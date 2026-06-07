import type { Where } from 'payload'

import { getPayloadClient } from './client'

export async function getVenues() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'venues',
    sort: 'displayOrder',
    limit: 20,
  })
  return docs
}

export async function getFeaturedVenues() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'venues',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    limit: 4,
  })
  return docs
}

export async function getVenueBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'venues',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}
