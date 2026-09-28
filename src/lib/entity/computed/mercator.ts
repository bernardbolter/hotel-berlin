import type { LngLat } from './types'

/** Web Mercator helpers for projecting pins/routes onto a static map image. */

const TILE_SIZE = 512

function mercatorX(lng: number): number {
  return ((lng + 180) / 360) * TILE_SIZE
}

function mercatorY(lat: number): number {
  const sin = Math.sin((lat * Math.PI) / 180)
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
  return y * TILE_SIZE
}

export type MapViewport = {
  center: LngLat
  zoom: number
  width: number
  height: number
}

/** Pixel position in the image (origin top-left). */
export function projectToPixel(
  point: LngLat,
  viewport: MapViewport,
): { x: number; y: number } {
  const scale = 2 ** viewport.zoom
  const worldW = TILE_SIZE * scale
  const centerX = mercatorX(viewport.center.lng) * scale
  const centerY = mercatorY(viewport.center.lat) * scale
  const x = (mercatorX(point.lng) * scale - centerX) + viewport.width / 2
  const y = (mercatorY(point.lat) * scale - centerY) + viewport.height / 2
  return { x, y }
}

export function projectLine(
  points: readonly LngLat[],
  viewport: MapViewport,
): string {
  if (points.length === 0) return ''
  return points
    .map((p, i) => {
      const { x, y } = projectToPixel(p, viewport)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export type Bounds = {
  west: number
  south: number
  east: number
  north: number
}

export function boundsFromPoints(points: readonly LngLat[]): Bounds | null {
  if (points.length === 0) return null
  let west = Infinity
  let east = -Infinity
  let south = Infinity
  let north = -Infinity
  for (const p of points) {
    west = Math.min(west, p.lng)
    east = Math.max(east, p.lng)
    south = Math.min(south, p.lat)
    north = Math.max(north, p.lat)
  }
  return { west, south, east, north }
}

/**
 * Fit points with padding, clamp zoom 10–16 (R6).
 * Returns center + zoom for Mapbox Static Images.
 */
export function fitBounds(
  points: readonly LngLat[],
  opts: {
    width: number
    height: number
    padding?: number
    minZoom?: number
    maxZoom?: number
  },
): MapViewport {
  const padding = opts.padding ?? 0.12
  const minZoom = opts.minZoom ?? 10
  const maxZoom = opts.maxZoom ?? 16
  const bounds = boundsFromPoints(points)
  const fallback: MapViewport = {
    center: points[0] ?? { lng: 13.3522, lat: 52.5036 },
    zoom: 14,
    width: opts.width,
    height: opts.height,
  }
  if (!bounds) return fallback

  const padLng = (bounds.east - bounds.west) * padding || 0.002
  const padLat = (bounds.north - bounds.south) * padding || 0.002
  const west = bounds.west - padLng
  const east = bounds.east + padLng
  const south = bounds.south - padLat
  const north = bounds.north + padLat

  const center = {
    lng: (west + east) / 2,
    lat: (south + north) / 2,
  }

  // Find the highest zoom where the padded bounds fit the image.
  let zoom = maxZoom
  for (let z = maxZoom; z >= minZoom; z -= 0.25) {
    const viewport: MapViewport = { center, zoom: z, width: opts.width, height: opts.height }
    const sw = projectToPixel({ lng: west, lat: south }, viewport)
    const ne = projectToPixel({ lng: east, lat: north }, viewport)
    const fits =
      Math.min(sw.x, ne.x) >= 0 &&
      Math.max(sw.x, ne.x) <= opts.width &&
      Math.min(sw.y, ne.y) >= 0 &&
      Math.max(sw.y, ne.y) <= opts.height
    if (fits) {
      zoom = z
      break
    }
    zoom = z
  }

  return {
    center,
    zoom: Math.min(maxZoom, Math.max(minZoom, zoom)),
    width: opts.width,
    height: opts.height,
  }
}

/** At zoom ≤ 12, drop route geometry and use a straight line (Olympiastadion ~11.5). */
export function routeForZoom(
  geometry: LngLat[] | null,
  from: LngLat,
  to: LngLat,
  zoom: number,
): LngLat[] {
  if (zoom <= 12 || !geometry || geometry.length < 2) {
    return [from, to]
  }
  return geometry
}
