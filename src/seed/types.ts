export type LocalizedSeed = { en: string; de: string }

export type RoomSeedRecord = {
  name: LocalizedSeed
  slug: string
  featured: boolean
  displayOrder: number
  shortDescription: LocalizedSeed
  fromPrice: number
  floorSizeM2?: number | null
  bedConfiguration: {
    type: 'double' | 'queen' | 'king' | 'king-freestanding' | 'twin' | 'bunk'
    details: string
  }
  occupancy: { maxAdults: number; maxChildren: number; maxTotal: number }
  childAgeMin?: number
  bathroomLabel: 'shower' | 'rain-shower' | 'bath-shower' | 'spa-bathroom'
  bathroomDescription: string
  hasBalcony: boolean
  hasSauna: boolean
  hasSeparateLiving: boolean
  isAccessible: boolean
  bookingUrl: string
  amenities: string[]
}

export type AmenityTagSeed = {
  name: string
  slug: string
  type: 'amenity'
  lucideIcon: string
}
