import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'

import { getMapboxGeocodeToken } from './constants'
import type { Coords } from './types'

type MapboxDirectionsResponse = {
  routes?: Array<{ duration: number }>
  message?: string
  code?: string
}

/**
 * Walking duration hotel → place via Mapbox Directions (walking profile).
 * Returns whole minutes (rounded).
 */
export async function mapboxWalkingMinutes(
  to: Coords,
  options?: { from?: Coords; accessToken?: string },
): Promise<number> {
  const token = options?.accessToken ?? getMapboxGeocodeToken()
  if (!token) {
    throw new Error('Missing MAPBOX_ACCESS_TOKEN or NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN')
  }

  const from = options?.from ?? {
    latitude: DEFAULT_HOTEL_COORDS.lat,
    longitude: DEFAULT_HOTEL_COORDS.lng,
  }

  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`
  const params = new URLSearchParams({
    access_token: token,
    geometries: 'geojson',
    overview: 'false',
  })

  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?${params}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Mapbox directions ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as MapboxDirectionsResponse
  const durationSec = data.routes?.[0]?.duration
  if (durationSec == null || !Number.isFinite(durationSec)) {
    throw new Error(data.message || 'No walking route returned')
  }

  return Math.max(1, Math.round(durationSec / 60))
}
