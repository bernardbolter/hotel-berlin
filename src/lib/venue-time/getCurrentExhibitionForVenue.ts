import { getPayloadClient } from '@/lib/payload/client'

import type { Exhibition } from '@/payload-types'

import { getBerlinNow } from './berlin'
import { selectCurrentExhibitionForVenue } from './selectCurrentExhibition'
import type { VenueTimeExhibition } from './types'

export async function getCurrentExhibitionForVenue(
  venueId: string | number,
  now: Date = getBerlinNow(),
): Promise<Exhibition | null> {
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
    // depth 1 so heroImage populates for mediaUrl()
    depth: 1,
    locale: 'en',
    fallbackLocale: 'en',
  })

  return selectCurrentExhibitionForVenue(
    docs as VenueTimeExhibition[],
    venueId,
    now,
  ) as Exhibition | null
}
