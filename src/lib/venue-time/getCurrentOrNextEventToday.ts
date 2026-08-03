import { getPayloadClient } from '@/lib/payload/client'

import { getBerlinNow } from './berlin'
import { selectCurrentOrNextEventToday } from './selectCurrentOrNextEventToday'
import type { EventWithRelativeTime, VenueTimeEvent } from './types'

export async function getCurrentOrNextEventToday(
  now: Date = getBerlinNow(),
): Promise<EventWithRelativeTime | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    limit: 100,
    depth: 1,
    sort: 'startDate',
  })

  return selectCurrentOrNextEventToday(docs as VenueTimeEvent[], now)
}
