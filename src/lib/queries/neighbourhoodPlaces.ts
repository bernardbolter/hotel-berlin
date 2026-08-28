import type { Where } from 'payload'

import {
  HOMEPAGE_FEATURED_LIMIT,
  TEASER_PLACE_LIMIT,
  type DistanceTier,
  type IndoorOutdoor,
  type PlaceCategory,
} from '@/lib/neighbourhood/constants'
import { getPayloadClient } from '@/lib/payload/client'
import {
  getFeaturedOrderPlaces,
  getTeaserPlaces,
  type TeaserContext,
} from '@/lib/places/getTeaserPlaces'
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
              jobTitle?: string | null
              status?: string | null
              portrait?: number | { url?: string | null; alt?: string | null } | null
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

function geoActiveWhere(extra: Where[] = []): Where {
  return {
    and: [
      { status: { equals: 'active' } },
      { 'geo.latitude': { exists: true } },
      { 'geo.longitude': { exists: true } },
      ...extra,
    ],
  }
}

/**
 * Homepage: `featuredOrder` 1–15 (paginated UI). `/here`: `hereTeaser` (max 5).
 * Homepage falls back to `homepageTeaser`, then any geo-tagged place, if featuredOrder is empty.
 */
export async function getMapTeaserPlaces(locale: string, context: TeaserContext) {
  const payload = await getPayloadClient()
  const loc = locale as 'de' | 'en'

  if (context === 'homepage') {
    const featured = await payload.find({
      collection: 'neighbourhood-places',
      locale: loc,
      where: geoActiveWhere([{ featuredOrder: { exists: true } }]),
      depth: 2,
      sort: 'featuredOrder',
      limit: HOMEPAGE_FEATURED_LIMIT,
    })
    const ordered = getFeaturedOrderPlaces(
      featured.docs as NeighbourhoodPlace[],
      HOMEPAGE_FEATURED_LIMIT,
    )
    if (ordered.length > 0) {
      return ordered as unknown as NeighbourhoodPlaceDoc[]
    }
  }

  const teaserField = context === 'homepage' ? 'homepageTeaser' : 'hereTeaser'

  const teaserResult = await payload.find({
    collection: 'neighbourhood-places',
    locale: loc,
    where: geoActiveWhere([{ [`${teaserField}.enabled`]: { equals: true } }]),
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

  const anyGeo = await payload.find({
    collection: 'neighbourhood-places',
    locale: loc,
    where: geoActiveWhere(),
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
