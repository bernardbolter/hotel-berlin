import { getPayloadClient } from './client'

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
