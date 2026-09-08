import {
  dayOfWeekMatches,
  formatBerlinTime,
  getBerlinNow,
  getBerlinParts,
  parseTimeToMinutes,
} from './berlin'
import type { GuestDiningStatus, OpeningHoursEntry, OpenSegment } from './types'

export const KITCHEN_CLOSING_SOON_MINUTES = 30

function segmentKey(entry: OpeningHoursEntry): string {
  return (entry.segment ?? entry.label ?? '').trim() || 'Hours'
}

export function isOpenEndedEntry(entry: OpeningHoursEntry): boolean {
  if (entry.isOpenEnded) return true
  const n = entry.closes?.trim().toLowerCase()
  return n === 'open end' || n === 'open-end' || n === 'openend' || n === 'late'
}

function formatClock(minutes: number): string {
  const wrapped = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = String(Math.floor(wrapped / 60)).padStart(2, '0')
  const mm = String(wrapped % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function minutesUntilClose(
  opens: number,
  closes: number,
  minutesNow: number,
): number {
  if (closes > opens) return closes - minutesNow
  if (minutesNow >= opens) return 24 * 60 - minutesNow + closes
  return closes - minutesNow
}

function isOpenAt(
  entry: OpeningHoursEntry,
  weekday: number,
  minutesNow: number,
): boolean {
  if (!dayOfWeekMatches(entry.dayOfWeek, weekday)) return false
  const opens = entry.opens ? parseTimeToMinutes(entry.opens) : null
  if (opens == null) return false

  const closes = entry.closes ? parseTimeToMinutes(entry.closes) : null
  if (closes == null) {
    // Open-ended with no clock bound: open from `opens` until midnight.
    return isOpenEndedEntry(entry) && minutesNow >= opens
  }

  if (closes > opens) {
    return minutesNow >= opens && minutesNow < closes
  }
  // overnight window (e.g. 10:00–01:00)
  return minutesNow >= opens || minutesNow < closes
}

function nextOpenForEntries(
  entries: OpeningHoursEntry[],
  weekday: number,
  minutesNow: number,
): { time: string; tomorrow: boolean } | undefined {
  const today: number[] = []
  for (const entry of entries) {
    if (!dayOfWeekMatches(entry.dayOfWeek, weekday)) continue
    const opens = entry.opens ? parseTimeToMinutes(entry.opens) : null
    if (opens == null) continue
    if (opens > minutesNow) today.push(opens)
  }
  if (today.length > 0) {
    return { time: formatClock(Math.min(...today)), tomorrow: false }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7
    const opens: number[] = []
    for (const entry of entries) {
      if (!dayOfWeekMatches(entry.dayOfWeek, day)) continue
      const open = entry.opens ? parseTimeToMinutes(entry.opens) : null
      if (open != null) opens.push(open)
    }
    if (opens.length === 0) continue
    return { time: formatClock(Math.min(...opens)), tomorrow: offset === 1 }
  }
  return undefined
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
    const staticNote = entries.map((e) => e.note?.trim()).find(Boolean)

    if (openEntry) {
      const opens = openEntry.opens ? parseTimeToMinutes(openEntry.opens) : null
      const closes = openEntry.closes ? parseTimeToMinutes(openEntry.closes) : null
      const until =
        closes != null && opens != null && !isOpenEndedEntry(openEntry)
          ? minutesUntilClose(opens, closes, minutesNow)
          : undefined

      const segment: OpenSegment = {
        label,
        status: 'Open',
      }
      if (staticNote) segment.note = staticNote
      if (closes != null && !isOpenEndedEntry(openEntry)) {
        segment.closesAt = openEntry.closes!.trim()
      }
      if (until != null) segment.minutesUntilClose = until
      return segment
    }

    const next = nextOpenForEntries(entries, weekday, minutesNow)
    const segment: OpenSegment = {
      label,
      status: 'Closed',
    }
    if (staticNote) segment.note = staticNote
    if (next?.time) {
      segment.nextOpensAt = next.time
      segment.nextOpensTomorrow = next.tomorrow
    }
    return segment
  })
}

function findSegment(segments: OpenSegment[], name: string): OpenSegment | undefined {
  return segments.find((s) => s.label.toLowerCase() === name)
}

/**
 * Kitchen-first status for the guest hub dining band.
 * Closing-soon wins over a generic “open until” line.
 */
export function deriveGuestDiningStatus(
  openingHours: OpeningHoursEntry[] | null | undefined,
  now: Date = getBerlinNow(),
): GuestDiningStatus | null {
  const segments = deriveOpenClosed(openingHours, now)
  if (segments.length === 0) return null

  const kitchen = findSegment(segments, 'kitchen')
  const bar = findSegment(segments, 'bar')

  if (
    kitchen?.status === 'Open' &&
    kitchen.minutesUntilClose != null &&
    kitchen.minutesUntilClose > 0 &&
    kitchen.minutesUntilClose <= KITCHEN_CLOSING_SOON_MINUTES
  ) {
    return { kind: 'kitchenClosingSoon', minutes: kitchen.minutesUntilClose }
  }

  if (kitchen?.status === 'Open') {
    return { kind: 'kitchenOpen', until: kitchen.closesAt ?? '' }
  }

  if (bar?.status === 'Open') {
    return {
      kind: 'barOnly',
      kitchenOpensAt: kitchen?.nextOpensAt,
      kitchenOpensTomorrow: kitchen?.nextOpensTomorrow,
    }
  }

  return {
    kind: 'closed',
    kitchenOpensAt: kitchen?.nextOpensAt ?? bar?.nextOpensAt,
    kitchenOpensTomorrow: kitchen?.nextOpensTomorrow ?? bar?.nextOpensTomorrow,
  }
}

/** Convenience for single-segment venues / Spotlight primaryMeta. */
export function formatOpenSegmentLine(segment: OpenSegment): string {
  if (segment.status === 'Open') {
    return segment.closesAt ? `Open · ${segment.closesAt}` : 'Open'
  }
  if (segment.nextOpensAt) {
    return segment.nextOpensTomorrow
      ? `Closed · ${segment.nextOpensAt}`
      : `Closed · ${segment.nextOpensAt}`
  }
  return segment.note ? `Closed · ${segment.note}` : 'Closed'
}

export function formatBerlinClock(now: Date = getBerlinNow()): string {
  return formatBerlinTime(now)
}
