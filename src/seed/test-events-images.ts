/**
 * Upload test-event assets and attach heroImage / portraits.
 *
 * Expects files in src/seed/assets/test-events/
 * Usage: npm run seed:test-events:images
 *        npm run seed:test-events:images -- --force
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { mediaUrl } from '../lib/spotlight/media'
import { getCurrentExhibitionForVenue } from '../lib/venue-time/queries'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, 'assets/test-events')

const force =
  process.argv.includes('--force') || process.env.TEST_EVENTS_IMAGES_FORCE === '1'

type Target =
  | { kind: 'event'; slug: string; files: string[]; alt: string }
  | { kind: 'exhibition'; slug: string; files: string[]; alt: string }
  | { kind: 'artist'; slug: string; files: string[]; alt: string; field: 'portrait' }
  | { kind: 'venue'; slug: string; files: string[]; alt: string; field: 'venueMonogram' }

const targets: Target[] = [
  {
    kind: 'event',
    slug: 'vinyl-nights',
    files: ['vinyl-nights.jpg', 'vinyl-nights.jpeg', 'vinyl-nights.png', 'vinyl-nights.webp'],
    alt: 'Vinyl Nights at Lütze',
  },
  {
    kind: 'event',
    slug: 'zeichenstammtisch',
    files: [
      'zeichenstammtisch.jpg',
      'zeichenstammtisch.jpeg',
      'zeichenstammtisch.png',
      'zeichenstammtisch.webp',
    ],
    alt: 'Zeichenstammtisch drawing meetup at Lütze',
  },
  {
    kind: 'event',
    slug: 'kttk-open-play',
    files: [
      'kttk-open-play.jpg',
      'kttk-open-play.jpeg',
      'kttk-open-play.png',
      'kttk-open-play.webp',
    ],
    alt: 'KTTK open play table tennis',
  },
  {
    kind: 'event',
    slug: 'kttk-tournament-night',
    files: [
      'kttk-tournament-night.jpg',
      'kttk-tournament-night.jpeg',
      'kttk-tournament-night.png',
      'kttk-tournament-night.webp',
    ],
    alt: 'KTTK tournament night',
  },
  {
    kind: 'exhibition',
    slug: 'magwie-x-cokyone',
    files: [
      'magwie-x-cokyone.webp',
      'magwie-x-cokyone.jpg',
      'duo-show-magwie-cokyone.webp',
      'duo-show-magwie-cokyone.jpg',
    ],
    alt: 'Magwie × CokyOne duo show at FKKB',
  },
  {
    kind: 'artist',
    slug: 'magwie',
    files: ['magwie-portrait.jpg', 'magwie-portrait.jpeg', 'magwie-portrait.webp', 'magwie-portrait.png'],
    alt: 'Magdalena Wiegner (Magwie)',
    field: 'portrait',
  },
  {
    kind: 'artist',
    slug: 'cokyone',
    files: [
      'cokyone-portrait.jpg',
      'cokyone-portrait.jpeg',
      'cokyone-portrait.webp',
      'cokyone-portrait.png',
    ],
    alt: 'Andreas Ponto (CokyOne)',
    field: 'portrait',
  },
  {
    kind: 'venue',
    slug: 'lutze',
    files: ['monograms/lutze-monogram.svg', 'lutze-monogram.svg'],
    alt: 'Lütze monogram',
    field: 'venueMonogram',
  },
  {
    kind: 'venue',
    slug: 'kttk',
    files: ['monograms/kttk-monogram.svg', 'kttk-monogram.svg'],
    alt: 'KTTK monogram',
    field: 'venueMonogram',
  },
  {
    kind: 'venue',
    slug: 'fkkb',
    files: ['monograms/fkkb-monogram.svg', 'fkkb-monogram.svg'],
    alt: 'FKKB monogram',
    field: 'venueMonogram',
  },
]

function resolveFile(candidates: string[]): string | null {
  for (const name of candidates) {
    const full = path.join(assetsDir, name)
    if (fs.existsSync(full)) return full
  }
  return null
}

async function uploadOrReuse(payload: Payload, filePath: string, alt: string) {
  const filename = path.basename(filePath)
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`  Reusing media: ${filename} (id ${existing.id})`)
    return existing
  }

  if (existing && force) {
    await payload.delete({ collection: 'media', id: existing.id })
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  })
  console.log(`  Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function findBySlug(
  payload: Payload,
  collection: 'events' | 'exhibitions' | 'artists' | 'venues',
  slug: string,
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

function collectionFor(kind: Target['kind']): 'events' | 'exhibitions' | 'artists' | 'venues' {
  switch (kind) {
    case 'event':
      return 'events'
    case 'exhibition':
      return 'exhibitions'
    case 'artist':
      return 'artists'
    case 'venue':
      return 'venues'
  }
}

async function main() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Missing assets dir: ${assetsDir}`)
  }

  const payload = await getPayload({ config })

  for (const target of targets) {
    const filePath = resolveFile(target.files)
    if (!filePath) {
      console.log(`Skip ${target.kind}/${target.slug} — no file matching ${target.files[0]}`)
      continue
    }

    const doc = await findBySlug(payload, collectionFor(target.kind), target.slug)
    if (!doc) {
      console.log(`Skip ${target.kind}/${target.slug} — record not found (run seed:test-events first)`)
      continue
    }

    console.log(`${target.kind}/${target.slug} ← ${path.basename(filePath)}`)
    const media = await uploadOrReuse(payload, filePath, target.alt)

    if (target.kind === 'artist') {
      await payload.update({
        collection: 'artists',
        id: doc.id,
        data: { [target.field]: media.id },
      })
    } else if (target.kind === 'venue') {
      await payload.update({
        collection: 'venues',
        id: doc.id,
        data: { [target.field]: media.id },
        locale: 'en',
      })
    } else if (target.kind === 'event') {
      await payload.update({
        collection: 'events',
        id: doc.id,
        data: { heroImage: media.id },
        locale: 'en',
      })
    } else {
      await payload.update({
        collection: 'exhibitions',
        id: doc.id,
        data: { heroImage: media.id },
        locale: 'en',
      })
    }
    console.log(`  Attached media id ${media.id}`)
  }

  // Confirm exhibition heroImage + venue monograms resolve at depth 1
  const { docs: venues } = await payload.find({
    collection: 'venues',
    where: { slug: { in: ['fkkb', 'lutze', 'kttk'] } },
    limit: 5,
    depth: 1,
  })
  for (const venue of venues) {
    console.log(
      `Monogram ${venue.slug}: ${mediaUrl(venue.venueMonogram) ?? '(none)'}`,
    )
  }
  const fkkb = venues.find((v) => v.slug === 'fkkb')
  if (fkkb) {
    const ex = await getCurrentExhibitionForVenue(fkkb.id)
    const url = mediaUrl(
      ex && 'heroImage' in ex ? ((ex as { heroImage?: unknown }).heroImage as never) : null,
    )
    console.log(
      `\nExhibition image check: ${ex?.title ?? 'null'} → ${url ?? 'NO URL (depth/populate issue)'}`,
    )
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
