import { berlinLocalToUtc, getBerlinParts } from './berlin'

const BYDAY_TO_WEEKDAY: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
}

/** e.g. TH → every Thursday; -1TH → last Thursday; 2MO → 2nd Monday */
export type ByDaySpec = {
  weekday: number
  /** null = any matching weekday in the period; ±N = Nth occurrence in the month */
  nth: number | null
}

export type ParsedRRule = {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  byDay: ByDaySpec[] | null
  until: Date | null
  byHour: number | null
  byMinute: number | null
}

export function parseRecurrenceRule(rule: string | null | undefined): ParsedRRule | null {
  if (!rule?.trim()) return null

  const parts = Object.fromEntries(
    rule
      .trim()
      .split(';')
      .map((pair) => {
        const [k, v] = pair.split('=')
        return [k?.toUpperCase(), v]
      })
      .filter(([k, v]) => k && v),
  ) as Record<string, string>

  const freqRaw = parts.FREQ?.toUpperCase()
  if (freqRaw !== 'DAILY' && freqRaw !== 'WEEKLY' && freqRaw !== 'MONTHLY') return null

  const byDay = parts.BYDAY
    ? parts.BYDAY.split(',')
        .map(parseByDayToken)
        .filter((s): s is ByDaySpec => s != null)
    : null

  const until = parts.UNTIL ? parseIcalUntil(parts.UNTIL) : null
  const byHour = parts.BYHOUR != null ? Number(parts.BYHOUR) : null
  const byMinute = parts.BYMINUTE != null ? Number(parts.BYMINUTE) : null

  return {
    freq: freqRaw,
    byDay: byDay?.length ? byDay : null,
    until,
    byHour: Number.isFinite(byHour) ? byHour : null,
    byMinute: Number.isFinite(byMinute) ? byMinute : null,
  }
}

function parseByDayToken(raw: string): ByDaySpec | null {
  const m = /^(-?\d)?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(raw.trim())
  if (!m) return null
  const weekday = BYDAY_TO_WEEKDAY[m[2].toUpperCase()]
  if (weekday == null) return null
  const nth = m[1] != null ? Number(m[1]) : null
  if (nth != null && (nth === 0 || !Number.isFinite(nth))) return null
  return { weekday, nth }
}

function parseIcalUntil(raw: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(raw.trim())
  if (!m) return null
  const [, y, mo, d, hh = '23', mm = '59', ss = '59'] = m
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss)))
}

/** Always-on daily recurring events (e.g. KTTK Open Play) — excluded from hero subline. */
export function isAlwaysOnDailyRecurring(
  isRecurring: boolean | null | undefined,
  recurrenceRule: string | null | undefined,
): boolean {
  if (!isRecurring) return false
  const parsed = parseRecurrenceRule(recurrenceRule)
  return parsed?.freq === 'DAILY'
}

export type Occurrence = {
  start: Date
  end: Date | null
}

/**
 * Day-of-month for the Nth weekday in a calendar month (Berlin wall calendar).
 * nth = -1 → last; 1 → first; etc. Returns null if that occurrence doesn't exist.
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
): number | null {
  if (nth === 0) return null

  if (nth > 0) {
    const firstWeekday = weekdayOfBerlinDate(year, month, 1)
    let day = 1 + ((weekday - firstWeekday + 7) % 7)
    day += (nth - 1) * 7
    const dim = daysInMonth(year, month)
    return day <= dim ? day : null
  }

  // Negative: count from end of month
  const dim = daysInMonth(year, month)
  const lastWeekday = weekdayOfBerlinDate(year, month, dim)
  let day = dim - ((lastWeekday - weekday + 7) % 7)
  day += (nth + 1) * 7 // nth=-1 → day; nth=-2 → day-7
  return day >= 1 ? day : null
}

function daysInMonth(year: number, month: number): number {
  // month 1–12; day 0 of next month = last day of this month (UTC calendar arith is fine for Y-M-D)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function weekdayOfBerlinDate(year: number, month: number, day: number): number {
  return getBerlinParts(berlinLocalToUtc(year, month, day, 12, 0, 0)).weekday
}

function monthlyOccurrenceDays(
  year: number,
  month: number,
  byDay: ByDaySpec[],
): number[] {
  const days = new Set<number>()
  for (const spec of byDay) {
    if (spec.nth == null) {
      // Every matching weekday in the month
      const first = nthWeekdayOfMonth(year, month, spec.weekday, 1)
      if (first == null) continue
      for (let d = first; d <= daysInMonth(year, month); d += 7) days.add(d)
    } else {
      const d = nthWeekdayOfMonth(year, month, spec.weekday, spec.nth)
      if (d != null) days.add(d)
    }
  }
  return [...days].sort((a, b) => a - b)
}

/**
 * Next occurrence at or after `now` (or currently in progress).
 * Supports RRULE subset: DAILY, WEEKLY, MONTHLY (incl. BYDAY=-1TH).
 */
