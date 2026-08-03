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
 * Pure selector — prefers `current`, then `permanent` (no end / end in future).
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

  const current = forVenue.find((ex) => {
    if (ex.status !== 'current') return false
    if (ex.endDate && new Date(ex.endDate).getTime() < now.getTime()) return false
    if (ex.startDate && new Date(ex.startDate).getTime() > now.getTime()) return false
    return true
  })
  if (current) return current

  const permanent = forVenue.find((ex) => {
    if (ex.status !== 'permanent') return false
    if (ex.endDate && new Date(ex.endDate).getTime() < now.getTime()) return false
    return true
  })
  return permanent ?? null
}
