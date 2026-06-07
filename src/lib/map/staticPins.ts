import type { HintDotVariant } from '@/components/primitives/HintDot'
import type { Place } from '@/lib/queries/places'

export const MAP_BOUNDS = {
  north: 52.516,
  south: 52.497,
  west: 13.34,
  east: 13.378,
} as const

export const HOTEL_COORDS = {
  lat: 52.5027,
  lng: 13.3583,
} as const

export function coordsToPercent(lat: number, lng: number): { top: string; left: string } {
  const top =
    ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
  const left = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100

  return {
    top: `${Math.min(100, Math.max(0, top))}%`,
    left: `${Math.min(100, Math.max(0, left))}%`,
  }
}

export function getPinVariant(place: Place): HintDotVariant {
  if (place.type === 'concierge') return 'concierge'
  if (place.featured) return 'featured'
  return 'default'
}
