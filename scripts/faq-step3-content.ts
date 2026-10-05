/**
 * FAQ System Part B Step 3 — content pass.
 *
 * - Applies tokenValueOverrides
 * - Token-converts 4 answers (round-trip verified)
 * - Executes 7 merges (absorbed → draft + mergedInto; survivor aliasSlugs)
 * - Imports 20 new FAQs as draft only (never publishes)
 *
 * Usage:
 *   npx tsx scripts/faq-step3-content.ts                         # dry-run all
 *   npx tsx scripts/faq-step3-content.ts --write                 # apply all
 *   npx tsx scripts/faq-step3-content.ts --only=overrides|conversions|merges|drafts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import { resolveFaqTokens, type FaqLocale, type TokenContext } from '../src/lib/faq/tokens'

const write = process.argv.includes('--write')
const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const only = onlyArg?.split('=')[1] as
  | 'overrides'
  | 'conversions'
  | 'merges'
  | 'drafts'
  | undefined

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentPath = path.join(root, 'doc/faqs/faq-step3-content.json')
const draftsPath = path.join(root, 'doc/faqs/faq-new-drafts.json')

type ContentFile = {
  tokenValueOverrides: Record<string, { en: string; de: string }>
  conversions: Array<{
    slug: string
    answer_en: string
    answer_de: string
  }>
  merges: Array<{
    group: string
    survivor: string
    absorbed: string
    audience: 'prospect' | 'guest' | 'both'
    question: { en: string; de: string }
    answer: { en: string; de: string }
  }>
}

type DraftsFile = {
  records: Array<{
    slug: string
    audience: 'prospect' | 'guest' | 'both'
    topic: string
    secondaryTopics: string[]
    priority: number
    question: { en: string; de: string }
    answer: { en: string; de: string }
    source: 'chatbot' | 'website' | 'staff'
    status: 'draft'
    internalNote?: string
  }>
}

function assertLocalDb() {
  const url = process.env.DATABASE_URL || ''
  console.log('DATABASE_URL=', url)
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error('Refusing to run: DATABASE_URL is not local.')
  }
}

function run(section: string) {
  return !only || only === section
}

async function loadTokenCtx(payload: Awaited<ReturnType<typeof getPayload>>): Promise<TokenContext> {
  const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0, overrideAccess: true })
  const amenities = await payload.find({
    collection: 'amenities',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  return {
    hotel,
    amenitiesBySlug: new Map(amenities.docs.map((a) => [a.slug, a])),
  }
}

async function main() {
  assertLocalDb()
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8')) as ContentFile
  const draftsFile = JSON.parse(fs.readFileSync(draftsPath, 'utf8')) as DraftsFile
  const payload = await getPayload({ config })
  const mode = write ? 'WRITE' : 'DRY-RUN'
  const skipped: string[] = []
  const textDiff: Array<{
    slug: string
    locale: FaqLocale
    field: 'question' | 'answer'
    old: string
    new: string
    kind: string
  }> = []

  // --- Task 1: overrides ---
  if (run('overrides')) {
    console.log(`\n=== tokenValueOverrides mode=${mode} ===`)
    const ov = content.tokenValueOverrides
    console.log('  breakfastWeekday →', ov.breakfastWeekday)
    console.log('  noShowCharge →', ov.noShowCharge, '(format via tokens.ts; value stays 90)')
    if (write) {
      const current = await payload.findGlobal({ slug: 'hotel', depth: 0, overrideAccess: true })
      await payload.updateGlobal({
        slug: 'hotel',
        data: {
          guestStay: {
            ...(current.guestStay || {}),
            breakfast: {
              ...(current.guestStay?.breakfast || {}),
              valueEN: ov.breakfastWeekday.en,
              valueDE: ov.breakfastWeekday.de,
            },
          },
          ratePolicy: {
            ...(current.ratePolicy || {}),
            noShowPercent: 90,
          },
        },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      console.log('  wrote hotel guestStay.breakfast + ratePolicy.noShowPercent=90')
    }
  }

  // --- Task 2: conversions ---
  if (run('conversions')) {
    console.log(`\n=== conversions (4) mode=${mode} ===`)
    // Ensure overrides are visible to resolver even in dry-run before write
    const ctx = await loadTokenCtx(payload)
    if (ctx.hotel) {
      ctx.hotel = {
        ...ctx.hotel,
        guestStay: {
          ...(ctx.hotel.guestStay || {}),
          breakfast: {
            ...(ctx.hotel.guestStay?.breakfast || {}),
            valueEN: content.tokenValueOverrides.breakfastWeekday.en,
            valueDE: content.tokenValueOverrides.breakfastWeekday.de,
          },
        },
        ratePolicy: {
          ...(ctx.hotel.ratePolicy || {}),
          noShowPercent: 90,
        },
      }
    }

    for (const conv of content.conversions) {
      const enDoc = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: conv.slug } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const deDoc = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: conv.slug } },
        locale: 'de',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const en = enDoc.docs[0]
      const de = deDoc.docs[0]
      if (!en || !de) {
        skipped.push(`conversion ${conv.slug}: missing record`)
        console.log(`  SKIP ${conv.slug}: missing`)
        continue
      }

      const resolvedEn = resolveFaqTokens(conv.answer_en, 'en', ctx)
      const resolvedDe = resolveFaqTokens(conv.answer_de, 'de', ctx)
      const curEn = en.answer ?? ''
      const curDe = de.answer ?? ''
      const matchEn = resolvedEn.text === curEn && resolvedEn.unresolved.length === 0
      const matchDe = resolvedDe.text === curDe && resolvedDe.unresolved.length === 0

      console.log(`  ${conv.slug}:`)
      console.log(`    EN round-trip ${matchEn ? 'OK' : 'FAIL'}`)
      if (!matchEn) {
        console.log('      resolved:', JSON.stringify(resolvedEn.text))
        console.log('      current: ', JSON.stringify(curEn))
        console.log('      unresolved:', resolvedEn.unresolved)
      }
      console.log(`    DE round-trip ${matchDe ? 'OK' : 'FAIL'}`)
      if (!matchDe) {
        console.log('      resolved:', JSON.stringify(resolvedDe.text))
        console.log('      current: ', JSON.stringify(curDe))
        console.log('      unresolved:', resolvedDe.unresolved)
      }

      if (!matchEn || !matchDe) {
        skipped.push(`conversion ${conv.slug}: round-trip mismatch`)
        continue
      }

      textDiff.push({
        slug: conv.slug,
        locale: 'en',
        field: 'answer',
        old: curEn,
        new: conv.answer_en,
        kind: 'token-conversion (no visible change)',
      })
      textDiff.push({
        slug: conv.slug,
        locale: 'de',
        field: 'answer',
        old: curDe,
        new: conv.answer_de,
        kind: 'token-conversion (no visible change)',
      })

      if (write) {
        await payload.update({
          collection: 'faqs',
          id: en.id,
          data: { answer: conv.answer_en },
          locale: 'en',
          overrideAccess: true,
          context: { disableRevalidate: true },
          draft: false,
        })
        await payload.update({
          collection: 'faqs',
          id: de.id,
          data: { answer: conv.answer_de },
          locale: 'de',
          overrideAccess: true,
          context: { disableRevalidate: true },
          draft: false,
        })
        console.log('    WRITE answers EN+DE')
      }
    }
  }

  // --- Task 3: merges ---
  if (run('merges')) {
    console.log(`\n=== merges (${content.merges.length}) mode=${mode} ===`)
    for (const merge of content.merges) {
      const survivor = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: merge.survivor } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const absorbed = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: merge.absorbed } },
        locale: 'en',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const s = survivor.docs[0]
      const a = absorbed.docs[0]
      if (!s || !a) {
        skipped.push(`merge ${merge.group}: missing ${!s ? merge.survivor : merge.absorbed}`)
        console.log(`  SKIP ${merge.group}: missing record`)
        continue
      }

      const sDe = await payload.findByID({
        collection: 'faqs',
        id: s.id,
        locale: 'de',
        depth: 0,
        overrideAccess: true,
      })

      console.log(
        `  ${merge.group}: ${merge.survivor} ← ${merge.absorbed} audience=${merge.audience}`,
      )
      console.log(`    survivor Q/A will be replaced; ${merge.absorbed} → draft + mergedInto`)

      for (const locale of ['en', 'de'] as const) {
        const oldQ = locale === 'en' ? s.question : sDe.question
        const oldA = locale === 'en' ? s.answer : sDe.answer
        if (oldQ !== merge.question[locale]) {
          textDiff.push({
            slug: merge.survivor,
            locale,
            field: 'question',
            old: oldQ ?? '',
            new: merge.question[locale],
            kind: 'merge (visible change)',
          })
        }
        if (oldA !== merge.answer[locale]) {
          textDiff.push({
            slug: merge.survivor,
            locale,
            field: 'answer',
            old: oldA ?? '',
            new: merge.answer[locale],
            kind: 'merge (visible change)',
          })
        }
      }

      if (write) {
        const aliases = Array.isArray(s.aliasSlugs) ? [...s.aliasSlugs] : []
        if (!aliases.some((x) => x?.slug === merge.absorbed)) {
          aliases.push({ slug: merge.absorbed })
        }
        await payload.update({
          collection: 'faqs',
          id: s.id,
          data: {
            audience: merge.audience,
            question: merge.question.en,
            answer: merge.answer.en,
            aliasSlugs: aliases,
          },
          locale: 'en',
          overrideAccess: true,
          context: { disableRevalidate: true },
          draft: false,
        })
        await payload.update({
          collection: 'faqs',
          id: s.id,
          data: {
            question: merge.question.de,
            answer: merge.answer.de,
          },
          locale: 'de',
          overrideAccess: true,
          context: { disableRevalidate: true },
          draft: false,
        })
        await payload.update({
          collection: 'faqs',
          id: a.id,
          data: {
            _status: 'draft',
            mergedInto: s.id,
          },
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        console.log('    WRITE survivor + absorb→draft')
      }
    }
  }

  // --- Task 4: drafts ---
  if (run('drafts')) {
    console.log(`\n=== new drafts (${draftsFile.records.length}) mode=${mode} ===`)
    const topics = await payload.find({
      collection: 'faq-topics',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const topicId = new Map(topics.docs.map((t) => [t.slug, t.id as number]))

    // next order after max existing
    const all = await payload.find({
      collection: 'faqs',
      limit: 200,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })
    let nextOrder =
      Math.max(0, ...all.docs.map((d) => (typeof d.order === 'number' ? d.order : 0))) + 10

    for (const rec of draftsFile.records) {
      const existing = await payload.find({
        collection: 'faqs',
        where: { slug: { equals: rec.slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: true,
      })
      const topic = topicId.get(rec.topic)
      if (!topic) throw new Error(`Unknown topic ${rec.topic} for ${rec.slug}`)
      const secondary = rec.secondaryTopics.map((slug) => {
        const id = topicId.get(slug)
        if (!id) throw new Error(`Unknown secondary topic ${slug}`)
        return id
      })

      console.log(
        `  ${existing.docs[0] ? 'would-update' : 'would-create'} ${rec.slug} audience=${rec.audience} DRAFT`,
      )

      if (write) {
        const base = {
          slug: rec.slug,
          audience: rec.audience,
          // legacy context required for admin — map both→prospect for shell field
          context: rec.audience === 'guest' ? ('guest' as const) : ('prospect' as const),
          category: 'general' as const,
          topic,
          secondaryTopics: secondary,
          priority: String(rec.priority) as '1' | '2' | '3',
          source: rec.source,
          order: nextOrder++,
          internalNote: rec.internalNote ?? undefined,
          question: rec.question.en,
          answer: rec.answer.en,
          _status: 'draft' as const,
        }
        const id = existing.docs[0]
          ? (
              await payload.update({
                collection: 'faqs',
                id: existing.docs[0].id,
                data: base,
                locale: 'en',
                overrideAccess: true,
                context: { disableRevalidate: true },
                draft: true,
              })
            ).id
          : (
              await payload.create({
                collection: 'faqs',
                data: base,
                locale: 'en',
                overrideAccess: true,
                context: { disableRevalidate: true },
                draft: true,
              })
            ).id
        await payload.update({
          collection: 'faqs',
          id,
          data: {
            question: rec.question.de,
            answer: rec.answer.de,
            _status: 'draft',
          },
          locale: 'de',
          overrideAccess: true,
          context: { disableRevalidate: true },
          draft: true,
        })
      }
    }
  }

  const diffPath = path.join(root, 'doc/faqs/step3/step3-text-diff.json')
  fs.mkdirSync(path.dirname(diffPath), { recursive: true })
  fs.writeFileSync(diffPath, JSON.stringify({ mode, skipped, textDiff }, null, 2))
  console.log(`\n--- skipped (${skipped.length}) ---`)
  for (const s of skipped) console.log(' ', s)
  console.log('wrote', diffPath)
  if (!write) console.log('\nDry-run only. Re-run with --write to apply.')
  else console.log('\nWRITE DONE')
  process.exit(skipped.length && write ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
