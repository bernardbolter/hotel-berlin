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

/** Homepage map teaser: featuredOrder 1–15, paginated in batches of 5. */
export const HOMEPAGE_FEATURED_LIMIT = 15
export const HOMEPAGE_FEATURED_PAGE_SIZE = 5

/** Compact /here teaser (and homepage fallback if featuredOrder is empty). */
export const TEASER_PLACE_LIMIT = 5
