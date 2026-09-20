// Hotel Berlin, Berlin — AEO schema-builder types
// Mirrors the Payload collection field shapes agreed for `people` and
// `neighbourhoodPlaces`. Keep this file in sync with the Payload config —
// it is the contract between the CMS schema and the JSON-LD output.

export type Locale = 'de' | 'en';

export type PropertyIdSystem = 'Wikidata' | 'GND' | 'VIAF' | 'GoogleKG' | 'GooglePlaceID';

export interface AuthorityIdentifier {
  propertyID: PropertyIdSystem;
  value: string;
}

export interface Authority {
  identifier?: AuthorityIdentifier[];
  sameAs?: string[];
}

export type PersonType = 'artist' | 'curator' | 'host' | 'partner' | 'staff' | 'local';

export interface Person {
  id: string; // Payload document id
  slug: string;
  name: string;
  jobTitle?: string;
  shortBio?: string;
  quote?: string;
  website?: string;
  instagram?: string;
  roomNumber?: string;
  basedIn?: string;
  type?: PersonType;
  authority?: Authority;
  status: 'draft' | 'published';
}

export type PlaceCategory =
  | 'Art'
  | 'Bar'
  | 'Kids'
  | 'Museum'
  | 'Parks and Nature'
  | 'Party'
  | 'Restaurant'
  | 'Shopping'
  | 'Sightseeing';

export type PlaceSchemaType =
  | 'TouristAttraction'
  | 'LocalBusiness'
  | 'Museum'
  | 'Park'
  | 'Restaurant'
  | 'BarOrPub'
  | 'ShoppingCenter';

export type DistanceTier = 'walkable' | 'short-transit' | 'further-out';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

export interface PlaceAddress {
  streetAddress?: string;
  addressLocality: string; // default "Berlin"
  postalCode?: string;
}

export interface PlaceGeo {
  latitude: number;
  longitude: number;
}

export interface Endorsement {
  person: Person; // resolved, not just an id — builders take resolved data
  quote: string;
}

export interface NeighbourhoodPlace {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  schemaType: PlaceSchemaType;
  address: PlaceAddress;
  geo?: PlaceGeo;
  walkingMinutes?: number;
  distanceTier?: DistanceTier;
  indoorOutdoor?: IndoorOutdoor;
  targetAudience?: string[];
  description?: string;
  endorsements?: Endorsement[];
  website?: string;
  openingHours?: string;
  priceRange?: string;
  authority?: Authority;
  associatedRoom?: string;
  status: 'active' | 'inactive';
}

export interface HotelRoomImage {
  url: string;
  altText: string;
}

export interface HotelRoomAmenity {
  name: string;
}

export interface HotelRoom {
  id: string;
  slug: string;
  name: string;
  /** Long-form description for schema — NOT shortDescription. */
  description?: string;
  fromPrice?: number;
  currency?: string;
  bookingUrl?: string;
  floorSizeM2?: number;
  occupancyMax?: number;
  bedType?: string;
  numberOfBeds?: number;
  images?: HotelRoomImage[];
  amenities?: HotelRoomAmenity[];
}

/** Schema.org MeetingRoom — no Offer (quote-based via inquiry form). */
export interface MeetingRoom {
  id: string;
  slug: string;
  name: string;
  /** Long-form description for schema — NOT shortDescription. */
  description?: string;
  floorSizeM2?: number;
  occupancyMax?: number;
  images?: HotelRoomImage[];
  amenities?: HotelRoomAmenity[];
}

/** Payload `venues.venueType` — maps 1:1 via `venueTypeToSchemaType`. */
export type VenueType =
  | 'Restaurant'
  | 'Bar'
  | 'ArtGallery'
  | 'SportsActivityLocation'
  | 'EventVenue'
  | 'LocalBusiness';

export type VenueSchemaType =
  | 'Restaurant'
  | 'BarOrPub'
  | 'ArtGallery'
  | 'SportsActivityLocation'
  | 'EventVenue'
  | 'LocalBusiness';

export const VENUE_TYPE_TO_SCHEMA: Record<VenueType, VenueSchemaType> = {
  Restaurant: 'Restaurant',
  Bar: 'BarOrPub',
  ArtGallery: 'ArtGallery',
  SportsActivityLocation: 'SportsActivityLocation',
  EventVenue: 'EventVenue',
  LocalBusiness: 'LocalBusiness',
};

export function venueTypeToSchemaType(venueType: VenueType): VenueSchemaType {
  return VENUE_TYPE_TO_SCHEMA[venueType];
}

export interface VenueOpeningHours {
  dayOfWeek?: string;
  opens?: string;
  closes?: string;
  isOpenEnded?: boolean;
  segment?: string;
  note?: string;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  venueType: VenueType;
  description?: string;
  images?: HotelRoomImage[];
  servesCuisine?: string;
  priceRange?: string;
  openingHours?: VenueOpeningHours[];
  menuUrl?: string;
  reservationUrl?: string;
  telephone?: string;
  email?: string;
  sameAs?: string[];
}

export interface SiteConfig {
  baseUrl: string; // e.g. "https://hotel-berlin.de"
  canonicalLocale: Locale; // 'de' — the site is German-first, bare domain redirects to /de
  paths: {
    neighbourhood: Record<Locale, string>; // { de: '/de/nachbarschaft', en: '/en/neighbourhood' }
    peopleHub: Record<Locale, string>; // { de: '/de/you-me-and-berlin', en: '/en/you-me-and-berlin' }
    rooms: Record<Locale, string>; // { de: '/de/zimmer', en: '/en/rooms' }
    meetings: Record<Locale, string>; // { de: '/de/tagungen', en: '/en/meetings' }
    restaurant: Record<Locale, string>; // { de: '/de/restaurant', en: '/en/restaurant' }
    amenities: Record<Locale, string>; // { de: '/de/ausstattung', en: '/en/amenities' }
  };
}

// JSON-LD primitives we actually use — intentionally not a full schema.org
// typing (that's a much bigger dependency); just enough structure to keep
// the builders honest.
export interface JsonLdNode {
  '@type'?: string;
  '@id'?: string;
  [key: string]: unknown;
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
}
