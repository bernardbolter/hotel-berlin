import type { JsonLdNode, SiteConfig, Venue, VenueType } from '../types'
import { venueTypeToSchemaType } from '../types'
import { hotelNodeId, restaurantUrl, venueNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

const CUISINE_VENUE_TYPES: VenueType[] = ['Restaurant', 'Bar']

const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

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

function isOpenEnded(hours: { closes?: string; isOpenEnded?: boolean }): boolean {
  if (hours.isOpenEnded) return true
  if (!hours.closes) return true
  const n = hours.closes.trim().toLowerCase()
  return n === 'open end' || n === 'open-end' || n === 'openend' || n === 'late'
}

/** Expand Payload day strings (Mo-Su, Thursday, Monday,Tuesday) to schema.org day names. */
export function toSchemaDays(dayOfWeek?: string): string | string[] | undefined {
  if (!dayOfWeek?.trim()) return undefined
  const raw = dayOfWeek.trim().toLowerCase()

  if (raw === 'mo-su' || raw === 'daily' || raw === 'every day') {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }

  const range = /^([a-z]{2,9})\s*[-–]\s*([a-z]{2,9})$/i.exec(raw)
  if (range) {
    const start = DAY_ALIASES[range[1]!]
    const end = DAY_ALIASES[range[2]!]
    if (start == null || end == null) return dayOfWeek
    const days: string[] = []
    if (start <= end) {
      for (let i = start; i <= end; i++) days.push(SCHEMA_DAYS[i]!)
    } else {
      for (let i = start; i <= 6; i++) days.push(SCHEMA_DAYS[i]!)
      for (let i = 0; i <= end; i++) days.push(SCHEMA_DAYS[i]!)
    }
    return days.length === 1 ? days[0] : days
  }

  const mapped = raw
    .split(/[,/|]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const idx = DAY_ALIASES[token]
      return idx == null ? token : SCHEMA_DAYS[idx]!
    })

  if (mapped.length === 0) return undefined
  return mapped.length === 1 ? mapped[0] : mapped
}

export function buildVenueRef(venue: Venue, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': venueTypeToSchemaType(venue.venueType),
    '@id': venueNodeId(config),
    name: venue.name,
  })
}

export function buildVenueNode(venue: Venue, config: SiteConfig): JsonLdNode {
  const cuisineTypes = CUISINE_VENUE_TYPES.includes(venue.venueType)

  return prune({
    '@type': venueTypeToSchemaType(venue.venueType),
    '@id': venueNodeId(config),
    name: venue.name,
    description: venue.description,
    url: restaurantUrl(config),
    identifier: venue.slug,
    containedInPlace: { '@id': hotelNodeId(config) },
    image: venue.images?.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      description: img.altText,
    })),
    servesCuisine: cuisineTypes ? venue.servesCuisine : undefined,
    priceRange: venue.priceRange,
    openingHoursSpecification: venue.openingHours?.map((h) =>
      prune({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: toSchemaDays(h.dayOfWeek),
        opens: h.opens,
        closes: isOpenEnded(h) ? undefined : h.closes,
      }),
    ),
    menu: venue.menuUrl,
    acceptsReservations: Boolean(venue.reservationUrl),
    telephone: venue.telephone,
    email: venue.email,
    sameAs: venue.sameAs,
  })
}

/** BreadcrumbList: Home → Restaurant */
export function buildVenueBreadcrumbList(
  _venue: Venue,
  config: SiteConfig,
  labels: { home: string; restaurant: string },
): JsonLdNode {
  return prune({
    '@type': 'BreadcrumbList',
    '@id': `${restaurantUrl(config)}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: labels.home,
        item: config.baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: labels.restaurant,
        item: restaurantUrl(config),
      },
    ],
  })
}
