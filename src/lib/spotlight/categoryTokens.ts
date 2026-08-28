/**
 * Category token → visual colors for SpotlightCard badge, title underline, Line-CTA.
 *
 * Event / venue card fills match DESIGN.md category tokens (`tokens.json` →
 * `color.category`, CSS `--cat-*`). Person-type tokens keep the map-pin palette
 * (`color.category.pin`) — different taxonomy.
 *
 * Open: Skate / Wallride has no category token yet. Do not invent one here.
 */
export type EventCategory =
  | 'art'
  | 'sport'
  | 'music'
  | 'food'
  | 'neighbourhood'
  | 'partnerships'
  | 'community'

export type CategoryToken =
  | EventCategory
  | 'other'
  | 'artist'
  | 'curator'
  | 'host'
  | 'partner'
  | 'staff'
  | 'local'

export type CategoryTokenStyle = {
  /** Solid brand hex for CTA, badge fill, and title underline */
  fill: string
  /** Text on a solid fill — White, or Ink where white fails AA (amber / coral / gold) */
  onFill: string
  label: string
}

const WHITE = '#FFFFFF'
const INK = '#1A2B4A'

/** DESIGN.md card category fills (`tokens.json` → color.category). */
const CAT = {
  art: '#2C6B7A',
  sport: '#F79B2E',
  music: '#F95D62',
  food: '#B87A2E',
  neighbourhood: '#56674F',
  partnerships: '#6B5B8D',
  community: '#216A95',
} as const

/** Map pin palette — person-type tokens only. */
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
  art: { fill: CAT.art, onFill: WHITE, label: 'Art' },
  sport: { fill: CAT.sport, onFill: INK, label: 'Sport' },
  music: { fill: CAT.music, onFill: INK, label: 'Music' },
  food: { fill: CAT.food, onFill: INK, label: 'Food' },
  neighbourhood: { fill: CAT.neighbourhood, onFill: WHITE, label: 'Neighbourhood' },
  partnerships: { fill: CAT.partnerships, onFill: WHITE, label: 'Partnerships' },
  community: { fill: CAT.community, onFill: WHITE, label: 'Community' },
  other: { fill: CAT.neighbourhood, onFill: WHITE, label: 'Other' },
  artist: { fill: PIN.art, onFill: WHITE, label: 'Artist' },
  curator: { fill: PIN.museum, onFill: INK, label: 'Curator' },
  host: { fill: PIN.sightseeing, onFill: INK, label: 'Host' },
  partner: { fill: CAT.partnerships, onFill: WHITE, label: 'Partner' },
  staff: { fill: PIN.parks, onFill: WHITE, label: 'Staff' },
  local: { fill: PIN.parks, onFill: WHITE, label: 'Local' },
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
  Partnerships: 'partnerships',
  Other: 'other',
}

export function categoryTokenForEventCategory(category: string | null | undefined): CategoryToken {
  if (!category) return 'other'
  if (EVENT_CATEGORY_TOKEN[category]) return EVENT_CATEGORY_TOKEN[category]
  const key = category.toLowerCase() as CategoryToken
  return CATEGORY_TOKENS[key] ? key : 'other'
}

export function categoryTokenForPersonType(type: string): CategoryToken {
  const key = type.toLowerCase() as CategoryToken
  return CATEGORY_TOKENS[key] ? key : 'local'
}
