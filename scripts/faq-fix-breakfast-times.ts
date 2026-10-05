/**
 * Apply the breakfast-times wording fix (weekday labels outside the token).
 * Reads from faq-step3-content.json G4 so a reseed stays consistent.
 *
 * Usage:
 *   npx tsx scripts/faq-fix-breakfast-times.ts           # dry-run
 *   npx tsx scripts/faq-fix-breakfast-times.ts --write
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const write = process.argv.includes('--write')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentPath = path.join(root, 'doc/faqs/faq-step3-content.json')

type ContentFile = {
  merges: Array<{
    group: string
    survivor: string
    answer: { en: string; de: string }
  }>
}

async function main() {
  const url = process.env.DATABASE_URL || ''
  console.log('DATABASE_URL=', url)
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error('Refusing: DATABASE_URL is not local')
  }

  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8')) as ContentFile
  const g4 = content.merges.find((m) => m.group === 'G4' && m.survivor === 'breakfast-times')
  if (!g4) throw new Error('G4 breakfast-times missing from faq-step3-content.json')

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'faqs',
    where: { slug: { equals: 'breakfast-times' } },
    locale: 'en',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = found.docs[0]
  if (!doc) throw new Error('breakfast-times not found')

  const de = await payload.findByID({
    collection: 'faqs',
    id: doc.id,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })

  console.log(`mode=${write ? 'WRITE' : 'DRY-RUN'}`)
  console.log('EN old:', JSON.stringify(doc.answer))
  console.log('EN new:', JSON.stringify(g4.answer.en))
  console.log('DE old:', JSON.stringify(de.answer))
  console.log('DE new:', JSON.stringify(g4.answer.de))

  if (write) {
    await payload.update({
      collection: 'faqs',
      id: doc.id,
      data: { answer: g4.answer.en },
      locale: 'en',
      overrideAccess: true,
      context: { disableRevalidate: true },
      draft: false,
    })
    await payload.update({
      collection: 'faqs',
      id: doc.id,
      data: { answer: g4.answer.de },
      locale: 'de',
      overrideAccess: true,
      context: { disableRevalidate: true },
      draft: false,
    })
    console.log('WRITE DONE')
  } else {
    console.log('Dry-run only. Re-run with --write to apply.')
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
