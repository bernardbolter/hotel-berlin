import type { Room } from '@/payload-types'

import { getPayloadClient } from './client'

/** Rooms for the homepage Sleep & Relax teaser (Outside_short.pdf). */
export async function getRoomsForHero(locale: 'de' | 'en'): Promise<Room[]> {
  const payload = await getPayloadClient()

  const teaser = await payload.find({
    collection: 'rooms',
    where: { 'homepageTeaser.enabled': { equals: true } },
    sort: 'homepageTeaser.order',
    locale,
    depth: 2,
    limit: 20,
  })

  if (teaser.docs.length > 0) return teaser.docs

  // Fallback: legacy `featured` flag until homepageTeaser is populated
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    locale,
    depth: 2,
    limit: 20,
  })
  return docs
}

export async function getRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    sort: 'displayOrder',
    limit: 20,
  })
  return docs
}

export async function getFeaturedRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    limit: 4,
  })
  return docs
}

export async function getRoomBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}
