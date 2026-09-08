import { getPayloadClient } from './client'
import {
  expandOccurrencesInWindow,
  isAlwaysOnDailyRecurring,
} from '@/lib/venue-time/recurrence'
import type { Event } from '@/payload-types'

export type EventOccurrence = {
  event: Event
  start: Date
  end: Date | null
  alwaysOn: boolean
}

export type GetEventOccurrencesArgs = {
  from: Date
  to: Date
  locale?: 'de' | 'en'
  /** FREQ=DAILY series (Open Play). Default false — dated happenings only. */
  includeAlwaysOn?: boolean
}

/**
 * Page-facing event list. Expands RRULEs across `[from, to)` and sorts by start.
 * Replaces `getEvents()` for any UI that needs dates rather than series-start rows.
 */
export async function getEventOccurrences({
  from,
  to,
  locale,
  includeAlwaysOn = false,
}: GetEventOccurrencesArgs): Promise<EventOccurrence[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    limit: 100,
    depth: 2,
    ...(locale ? { locale, fallbackLocale: 'en' } : {}),
  })

  const results: EventOccurrence[] = []

  for (const doc of docs) {
    const event = doc as Event
    const alwaysOn = isAlwaysOnDailyRecurring(event.isRecurring, event.recurrenceRule)
    if (alwaysOn && !includeAlwaysOn) continue

    const occs = expandOccurrencesInWindow(
      event.startDate,
      event.endDate,
      event.isRecurring,
      event.recurrenceRule,
      from,
      to,
    )
    for (const occ of occs) {
      results.push({ event, start: occ.start, end: occ.end, alwaysOn })
    }
  }

  results.sort((a, b) => a.start.getTime() - b.start.getTime())
  return results
}
