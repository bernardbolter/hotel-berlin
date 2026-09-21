import type { Event } from '@/payload-types'
import {
  expandOccurrencesInWindow,
  formatBerlinTime,
  getBerlinParts,
  isAlwaysOnDailyRecurring,
  parseRecurrenceRule,
  type Occurrence,
} from '@/lib/venue-time'
import type { Locale } from '@/lib/aeo-schema/src/types'

export type ScheduleOccurrence = Occurrence

export type ResolvedEvent = Event & {
  recurrenceRule?: string | null
}

const BYDAY_NAME: Record<string, { de: string; en: string }> = {
  SU: { de: 'Sonntag', en: 'Sunday' },
  MO: { de: 'Montag', en: 'Monday' },
  TU: { de: 'Dienstag', en: 'Tuesday' },
  WE: { de: 'Mittwoch', en: 'Wednesday' },
  TH: { de: 'Donnerstag', en: 'Thursday' },
  FR: { de: 'Freitag', en: 'Friday' },
  SA: { de: 'Samstag', en: 'Saturday' },
}

const WEEKDAY_FROM_INDEX = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const

function weekdayName(token: string, locale: Locale): string {
  const names = BYDAY_NAME[token.toUpperCase()]
  if (!names) return token
  return locale === 'de' ? names.de : names.en
}

function seriesTimes(event: Pick<ResolvedEvent, 'startDate' | 'endDate'>): {
  start: string
  end: string | null
} {
  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : null
  return {
    start: Number.isNaN(start.getTime()) ? '00:00' : formatBerlinTime(start),
    end: end && !Number.isNaN(end.getTime()) ? formatBerlinTime(end) : null,
  }
}

function nthLabel(nth: number | null, locale: Locale): string {
  if (nth == null || nth === 0) return ''
  if (nth === -1) return locale === 'de' ? 'letzten ' : 'the last '
  if (nth === 1) return locale === 'de' ? 'ersten ' : 'the first '
  if (nth === 2) return locale === 'de' ? 'zweiten ' : 'the second '
  if (nth === 3) return locale === 'de' ? 'dritten ' : 'the third '
  if (nth === 4) return locale === 'de' ? 'vierten ' : 'the fourth '
  return ''
}

/**
 * Expand the next `count` occurrences from `from` (Berlin-correct, DST-safe).
 * Always-on daily series should not use this — call {@link isAlwaysOnDailyRecurring}
 * and render a single hours line instead.
 */
export function expandSchedule(
  event: Pick<ResolvedEvent, 'startDate' | 'endDate' | 'isRecurring' | 'recurrenceRule'>,
  opts: { from: Date; count: number },
): ScheduleOccurrence[] {
  const count = Math.max(0, opts.count)
  if (count === 0) return []

  if (isAlwaysOnDailyRecurring(event.isRecurring, event.recurrenceRule)) {
    return []
  }

  const horizonMs =
    event.isRecurring && parseRecurrenceRule(event.recurrenceRule)?.freq === 'MONTHLY'
      ? 400 * 24 * 60 * 60 * 1000
      : 120 * 24 * 60 * 60 * 1000

  const occs = expandOccurrencesInWindow(
    event.startDate,
    event.endDate,
    event.isRecurring,
    event.recurrenceRule,
    opts.from,
    new Date(opts.from.getTime() + horizonMs),
  )

  return occs.slice(0, count)
}

export function isPastOneOff(
  event: Pick<ResolvedEvent, 'startDate' | 'endDate' | 'isRecurring'>,
  now: Date,
): boolean {
  if (event.isRecurring) return false
  const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
  if (Number.isNaN(end.getTime())) return false
  return end.getTime() < now.getTime()
}

/** "Jeden Donnerstag, 19:00" / "Täglich 13–23 Uhr" / null for a one-off. */
export function scheduleSummary(
  event: Pick<
    ResolvedEvent,
    'startDate' | 'endDate' | 'isRecurring' | 'recurrenceRule' | 'recurrenceNote'
  >,
  locale: Locale,
): string | null {
  if (!event.isRecurring) return null

  const times = seriesTimes(event)
  const de = locale === 'de'
  const timeRange =
    times.end && times.end !== times.start
      ? de
        ? `${times.start}–${times.end} Uhr`
        : `${times.start}–${times.end}`
      : de
        ? `${times.start} Uhr`
        : times.start

  if (isAlwaysOnDailyRecurring(event.isRecurring, event.recurrenceRule)) {
    return de ? `Täglich ${timeRange}` : `Daily ${timeRange}`
  }

  const parsed = parseRecurrenceRule(event.recurrenceRule)
  if (!parsed) return event.recurrenceNote?.trim() || null

  if (parsed.freq === 'WEEKLY') {
    const days = (parsed.byDay ?? []).map((d) =>
      weekdayName(WEEKDAY_FROM_INDEX[d.weekday] ?? 'TH', locale),
    )
    const dayList =
      days.length > 0
        ? days.join(de ? ' und ' : ' and ')
        : weekdayName(WEEKDAY_FROM_INDEX[getBerlinParts(new Date(event.startDate)).weekday] ?? 'TH', locale)
    return de ? `Jeden ${dayList}, ${timeRange}` : `Every ${dayList}, ${timeRange}`
  }

  if (parsed.freq === 'MONTHLY') {
    const spec = parsed.byDay?.[0]
    const day = weekdayName(
      WEEKDAY_FROM_INDEX[spec?.weekday ?? getBerlinParts(new Date(event.startDate)).weekday] ?? 'TH',
      locale,
    )
    const nth = nthLabel(spec?.nth ?? null, locale)
    if (de) {
      return nth ? `Jeden ${nth}${day}, ${timeRange}` : `Monatlich, ${day}, ${timeRange}`
    }
    return nth ? `${nth}${day} of the month, ${timeRange}` : `Monthly, ${day}, ${timeRange}`
  }

  if (parsed.freq === 'DAILY') {
    return de ? `Täglich ${timeRange}` : `Daily ${timeRange}`
  }

  return event.recurrenceNote?.trim() || null
}

export function formatScheduleDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

export function formatPastOneOffLine(date: Date, locale: Locale): string {
  const formatted = formatScheduleDate(date, locale)
  return locale === 'de' ? `Fand statt am ${formatted}` : `Took place on ${formatted}`
}

export function datetimeAttr(date: Date): string {
  const parts = getBerlinParts(date)
  const time = formatBerlinTime(date)
  return `${parts.dateKey}T${time}`
}
