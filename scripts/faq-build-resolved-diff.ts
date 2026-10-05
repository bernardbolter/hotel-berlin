/**
 * Build resolved-text section for Step3_TextDiff.md (7 survivors).
 * Uses OLD published text from existing-faqs.json vs NEW merge answers with tokens resolved.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  resolveFaqTokens,
  type FaqLocale,
  type TokenContext,
} from '../src/lib/faq/tokens'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SURVIVORS = [
  'check-in-time',
  'parking',
  'pet-policy',
  'breakfast-times',
  'guest-card-only',
  'guest-pharmacy-nollendorf',
  'guest-emergency',
] as const

async function loadCtx(payload: Awaited<ReturnType<typeof getPayload>>): Promise<TokenContext> {
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
  const existing = JSON.parse(
    fs.readFileSync(path.join(root, 'doc/faqs/existing-faqs.json'), 'utf8'),
  ) as Array<{ slug: string; question: { en: string; de: string }; answer: { en: string; de: string } }>
  const bySlug = new Map(existing.map((e) => [e.slug, e]))

  const content = JSON.parse(
    fs.readFileSync(path.join(root, 'doc/faqs/faq-step3-content.json'), 'utf8'),
  ) as {
    merges: Array<{
      survivor: string
      question: { en: string; de: string }
      answer: { en: string; de: string }
    }>
  }
  const mergeBy = new Map(content.merges.map((m) => [m.survivor, m]))

  const payload = await getPayload({ config })
  const ctx = await loadCtx(payload)

  const lines: string[] = [
    '',
    '---',
    '',
    '## Resolved text (7 survivors)',
    '',
    '*OLD = published text before Step 3 (from `existing-faqs.json`).*',
    '*NEW = merge answer after token resolution (live hotel/amenity sources).*',
    '*Questions compared as written (no tokens in survivor questions).*',
    '',
  ]

  const summary: Array<{
    slug: string
    locale: FaqLocale
    field: string
    status: 'identical' | 'changed'
  }> = []

  for (const slug of SURVIVORS) {
    const old = bySlug.get(slug)
    const merge = mergeBy.get(slug)
    if (!old || !merge) throw new Error(`Missing data for ${slug}`)

    lines.push(`### \`${slug}\``)
    lines.push('')

    for (const locale of ['en', 'de'] as const) {
      for (const field of ['question', 'answer'] as const) {
        const oldText = old[field][locale]
        let newText = merge[field][locale]
        if (field === 'answer') {
          const r = resolveFaqTokens(newText, locale, ctx)
          if (r.unresolved.length) {
            throw new Error(`${slug} ${locale} unresolved: ${r.unresolved.join(',')}`)
          }
          newText = r.text
        }
        const status = oldText === newText ? 'identical' : 'changed'
        summary.push({ slug, locale, field, status })
        lines.push(`#### ${locale.toUpperCase()} · ${field} — **${status}**`)
        lines.push('')
        lines.push('**OLD**')
        lines.push('')
        lines.push('```')
        lines.push(oldText)
        lines.push('```')
        lines.push('')
        lines.push('**NEW (resolved)**')
        lines.push('')
        lines.push('```')
        lines.push(newText)
        lines.push('```')
        lines.push('')
      }
    }
  }

  lines.push('### Summary table')
  lines.push('')
  lines.push('| slug | locale | field | status |')
  lines.push('|---|---|---|---|')
  for (const row of summary) {
    lines.push(`| \`${row.slug}\` | ${row.locale} | ${row.field} | ${row.status} |`)
  }
  lines.push('')

  const diffPath = path.join(root, 'doc/faqs/step3/Step3_TextDiff.md')
  let existingMd = fs.readFileSync(diffPath, 'utf8')
  // Strip any previous resolved section
  const cut = existingMd.indexOf('\n## Resolved text (7 survivors)')
  if (cut >= 0) existingMd = existingMd.slice(0, cut).replace(/\s+$/, '')
  // Also strip trailing --- that we may have added
  existingMd = existingMd.replace(/\n---\s*$/, '')
  fs.writeFileSync(diffPath, existingMd + '\n' + lines.join('\n'))
  console.log('updated', diffPath)
  for (const row of summary) {
    console.log(`${row.slug} ${row.locale} ${row.field}: ${row.status}`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
