import { getBerlinNow } from './berlin'
import { resolveOccurrence } from './recurrence'
import type { VenueTimeEvent } from './types'

function venueIdOf(venue: VenueTimeEvent['venue']): string | number | null {
  if (venue == null) return null
  if (typeof venue === 'object') return venue.id
  return venue
}

export type EventOccurrenceMatch = {
  event: VenueTimeEvent
  occurrenceStart: Date
  occurrenceEnd: Date | null
}

/**
 * Pure selector — next occurrence at this venue (in progress or upcoming).
 */
export function selectNextEventForVenue(
  events: VenueTimeEvent[],
  venueId: string | number,
  now: Date = getBerlinNow(),
): EventOccurrenceMatch | null {
  const matches: EventOccurrenceMatch[] = []

  for (const event of events) {
    const id = venueIdOf(event.venue)
    if (id == null || String(id) !== String(venueId)) continue

    const occ = resolveOccurrence(
      event.startDate,
      event.endDate,
      event.isRecurring,
      event.recurrenceRule,
      now,
    )
    if (!occ) continue

    matches.push({
      event,
      occurrenceStart: occ.start,
      occurrenceEnd: occ.end,
    })
  }

  if (matches.length === 0) return null

  matches.sort((a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime())
  return matches[0] ?? null
}
