import 'dotenv/config'
import { getPayload } from 'payload'

import type { Config } from '@/payload-types'
import config from '../payload.config'

type SeedableCollection = keyof Config['collections']
import {
  defaultInsideNavSlugs,
  hotelSeed,
  lutzeLocaleDe,
  kttkLocaleDe,
  fkkbLocaleDe,
  sissiLocaleDe,
  wallrideLocaleDe,
  meetingRoomsSeed,
  pagesSeed,
  tagsSeed,
  venuesSeed,
  wundermartLocaleDe,
} from './data'
import roomsSeed from './data/rooms.json'
import { upsertFaqs } from './faqs'
import { upsertPage } from './pages'
import { plainRichText } from './richText'
import type { AmenityTagSeed, RoomSeedRecord } from './types'

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

async function isFooterSeeded(): Promise<boolean> {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({ slug: 'footer' })
  return Boolean(footer.columns && footer.columns.length > 0)
}

async function seed() {
  const payload = await getPayload({ config })

  if (!(await isSeeded('tags'))) {
    console.log('Seeding tags...')
    for (const tag of tagsSeed) {
      if (tag.type === 'amenity') {
        const amenity = tag as AmenityTagSeed
        const created = await payload.create({
          collection: 'tags',
          data: {
            name: amenity.name,
            slug: amenity.slug,
            type: 'amenity',
            lucideIcon: amenity.lucideIcon,
            description: amenity.description.en,
          },
          locale: 'en',
        })
        await payload.update({
          collection: 'tags',
          id: created.id,
          data: {
            name: amenity.name,
            description: amenity.description.de,
          },
          locale: 'de',
        })
      } else {
        await payload.create({
          collection: 'tags',
          data: {
            name: tag.name,
            slug: tag.slug,
            type: tag.type,
          },
          locale: 'en',
        })
      }
    }
  }

  if (!(await isHotelSeeded())) {
    console.log('Seeding hotel global...')
    await payload.updateGlobal({ slug: 'hotel', data: hotelSeed, locale: 'en' })
    await payload.updateGlobal({
      slug: 'hotel',
      locale: 'en',
      data: {
        roomService: {
          offered: false,
          note: 'No room service — collect at the bar',
        },
      },
    })
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
  }

  if (!(await isSeeded('rooms'))) {
    console.log('Seeding rooms...')

    const { docs: tagDocs } = await payload.find({ collection: 'tags', limit: 300 })
    const tagIdBySlug = new Map(tagDocs.map((tag) => [tag.slug, tag.id as number]))

    for (const room of rooms) {
      const { name, shortDescription, description, amenities, ...rest } = room
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
          ...(description ? { description: plainRichText(description.en) } : {}),
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
          ...(description ? { description: plainRichText(description.de) } : {}),
        },
        locale: 'de',
      })
    }
  }

  const meetingRoomIds = new Map<string, number>()

  if (!(await isSeeded('meeting-rooms'))) {
    console.log('Seeding meeting rooms...')
    for (const room of meetingRoomsSeed) {
      const { combinableWith, name, shortDescription, description, ...rest } = room as {
        combinableWith?: string[]
        name: { en: string; de: string }
        shortDescription: { en: string; de: string }
        description?: { en: string; de: string }
        [key: string]: unknown
      }
      const doc = await payload.create({
        collection: 'meeting-rooms',
        data: {
          ...rest,
          name: name.en,
          shortDescription: shortDescription.en,
          ...(description ? { description: plainRichText(description.en) } : {}),
        },
        locale: 'en',
      } as Parameters<(typeof payload)['create']>[0])
      meetingRoomIds.set(room.slug, doc.id as number)

      await payload.update({
        collection: 'meeting-rooms',
        id: doc.id,
        data: {
          name: name.de,
          shortDescription: shortDescription.de,
          ...(description ? { description: plainRichText(description.de) } : {}),
        },
        locale: 'de',
      })
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
    const venueDe: Record<string, object> = {
      lutze: lutzeLocaleDe,
      wundermart: wundermartLocaleDe,
      kttk: kttkLocaleDe,
      fkkb: fkkbLocaleDe,
      sissi: sissiLocaleDe,
      wallride: wallrideLocaleDe,
    }
    for (const venue of venuesSeed) {
      const doc = await payload.create({ collection: 'venues', data: venue, locale: 'en' })
      const de = venueDe[venue.slug]
      if (de) {
        await payload.update({
          collection: 'venues',
          id: doc.id,
          data: { name: venue.name, ...de },
          locale: 'de',
        })
      }
    }
  }

  if (!(await isSeeded('faqs'))) {
    console.log('Seeding FAQs...')
    await upsertFaqs(payload)
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

  if (!(await isFooterSeeded())) {
    console.log('Seeding footer global...')
    const { footerSeedDe, footerSeedEn } = await import('./data/footer')
    await payload.updateGlobal({
      slug: 'footer',
      data: footerSeedEn,
      locale: 'en',
    })
    await payload.updateGlobal({
      slug: 'footer',
      data: footerSeedDe,
      locale: 'de',
    })
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
