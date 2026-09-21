import { formatBerlinTime, getBerlinParts } from '@/lib/venue-time/berlin'
import type { Event, Venue } from '@/payload-types'

export type SpotlightFraming = 'prospect' | 'guest'

export function joinMeta(...parts: Array<string | null | undefined>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' · ')
}

export function eventVenue(
  event: Event,
): (Venue & { spotlightLocation?: string | null; location?: string | null }) | null {
  return typeof event.venue === 'object' && event.venue ? event.venue : null
}

export function venueFloor(
  venue: {
    slug?: string | null
    spotlightLocation?: string | null
    location?: string | null
  } | null,
  locale = 'en',
): string {
  if (!venue) return ''
  const pinned = venue.spotlightLocation?.trim()
  if (pinned) return pinned
  if (venue.slug === 'fkkb') {
    return locale === 'de' ? 'Im Atrium über der Lobby' : 'In the atrium above the lobby'
  }
  return (venue.location || '').trim()
}

/** Prospect sub-line: venue address, not the in-building floor pin. */
export function venueAddress(
  venue: {
    slug?: string | null
    location?: string | null
  } | null,
  locale = 'en',
): string {
  if (!venue) return ''
  const street = venue.location?.trim()
  if (street) return street
  if (venue.slug === 'fkkb') {
    return locale === 'de' ? 'Im Atrium über der Lobby' : 'In the atrium above the lobby'
  }
  return ''
}

export function formatEventPrice(
  event: Pick<Event, 'isFree' | 'price'>,
  locale: string,
): string {
  if (event.isFree) return locale === 'de' ? 'frei' : 'free'
  if (event.price == null) return ''
  const n = event.price
  const amount = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '')
  return `€${amount}`
}

/** Guest body slot: price or “kein Eintritt”, plus booking note. */
export function formatPracticalLine(
  event: Pick<Event, 'isFree' | 'price' | 'bookingNote'>,
  locale: string,
): string {
  const price = event.isFree
    ? locale === 'de'
      ? 'kein Eintritt'
      : 'free entry'
    : formatEventPrice(event, locale)
  return joinMeta(price, event.bookingNote)
}

export function eventListHref(framing: SpotlightFraming, slug: string): string {
  return framing === 'guest' ? `/here/events#${slug}` : `/happenings/${slug}`
}

function weekdayShort(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

/** Prospect eyebrow: calendar date + time, no live state, no venue (that is the sub-line). */
export function formatProspectPrimaryMeta(start: Date, locale: string): string {
  const date = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(start)
  return `${date} · ${formatBerlinTime(start)}`
}

export function formatGuestTimeState(args: {
  start: Date
  end: Date | null
  now: Date
  locale: string
  alwaysOn: boolean
}): string {
  const { start, end, now, locale, alwaysOn } = args
  const de = locale === 'de'
  const inProgress =
    start.getTime() <= now.getTime() && (end == null || end.getTime() >= now.getTime())

  if (inProgress) return de ? 'Jetzt' : 'Now'
  if (alwaysOn) return de ? 'Immer' : 'Always'

  const startParts = getBerlinParts(start)
  const nowParts = getBerlinParts(now)
  const time = formatBerlinTime(start)

  if (startParts.dateKey === nowParts.dateKey) {
    return de ? `Heute ${time}` : `Today ${time}`
  }

  const day = startParts.day
  const month = startParts.month
  const wd = weekdayShort(start, locale)
  if (de) return `${wd} ${day}.${month} ${time}`
  return `${wd} ${day} ${monthNameEn(month)} ${time}`
}

function monthNameEn(month: number): string {
  return (
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
      month - 1
    ] ?? ''
  )
}
