import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload/client'

export const NEIGHBOURHOOD_PAGE_SIZE = 24

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

export type NeighbourhoodPlaceDoc = {
  id: number | string
  name: string
  slug: string
  category: PlaceCategory
  description?: string | null
  walkingMinutes?: number | null
  geo?: { latitude?: number | null; longitude?: number | null } | null
  image?: number | { url?: string | null; alt?: string | null } | null
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
