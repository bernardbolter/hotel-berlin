import {
  dayOfWeekMatches,
  formatBerlinTime,
  getBerlinNow,
  getBerlinParts,
  parseTimeToMinutes,
} from './berlin'
import type { OpeningHoursEntry, OpenSegment } from './types'

function segmentKey(entry: OpeningHoursEntry): string {
  return (entry.segment ?? entry.label ?? '').trim() || 'Hours'
}

function isOpenAt(
  entry: OpeningHoursEntry,
  weekday: number,
  minutesNow: number,
): boolean {
  if (!dayOfWeekMatches(entry.dayOfWeek, weekday)) return false
  const opens = entry.opens ? parseTimeToMinutes(entry.opens) : null
  const closes = entry.closes ? parseTimeToMinutes(entry.closes) : null
  if (opens == null || closes == null) return false

  if (closes > opens) {
    return minutesNow >= opens && minutesNow < closes
  }
  // overnight window (e.g. 22:00–02:00)
  return minutesNow >= opens || minutesNow < closes
}

function nextOpenNote(
  entries: OpeningHoursEntry[],
  weekday: number,
  minutesNow: number,
): string | undefined {
  const candidates: number[] = []
  for (const entry of entries) {
    if (!dayOfWeekMatches(entry.dayOfWeek, weekday)) continue
    const opens = entry.opens ? parseTimeToMinutes(entry.opens) : null
    if (opens == null) continue
    if (opens > minutesNow) candidates.push(opens)
  }
  if (candidates.length === 0) return undefined
  const next = Math.min(...candidates)
  const hh = String(Math.floor(next / 60)).padStart(2, '0')
  const mm = String(next % 60).padStart(2, '0')
  return `Reopens ${hh}:${mm}`
}

/**
 * Returns one status row per distinct segment label.
 * Multiple openingHours rows that share a segment (e.g. Kitchen lunch + dinner)
 * collapse into a single OpenSegment — open if *any* window covers `now`.
 */
export function deriveOpenClosed(
  openingHours: OpeningHoursEntry[] | null | undefined,
  now: Date = getBerlinNow(),
): OpenSegment[] {
  if (!openingHours?.length) return []

  const { weekday, hour, minute } = getBerlinParts(now)
  const minutesNow = hour * 60 + minute

  const order: string[] = []
  const bySegment = new Map<string, OpeningHoursEntry[]>()

  for (const entry of openingHours) {
    const key = segmentKey(entry)
    if (!bySegment.has(key)) {
      bySegment.set(key, [])
      order.push(key)
    }
    bySegment.get(key)!.push(entry)
  }

  return order.map((label) => {
    const entries = bySegment.get(label)!
    const openEntry = entries.find((e) => isOpenAt(e, weekday, minutesNow))

    if (openEntry) {
      return {
        label,
        status: 'Open' as const,
        note: openEntry.note?.trim() || undefined,
      }
    }

    const staticNote = entries.map((e) => e.note?.trim()).find(Boolean)
    const note = staticNote || nextOpenNote(entries, weekday, minutesNow)

    return {
      label,
      status: 'Closed' as const,
      note,
    }
  })
}

/** Convenience for single-segment venues / Spotlight primaryMeta. */
export function formatOpenSegmentLine(segment: OpenSegment): string {
  if (segment.status === 'Open') {
    return segment.note ? `Open · ${segment.note}` : 'Open'
  }
  return segment.note ? `Closed · ${segment.note}` : 'Closed'
}

export function formatBerlinClock(now: Date = getBerlinNow()): string {
  return formatBerlinTime(now)
}
