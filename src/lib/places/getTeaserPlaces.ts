import { HOMEPAGE_FEATURED_LIMIT } from '@/lib/neighbourhood/constants'
import type { NeighbourhoodPlace } from '@/payload-types'

export type TeaserContext = 'homepage' | 'here'

/**
 * Homepage map pagination set — `featuredOrder` 1–15, pages of 5.
 * Pure selection over an already-fetched list.
 */
export function getFeaturedOrderPlaces(
  allPlaces: NeighbourhoodPlace[],
  limit = HOMEPAGE_FEATURED_LIMIT,
): NeighbourhoodPlace[] {
  return allPlaces
    .filter((p) => typeof p.featuredOrder === 'number' && p.featuredOrder > 0)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .slice(0, limit)
}

/**
 * Curated teaser set for homepage fallback or /here map — enabled + ordered, max `limit` (default 5).
 * Pure selection over an already-fetched list.
 */
export function getTeaserPlaces(
  allPlaces: NeighbourhoodPlace[],
  context: TeaserContext,
  limit = 5,
): NeighbourhoodPlace[] {
  const field = context === 'homepage' ? 'homepageTeaser' : 'hereTeaser'
  return allPlaces
    .filter((p) => p[field]?.enabled)
    .sort((a, b) => (a[field]?.order ?? 0) - (b[field]?.order ?? 0))
    .slice(0, limit)
}
