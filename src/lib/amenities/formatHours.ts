import { getBerlinParts } from '@/lib/venue-time/berlin'

import type { FormatAmenityHoursInput, SpecialHoursEntry } from './types'

const ALWAYS_DAY = /^(mo[–-]so|mo[–-]su|mon[–-]sun|monday[–-]sunday|daily|täglich)$/i
const FULL_OPEN = /^(00:00|0:00)$/
const FULL_CLOSE = /^(24:00|00:00|0:00)$/
const NOTICE_WINDOW_DAYS = 7

function dateKeyFromField(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return getBerlinParts(value).dateKey
  }
  if (/T/.test(value) || /(?:Z|[+-]\d{2}:\d{2})$/.test(value.trim())) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return getBerlinParts(parsed).dateKey
  }
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? null
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day + days))
  return utc.toISOString().slice(0, 10)
}

function specialAppliesOn(row: SpecialHoursEntry, dateKey: string): boolean {
  const from = dateKeyFromField(row.validFrom)
  if (!from) return false
  const through = dateKeyFromField(row.validThrough) ?? from
  return dateKey >= from && dateKey <= through
}

function specialAppliesToday(row: SpecialHoursEntry, today: string): boolean {
  return specialAppliesOn(row, today)
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

function formatNoticeDate(dateKey: string, locale: 'de' | 'en'): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (locale === 'de') {
    const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'UTC' })
      .format(date)
      .replace(/\.$/, '')
    return `${weekday}, ${day}.${month}.`
  }
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${weekday}, ${day} ${months[month - 1]}`
}

function nextSpecialInWindow(
  specialHours: SpecialHoursEntry[] | null | undefined,
  now: Date,
  windowDays = NOTICE_WINDOW_DAYS,
): { row: SpecialHoursEntry; dateKey: string; offset: number } | null {
  const today = getBerlinParts(now).dateKey
  for (let offset = 0; offset <= windowDays; offset += 1) {
    const dateKey = addDaysToDateKey(today, offset)
    const matches = (specialHours ?? []).filter((row) => specialAppliesOn(row, dateKey))
    const row = matches[matches.length - 1]
    if (row) return { row, dateKey, offset }
  }
  return null
}

function formatNoticeLine(
  row: SpecialHoursEntry,
  dateKey: string,
  offset: number,
  locale: 'de' | 'en',
  labels: FormatAmenityHoursInput['labels'],
): string | null {
  const note = row.note?.trim()
  const window = formatWindow(row.opens, row.closes)
  const today = offset === 0

  if (today) {
    if (row.kind === 'closed') {
      if (locale === 'de') return note ? `Heute geschlossen – ${note}` : 'Heute geschlossen'
      return note ? `Closed today – ${note}` : 'Closed today'
    }
    if (row.kind === 'hours' && window) {
      return locale === 'de' ? `Heute ${window}` : `Today ${window}`
    }
    return formatSpecial(row, labels)
  }

  const date = formatNoticeDate(dateKey, locale)
  if (row.kind === 'closed') {
    return locale === 'de' ? `Geschlossen am ${date}` : `Closed ${date}`
  }
  if (row.kind === 'hours' && window) {
    return locale === 'de' ? `Am ${date}: ${window}` : `${date}: ${window}`
  }
  if (row.kind === 'on-request') {
    const label = note || labels.onRequest
    return locale === 'de' ? `Am ${date}: ${label}` : `${date}: ${label}`
  }
  return locale === 'de' ? `Am ${date}: ${formatSpecial(row, labels)}` : `${date}: ${formatSpecial(row, labels)}`
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

/** Guest-facing notice from special hours today or within the next 7 Berlin days (R2). */
export function formatAmenityNotice(input: FormatAmenityHoursInput): string | null {
  const found = nextSpecialInWindow(input.specialHours, input.now ?? new Date())
  if (!found) return null
  return formatNoticeLine(found.row, found.dateKey, found.offset, input.locale, input.labels)
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
