import { getPayloadClient } from './client'

type EventQuery = {
  featured?: boolean
  limit?: number
}

export async function getEvents({ featured, limit = 20 }: EventQuery = {}) {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    where: featured != null ? { featured: { equals: featured } } : undefined,
    sort: 'startDate',
    limit,
  })

  return docs
}

export async function getEventBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}
