import {
  DEFAULT_MAPBOX_STYLE,
  getMapboxAccessToken,
  getMapboxStyleId,
  type MapBounds,
} from './config'

type StaticMapOptions = {
  width: number
  height: number
  bounds?: MapBounds
  center?: { lat: number; lng: number }
  zoom?: number
  retina?: boolean
  styleId?: string
  /** Optional Mapbox overlay pin at lon,lat (e.g. hotel marker) */
  marker?: { lat: number; lng: number; color?: string }
}

function encodeStyleId(styleId: string): string {
  return styleId.includes('/') ? styleId : `mapbox/${styleId}`
}

export function buildMapboxStaticImageUrl({
  width,
  height,
  bounds,
  center,
  zoom = 14,
  retina = true,
  styleId = getMapboxStyleId(),
  marker,
}: StaticMapOptions): string | null {
  const token = getMapboxAccessToken()
  if (!token) return null

  const style = encodeStyleId(styleId)
  const size = `${Math.round(width)}x${Math.round(height)}${retina ? '@2x' : ''}`

  const position = bounds
    ? `[${bounds.west},${bounds.south},${bounds.east},${bounds.north}]`
    : center
      ? `${center.lng},${center.lat},${zoom},0,0`
      : null

  if (!position) return null

  const overlay =
    marker != null
      ? `pin-s+${(marker.color ?? '4F674F').replace('#', '')}(${marker.lng},${marker.lat})/`
      : ''

  const params = new URLSearchParams({
    access_token: token,
    attribution: 'false',
    logo: 'false',
  })

  return `https://api.mapbox.com/styles/v1/${style}/static/${overlay}${position}/${size}?${params}`
}

export function buildMapboxStyleUrl(styleId: string = getMapboxStyleId()): string {
  const style = encodeStyleId(styleId)
  return `mapbox://styles/${style}`
}

export function mapboxAttributionUrl(): string {
  return 'https://www.mapbox.com/about/maps/'
}
