import stationsData from '@/data/stations.json'

import { haversineMeters } from './haversine'
import type { LngLat, NearestStation, Station } from './types'

/** Max straight-line distance for a station row (metres). */
export const NEAREST_STATION_MAX_M = 1_200

type StationsFile = {
  _source?: string
  stations: Station[]
}

const data = stationsData as StationsFile

export const STATIONS_SOURCE = data._source ?? ''

export const STATIONS: readonly Station[] = data.stations

/**
 * Nearest U-Bahn or S-Bahn station within 1,200 m (straight line), or null.
 * Format for display: `{name} · {lines joined}` — row label from `mode`.
 */
export function nearestStation(point: LngLat): NearestStation | null {
  let best: NearestStation | null = null

  for (const station of STATIONS) {
    const meters = haversineMeters(point, { lng: station.lng, lat: station.lat })
    if (meters > NEAREST_STATION_MAX_M) continue
    if (!best || meters < best.meters) {
      best = { ...station, meters }
    }
  }

  return best
}

/** `Bayerischer Platz · U4, U7` */
export function formatStationValue(station: Pick<Station, 'name' | 'lines'>): string {
  const lines = station.lines.join(', ')
  return lines ? `${station.name} · ${lines}` : station.name
}
