/**
 * A2 verification fixtures: two live works (full + thin record).
 * Usage: npm run seed:art-fixtures
 *        npm run seed:art-fixtures -- --force
 */
import 'dotenv/config'
import './guard'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { plainRichText } from './richText'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const force =
  process.argv.includes('--force') || process.env.ART_FIXTURES_FORCE === '1'

const writeOpts = {
  overrideAccess: true,
  context: { disableRevalidate: true },
} as const

const IMAGES = {
  vogel: path.resolve(dirname, '../../public/images/here/cokyone.jpg'),
  somari: path.resolve(dirname, '../../public/images/here/magwie.jpg'),
  detail: path.resolve(dirname, '../../public/images/here/deerbln.jpg'),
  context: path.resolve(dirname, '../../public/images/here/kttk.jpg'),
} as const

async function uploadOrReuse(payload: Payload, filePath: string, alt: string) {
  const filename = `art-fixture-${path.basename(filePath)}`
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing image: ${filePath}`)
  }

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

  // Payload stores the basename; copy to a temp name so we can force the fixture filename.
  const tmpDir = path.join(dirname, '.tmp-art-fixtures')
  fs.mkdirSync(tmpDir, { recursive: true })
  const tmpPath = path.join(tmpDir, filename)
  fs.copyFileSync(filePath, tmpPath)

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: tmpPath,
    ...writeOpts,
  })
  console.log(`  Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function upsertArtist(payload: Payload, name: string, slug: string) {
  const existing = (
    await payload.find({
      collection: 'artists',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0]

  if (existing) {
    console.log(`  Artist exists: ${slug} (id ${existing.id})`)
    return existing
  }

  const created = await payload.create({
    collection: 'artists',
    data: { name, slug },
    ...writeOpts,
  })
  console.log(`  Created artist: ${slug} (id ${created.id})`)
  return created
}

async function upsertWork(
  payload: Payload,
  slug: string,
  data: Record<string, unknown>,
  dataDe?: Record<string, unknown>,
) {
  const existing = (
    await payload.find({
      collection: 'artworks',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`  Skip work ${slug} (id ${existing.id}) — use --force to replace`)
    return existing
  }

  if (existing && force) {
    // Delete the work first so image FKs do not block media delete.
    await payload.delete({ collection: 'artworks', id: existing.id, ...writeOpts })
  }

  const created = await payload.create({
    collection: 'artworks',
    data: { ...data, slug },
    locale: 'en',
    ...writeOpts,
  })

  if (dataDe) {
    await payload.update({
      collection: 'artworks',
      id: created.id,
      data: dataDe,
      locale: 'de',
      ...writeOpts,
    })
  }

  console.log(`  Created work: ${slug} (id ${created.id})`)
  return created
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Art A2 fixtures…')

  const pisa = await upsertArtist(payload, 'Pisa73', 'pisa73')
  const somari = await upsertArtist(payload, 'Somari', 'somari')

  const vogelImg = await uploadOrReuse(payload, IMAGES.vogel, 'Vogel mural by Pisa73')
  const somariImg = await uploadOrReuse(payload, IMAGES.somari, 'Somari mural at the lifts')
  const detailImg = await uploadOrReuse(payload, IMAGES.detail, 'Detail of Vogel')
  const contextImg = await uploadOrReuse(payload, IMAGES.context, 'Vogel in the corridor')

  await upsertWork(
    payload,
    'vogel',
    {
      title: 'Vogel',
      artworkType: 'mural',
      visibility: 'live',
      status: 'not-for-sale',
      pinned: true,
      artist: pisa.id,
      medium: 'Sprayfarbe auf Putz',
      dimensions: 'ca. 3 × 4 m',
      year: 2024,
      description: plainRichText(
        'A bird that landed on the fourth floor and stayed. Guests pass it on the way to the lifts; staff point it out without being asked.',
      ),
      locationInBuilding: { floor: '4', spot: 'near the lifts' },
      images: [{ image: vogelImg.id, alt: 'Vogel mural by Pisa73' }],
      contextImage: contextImg.id,
      detailImages: [{ image: detailImg.id, alt: 'Detail of Vogel' }],
    },
    {
      description: plainRichText(
        'Ein Vogel, der auf der vierten Etage gelandet ist und geblieben. Gäste kommen an ihm vorbei auf dem Weg zu den Aufzügen; das Personal zeigt ihn, ohne gefragt zu werden.',
      ),
      locationInBuilding: { floor: '4', spot: 'bei den Aufzügen' },
    },
  )

  await upsertWork(
    payload,
    'somari',
    {
      title: '',
      artworkType: 'mural',
      visibility: 'live',
      status: 'not-for-sale',
      pinned: false,
      artist: somari.id,
      medium: null,
      dimensions: null,
      year: null,
      description: null,
      locationInBuilding: { floor: '4', spot: 'near the lifts' },
      images: [{ image: somariImg.id, alt: 'Somari mural at the lifts' }],
      contextImage: null,
      detailImages: [],
    },
    {
      locationInBuilding: { floor: '4', spot: 'bei den Aufzügen' },
    },
  )

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
