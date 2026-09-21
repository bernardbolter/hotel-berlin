/**
 * Upsert Im Haus amenity venues (wallride, gym, sauna, bike, business, EV)
 * and KTTK daily open-play hours. Does not invent sauna opening hours.
 *
 * Usage: npm run seed:here-amenities
 */
import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'

import config from '../payload.config'
import { hereAmenityLocalesDe, venuesSeed } from './data'

const AMENITY_SLUGS = [
  'kttk',
  'wallride',
  'gym',
  'sauna',
  'bett-and-bike',
  'business-center',
  'e-laden',
] as const

async function upsertVenue(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  en: Record<string, unknown>,
  de?: Record<string, unknown>,
) {
  const existing = (
    await payload.find({
      collection: 'venues',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })
  ).docs[0]

  if (existing) {
    await payload.update({
      collection: 'venues',
      id: existing.id,
      data: en,
      locale: 'en',
    })
    if (de) {
      await payload.update({
        collection: 'venues',
        id: existing.id,
        data: de,
        locale: 'de',
      })
    }
    console.log(`✓ venues/${slug} updated`)
    return
  }

  const created = await payload.create({
    collection: 'venues',
    data: { slug, ...en },
    locale: 'en',
  })
  if (de) {
    await payload.update({
      collection: 'venues',
      id: created.id,
      data: de,
      locale: 'de',
    })
  }
  console.log(`✓ venues/${slug} created`)
}

async function main() {
  const payload = await getPayload({ config })
  const bySlug = new Map(venuesSeed.map((row) => [row.slug, row]))

  for (const slug of AMENITY_SLUGS) {
    const en = bySlug.get(slug)
    if (!en) {
      console.warn(`skip ${slug} — not in venuesSeed`)
      continue
    }
    const { slug: _s, ...data } = en
    await upsertVenue(payload, slug, data, hereAmenityLocalesDe[slug])
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
