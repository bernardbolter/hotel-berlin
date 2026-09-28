/**
 * Test-site only: attach You, Me & Berlin portraits by person slug.
 * Source is a partner pitch deck — do not treat as production licence.
 *
 *   npm run seed:ymb-portraits
 *   npm run seed:ymb-portraits -- --force
 *
 * Katja Morkel is intentionally left without a portrait.
 */
import 'dotenv/config'
import './guard'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, 'assets/ymb-portraits')

const force =
  process.argv.includes('--force') || process.env.YMB_PORTRAITS_FORCE === '1'

const PORTRAITS: { slug: string; file: string; alt: string }[] = [
  { slug: 'iris-berndt', file: 'iris-berndt.jpg', alt: 'Dr. Iris Berndt' },
  {
    slug: 'christiane-fritsch-weith',
    file: 'christiane-fritsch-weith.jpg',
    alt: 'Christiane Fritsch-Weith',
  },
  { slug: 'jennifer-oeser', file: 'jennifer-oeser.jpg', alt: 'Jennifer Oeser' },
  {
    slug: 'kristiane-kegelmann',
    file: 'kristiane-kegelmann.jpg',
    alt: 'Kristiane Kegelmann',
  },
  { slug: 'gita-kurdpoor', file: 'gita-kurdpoor.jpg', alt: 'Gita Kurdpoor' },
]

const NO_PORTRAIT_SLUG = 'katja-morkel'

const writeOpts = {
  overrideAccess: true,
  context: { disableRevalidate: true },
} as const

async function uploadOrReuse(payload: Payload, filePath: string, alt: string) {
  const filename = path.basename(filePath)
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`  Reusing media: ${filename} (id ${existing.id})`)
    return existing
  }

  if (existing && force) {
    await payload.delete({ collection: 'media', id: existing.id, ...writeOpts })
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
    ...writeOpts,
  })
  console.log(`  Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function findPerson(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'people',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function main() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Missing assets dir: ${assetsDir}`)
  }

  const payload = await getPayload({ config })

  for (const row of PORTRAITS) {
    const filePath = path.join(assetsDir, row.file)
    if (!fs.existsSync(filePath)) {
      console.log(`Skip ${row.slug} — missing ${row.file}`)
      continue
    }

    const person = await findPerson(payload, row.slug)
    if (!person) {
      console.log(`Skip ${row.slug} — person not found (run seed:curated-tips first)`)
      continue
    }

    console.log(`${row.slug} ← ${row.file}`)
    const media = await uploadOrReuse(payload, filePath, row.alt)
    await payload.update({
      collection: 'people',
      id: person.id,
      data: { portrait: media.id },
      ...writeOpts,
    })
    console.log(`  Attached media id ${media.id}`)
  }

  const katja = await findPerson(payload, NO_PORTRAIT_SLUG)
  if (katja) {
    await payload.update({
      collection: 'people',
      id: katja.id,
      data: { portrait: null },
      ...writeOpts,
    })
    console.log(`${NO_PORTRAIT_SLUG}: portrait cleared (no usable source)`)
  } else {
    console.log(`Skip ${NO_PORTRAIT_SLUG} — person not found`)
  }

  console.log('\nDone. Test-site portraits only — do not push to production.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
