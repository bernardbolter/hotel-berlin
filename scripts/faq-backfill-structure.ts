/**
 * FAQ System Part B Step 1 — structure backfill (idempotent).
 *
 * Reads doc/faqs/faq-structure-backfill.json (from the reconciliation workbook).
 * Sets audience, topic, secondaryTopics, priority, source='website' by slug.
 * Does NOT touch question, answer, context, category, order.
 * Does NOT execute merges.
 *
 * Usage:
 *   npx tsx scripts/faq-backfill-structure.ts           # dry-run (default)
 *   npx tsx scripts/faq-backfill-structure.ts --write    # apply
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'

type BackfillFile = {
  topics: Array<{
    slug: string
    label: { en: string; de: string }
    sortOrder: number
  }>
  records: Array<{
    slug: string
    audience: 'prospect' | 'guest' | 'both'
    topic: string
    secondaryTopics: string[]
    priority: number
    source: 'website' | 'chatbot' | 'staff'
  }>
}

const write = process.argv.includes('--write')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backfillPath = path.join(root, 'doc/faqs/faq-structure-backfill.json')

function priorityValue(n: number): '1' | '2' | '3' {
  if (n === 1 || n === 2 || n === 3) return String(n) as '1' | '2' | '3'
  throw new Error(`Invalid priority ${n}`)
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(backfillPath, 'utf8')) as BackfillFile
  const payload = await getPayload({ config })

  // --- Topics seed (always upsert; needed before FAQ topic relations) ---
  const topicIdBySlug = new Map<string, number>()
  console.log(`\n=== faq-topics (${raw.topics.length}) mode=${write ? 'WRITE' : 'DRY-RUN'} ===`)
  for (const topic of raw.topics) {
    const existing = await payload.find({
      collection: 'faq-topics',
      where: { slug: { equals: topic.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const en = {
      slug: topic.slug,
      sortOrder: topic.sortOrder,
      label: topic.label.en,
    }
    const de = { label: topic.label.de }
    if (!write) {
      console.log(
        `  ${existing.docs[0] ? 'would-update' : 'would-create'} ${topic.slug} sort=${topic.sortOrder}`,
      )
      if (existing.docs[0]) topicIdBySlug.set(topic.slug, existing.docs[0].id as number)
      continue
    }
    const id = existing.docs[0]
      ? (
          await payload.update({
            collection: 'faq-topics',
            id: existing.docs[0].id,
            data: en,
            locale: 'en',
            overrideAccess: true,
          })
        ).id
      : (
          await payload.create({
            collection: 'faq-topics',
            data: en,
            locale: 'en',
            overrideAccess: true,
          })
        ).id
    await payload.update({
      collection: 'faq-topics',
      id,
      data: de,
      locale: 'de',
      overrideAccess: true,
    })
    topicIdBySlug.set(topic.slug, id as number)
    console.log(`  ✓ ${topic.slug} id=${id}`)
  }

  if (write) {
    // reload map in case dry-run skipped ids
    const all = await payload.find({
      collection: 'faq-topics',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    topicIdBySlug.clear()
    for (const doc of all.docs) {
      topicIdBySlug.set(doc.slug, doc.id as number)
    }
  } else {
    // For dry-run abort checks we still need topic slug existence in the file
    for (const topic of raw.topics) {
      if (!topicIdBySlug.has(topic.slug)) {
        // pretend ids for relation resolution in dry-run reporting only
        topicIdBySlug.set(topic.slug, -1)
      }
    }
  }

  // --- Slug set abort checks ---
  const dbFaqs = await payload.find({
    collection: 'faqs',
    limit: 200,
    depth: 0,
    overrideAccess: true,
    draft: false,
  })
  const dbSlugs = new Set(dbFaqs.docs.map((d) => d.slug))
  const fileSlugs = new Set(raw.records.map((r) => r.slug))
  const missingInDb = [...fileSlugs].filter((s) => !dbSlugs.has(s))
  const missingInFile = [...dbSlugs].filter((s) => !fileSlugs.has(s))
  if (missingInDb.length || missingInFile.length) {
    console.error('\nABORT: slug set mismatch')
    console.error('  in backfill JSON, not in DB:', missingInDb)
    console.error('  in DB, not in backfill JSON:', missingInFile)
    process.exit(1)
  }

  // Topic refs must exist
  const neededTopics = new Set<string>()
  for (const r of raw.records) {
    neededTopics.add(r.topic)
    for (const t of r.secondaryTopics || []) neededTopics.add(t)
  }
  const missingTopics = [...neededTopics].filter((s) => !raw.topics.some((t) => t.slug === s))
  if (missingTopics.length) {
    console.error('ABORT: records reference topics not in topics list:', missingTopics)
    process.exit(1)
  }

  console.log(`\n=== faqs structure backfill (${raw.records.length}) mode=${write ? 'WRITE' : 'DRY-RUN'} ===`)
  let bothCount = 0
  for (const row of raw.records) {
    if (row.audience === 'both') bothCount++
    const doc = dbFaqs.docs.find((d) => d.slug === row.slug)!
    const topicId = topicIdBySlug.get(row.topic)
    if (topicId == null) {
      console.error(`ABORT: topic ${row.topic} has no id for ${row.slug}`)
      process.exit(1)
    }
    const secondaryIds = (row.secondaryTopics || []).map((slug) => {
      const id = topicIdBySlug.get(slug)
      if (id == null) throw new Error(`Missing secondary topic ${slug}`)
      return id
    })
    const next = {
      audience: row.audience,
      topic: write ? topicId : row.topic,
      secondaryTopics: write ? secondaryIds : row.secondaryTopics,
      priority: priorityValue(row.priority),
      source: row.source || 'website',
    }
    const prev = {
      audience: (doc as { audience?: string | null }).audience ?? null,
      topic:
        typeof (doc as { topic?: unknown }).topic === 'object' &&
        (doc as { topic?: { slug?: string } }).topic
          ? (doc as { topic: { slug?: string } }).topic.slug
          : ((doc as { topic?: number | string | null }).topic ?? null),
      priority: (doc as { priority?: string | null }).priority ?? null,
      source: (doc as { source?: string | null }).source ?? null,
    }
    console.log(
      `  ${row.slug}: audience ${prev.audience}→${next.audience}; topic →${row.topic}; priority ${prev.priority}→${next.priority}; source →${next.source}` +
        (row.secondaryTopics?.length ? `; secondary=${row.secondaryTopics.join(',')}` : ''),
    )
    if (!write) continue
    await payload.update({
      collection: 'faqs',
      id: doc.id,
      data: {
        audience: next.audience,
        topic: topicId,
        secondaryTopics: secondaryIds,
        priority: next.priority,
        source: next.source,
      },
      draft: false,
      overrideAccess: true,
    })
  }

  console.log(`\nboth-count (file)=${bothCount}`)
  if (write) {
    const check = await payload.find({
      collection: 'faqs',
      where: { audience: { equals: 'both' } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
      draft: false,
    })
    const topics = await payload.find({
      collection: 'faq-topics',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const withAudience = await payload.find({
      collection: 'faqs',
      where: { audience: { exists: true } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
      draft: false,
    })
    console.log(
      `WRITE DONE: faq-topics=${topics.totalDocs}; faqs with audience=${withAudience.totalDocs}; audience=both=${check.totalDocs}`,
    )
  } else {
    console.log('Dry-run only. Re-run with --write to apply.')
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
