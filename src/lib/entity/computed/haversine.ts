import type { LngLat } from './types'

const EARTH_RADIUS_M = 6_371_000

/** Great-circle distance in metres. */
export function haversineMeters(a: LngLat, b: LngLat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const φ1 = toRad(a.lat)
  const φ2 = toRad(b.lat)
  const Δφ = toRad(b.lat - a.lat)
  const Δλ = toRad(b.lng - a.lng)
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

/** Walking estimate: haversine × 1.3 detour, 80 m/min, rounded up. */
export function estimateWalkMeters(a: LngLat, b: LngLat): number {
  return Math.round(haversineMeters(a, b) * 1.3)
}

export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.ceil(meters / 80))
}

/** Round coordinates for cache keys (5 decimal places ≈ 1.1 m). */
export function roundCoord(n: number, decimals = 5): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}
