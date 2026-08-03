/**
 * Category token → visual colors for SpotlightCard badge + Line-CTA.
 * Fill uses ~90% opacity in the component; `text` is the dark stop for badge label contrast.
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
  /** Solid brand hex for CTA `--cta-highlight` and badge fill base */
  fill: string
  /** Darker stop for badge label on translucent fill */
  text: string
  label: string
}

export const CATEGORY_TOKENS: Record<CategoryToken, CategoryTokenStyle> = {
  art: { fill: '#6A5870', text: '#3D3242', label: 'Art' },
  music: { fill: '#F79B2E', text: '#1E1530', label: 'Music' },
  sport: { fill: '#4A7A68', text: '#1A3C40', label: 'Sport' },
  food: { fill: '#F95D62', text: '#1E1530', label: 'Food' },
  community: { fill: '#2C6B7A', text: '#1A3C40', label: 'Community' },
  neighbourhood: { fill: '#A08C38', text: '#1E1530', label: 'Neighbourhood' },
  other: { fill: '#5A5550', text: '#2D2A26', label: 'Other' },
  artist: { fill: '#6A5870', text: '#3D3242', label: 'Artist' },
  curator: { fill: '#2C6B7A', text: '#1A3C40', label: 'Curator' },
  host: { fill: '#F79B2E', text: '#1E1530', label: 'Host' },
  partner: { fill: '#A08C38', text: '#1E1530', label: 'Partner' },
  staff: { fill: '#4A7A68', text: '#1A3C40', label: 'Staff' },
  local: { fill: '#56674F', text: '#1A3C40', label: 'Local' },
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
