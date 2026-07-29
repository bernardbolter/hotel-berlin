import type { PlaceCategory } from '@/lib/queries/neighbourhoodPlaces'

/** Category → Lucide icon name for map pins and PlaceCard badges. */
export const CATEGORY_ICON: Record<PlaceCategory, string> = {
  Art: 'Palette',
  Bar: 'Wine',
  Kids: 'Baby',
  Museum: 'Landmark',
  'Parks and Nature': 'Trees',
  Party: 'Music',
  Restaurant: 'UtensilsCrossed',
  Shopping: 'ShoppingBag',
  Sightseeing: 'Binoculars',
}

export const NEIGHBOURHOOD_PIN_COLOR = '#4A7A68' // hbb-green
