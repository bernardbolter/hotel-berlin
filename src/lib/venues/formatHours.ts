import { isOpenEndedEntry } from '@/lib/venue-time/deriveOpenClosed'
import type { OpeningHoursEntry } from '@/lib/venue-time/types'

export type HoursSegmentDisplay = {
  label: string
  body: string
}

function formatWindow(
  entry: OpeningHoursEntry,
  openEndLabel: string,
): string | null {
  if (!entry.opens?.trim()) return null
  if (isOpenEndedEntry(entry)) return `${entry.opens.trim()} – ${openEndLabel}`
  if (!entry.closes?.trim()) return entry.opens.trim()
  return `${entry.opens.trim()}–${entry.closes.trim()}`
}

/**
 * Collapse venue openingHours rows into one display line per segment
 * (Kitchen lunch + dinner → "11:30–15:00 · 17:00–22:30").
 */
export function formatVenueHoursSegments(
  openingHours: OpeningHoursEntry[] | null | undefined,
  openEndLabel = 'open end',
): HoursSegmentDisplay[] {
  if (!openingHours?.length) return []

  const order: string[] = []
  const windows = new Map<string, string[]>()

  for (const entry of openingHours) {
    const label = (entry.segment ?? entry.label ?? '').trim() || 'Hours'
    const window = formatWindow(entry, openEndLabel)
    if (!window) continue
    if (!windows.has(label)) {
      windows.set(label, [])
      order.push(label)
    }
    const list = windows.get(label)!
    if (!list.includes(window)) list.push(window)
  }

  return order.map((label) => ({
    label,
    body: windows.get(label)!.join(' · '),
  }))
}

export function localizeHoursSegmentLabel(
  label: string,
  labels: { kitchen?: string; bar?: string; breakfast?: string },
): string {
  const key = label.trim().toLowerCase()
  if (key === 'kitchen' && labels.kitchen) return labels.kitchen
  if (key === 'bar' && labels.bar) return labels.bar
  if (key === 'breakfast' && labels.breakfast) return labels.breakfast
  return label
}

export function toOpeningHoursEntries(
  openingHours:
    | {
        dayOfWeek?: string | null
        opens?: string | null
        closes?: string | null
        isOpenEnded?: boolean | null
        segment?: string | null
        note?: string | null
      }[]
    | null
    | undefined,
): OpeningHoursEntry[] {
  return (openingHours ?? []).map((h) => ({
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
    isOpenEnded: h.isOpenEnded,
    segment: h.segment,
    note: h.note,
  }))
}

export function entriesForSegment(
  openingHours: OpeningHoursEntry[] | null | undefined,
  segment: string,
): OpeningHoursEntry[] {
  const key = segment.toLowerCase()
  return (openingHours ?? []).filter(
    (entry) => (entry.segment ?? entry.label ?? '').trim().toLowerCase() === key,
  )
}

/** Weekday vs weekend breakfast windows, if both exist. */
export function breakfastHourSplit(
  openingHours: OpeningHoursEntry[] | null | undefined,
): { weekdays: string | null; weekend: string | null } {
  const rows = entriesForSegment(openingHours, 'breakfast')
  let weekdays: string | null = null
  let weekend: string | null = null

  for (const row of rows) {
    const day = row.dayOfWeek?.trim().toLowerCase() ?? ''
    const window =
      row.opens && row.closes ? `${row.opens.trim()} – ${row.closes.trim()}` : null
    if (!window) continue
    if (/^(sa-su|sat-sun|saturday,\s*sunday)$/i.test(day)) {
      weekend = window
    } else {
      weekdays = window
    }
  }

  return { weekdays, weekend }
}
