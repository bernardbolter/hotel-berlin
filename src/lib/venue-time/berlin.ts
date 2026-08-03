const BERLIN_TZ = 'Europe/Berlin'

export type BerlinParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  /** 0 = Sunday … 6 = Saturday (JS convention) */
  weekday: number
  /** YYYY-MM-DD in Berlin */
  dateKey: string
}

/**
 * Single source of truth for "now" used by venue-time helpers and consumers.
 * Returns a real Instant; interpret wall-clock via {@link getBerlinParts}.
 */
export function getBerlinNow(base: Date = new Date()): Date {
  return base
}

export function getBerlinParts(date: Date): BerlinParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BERLIN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  })

  const parts = formatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0'

  const weekdayShort = get('weekday')
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  const year = Number(get('year'))
  const month = Number(get('month'))
  const day = Number(get('day'))
  const hour = Number(get('hour'))
  const minute = Number(get('minute'))
  const second = Number(get('second'))

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday: weekdayMap[weekdayShort] ?? 0,
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  }
}

/** Instant at Berlin local YYYY-MM-DD HH:MM:SS. */
export function berlinLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  // Iterate to resolve CET/CEST offset for this local wall time
  let guess = Date.UTC(year, month - 1, day, hour, minute, second)
  for (let i = 0; i < 3; i++) {
    const parts = getBerlinParts(new Date(guess))
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    )
    const target = Date.UTC(year, month - 1, day, hour, minute, second)
    guess += target - asUtc
  }
  return new Date(guess)
}

export function startOfBerlinDay(date: Date): Date {
  const { year, month, day } = getBerlinParts(date)
  return berlinLocalToUtc(year, month, day, 0, 0, 0)
}

export function endOfBerlinDay(date: Date): Date {
  const { year, month, day } = getBerlinParts(date)
  return berlinLocalToUtc(year, month, day, 23, 59, 59)
}

export function formatBerlinTime(date: Date): string {
  const { hour, minute } = getBerlinParts(date)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function parseTimeToMinutes(time: string): number | null {
  const normalized = time.trim().toLowerCase().replace('.', ':')
  if (
    normalized === 'open end' ||
    normalized === 'open-end' ||
    normalized === 'openend' ||
    normalized === 'late'
  ) {
    return 24 * 60 // treat as end of day for range checks
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(normalized)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 24 || m > 59) return null
  return Math.min(h * 60 + m, 24 * 60)
}

const DAY_ALIASES: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  mo: 1,
  mon: 1,
  monday: 1,
  tu: 2,
  tue: 2,
  tues: 2,
  tuesday: 2,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
}

/** Whether `dayOfWeek` (Mo-Su, Monday,Tuesday, Thursday, …) includes Berlin weekday. */
export function dayOfWeekMatches(dayOfWeek: string | null | undefined, weekday: number): boolean {
  if (!dayOfWeek?.trim()) return false
  const raw = dayOfWeek.trim().toLowerCase()

  if (raw === 'mo-su' || raw === 'daily' || raw === 'every day') return true

  const range = /^([a-z]{2,9})\s*[-–]\s*([a-z]{2,9})$/i.exec(raw)
  if (range) {
    const start = DAY_ALIASES[range[1]]
    const end = DAY_ALIASES[range[2]]
    if (start == null || end == null) return false
    if (start <= end) return weekday >= start && weekday <= end
    // wrap (e.g. Fr-Mo)
    return weekday >= start || weekday <= end
  }

  return raw
    .split(/[,/|]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .some((token) => DAY_ALIASES[token] === weekday)
}
