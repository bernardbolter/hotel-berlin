/**
 * Category token → visual colors for SpotlightCard badge + Line-CTA.
 * Hex values match map pin palette v2 (`CATEGORY_PIN_COLOR` / tokens.json → color.category.pin).
 */
export type CategoryToken =
  | 'art'
  | 'music'
  | 'sport'
  | 'food'
  | 'community'
  | 'neighbourhood'
  | 'other'
  | 'artist'
  | 'curator'
  | 'host'
  | 'partner'
  | 'staff'
  | 'local'

export type CategoryTokenStyle = {
  /** Solid brand hex for CTA and badge — same as map pin for that category */
  fill: string
  /** Darker stop for badge label on translucent fill */
  text: string
  label: string
}

/** Map pin palette (shared with neighbourhood maps). */
const PIN = {
  art: '#2C6B7A',
  museum: '#A08C38',
  shopping: '#5F4E68',
  bar: '#D14A50',
  restaurant: '#C1652F',
  parks: '#56674F',
  sightseeing: '#E08A28',
  party: '#9B3F6B',
  kids: '#4A90C4',
} as const

export const CATEGORY_TOKENS: Record<CategoryToken, CategoryTokenStyle> = {
  art: { fill: PIN.art, text: '#1A3C40', label: 'Art' },
  music: { fill: PIN.party, text: '#1E1530', label: 'Music' },
  sport: { fill: PIN.kids, text: '#1A3C40', label: 'Sport' },
  food: { fill: PIN.restaurant, text: '#1E1530', label: 'Food' },
  community: { fill: PIN.shopping, text: '#1E1530', label: 'Community' },
  neighbourhood: { fill: PIN.museum, text: '#1E1530', label: 'Neighbourhood' },
  other: { fill: PIN.parks, text: '#1A3C40', label: 'Other' },
  artist: { fill: PIN.art, text: '#1A3C40', label: 'Artist' },
  curator: { fill: PIN.museum, text: '#1E1530', label: 'Curator' },
  host: { fill: PIN.sightseeing, text: '#1E1530', label: 'Host' },
  partner: { fill: PIN.shopping, text: '#1E1530', label: 'Partner' },
  staff: { fill: PIN.parks, text: '#1A3C40', label: 'Staff' },
  local: { fill: PIN.parks, text: '#1A3C40', label: 'Local' },
}

export function resolveCategoryToken(token: string): CategoryTokenStyle {
  const key = token.toLowerCase() as CategoryToken
  return CATEGORY_TOKENS[key] ?? CATEGORY_TOKENS.other
}

const VENUE_TYPE_TOKEN: Record<string, CategoryToken> = {
  Restaurant: 'food',
  Bar: 'food',
  ArtGallery: 'art',
  SportsActivityLocation: 'sport',
  EventVenue: 'community',
  LocalBusiness: 'other',
}

export function categoryTokenForVenueType(venueType: string): CategoryToken {
  return VENUE_TYPE_TOKEN[venueType] ?? 'other'
}

const EVENT_CATEGORY_TOKEN: Record<string, CategoryToken> = {
  Art: 'art',
  Music: 'music',
  Sport: 'sport',
  Food: 'food',
  Community: 'community',
  Neighbourhood: 'neighbourhood',
  Other: 'other',
}

export function categoryTokenForEventCategory(category: string | null | undefined): CategoryToken {
  if (!category) return 'other'
  return EVENT_CATEGORY_TOKEN[category] ?? 'other'
}

export function categoryTokenForPersonType(type: string): CategoryToken {
  const key = type.toLowerCase() as CategoryToken
  return CATEGORY_TOKENS[key] ? key : 'local'
}
