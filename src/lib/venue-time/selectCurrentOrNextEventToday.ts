import { endOfBerlinDay, getBerlinNow, startOfBerlinDay } from './berlin'
import { formatRelativeTime } from './formatRelativeTime'
import { isAlwaysOnDailyRecurring, resolveOccurrence } from './recurrence'
import type { EventWithRelativeTime, VenueTimeEvent } from './types'

/**
 * Pure selector — current or next event *today* (Berlin calendar day).
 * Excludes always-on daily recurring events (FREQ=DAILY).
 */
export function selectCurrentOrNextEventToday(
  events: VenueTimeEvent[],
  now: Date = getBerlinNow(),
): EventWithRelativeTime | null {
  const dayStart = startOfBerlinDay(now).getTime()
  const dayEnd = endOfBerlinDay(now).getTime()
  const nowMs = now.getTime()
  const candidates: EventWithRelativeTime[] = []

  for (const event of events) {
    if (isAlwaysOnDailyRecurring(event.isRecurring, event.recurrenceRule)) continue

    const occ = resolveOccurrence(
      event.startDate,
      event.endDate,
      event.isRecurring,
      event.recurrenceRule,
      now,
    )
    if (!occ) continue

    const start = occ.start.getTime()
    const end = occ.end?.getTime() ?? null
    const inProgress = start <= nowMs && (end == null || end >= nowMs)
    const startsToday = start >= dayStart && start <= dayEnd

    // Must intersect today and still be relevant (in progress or upcoming later today)
    if (!startsToday && !inProgress) continue
    if (end != null && end < nowMs) continue
    if (start > dayEnd) continue

    candidates.push({
      ...event,
      occurrenceStart: occ.start,
      occurrenceEnd: occ.end,
      relativeTime: formatRelativeTime(occ.start, now, occ.end),
    })
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    const aNow = a.relativeTime.kind === 'now' ? 0 : 1
    const bNow = b.relativeTime.kind === 'now' ? 0 : 1
    if (aNow !== bNow) return aNow - bNow
    return a.occurrenceStart.getTime() - b.occurrenceStart.getTime()
  })

  return candidates[0] ?? null
}
