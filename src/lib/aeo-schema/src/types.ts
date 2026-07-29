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

export interface SiteConfig {
  baseUrl: string; // e.g. "https://hotel-berlin.de"
  canonicalLocale: Locale; // 'de' — the site is German-first, bare domain redirects to /de
  paths: {
    neighbourhood: Record<Locale, string>; // { de: '/de/nachbarschaft', en: '/en/neighbourhood' }
    peopleHub: Record<Locale, string>; // { de: '/de/you-me-and-berlin', en: '/en/you-me-and-berlin' }
  };
}

// JSON-LD primitives we actually use — intentionally not a full schema.org
// typing (that's a much bigger dependency); just enough structure to keep
// the builders honest.
export interface JsonLdNode {
  '@type': string;
  '@id'?: string;
  [key: string]: unknown;
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
}
