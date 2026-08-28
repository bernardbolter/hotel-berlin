import type { PlaceCategory } from '@/lib/neighbourhood/constants'

/** Category → Lucide icon name for map pins and PlaceCard badges. */
export const CATEGORY_ICON: Record<PlaceCategory, string> = {
  Art: 'Palette',
  Bar: 'Martini',
  Kids: 'Baby',
  Museum: 'Landmark',
  'Parks and Nature': 'TreePine',
  Party: 'PartyPopper',
  Restaurant: 'UtensilsCrossed',
  Shopping: 'ShoppingBag',
  Sightseeing: 'FerrisWheel',
}

/** Default single pin color for `/nachbarschaft` when category is unknown. */
export const NEIGHBOURHOOD_PIN_COLOR = '#56674F' // forest

/**
 * Hotel map marker fill — brand amber, same on `/` and `/here`.
 * Does not track the page accent (forest / teal). tokens.json → color.map.hotelFill.
 */
export const HOTEL_PIN_FILL = '#F79B2E'

/**
 * Ink — hotel Home glyph, Sightseeing glyph, person-pin fallback fill.
 * tokens.json → color.map.hotelInk.
 */
export const HOTEL_PIN_COLOR = '#1A2B4A'

export const PIN_GLYPH_WHITE = '#FFFFFF'
export const PIN_GLYPH_INK = HOTEL_PIN_COLOR

/**
 * Palette v2 — one hex per `neighbourhoodPlaces.category` value.
 * Five keep exact brand hex; Restaurant / Party / Kids fill former gaps.
 * See `HotelBerlin_NeighbourhoodTeaser_Addendum.md` §7.
 */
export const CATEGORY_PIN_COLOR: Record<PlaceCategory, string> = {
  Art: '#2C6B7A',
  Museum: '#A08C38',
  Shopping: '#5F4E68',
  Bar: '#D14A50',
  Restaurant: '#C1652F',
  'Parks and Nature': '#56674F',
  Sightseeing: '#E08A28',
  Party: '#9B3F6B',
  /** Provisional — only if Kids stays a category value (open taxonomy item). */
  Kids: '#4A90C4',
}

export function pinColorForCategory(category: PlaceCategory): string {
  return CATEGORY_PIN_COLOR[category] ?? NEIGHBOURHOOD_PIN_COLOR
}

/** White fails WCAG non-text 3:1 on Sightseeing `#E08A28` (2.68:1); ink is 5.26:1. */
export function pinGlyphColorForCategory(category: PlaceCategory): string {
  return category === 'Sightseeing' ? PIN_GLYPH_INK : PIN_GLYPH_WHITE
}
