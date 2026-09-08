import { getPayloadClient } from './client'

type EventQuery = {
  featured?: boolean
  limit?: number
  locale?: 'de' | 'en'
}

/**
 * Raw CMS docs sorted by series `startDate` — no RRULE expansion, no date filter.
 * Do not use for page lists (that is why `/hier/events` showed August).
 * Use {@link getEventOccurrences} instead.
 */
export async function getEvents({ featured, limit = 20, locale }: EventQuery = {}) {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    where: featured != null ? { featured: { equals: featured } } : undefined,
    sort: 'startDate',
    limit,
    ...(locale ? { locale, fallbackLocale: 'en' } : {}),
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
