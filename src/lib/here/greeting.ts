import { getBerlinParts, getBerlinNow } from '@/lib/venue-time'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

/** Berlin wall-clock hour → greeting slot. After 23:00 stays "evening". */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

export function berlinTimeOfDay(now: Date = getBerlinNow()): TimeOfDay {
  return getTimeOfDay(getBerlinParts(now).hour)
}

export function formatBerlinDayLabel(now: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    timeZone: 'Europe/Berlin',
  })
    .format(now)
    .toUpperCase()
}
