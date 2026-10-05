/**
 * FAQ System Part B Step 2 — seed faq-placements global + faqs.pinnedRoutes.
 *
 * Reads doc/faqs/faq-placements.json.
 * Only touches the global and pinnedRoutes (not question/answer).
 *
 * Usage:
 *   npx tsx scripts/faq-seed-placements.ts           # dry-run
 *   npx tsx scripts/faq-seed-placements.ts --write
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { FaqRouteKey } from '../src/lib/faq/routes'

type PlacementsFile = {
  placements: Array<{
    route: FaqRouteKey
    audience: 'prospect' | 'guest' | 'both'
    topics: string[]
    cap: number | null
    showAll: boolean
    heading?: { en?: string; de?: string }
  }>
  pins: Record<string, FaqRouteKey[]>
}

const write = process.argv.includes('--write')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const filePath = path.join(root, 'doc/faqs/faq-placements.json')

function assertLocalDb() {
  const url = process.env.DATABASE_URL || ''
  console.log('DATABASE_URL=', url)
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error('Refusing to run: DATABASE_URL is not local (localhost/127.0.0.1).')
  }
}

async function main() {
  assertLocalDb()
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as PlacementsFile
  const payload = await getPayload({ config })

  const topics = await payload.find({
    collection: 'faq-topics',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const topicIdBySlug = new Map(topics.docs.map((t) => [t.slug, t.id as number]))

  console.log(`\n=== faq-placements (${raw.placements.length}) mode=${write ? 'WRITE' : 'DRY-RUN'} ===`)
  for (const p of raw.placements) {
    const missing = p.topics.filter((s) => !topicIdBySlug.has(s))
    if (missing.length) {
      throw new Error(`Placement ${p.route}: unknown topics ${missing.join(', ')}`)
    }
    console.log(
      `  ${p.route}: audience=${p.audience} showAll=${p.showAll} cap=${p.cap} topics=[${p.topics.join(',')}]`,
    )
  }

  if (write) {
    const placements = raw.placements.map((p) => ({
      route: p.route as FaqRouteKey,
      audience: p.audience,
      showAll: p.showAll,
      cap: p.cap,
      topics: p.topics.map((s) => topicIdBySlug.get(s)!),
    }))
    await payload.updateGlobal({
      slug: 'faq-placements',
      data: { placements } as never,
      locale: 'en',
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    console.log('  wrote faq-placements global')
  }

  console.log(`\n=== pinnedRoutes (${Object.keys(raw.pins).length} FAQs) ===`)
  for (const [slug, routes] of Object.entries(raw.pins)) {
    const found = await payload.find({
      collection: 'faqs',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) throw new Error(`Pin target FAQ not found: ${slug}`)
    const current = Array.isArray(doc.pinnedRoutes) ? doc.pinnedRoutes : []
    console.log(`  ${slug}: ${JSON.stringify(current)} → ${JSON.stringify(routes)}`)
    if (write) {
      await payload.update({
        collection: 'faqs',
        id: doc.id,
        data: { pinnedRoutes: routes as FaqRouteKey[] },
        overrideAccess: true,
        context: { disableRevalidate: true },
        draft: false,
      })
    }
  }

  if (!write) {
    console.log('\nDry-run only. Re-run with --write to apply.')
  } else {
    console.log('\nWRITE DONE: faq-placements + pinnedRoutes')
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
