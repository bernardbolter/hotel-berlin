import { getExhibitionStatus } from '@/lib/art/status'
import { getBerlinNow } from './berlin'
import type { VenueTimeExhibition } from './types'

function venueIdOf(
  venue: VenueTimeExhibition['venue'],
): string | number | null {
  if (venue == null) return null
  if (typeof venue === 'object') return venue.id
  return venue
}

/**
 * Pure selector — dated current shows first, then permanent, for one venue.
 * Status is derived from dates / runType (never a stored select).
 */
export function selectCurrentExhibitionForVenue(
  exhibitions: VenueTimeExhibition[],
  venueId: string | number,
  now: Date = getBerlinNow(),
): VenueTimeExhibition | null {
  const forVenue = exhibitions.filter((ex) => {
    const id = venueIdOf(ex.venue)
    return id != null && String(id) === String(venueId)
  })

  const dated = forVenue.find((ex) => {
    const status = getExhibitionStatus(ex, now)
    return status === 'current' && (ex.runType ?? ex.status) !== 'permanent'
  })
  if (dated) return dated

  return (
    forVenue.find((ex) => {
      const status = getExhibitionStatus(ex, now)
      return status === 'current' && (ex.runType === 'permanent' || ex.status === 'permanent')
    }) ?? null
  )
}