export function resolveOccurrence(
  startDateIso: string,
  endDateIso: string | null | undefined,
  isRecurring: boolean | null | undefined,
  recurrenceRule: string | null | undefined,
  now: Date,
): Occurrence | null {
  const seriesStart = new Date(startDateIso)
  if (Number.isNaN(seriesStart.getTime())) return null

  const seriesEnd = endDateIso ? new Date(endDateIso) : null
  const durationMs =
    seriesEnd && !Number.isNaN(seriesEnd.getTime())
      ? Math.max(0, seriesEnd.getTime() - seriesStart.getTime())
      : null

  if (!isRecurring || !recurrenceRule) {
    if (seriesEnd && seriesEnd.getTime() < now.getTime()) return null
    if (!seriesEnd && seriesStart.getTime() < now.getTime()) return null
    return { start: seriesStart, end: seriesEnd }
  }

  const rule = parseRecurrenceRule(recurrenceRule)
  if (!rule) return null

  const startParts = getBerlinParts(seriesStart)
  const hour = rule.byHour ?? startParts.hour
  const minute = rule.byMinute ?? startParts.minute

  if (rule.freq === 'MONTHLY') {
    return resolveMonthly(rule, startParts, hour, minute, durationMs, now)
  }

  // DAILY / WEEKLY — walk day by day
  for (let offset = 0; offset < 400; offset++) {
    const day = addBerlinDays(seriesStart, offset)
    const parts = getBerlinParts(day)

    if (rule.freq === 'WEEKLY' && rule.byDay) {
      const weekdays = rule.byDay.map((s) => s.weekday)
      if (!weekdays.includes(parts.weekday)) continue
    }

    if (parts.dateKey < startParts.dateKey) continue

    const candidate = occurrenceAt(parts.year, parts.month, parts.day, hour, minute, durationMs, rule.until, now)
    if (candidate === 'past-until') return null
    if (candidate) return candidate
  }

  return null
}

function resolveMonthly(
  rule: ParsedRRule,
  startParts: ReturnType<typeof getBerlinParts>,
  hour: number,
  minute: number,
  durationMs: number | null,
  now: Date,
): Occurrence | null {
  const byDay = rule.byDay ?? [{ weekday: startParts.weekday, nth: null }]

  let year = startParts.year
  let month = startParts.month

  for (let i = 0; i < 36; i++) {
    const days = monthlyOccurrenceDays(year, month, byDay)
    for (const day of days) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (dateKey < startParts.dateKey) continue

      const candidate = occurrenceAt(year, month, day, hour, minute, durationMs, rule.until, now)
      if (candidate === 'past-until') return null
      if (candidate) return candidate
    }

    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return null
}

function occurrenceAt(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  durationMs: number | null,
  until: Date | null,
  now: Date,
): Occurrence | null | 'past-until' {
  const occStart = berlinLocalToUtc(year, month, day, hour, minute, 0)
  if (until && occStart.getTime() > until.getTime()) return 'past-until'

  const occEnd = durationMs != null ? new Date(occStart.getTime() + durationMs) : null
  const inProgress =
    occStart.getTime() <= now.getTime() && (occEnd == null || occEnd.getTime() >= now.getTime())
  const upcoming = occStart.getTime() >= now.getTime()

  if (inProgress || upcoming) return { start: occStart, end: occEnd }
  return null
}

function addBerlinDays(from: Date, days: number): Date {
  const parts = getBerlinParts(from)
  const base = berlinLocalToUtc(parts.year, parts.month, parts.day, 12, 0, 0)
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
}
