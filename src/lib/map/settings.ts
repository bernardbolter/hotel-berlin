import { getPayloadClient } from '@/lib/payload/client'

import {
  DEFAULT_HOTEL_COORDS,
  DEFAULT_MAP_BOUNDS,
  getMapboxAccessToken,
  getMapboxStyleId,
  type MapBounds,
} from './config'

export type MapSettings = {
  bounds: MapBounds
  center: { lat: number; lng: number }
  hotelName: string
  directionsUrl: string
  styleId: string
  accessToken: string | null
}

const DEFAULT_HOTEL_NAME = 'Hotel Berlin, Berlin'

const DEFAULT_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=52.5036,13.3522'

export async function getMapSettings(): Promise<MapSettings> {
  const accessToken = getMapboxAccessToken()
  const styleId = getMapboxStyleId()

  try {
    const payload = await getPayloadClient()
    const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0 })
    const bounds = hotel.mapBounds

    // Prefer CMS geo, but correct the known-wrong seed point (~340m east of Lützowplatz 17)
    const rawLat = hotel.geo?.latitude ?? DEFAULT_HOTEL_COORDS.lat
    const rawLng = hotel.geo?.longitude ?? DEFAULT_HOTEL_COORDS.lng
    const isLegacySeedPoint =
      Math.abs(rawLat - 52.5034) < 0.00015 && Math.abs(rawLng - 13.3572) < 0.00015

    return {
      bounds: {
        north: bounds?.north ?? DEFAULT_MAP_BOUNDS.north,
        south: bounds?.south ?? DEFAULT_MAP_BOUNDS.south,
        west: bounds?.west ?? DEFAULT_MAP_BOUNDS.west,
        east: bounds?.east ?? DEFAULT_MAP_BOUNDS.east,
      },
      center: isLegacySeedPoint
        ? { ...DEFAULT_HOTEL_COORDS }
        : { lat: rawLat, lng: rawLng },
      hotelName: hotel.name?.trim() || DEFAULT_HOTEL_NAME,
      directionsUrl: hotel.directionsUrl?.trim() || hotel.hasMap?.trim() || DEFAULT_DIRECTIONS_URL,
      styleId,
      accessToken,
    }
  } catch {
    return {
      bounds: { ...DEFAULT_MAP_BOUNDS },
      center: { ...DEFAULT_HOTEL_COORDS },
      hotelName: DEFAULT_HOTEL_NAME,
      directionsUrl: DEFAULT_DIRECTIONS_URL,
      styleId,
      accessToken,
    }
  }
}
