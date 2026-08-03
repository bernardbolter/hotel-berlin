import { getPayloadClient } from '@/lib/payload/client'

import { getBerlinNow } from './berlin'
import { selectCurrentExhibitionForVenue } from './selectCurrentExhibition'
import type { VenueTimeExhibition } from './types'

export async function getCurrentExhibitionForVenue(
  venueId: string | number,
  now: Date = getBerlinNow(),
): Promise<VenueTimeExhibition | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { venue: { equals: venueId } },
        {
          or: [{ status: { equals: 'current' } }, { status: { equals: 'permanent' } }],
        },
      ],
    },
    limit: 20,
    depth: 0,
  })

  return selectCurrentExhibitionForVenue(docs as VenueTimeExhibition[], venueId, now)
}
