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

/** All rooms for the /rooms index, ordered by editorial displayOrder. */
export async function getAllRooms(locale: 'de' | 'en'): Promise<Room[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    locale,
    depth: 2,
    sort: 'displayOrder',
    limit: 50,
  })
  return docs
}

/** @deprecated Prefer getAllRooms(locale) — kept for existing callers. */
export async function getRooms() {
  return getAllRooms('en')
}

export async function getFeaturedRooms(locale: 'de' | 'en' = 'en') {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    locale,
    depth: 2,
    limit: 4,
  })
  return docs
}

export async function getRoomBySlug(
  slug: string,
  locale: 'de' | 'en' = 'en',
): Promise<Room | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: slug } },
    locale,
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getRoomSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    depth: 0,
    limit: 50,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter(Boolean)
}
