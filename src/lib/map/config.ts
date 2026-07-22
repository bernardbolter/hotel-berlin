/** Default neighbourhood viewport — Tiergarten / Lützowplatz area */
export const DEFAULT_MAP_BOUNDS = {
  north: 52.516,
  south: 52.497,
  west: 13.34,
  east: 13.378,
} as const

export type MapBounds = {
  north: number
  south: number
  west: number
  east: number
}

/** Lützowplatz 17 — Hotel Berlin, Berlin (verified ~52.5036, 13.3522) */
export const DEFAULT_HOTEL_COORDS = {
  lat: 52.5036,
  lng: 13.3522,
} as const

/** Mapbox built-in light style — swap via MAPBOX_STYLE_ID later for a custom style */
export const DEFAULT_MAPBOX_STYLE = 'mapbox/light-v11'

export function getMapboxAccessToken(): string | null {
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() || null
}

export function getMapboxStyleId(): string {
  return process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID?.trim() || DEFAULT_MAPBOX_STYLE
}
