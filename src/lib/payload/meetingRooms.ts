import type { MeetingRoom } from '@/payload-types'

import { getPayloadClient } from './client'

export async function getMeetingRooms(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    locale,
    depth: 2,
    sort: 'displayOrder',
    limit: 50,
  })
  return docs
}

export async function getFeaturedMeetingRooms(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    locale,
    depth: 2,
    limit: 4,
  })
  return docs
}

export async function getMeetingRoomBySlug(
  slug: string,
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: { slug: { equals: slug } },
    locale,
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getMeetingRoomSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    limit: 100,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug)
}
