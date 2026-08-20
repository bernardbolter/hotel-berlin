import type { OpeningHoursEntry } from '@/lib/venue-time/types'

export type HoursSegmentDisplay = {
  label: string
  body: string
}

function isOpenEnded(closes?: string | null): boolean {
  if (!closes) return true
  const n = closes.trim().toLowerCase()
  return n === 'open end' || n === 'open-end' || n === 'openend' || n === 'late'
}

function formatWindow(
  opens: string | null | undefined,
  closes: string | null | undefined,
  openEndLabel: string,
): string | null {
  if (!opens?.trim()) return null
  if (isOpenEnded(closes)) return `${opens.trim()} – ${openEndLabel}`
  return `${opens.trim()}–${closes!.trim()}`
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
    const window = formatWindow(entry.opens, entry.closes, openEndLabel)
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
  labels: { kitchen?: string; bar?: string },
): string {
  const key = label.trim().toLowerCase()
  if (key === 'kitchen' && labels.kitchen) return labels.kitchen
  if (key === 'bar' && labels.bar) return labels.bar
  return label
}

export function toOpeningHoursEntries(
  openingHours: {
    dayOfWeek?: string | null
    opens?: string | null
    closes?: string | null
    segment?: string | null
    note?: string | null
  }[] | null | undefined,
): OpeningHoursEntry[] {
  return (openingHours ?? []).map((h) => ({
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
    segment: h.segment,
    note: h.note,
  }))
}
