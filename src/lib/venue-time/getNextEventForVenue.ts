import { getPayloadClient } from '@/lib/payload/client'

import { getBerlinNow } from './berlin'
import { selectNextEventForVenue, type EventOccurrenceMatch } from './selectNextEvent'
import type { VenueTimeEvent } from './types'

export async function getNextEventForVenue(
  venueId: string | number,
  now: Date = getBerlinNow(),
): Promise<EventOccurrenceMatch | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    where: { venue: { equals: venueId } },
    limit: 100,
    // depth 2 so nested venue.venueMonogram populates for SpotlightCard
    depth: 2,
    locale: 'en',
  })

  return selectNextEventForVenue(docs as VenueTimeEvent[], venueId, now)
}
