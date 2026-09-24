import type { LngLat, Trip, TripMode } from './types'
import { estimateWalkMeters, estimateWalkMinutes, roundCoord } from './haversine'

const REVALIDATE_30_DAYS = 2_592_000
const FAR_THRESHOLD_MINUTES = 30

type DirectionsRoute = {
  duration: number
  distance: number
  geometry?: { coordinates?: [number, number][] }
}

type DirectionsResponse = {
  routes?: DirectionsRoute[]
  message?: string
  code?: string
}

function tripMode(minutes: number): TripMode {
  return minutes > FAR_THRESHOLD_MINUTES ? 'far' : 'walk'
}

function getDirectionsToken(): string | null {
  return (
    process.env.MAPBOX_SERVER_TOKEN?.trim() ||
    process.env.MAPBOX_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ||
    null
  )
}

function storedTrip(from: LngLat, to: LngLat, storedMinutes: number): Trip {
  const meters = estimateWalkMeters(from, to)
  return {
    minutes: Math.max(1, Math.round(storedMinutes)),
    meters,
    geometry: null,
    source: 'stored',
    mode: tripMode(storedMinutes),
  }
}

function estimateTrip(from: LngLat, to: LngLat): Trip {
  const meters = estimateWalkMeters(from, to)
  const minutes = estimateWalkMinutes(meters)
  return {
    minutes,
    meters,
    geometry: null,
    source: 'estimate',
    mode: tripMode(minutes),
  }
}

async function fetchDirections(from: LngLat, to: LngLat, token: string): Promise<Trip | null> {
  const coords = `${roundCoord(from.lng)},${roundCoord(from.lat)};${roundCoord(to.lng)},${roundCoord(to.lat)}`
  const params = new URLSearchParams({
    access_token: token,
    geometries: 'geojson',
    overview: 'full',
  })
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_30_DAYS } })
    if (!res.ok) return null
    const data = (await res.json()) as DirectionsResponse
    const route = data.routes?.[0]
    if (!route || !Number.isFinite(route.duration) || !Number.isFinite(route.distance)) {
      return null
    }
    const minutes = Math.max(1, Math.round(route.duration / 60))
    const geometry =
      route.geometry?.coordinates?.map(([lng, lat]) => ({ lng, lat })) ?? null
    return {
      minutes,
      meters: Math.round(route.distance),
      geometry: geometry && geometry.length > 1 ? geometry : null,
      source: 'directions',
      mode: tripMode(minutes),
    }
  } catch {
    return null
  }
}

/**
 * Hotel→place (or place→place) trip.
 * Precedence: Mapbox Directions → stored `walkingMinutes` (hotel→place only) → estimate.
 */
export async function getTrip(
  from: LngLat,
  to: LngLat,
  opts?: { storedMinutes?: number | null },
): Promise<Trip> {
  const token = getDirectionsToken()
  if (token) {
    const directed = await fetchDirections(from, to, token)
    if (directed) return directed
  }

  if (opts?.storedMinutes != null && Number.isFinite(opts.storedMinutes)) {
    return storedTrip(from, to, opts.storedMinutes)
  }

  return estimateTrip(from, to)
}

export { FAR_THRESHOLD_MINUTES, tripMode }
