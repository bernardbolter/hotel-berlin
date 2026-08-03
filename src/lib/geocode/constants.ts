import type { DistanceTier } from './types'

/** Walking-minutes thresholds for Nachbarschaft distanceTier. */
export const WALKABLE_MAX_MINUTES = 20
export const SHORT_TRANSIT_MAX_MINUTES = 45

/** Mapbox Geocoding relevance floor — below this, skip auto-write. */
export const MIN_GEOCODE_RELEVANCE = 0.7

/**
 * Loose Berlin metro bounding box — rejects wildly wrong hits
 * (e.g. same-named places in other cities).
 */
export const BERLIN_BBOX = {
  north: 52.68,
  south: 52.33,
  west: 13.08,
  east: 13.77,
} as const

export function tierFromMinutes(minutes: number): DistanceTier {
  if (minutes <= WALKABLE_MAX_MINUTES) return 'walkable'
  if (minutes <= SHORT_TRANSIT_MAX_MINUTES) return 'short-transit'
  return 'further-out'
}

export function isInsideBerlin(latitude: number, longitude: number): boolean {
  return (
    latitude >= BERLIN_BBOX.south &&
    latitude <= BERLIN_BBOX.north &&
    longitude >= BERLIN_BBOX.west &&
    longitude <= BERLIN_BBOX.east
  )
}

export function getMapboxGeocodeToken(): string | null {
  return (
    process.env.MAPBOX_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ||
    null
  )
}
