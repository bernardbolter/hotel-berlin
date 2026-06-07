import { getPayloadClient } from './client'

export async function getMeetingRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    sort: 'displayOrder',
    limit: 50,
  })
  return docs
}

export async function getFeaturedMeetingRooms() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: { featured: { equals: true } },
    sort: 'displayOrder',
    limit: 4,
  })
  return docs
}

export async function getMeetingRoomBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'meeting-rooms',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}
