import type { NeighbourhoodPlace } from '@/payload-types'

export type TeaserContext = 'homepage' | 'here'

/**
 * Curated teaser set for homepage or /here map — enabled + ordered, max `limit` (default 5).
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
