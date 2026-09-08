export const PLACE_CATEGORIES = [
  'Art',
  'Bar',
  'Kids',
  'Museum',
  'Parks and Nature',
  'Party',
  'Restaurant',
  'Shopping',
  'Sightseeing',
] as const

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number]
export type DistanceTier = 'walkable' | 'short-transit' | 'further-out'
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both'

/** xlsx Zielgruppe values used on /here/explore. */
export const TARGET_AUDIENCES = [
  'Alle',
  'Familien',
  'Kinder',
  'Freunde',
  'Paare',
  'Erwachsene',
  'Business',
  'Kunstinteressierte',
] as const

export type TargetAudience = (typeof TARGET_AUDIENCES)[number]

/** Homepage map teaser: featuredOrder 1–15, paginated in batches of 5. */
export const HOMEPAGE_FEATURED_LIMIT = 15
export const HOMEPAGE_FEATURED_PAGE_SIZE = 5

/** Compact /here teaser fallback (homepage if featuredOrder is empty). */
export const TEASER_PLACE_LIMIT = 5

/** /here map after the curated-tips seed — the ten endorsed places. */
export const HERE_TEASER_PLACE_LIMIT = 10
