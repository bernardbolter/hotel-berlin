import placesData from '@/lib/data/places.json'

export type PlaceContext = 'outside' | 'inside' | 'both'
export type PlaceType = 'monument' | 'concierge' | 'in-building'

export interface Place {
  id: string
  name: string
  slug: string
  context: PlaceContext
  type: PlaceType
  category: string
  shortDescription: string
  shortDescriptionDE?: string
  location: { lat: number; lng: number }
  address?: string | null
  walkingMinutes?: number | null
  walkingNote?: string
  floor?: string | null
  website?: string | null
  hours?: string | null
  pinIcon: string
  schemaType: string
  featured: boolean
  active: boolean
}

const places = placesData as Place[]

export function getAllPlaces(): Place[] {
  return places.filter((p) => p.active)
}

export function getPlacesForContext(ctx: Exclude<PlaceContext, 'both'>): Place[] {
  return places.filter((p) => p.active && (p.context === ctx || p.context === 'both'))
}

export function getFeaturedPlaces(): Place[] {
  return places.filter((p) => p.active && p.featured)
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug && p.active)
}

export function getInBuildingPlaces(): Place[] {
  return places.filter((p) => p.active && p.type === 'in-building')
}

export function getConciergePicks(): Place[] {
  return places.filter((p) => p.active && p.type === 'concierge')
}
