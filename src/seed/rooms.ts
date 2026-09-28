import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'

import config from '../payload.config'

import amenityTagsSeed from './data/amenity-tags.json'
import roomsSeed from './data/rooms.json'
import { plainRichText } from './richText'
import type { AmenityTagSeed, RoomSeedRecord } from './types'

const amenityTags = amenityTagsSeed as AmenityTagSeed[]
const rooms = roomsSeed as RoomSeedRecord[]

async function seedAmenityTags(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, number>> {
  console.log('Seeding amenity tags from src/seed/data/amenity-tags.json...')

  for (const tag of amenityTags) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })

    const dataEn = {
      name: tag.name,
      slug: tag.slug,
      type: 'amenity' as const,
      lucideIcon: tag.lucideIcon,
      description: tag.description.en,
    }

    const dataDe = {
      name: tag.name,
      description: tag.description.de,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'tags',
        id: existing.docs[0].id,
        data: dataEn,
        locale: 'en',
      })
      await payload.update({
        collection: 'tags',
        id: existing.docs[0].id,
        data: dataDe,
        locale: 'de',
      })
      console.log(`  Updated tag: ${tag.slug}`)
    } else {
      const created = await payload.create({
        collection: 'tags',
        data: dataEn,
        locale: 'en',
      })
      await payload.update({
        collection: 'tags',
        id: created.id,
        data: dataDe,
        locale: 'de',
      })
      console.log(`  Created tag: ${tag.slug}`)
    }
  }

  const { docs: tagDocs } = await payload.find({
    collection: 'tags',
    where: { type: { equals: 'amenity' } },
    limit: 300,
  })

  return new Map(tagDocs.map((tag) => [tag.slug, tag.id as number]))
}

async function seedRooms() {
  const payload = await getPayload({ config })
  const tagIdBySlug = await seedAmenityTags(payload)

  console.log('Seeding rooms from src/seed/data/rooms.json...')

  for (const room of rooms) {
    const existing = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: room.slug } },
      limit: 1,
    })

    const { name, shortDescription, description, amenities, ...rest } = room
    const missing = amenities.filter((slug) => !tagIdBySlug.has(slug))
    if (missing.length > 0) {
      console.warn(`  Warning (${room.slug}): missing amenity tags: ${missing.join(', ')}`)
    }

    const amenityIds = amenities
      .map((slug) => tagIdBySlug.get(slug))
      .filter((id): id is number => id != null)

    const data = {
      ...rest,
      currency: 'EUR',
      name: name.en,
      shortDescription: shortDescription.en,
      ...(description ? { description: plainRichText(description.en) } : {}),
      amenities: amenityIds,
    }

    const deData = {
      name: name.de,
      shortDescription: shortDescription.de,
      ...(description ? { description: plainRichText(description.de) } : {}),
    }

    if (existing.docs[0]) {
      const id = existing.docs[0].id
      await payload.update({ collection: 'rooms', id, data, locale: 'en' })
      await payload.update({
        collection: 'rooms',
        id,
        data: deData,
        locale: 'de',
      })
      console.log(`  Updated: ${room.slug} (${amenityIds.length} amenities)`)
      continue
    }

    const doc = await payload.create({ collection: 'rooms', data, locale: 'en' })
    await payload.update({
      collection: 'rooms',
      id: doc.id,
      data: deData,
      locale: 'de',
    })
    console.log(`  Created: ${room.slug} (${amenityIds.length} amenities)`)
  }

  console.log('Rooms seed complete.')
  process.exit(0)
}

seedRooms().catch((error) => {
  console.error('Rooms seed failed:', error)
  process.exit(1)
})
