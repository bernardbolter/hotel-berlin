import type { Where } from 'payload'

import {
  TEASER_PLACE_LIMIT,
  type DistanceTier,
  type IndoorOutdoor,
  type PlaceCategory,
} from '@/lib/neighbourhood/constants'
import { getPayloadClient } from '@/lib/payload/client'
import { getTeaserPlaces, type TeaserContext } from '@/lib/places/getTeaserPlaces'
import type { NeighbourhoodPlace } from '@/payload-types'

export {
  PLACE_CATEGORIES,
  HOMEPAGE_FEATURED_LIMIT,
  HOMEPAGE_FEATURED_PAGE_SIZE,
  TEASER_PLACE_LIMIT,
  type PlaceCategory,
  type DistanceTier,
  type IndoorOutdoor,
} from '@/lib/neighbourhood/constants'

export const NEIGHBOURHOOD_PAGE_SIZE = 24

export type NeighbourhoodPlaceDoc = {
  id: number | string
  name: string
  slug: string
  category: PlaceCategory
  description?: string | null
  walkingMinutes?: number | null
  priceRange?: string | null
  featuredOrder?: number | null
  transit?: {
    minutes?: number | null
    station?: string | null
    line?: string | null
  } | null
  homepageTeaser?: { enabled?: boolean | null; order?: number | null } | null
  hereTeaser?: { enabled?: boolean | null; order?: number | null } | null
  geo?: { latitude?: number | null; longitude?: number | null } | null
  image?: number | { url?: string | null; alt?: string | null } | null
  imageCredit?: {
    creditText?: string | null
    creditUrl?: string | null
    license?: string | null
  } | null
  endorsements?:
    | {
        person?:
          | number
          | {
              id?: number | string
              name: string
              slug?: string | null
            }
          | null
        quote?: string
        associatedRoom?: string | null
      }[]
    | null
  status?: string
}

export type NeighbourhoodPlaceListParams = {
  locale: string
  category?: PlaceCategory | null
  distanceTier?: DistanceTier | null
  /**
   * When true and no distanceTier is set, restrict to walkable (or unset tier).
   * Set false when the user expands “show further out”.
   */
  defaultWalkable?: boolean
  indoorOutdoor?: IndoorOutdoor | null
  search?: string | null
  page?: number
  /** When true, skip pagination and return the full active set (for JSON-LD / map). */
  unpaginated?: boolean
}

/**
 * Curated teaser places for homepage or /here (max 5).
 * Prefers `homepageTeaser` / `hereTeaser`; falls back to legacy `featuredOrder` on homepage
 * until editors finish migrating.
 */
export async function getMapTeaserPlaces(locale: string, context: TeaserContext) {
  const payload = await getPayloadClient()
  const teaserField = context === 'homepage' ? 'homepageTeaser' : 'hereTeaser'

  const teaserResult = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: {
      and: [
        { status: { equals: 'active' } },
        { [`${teaserField}.enabled`]: { equals: true } },
        { 'geo.latitude': { exists: true } },
        { 'geo.longitude': { exists: true } },
      ],
    },
    depth: 2,
    sort: `${teaserField}.order`,
    limit: 40,
  })

  const curated = getTeaserPlaces(
    teaserResult.docs as NeighbourhoodPlace[],
    context,
    TEASER_PLACE_LIMIT,
  )
  if (curated.length > 0) {
    return curated as unknown as NeighbourhoodPlaceDoc[]
  }

  if (context !== 'homepage') return []

  // Legacy fallback — featuredOrder 1–5 until homepageTeaser is seeded
  const legacy = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: {
      and: [
        { status: { equals: 'active' } },
        { featuredOrder: { exists: true } },
        { 'geo.latitude': { exists: true } },
        { 'geo.longitude': { exists: true } },
      ],
    },
    depth: 2,
    sort: 'featuredOrder',
    limit: TEASER_PLACE_LIMIT,
  })

  if (legacy.docs.length > 0) {
    return legacy.docs as unknown as NeighbourhoodPlaceDoc[]
  }

  // Last resort — any active geo-tagged places so the homepage map still has pins
  const anyGeo = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: {
      and: [
        { status: { equals: 'active' } },
        { 'geo.latitude': { exists: true } },
        { 'geo.longitude': { exists: true } },
      ],
    },
    depth: 2,
    sort: 'walkingMinutes',
    limit: TEASER_PLACE_LIMIT,
  })

  return anyGeo.docs as unknown as NeighbourhoodPlaceDoc[]
}

/** @deprecated Prefer getMapTeaserPlaces(locale, 'homepage') */
export async function getHomepageFeaturedPlaces(locale: string) {
  return getMapTeaserPlaces(locale, 'homepage')
}

export async function getNeighbourhoodPlaces(params: NeighbourhoodPlaceListParams) {
  const payload = await getPayloadClient()
  const page = Math.max(1, params.page ?? 1)

  const and: Where[] = [{ status: { equals: 'active' } }]

  if (params.category) {
    and.push({ category: { equals: params.category } })
  }

  if (params.distanceTier) {
    and.push({ distanceTier: { equals: params.distanceTier } })
  } else if (params.defaultWalkable) {
    and.push({
      or: [
        { distanceTier: { equals: 'walkable' } },
        { distanceTier: { exists: false } },
      ],
    })
  }

  if (params.indoorOutdoor) {
    and.push({
      or: [
        { indoorOutdoor: { equals: params.indoorOutdoor } },
        { indoorOutdoor: { equals: 'both' } },
      ],
    })
  }

  if (params.search?.trim()) {
    const q = params.search.trim()
    and.push({
      or: [
        { name: { contains: q } },
        { description: { contains: q } },
        { 'address.streetAddress': { contains: q } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'neighbourhood-places',
    locale: params.locale as 'de' | 'en',
    where: { and },
    depth: 2,
    sort: 'name',
    page: params.unpaginated ? 1 : page,
    limit: params.unpaginated ? 500 : NEIGHBOURHOOD_PAGE_SIZE,
  })

  return {
    ...result,
    docs: result.docs as unknown as NeighbourhoodPlaceDoc[],
  }
}

export async function getNeighbourhoodPlaceBySlug(slug: string, locale: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }],
    },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as NeighbourhoodPlaceDoc | undefined) ?? null
}
