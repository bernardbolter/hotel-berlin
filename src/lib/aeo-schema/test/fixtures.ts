import type { NeighbourhoodPlace, Person } from '../src/types.js';

export const kristiane: Person = {
  id: 'people-1',
  slug: 'kristiane-kegelmann',
  name: 'Kristiane Kegelmann',
  jobTitle: 'Artist / Sculptor',
  shortBio: 'Berlin-based artist and sculptor, room host in the You, Me & Berlin network.',
  quote: 'I hope you have a great time!',
  website: 'https://kristianekegelmann.com/',
  roomNumber: '1185',
  basedIn: 'Prenzlauer Berg',
  type: 'host',
  authority: {
    sameAs: ['https://www.wikidata.org/wiki/Special:Search?search=Kristiane+Kegelmann'],
  },
  status: 'published',
};

export const drIrisBerndt: Person = {
  id: 'people-2',
  slug: 'iris-berndt',
  name: 'Dr. Iris Berndt',
  jobTitle: 'Director, Käthe Kollwitz Museum',
  shortBio: 'Art historian and director of the Käthe Kollwitz Museum.',
  website: 'http://www.irisberndt.de/',
  roomNumber: '1171',
  type: 'host',
  status: 'published',
};

export const maike: Person = {
  id: 'people-3',
  slug: 'maike',
  name: 'Maike',
  type: 'local',
  status: 'published',
};

export const alessandraBotts: Person = {
  id: 'people-4',
  slug: 'alessandra-botts',
  name: 'Alessandra Botts',
  type: 'local',
  status: 'published',
};

export const koenigGalerie: NeighbourhoodPlace = {
  id: 'places-1',
  slug: 'koenig-galerie',
  name: 'König Galerie',
  category: 'Art',
  schemaType: 'TouristAttraction',
  address: { addressLocality: 'Berlin' },
  walkingMinutes: 18,
  distanceTier: 'walkable',
  indoorOutdoor: 'indoor',
  targetAudience: ['Kunstinteressierte'],
  description: 'Galerie für zeitgenössische Kunst.',
  endorsements: [{ person: kristiane, quote: 'Its spaces are unbelievable.' }],
  associatedRoom: '1185',
  status: 'active',
};

// The one confirmed many-to-many case in the real data: two distinct
// recommenders on the same place.
export const schlossCharlottenburg: NeighbourhoodPlace = {
  id: 'places-2',
  slug: 'schloss-charlottenburg',
  name: 'Schloss Charlottenburg',
  category: 'Sightseeing',
  schemaType: 'TouristAttraction',
  address: { addressLocality: 'Berlin' },
  walkingMinutes: 45,
  distanceTier: 'short-transit',
  indoorOutdoor: 'both',
  description: 'Historic palace and gardens.',
  endorsements: [
    { person: maike, quote: 'A perfect Sunday walk.' },
    { person: alessandraBotts, quote: 'The gardens at golden hour are unbeatable.' },
  ],
  status: 'active',
};

// Unattributed place — present in the real xlsx (12 of 91 rows have no
// recommender). Must not crash any builder.
export const hamburgerBahnhof: NeighbourhoodPlace = {
  id: 'places-3',
  slug: 'hamburger-bahnhof',
  name: 'Hamburger Bahnhof',
  category: 'Art',
  schemaType: 'Museum',
  address: { addressLocality: 'Berlin' },
  description: 'Museum für Gegenwartskunst.',
  status: 'active',
};
