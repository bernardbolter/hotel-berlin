/**
 * Guest hub §2 dining data: Lütze DE copy + 01:00 bar close, Wundermart,
 * hotel openingHours array, weekend breakfast, prices, room-service line.
 *
 * Usage: npm run seed:here-dining
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import {
  hotelSeed,
  lutzeHoursSeed,
  lutzeLocaleDe,
  wundermartLocaleDe,
  wundermartSeed,
} from './data'

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
    return existing.id
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
  return created.id
}

async function main() {
  const payload = await getPayload({ config })

  await upsertVenue(
    payload,
    'lutze',
    {
      openingHours: lutzeHoursSeed,
      name: 'Lütze',
      tagline: 'The place to eat, play, and hang all day.',
      shortDescription:
        'Italian deli café, bar, and garden at Lützowplatz 17. Open to guests and Berliners alike.',
      location: 'Ground Floor, Lützowplatz 17',
      spotlightLocation: 'Ground floor',
      servesCuisine: 'Italian',
      isGuestFacing: true,
    },
    lutzeLocaleDe,
  )

  await upsertVenue(
    payload,
    'wundermart',
    {
      name: wundermartSeed.name,
      venueType: wundermartSeed.venueType,
      location: wundermartSeed.location,
      openingHours: wundermartSeed.openingHours,
      shortDescription: wundermartSeed.shortDescription,
      isGuestFacing: wundermartSeed.isGuestFacing,
      isOpenToPublic: wundermartSeed.isOpenToPublic,
      featured: wundermartSeed.featured,
      displayOrder: wundermartSeed.displayOrder,
    },
    wundermartLocaleDe,
  )

  const kttk = (
    await payload.find({
      collection: 'venues',
      where: { slug: { equals: 'kttk' } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })
  ).docs[0]
  if (kttk) {
    await payload.update({
      collection: 'venues',
      id: kttk.id,
      locale: 'en',
      data: {
        name: kttk.name || 'KTTK — Königlicher Tischtennis Klub Berlin',
        openingHours: [
          {
            dayOfWeek: 'Thursday',
            opens: '19:00',
            closes: '02:00',
            isOpenEnded: true,
            segment: 'Tournament Night',
          },
        ],
      },
    })
    console.log('✓ venues/kttk hours (isOpenEnded)')
  }

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'en',
    data: {
      hours: hotelSeed.hours,
      breakfastPricing: hotelSeed.breakfastPricing,
      guestStay: hotelSeed.guestStay,
      roomService: {
        offered: false,
        note: 'No room service — collect at the bar',
      },
    },
  })
  console.log('✓ hotel openingHours + breakfastPricing (en)')

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'de',
    data: {
      roomService: {
        offered: false,
        note: 'Kein Zimmerservice — Abholung an der Bar',
      },
    },
  })
  console.log('✓ hotel roomService (de)')

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
