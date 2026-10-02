import type { MeetingRoom } from '@/payload-types'

import { getPayloadClient } from './client'

const visibleWhere = {
  or: [{ visibleOnSite: { equals: true } }, { visibleOnSite: { exists: false } }],
}

export async function getMeetingRooms(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: visibleWhere,
    locale,
    depth: 2,
    sort: 'displayOrder',
    limit: 50,
  })
  return docs
}

/** Meeting rooms for the homepage Meet & Work teaser. */
export async function getMeetingRoomsForTeaser(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: {
      and: [{ 'homepageTeaser.enabled': { equals: true } }, visibleWhere],
    },
    sort: 'homepageTeaser.order',
    locale,
    depth: 2,
    limit: 20,
  })
  return docs
}

export async function getFeaturedMeetingRooms(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingRoom[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: {
      and: [{ featured: { equals: true } }, visibleWhere],
    },
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
    where: {
      and: [{ slug: { equals: slug } }, visibleWhere],
    },
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
    where: visibleWhere,
    limit: 100,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug)
}
