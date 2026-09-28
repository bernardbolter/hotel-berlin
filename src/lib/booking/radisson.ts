import { isoToVendorDate } from './dates'

export const RADISSON_ORIGIN = 'https://www.radissonhotels.com'
export const RADISSON_PROPERTY_SLUG = 'radisson-individuals-berlin'

/**
 * Locale → Radisson path + languageid.
 * English uses `en-gb` (not Galaxy's `en-us`) so European guests land on
 * the right currency and date conventions. See BookingWidget audit §2.
 */
export const RADISSON_LOCALES = {
  de: { localePath: 'de-de', languageId: 7, inLanguage: 'de' },
  en: { localePath: 'en-gb', languageId: 1, inLanguage: 'en' },
} as const

export type BookingLocale = keyof typeof RADISSON_LOCALES

export type RadissonBookingParams = {
  /** Check-in as `YYYY-MM-DD`. Converted to `MM/DD/YYYY` for the vendor. */
  checkin: string
  /** Check-out as `YYYY-MM-DD`. */
  checkout: string
  adults: number
  rooms: number
  locale: BookingLocale
  /** Omitted from the query string when 0 / undefined, matching the live handoff. */
  children?: number
  /** GA cross-domain linker (`_ga` cookie value). */
  ga?: string
}

export function radissonBookingBaseUrl(locale: BookingLocale): string {
  const { localePath } = RADISSON_LOCALES[locale]
  return `${RADISSON_ORIGIN}/${localePath}/hotels/${RADISSON_PROPERTY_SLUG}`
}

function assertPositiveInt(name: string, value: number) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`)
  }
}

/**
 * Single URL builder for every Radisson rooms handoff.
 * ISO dates in, vendor query string out. Do not reimplement per call site.
 */
export function buildRadissonBookingUrl(params: RadissonBookingParams): string {
  assertPositiveInt('adults', params.adults)
  assertPositiveInt('rooms', params.rooms)
  if (params.children != null && (!Number.isInteger(params.children) || params.children < 0)) {
    throw new Error('children must be a non-negative integer')
  }

  const search = new URLSearchParams()
  search.set('datein', isoToVendorDate(params.checkin))
  search.set('dateout', isoToVendorDate(params.checkout))
  search.set('rooms', String(params.rooms))
  search.set('adults', String(params.adults))
  if (params.children && params.children > 0) {
    search.set('children', String(params.children))
  }
  search.set('languageid', String(RADISSON_LOCALES[params.locale].languageId))
  if (params.ga) search.set('_ga', params.ga)

  // Radisson accepts unencoded slashes in MM/DD/YYYY; keep the live shape.
  return `${radissonBookingBaseUrl(params.locale)}?${decodeVendorDateParams(search)}`
}

/**
 * RFC-6570-style template used by `ReserveAction`. Parameter names here are
 * the contract the human form also fills — they must not drift.
 */
export function buildRadissonBookingUrlTemplate(locale: BookingLocale): string {
  const { languageId } = RADISSON_LOCALES[locale]
  return `${radissonBookingBaseUrl(locale)}?datein={checkin}&dateout={checkout}&adults={adults}&rooms={rooms}&languageid=${languageId}`
}

function decodeVendorDateParams(search: URLSearchParams): string {
  return search.toString().replace(/%2F/gi, '/')
}
