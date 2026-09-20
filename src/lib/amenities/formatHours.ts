import { getBerlinParts } from '@/lib/venue-time/berlin'
import { isOpenEndedEntry } from '@/lib/venue-time/deriveOpenClosed'

import type { FormatAmenityHoursInput, SpecialHoursEntry } from './types'

const ALWAYS_DAY = /^(mo[–-]so|mo[–-]su|mon[–-]sun|monday[–-]sunday|daily|täglich)$/i
const FULL_OPEN = /^(00:00|0:00)$/
const FULL_CLOSE = /^(24:00|00:00|0:00)$/

function dateKeyFromField(value: string | null | undefined): string | null {
  if (!value) return null
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? null
}

function specialAppliesToday(row: SpecialHoursEntry, today: string): boolean {
  const from = dateKeyFromField(row.validFrom)
  if (!from) return false
  const through = dateKeyFromField(row.validThrough) ?? from
  return today >= from && today <= through
}

function formatWindow(
  opens: string | null | undefined,
  closes: string | null | undefined,
  isOpenEnded?: boolean | null,
): string | null {
  const start = opens?.trim()
  if (!start) return null
  if (isOpenEnded) return start
  const end = closes?.trim()
  if (!end) return start
  return `${start}–${end}`
}

function coversAllDays(dayOfWeek: string | null | undefined): boolean {
  return Boolean(dayOfWeek && ALWAYS_DAY.test(dayOfWeek.trim()))
}

function isFullDay(opens: string | null | undefined, closes: string | null | undefined): boolean {
  return FULL_OPEN.test(opens?.trim() ?? '') && FULL_CLOSE.test(closes?.trim() ?? '')
}

function localizeDayRange(dayOfWeek: string, locale: 'de' | 'en'): string {
  const trimmed = dayOfWeek.trim()
  if (ALWAYS_DAY.test(trimmed)) return locale === 'de' ? 'Mo–So' : 'Mon–Sun'
  return trimmed.replace(/-/g, '–')
}

function formatWeekly(
  openingHours: NonNullable<FormatAmenityHoursInput['openingHours']>,
  locale: 'de' | 'en',
): string | null {
  const usable = openingHours.filter((row) => row.opens?.trim())
  if (usable.length === 0) return null

  if (
    usable.length > 0 &&
    usable.every((row) => coversAllDays(row.dayOfWeek) && isFullDay(row.opens, row.closes))
  ) {
    return '24/7'
  }

  const parts = usable.map((row) => {
    const window = formatWindow(row.opens, row.closes, row.isOpenEnded)
    const days = localizeDayRange(row.dayOfWeek?.trim() || '', locale)
    if (days && window) return `${days}, ${window}`
    return window || days
  })

  const unique = parts.filter((part, index) => part && parts.indexOf(part) === index)
  return unique.length > 0 ? unique.join(' · ') : null
}

function formatSpecial(
  row: SpecialHoursEntry,
  labels: FormatAmenityHoursInput['labels'],
): string {
  const note = row.note?.trim()
  if (row.kind === 'on-request') {
    return note || labels.onRequest
  }
  if (row.kind === 'hours') {
    const window = formatWindow(row.opens, row.closes)
    if (window && note) return `${window} · ${note}`
    return window || note || labels.onRequest
  }
  return note || labels.closed
}

/**
 * Guest-facing “Wann” string. Special hours win when today (Berlin) is inside
 * a row’s window. hoursOverride wins over weekly openingHours. Empty → omit.
 */
export function formatAmenityHours(input: FormatAmenityHoursInput): string | null {
  const today = getBerlinParts(input.now ?? new Date()).dateKey
  const specials = (input.specialHours ?? []).filter((row) => specialAppliesToday(row, today))
  const active = specials[specials.length - 1]
  if (active) return formatSpecial(active, input.labels)

  const override = input.hoursOverride?.trim()
  if (override) return override

  return formatWeekly(input.openingHours ?? [], input.locale)
}

/** Guest-facing notice from today's special hours — not a CMS field (R2). */
export function formatAmenityNotice(input: FormatAmenityHoursInput): string | null {
  const active = specialHoursForToday(input.specialHours, input.now)
  if (!active) return null
  return formatSpecial(active, input.labels)
}

export type AmenityHoursMode = 'always' | 'schedule' | 'onRequest' | 'unknown'

/** JSON-LD hours: only `always` and `schedule` emit openingHoursSpecification. */
export function amenityHoursMode(input: FormatAmenityHoursInput): AmenityHoursMode {
  const today = getBerlinParts(input.now ?? new Date()).dateKey
  const specials = (input.specialHours ?? []).filter((row) => specialAppliesToday(row, today))
  const active = specials[specials.length - 1]
  if (active?.kind === 'on-request') return 'onRequest'
  if (active?.kind === 'closed') return 'unknown'
  if (input.hoursOverride?.trim()) return 'unknown'
  const weekly = formatWeekly(input.openingHours ?? [], input.locale)
  if (weekly === '24/7') return 'always'
  if (weekly) return 'schedule'
  return 'unknown'
}

export function specialHoursForToday(
  specialHours: SpecialHoursEntry[] | null | undefined,
  now: Date = new Date(),
): SpecialHoursEntry | null {
  const today = getBerlinParts(now).dateKey
  const matches = (specialHours ?? []).filter((row) => specialAppliesToday(row, today))
  return matches[matches.length - 1] ?? null
}
