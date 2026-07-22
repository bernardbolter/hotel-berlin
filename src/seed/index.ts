import 'dotenv/config'
import { getPayload } from 'payload'

import type { Config } from '@/payload-types'
import config from '../payload.config'

type SeedableCollection = keyof Config['collections']
import {
  defaultInsideNavSlugs,
  faqsSeed,
  hotelSeed,
  meetingRoomsSeed,
  pagesSeed,
  tagsSeed,
  venuesSeed,
} from './data'
import roomsSeed from './data/rooms.json'
import { upsertPage } from './pages'
import type { RoomSeedRecord } from './types'

const rooms = roomsSeed as RoomSeedRecord[]

async function isSeeded(collection: SeedableCollection): Promise<boolean> {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.find({ collection, limit: 1 })
  return totalDocs > 0
}

async function isHotelSeeded(): Promise<boolean> {
  const payload = await getPayload({ config })
  const hotel = await payload.findGlobal({ slug: 'hotel' })
  return Boolean(hotel.name)
}

async function isNavigationSeeded(): Promise<boolean> {
  const payload = await getPayload({ config })
  const nav = await payload.findGlobal({ slug: 'navigation' })
  return Boolean(nav.secondaryLinks && nav.secondaryLinks.length > 0)
}

async function seed() {
  const payload = await getPayload({ config })

  if (!(await isSeeded('tags'))) {
    console.log('Seeding tags...')
    for (const tag of tagsSeed) {
      await payload.create({ collection: 'tags', data: tag, locale: 'en' })
    }
  }

  if (!(await isHotelSeeded())) {
    console.log('Seeding hotel global...')
    await payload.updateGlobal({ slug: 'hotel', data: hotelSeed })
  }

  if (!(await isSeeded('rooms'))) {
    console.log('Seeding rooms...')

    const { docs: tagDocs } = await payload.find({ collection: 'tags', limit: 300 })
    const tagIdBySlug = new Map(tagDocs.map((tag) => [tag.slug, tag.id as number]))

    for (const room of rooms) {
      const { name, shortDescription, amenities, ...rest } = room
      const amenityIds = amenities
        .map((slug) => tagIdBySlug.get(slug))
        .filter((id): id is number => id != null)

      const doc = await payload.create({
        collection: 'rooms',
        data: {
          ...rest,
          currency: 'EUR',
          name: name.en,
          shortDescription: shortDescription.en,
          amenities: amenityIds,
        },
        locale: 'en',
      })

      await payload.update({
        collection: 'rooms',
        id: doc.id,
        data: {
          name: name.de,
          shortDescription: shortDescription.de,
        },
        locale: 'de',
      })
    }
  }

  const meetingRoomIds = new Map<string, number>()

  if (!(await isSeeded('meeting-rooms'))) {
    console.log('Seeding meeting rooms...')
    for (const room of meetingRoomsSeed) {
      const { combinableWith, ...data } = room
      const doc = await payload.create({ collection: 'meeting-rooms', data, locale: 'en' })
      meetingRoomIds.set(room.slug, doc.id as number)
    }

    for (const room of meetingRoomsSeed) {
      if (!room.combinableWith?.length) continue

      const relatedIds = room.combinableWith
        .map((slug) => meetingRoomIds.get(slug))
        .filter((id): id is number => id != null)

      if (relatedIds.length === 0) continue

      await payload.update({
        collection: 'meeting-rooms',
        id: meetingRoomIds.get(room.slug)!,
        data: { combinableWith: relatedIds },
      })
    }
  }

  if (!(await isSeeded('venues'))) {
    console.log('Seeding venues...')
    for (const venue of venuesSeed) {
      await payload.create({ collection: 'venues', data: venue, locale: 'en' })
    }
  }

  if (!(await isSeeded('faqs'))) {
    console.log('Seeding FAQs...')
    for (const faq of faqsSeed) {
      await payload.create({ collection: 'faqs', data: faq, locale: 'en' })
    }
  }

  const pageIds = new Map<string, number>()

  console.log('Seeding pages (skeleton)...')
  for (const page of pagesSeed) {
    const id = await upsertPage(payload, page)
    pageIds.set(page.slug, id)
    console.log(`  Seeded: ${page.slug}`)
  }

  if (!(await isNavigationSeeded())) {
    console.log('Seeding inside navigation...')
    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        secondaryLinks: defaultInsideNavSlugs.map((slug) => ({
          page: pageIds.get(slug),
        })),
      },
    })
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
