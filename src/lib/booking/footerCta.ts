import { addDaysIso, berlinTodayIso } from './dates'
import { buildRadissonBookingUrl, type BookingLocale } from './radisson'

/** CMS / fallback CTA that should open the booking panel (and fall back to Radisson without JS). */
export function isInternalBookCta(url: string): boolean {
  const path = url.trim()
  return path === '/book' || path.startsWith('/book?') || path.startsWith('/book#')
}

/**
 * Footer book-direct href. `/book` becomes a locale-aware Radisson URL so the
 * strip works without JS; other CMS URLs pass through unchanged.
 */
export function footerBookingHref(
  ctaUrl: string,
  locale: BookingLocale,
  todayIso = berlinTodayIso(),
): string {
  if (!isInternalBookCta(ctaUrl)) return ctaUrl
  return buildRadissonBookingUrl({
    checkin: todayIso,
    checkout: addDaysIso(todayIso, 1),
    adults: 1,
    rooms: 1,
    locale,
  })
}
