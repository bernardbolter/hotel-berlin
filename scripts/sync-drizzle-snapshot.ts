/**
 * Write a drizzle kit snapshot that matches the current Payload schema.
 * Used to re-sync after a migration applied via psql without a .json snapshot.
 *
 * Usage: npx tsx scripts/sync-drizzle-snapshot.ts [out.json]
 * Default out: src/migrations/20261005_140000_faq_topics_and_structure.json
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migDir = path.join(root, 'src/migrations')
const outArg = process.argv[2]
const out = path.resolve(
  root,
  outArg || 'src/migrations/20261005_140000_faq_topics_and_structure.json',
)

async function main() {
  const payload = await getPayload({ config })
  const adapter = payload.db
  const { generateDrizzleJson } = adapter.requireDrizzleKit()
  const snap = (await generateDrizzleJson(adapter.schema)) as {
    id?: string
    prevId?: string
    version?: number
    tables?: Record<string, unknown>
    enums?: Record<string, unknown>
  }

  if (!snap.id) snap.id = randomUUID()

  const prior = fs
    .readdirSync(migDir)
    .filter((f) => f.endsWith('.json') && path.resolve(migDir, f) !== out)
    .sort()
    .reverse()[0]
  if (prior) {
    const prev = JSON.parse(fs.readFileSync(path.join(migDir, prior), 'utf8')) as { id: string }
    snap.prevId = prev.id
  } else if (!snap.prevId) {
    snap.prevId = '00000000-0000-0000-0000-000000000000'
  }

  fs.writeFileSync(out, JSON.stringify(snap, null, 2))
  console.log('Wrote', out)
  console.log('version', snap.version, 'tables', Object.keys(snap.tables || {}).length)
  console.log(
    'faq tables',
    Object.keys(snap.tables || {}).filter((t) => t.includes('faq')),
  )
  console.log('has enum_faqs_audience', Boolean(snap.enums?.['public.enum_faqs_audience']))
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
