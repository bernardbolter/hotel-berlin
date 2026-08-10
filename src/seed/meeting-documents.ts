import 'dotenv/config'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(dirname, 'assets/meeting-pdf')

const force =
  process.argv.includes('--force') || process.env.MEETING_DOCS_SEED_FORCE === '1'

type DocSeed = {
  key: string
  title: { en: string; de: string }
  category: 'general' | 'floor-plan' | 'hybrid' | 'sustainability'
  area?: 'saal' | 'bereich-a' | 'bereich-b' | 'bereich-c'
  pageRole?: 'none' | 'hybrid-teaser' | 'banquet-teaser'
  sortOrder: number
}

/** Mirrors the live library on hotel-berlin.de/tagungen-arbeiten */
const DOCUMENTS: DocSeed[] = [
  {
    key: 'hybrid',
    title: { en: 'Hybrid Meetings', de: 'Hybride Konferenzen' },
    category: 'hybrid',
    pageRole: 'hybrid-teaser',
    sortOrder: 10,
  },
  {
    key: 'banquet-folder',
    title: { en: 'Banquet Menu', de: 'Bankettmappe' },
    category: 'general',
    pageRole: 'banquet-teaser',
    sortOrder: 20,
  },
  {
    key: 'special-offer',
    title: { en: 'Special Offer', de: 'Spezialangebot' },
    category: 'general',
    pageRole: 'none',
    sortOrder: 30,
  },
  {
    key: 'brochure',
    title: { en: 'Factsheet', de: 'Broschüre' },
    category: 'general',
    pageRole: 'none',
    sortOrder: 40,
  },
  {
    key: 'floor-plan-overview',
    title: { en: 'Floorplan / Overview', de: 'Grundriss / Übersicht' },
    category: 'floor-plan',
    pageRole: 'none',
    sortOrder: 50,
  },
  {
    key: 'bereich-a',
    title: { en: 'Area A', de: 'Bereich A' },
    category: 'floor-plan',
    area: 'bereich-a',
    pageRole: 'none',
    sortOrder: 60,
  },
  {
    key: 'bereich-b',
    title: { en: 'Area B', de: 'Bereich B' },
    category: 'floor-plan',
    area: 'bereich-b',
    pageRole: 'none',
    sortOrder: 70,
  },
  {
    key: 'bereich-c',
    title: { en: 'Area C', de: 'Bereich C' },
    category: 'floor-plan',
    area: 'bereich-c',
    pageRole: 'none',
    sortOrder: 80,
  },
  {
    key: 'saal',
    title: { en: 'Berlin Ballroom', de: 'Bereich Saal' },
    category: 'floor-plan',
    area: 'saal',
    pageRole: 'none',
    sortOrder: 90,
  },
  {
    key: 'sustainability-2024',
    title: { en: 'Sustainability Report 2024', de: 'Nachhaltigkeitsreport 2024' },
    category: 'sustainability',
    pageRole: 'none',
    sortOrder: 100,
  },
]

async function uploadPdf(
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: 'de' | 'en',
  key: string,
  filePath: string,
  alt: string,
) {
  // Unique media filename so DE/EN copies of the same key don't collide.
  const uniqueFilename = `${locale}-${key}.pdf`
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: uniqueFilename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`  reuse media ${uniqueFilename} (id ${existing.id})`)
    return existing.id as number
  }

  const tmpPath = path.join(os.tmpdir(), uniqueFilename)
  fs.copyFileSync(filePath, tmpPath)

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: tmpPath,
  })
  try {
    fs.unlinkSync(tmpPath)
  } catch {
    // ignore
  }
  console.log(`  uploaded ${uniqueFilename} (id ${media.id})`)
  return media.id as number
}

async function main() {
  for (const locale of ['de', 'en'] as const) {
    const dir = path.join(rootDir, locale)
    if (!fs.existsSync(dir)) {
      console.error(`Missing folder: ${dir}`)
      process.exit(1)
    }
  }

  const payload = await getPayload({ config })

  for (const doc of DOCUMENTS) {
    const dePath = path.join(rootDir, 'de', `${doc.key}.pdf`)
    const enPath = path.join(rootDir, 'en', `${doc.key}.pdf`)
    if (!fs.existsSync(dePath) || !fs.existsSync(enPath)) {
      console.warn(`Skip ${doc.key} — missing de and/or en PDF`)
      continue
    }

    console.log(`Document: ${doc.key}`)
    const deFileId = await uploadPdf(payload, 'de', doc.key, dePath, doc.title.de)
    const enFileId = await uploadPdf(payload, 'en', doc.key, enPath, doc.title.en)

    const existing = (
      await payload.find({
        collection: 'meeting-documents',
        where: { key: { equals: doc.key } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]

    const baseData = {
      key: doc.key,
      category: doc.category,
      ...(doc.area ? { area: doc.area } : {}),
      pageRole: doc.pageRole ?? 'none',
      sortOrder: doc.sortOrder,
    }

    if (existing && !force) {
      console.log(`  skip existing document id ${existing.id} (use --force)`)
      continue
    }

    if (existing && force) {
      await payload.update({
        collection: 'meeting-documents',
        id: existing.id,
        locale: 'en',
        data: {
          ...baseData,
          title: doc.title.en,
          file: enFileId,
        },
      })
      await payload.update({
        collection: 'meeting-documents',
        id: existing.id,
        locale: 'de',
        data: {
          title: doc.title.de,
          file: deFileId,
        },
      })
      console.log(`  updated id ${existing.id}`)
      continue
    }

    const created = await payload.create({
      collection: 'meeting-documents',
      locale: 'en',
      data: {
        ...baseData,
        title: doc.title.en,
        file: enFileId,
      },
    })
    await payload.update({
      collection: 'meeting-documents',
      id: created.id,
      locale: 'de',
      data: {
        title: doc.title.de,
        file: deFileId,
      },
    })
    console.log(`  created id ${created.id}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
