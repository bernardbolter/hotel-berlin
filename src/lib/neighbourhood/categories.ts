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

function relativeLuminance(hex: string): number {
  const raw = hex.replace('#', '')
  const channels = [0, 1, 2].map((i) => {
    const v = parseInt(raw.slice(i * 2, i * 2 + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export type PinChipStyle = {
  backgroundColor: string
  color: string
  borderColor?: string
}

/**
 * Category chip colours for entity pages — text must hit WCAG AA 4.5:1.
 * Prefer white on fill; else ink on fill (token-map `onFill`); else outline + ink.
 */
export function pinChipStyleForCategory(category: PlaceCategory): PinChipStyle {
  const fill = pinColorForCategory(category)
  if (contrastRatio(PIN_GLYPH_WHITE, fill) >= 4.5) {
    return { backgroundColor: fill, color: PIN_GLYPH_WHITE }
  }
  if (contrastRatio(PIN_GLYPH_INK, fill) >= 4.5) {
    return { backgroundColor: fill, color: PIN_GLYPH_INK }
  }
  return { backgroundColor: 'transparent', color: PIN_GLYPH_INK, borderColor: fill }
}
