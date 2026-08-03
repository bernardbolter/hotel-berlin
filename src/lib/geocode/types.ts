export type DistanceTier = 'walkable' | 'short-transit' | 'further-out'

export type PlaceAddressInput = {
  streetAddress?: string | null
  addressLocality?: string | null
  postalCode?: string | null
}

export type Coords = {
  latitude: number
  longitude: number
}

export type GeocodeResult = Coords & {
  relevance: number
  mapboxId: string
  placeName: string
  streetAddress?: string
  postalCode?: string
  query: string
}

export type EnrichmentResult = {
  geo: Coords
  walkingMinutes: number
  distanceTier: DistanceTier
  streetAddress?: string
  postalCode?: string
  relevance: number
  mapboxId: string
  placeName: string
  query: string
}

export type EnrichmentFailure = {
  reason: 'no-token' | 'no-result' | 'low-confidence' | 'outside-berlin' | 'directions-failed' | 'error'
  message: string
  query?: string
  relevance?: number
  coords?: Coords
}
