import 'dotenv/config'
import { getPayload } from 'payload'

import type { Place } from '../src/payload-types'
import placesData from '../src/lib/data/places.json'
import config from '../src/payload.config'

type PlaceSeed = (typeof placesData)[number]
type PlaceCreateData = Omit<Place, 'id' | 'updatedAt' | 'createdAt'>

function toPayloadData(place: PlaceSeed): PlaceCreateData {
  const { id: _id, ...rest } = place

  return {
    name: rest.name,
    slug: rest.slug,
    context: rest.context as PlaceCreateData['context'],
    type: rest.type as PlaceCreateData['type'],
    category: rest.category as PlaceCreateData['category'],
    shortDescription: rest.shortDescription,
    shortDescriptionDE: rest.shortDescriptionDE,
    location: rest.location,
    address: rest.address ?? undefined,
    walkingMinutes: rest.walkingMinutes ?? undefined,
    walkingNote: rest.walkingNote,
    floor: rest.floor ?? undefined,
    website: rest.website ?? undefined,
    hours: rest.hours ?? undefined,
    pinIcon: rest.pinIcon as PlaceCreateData['pinIcon'],
    schemaType: rest.schemaType as PlaceCreateData['schemaType'],
    featured: rest.featured,
    active: rest.active,
  }
}

async function seed() {
  const payload = await getPayload({ config })

  for (const place of placesData) {
    const existing = await payload.find({
      collection: 'places',
      where: { slug: { equals: place.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping existing place: ${place.name}`)
      continue
    }

    await payload.create({
      collection: 'places',
      data: toPayloadData(place),
    })

    console.log(`Created: ${place.name}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
