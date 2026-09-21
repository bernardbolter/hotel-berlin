/**
 * Upsert amenity tags (localized names, descriptions, icons).
 * Usage: npm run seed:amenity-tags
 */
import 'dotenv/config'
import './guard'

import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../payload.config'
import amenityTagsSeed from './data/amenity-tags.json'
import type { AmenityTagSeed } from './types'

const tags = amenityTagsSeed as AmenityTagSeed[]

export async function upsertAmenityTags(payload: Payload): Promise<Map<string, number>> {
  console.log('Seeding amenity tags from src/seed/data/amenity-tags.json...')

  for (const tag of tags) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })

    const dataEn = {
      name: tag.name.en,
      slug: tag.slug,
      type: 'amenity' as const,
      lucideIcon: tag.lucideIcon,
      description: tag.description.en,
    }

    const dataDe = {
      name: tag.name.de,
      description: tag.description.de,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'tags',
        id: existing.docs[0].id,
        data: dataEn,
        locale: 'en',
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      await payload.update({
        collection: 'tags',
        id: existing.docs[0].id,
        data: dataDe,
        locale: 'de',
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      console.log(`  updated ${tag.slug}`)
    } else {
      const created = await payload.create({
        collection: 'tags',
        data: dataEn,
        locale: 'en',
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      await payload.update({
        collection: 'tags',
        id: created.id,
        data: dataDe,
        locale: 'de',
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      console.log(`  created ${tag.slug}`)
    }
  }

  const { docs: tagDocs } = await payload.find({
    collection: 'tags',
    where: { type: { equals: 'amenity' } },
    limit: 300,
  })

  return new Map(tagDocs.map((tag) => [tag.slug, tag.id as number]))
}

async function seed() {
  const payload = await getPayload({ config })
  await upsertAmenityTags(payload)
  console.log('Amenity tags seed complete.')
  process.exit(0)
}

const isCli =
  process.argv[1]?.includes('seed/amenity-tags.ts') ||
  process.argv[1]?.includes('seed/amenity-tags.js')

if (isCli) {
  seed().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
