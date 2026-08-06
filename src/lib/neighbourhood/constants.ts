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

/** Homepage map teaser: legacy paginated set (featuredOrder 1–15). Prefer TEASER_PLACE_LIMIT. */
export const HOMEPAGE_FEATURED_LIMIT = 15
export const HOMEPAGE_FEATURED_PAGE_SIZE = 5

/** Curated map teaser size (homepage / here) — no pagination. */
export const TEASER_PLACE_LIMIT = 5
