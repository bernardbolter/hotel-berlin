import type {
  HotelRoom,
  JsonLdGraph,
  JsonLdNode,
  MeetingRoom,
  NeighbourhoodPlace,
  Person,
  SiteConfig,
  Venue,
} from '../types';
import {
  buildHotelRoomNode,
  buildHotelRoomRef,
  buildOfferNode,
  buildRoomBreadcrumbList,
} from './hotelRoom';
import {
  buildMeetingRoomBreadcrumbList,
  buildMeetingRoomNode,
  buildMeetingRoomRef,
} from './meetingRoom';
import { buildPersonNode, buildPersonRef } from './person';
import { buildPlaceNode, buildPlaceRef } from './place';
import { buildReviewNodesForPlace } from './review';
import {
  buildVenueBreadcrumbList,
  buildVenueNode,
} from './venue';
import {
  meetingsListUrl,
  neighbourhoodListUrl,
  peopleListUrl,
  roomsListUrl,
} from '../lib/ids';

function wrap(graph: JsonLdNode[]): JsonLdGraph {
  return { '@context': 'https://schema.org', '@graph': dedupeById(graph) };
}

/**
 * De-duplicates nodes by @id, keeping the *richest* version (most keys)
 * when the same @id appears more than once — which happens deliberately
 * when a place page inlines a stub for a person who's also referenced
 * elsewhere. Order of insertion doesn't matter; richness does.
 */
export function dedupeById(nodes: JsonLdNode[]): JsonLdNode[] {
  const byId = new Map<string, JsonLdNode>();
  const noId: JsonLdNode[] = [];

  for (const node of nodes) {
    const id = node['@id'] as string | undefined;
    if (!id) {
      noId.push(node);
      continue;
    }
    const existing = byId.get(id);
    if (!existing || Object.keys(node).length > Object.keys(existing).length) {
      byId.set(id, node);
    }
  }

  return [...noId, ...byId.values()];
}

/**
 * Full JSON-LD graph for a single place detail page
 * (`/nachbarschaft/[slug]`). Includes the place node itself, a lightweight
 * stub for each endorser (full profiles live on their own pages, under the
 * same @id), and the Review node bridging them.
 */
export function buildPlacePageGraph(place: NeighbourhoodPlace, config: SiteConfig): JsonLdGraph {
  const placeNode = buildPlaceNode(place, config);
  const personStubs = (place.endorsements ?? []).map((e) => buildPersonRef(e.person, config));
  const reviews = buildReviewNodesForPlace(place, config);

  return wrap([placeNode, ...personStubs, ...reviews]);
}

/**
 * Full JSON-LD graph for a single person profile page
 * (`/you-me-and-berlin/[slug]`). `picks` is the resolved reverse-join —
 * every place this person has endorsed, each with the matching endorsement
 * quote — so the *same* Review @id used on the place page is reused here,
 * not re-declared. See test/consistency.test.ts for the guarantee that
 * both sides produce byte-identical Review nodes.
 */
export function buildPersonPageGraph(
  person: Person,
  picks: { place: NeighbourhoodPlace; quote: string }[],
  config: SiteConfig,
): JsonLdGraph {
  const personNode = buildPersonNode(person, config);
  const placeStubs = picks.map((p) => buildPlaceRef(p.place, config));

  const reviews = picks.map((p) =>
    buildReviewNodesForPlace(
      { ...p.place, endorsements: [{ person, quote: p.quote }] },
      config,
    ),
  ).flat();

  return wrap([personNode, ...placeStubs, ...reviews]);
}

/**
 * Listing-page graph — deliberately lightweight. Each item is an @id-only
 * reference into the entity's own detail page, not a re-declaration of the
 * full node. This is what keeps the listing page from "competing" with the
 * detail pages for citation authority (see the individual-pages decision
 * in the design conversation) while still describing what's on the page.
 */
export function buildNeighbourhoodListGraph(
  places: NeighbourhoodPlace[],
  config: SiteConfig,
): JsonLdGraph {
  const itemListElement = places.map((place, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: buildPlaceRef(place, config),
  }));

  const listNode: JsonLdNode = {
    '@type': 'ItemList',
    '@id': `${neighbourhoodListUrl(config)}#list`,
    itemListElement,
  };

  return wrap([listNode]);
}

export function buildPeopleListGraph(people: Person[], config: SiteConfig): JsonLdGraph {
  const itemListElement = people.map((person, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: buildPersonRef(person, config),
  }));

  const listNode: JsonLdNode = {
    '@type': 'ItemList',
    '@id': `${peopleListUrl(config)}#list`,
    itemListElement,
  };

  return wrap([listNode]);
}

/**
 * Full JSON-LD graph for a room detail page (`/zimmer/[slug]`).
 * Declares the HotelRoom entity once, plus its Offer and BreadcrumbList.
 */
export function buildHotelRoomPageGraph(
  room: HotelRoom,
  config: SiteConfig,
  breadcrumbLabels: { home: string; rooms: string } = { home: 'Home', rooms: 'Rooms' },
): JsonLdGraph {
  const roomNode = buildHotelRoomNode(room, config);
  const offer = buildOfferNode(room, config);
  const breadcrumb = buildRoomBreadcrumbList(room, config, breadcrumbLabels);
  return wrap(offer ? [roomNode, offer, breadcrumb] : [roomNode, breadcrumb]);
}

/**
 * Listing-page graph — ItemList of lightweight refs to detail-page @ids.
 * Never re-declares full HotelRoom nodes on the index.
 */
export function buildRoomsListGraph(rooms: HotelRoom[], config: SiteConfig): JsonLdGraph {
  const itemListElement = rooms.map((room, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: buildHotelRoomRef(room, config),
  }));

  const listNode: JsonLdNode = {
    '@type': 'ItemList',
    '@id': `${roomsListUrl(config)}#list`,
    itemListElement,
  };

  return wrap([listNode]);
}

/**
 * Full JSON-LD graph for a meeting-room detail page (`/tagungen/[slug]`).
 * Declares the MeetingRoom entity once plus BreadcrumbList — no Offer.
 */
export function buildMeetingRoomPageGraph(
  room: MeetingRoom,
  config: SiteConfig,
  breadcrumbLabels: { home: string; meetings: string } = {
    home: 'Home',
    meetings: 'Meet & Work',
  },
): JsonLdGraph {
  const roomNode = buildMeetingRoomNode(room, config);
  const breadcrumb = buildMeetingRoomBreadcrumbList(room, config, breadcrumbLabels);
  return wrap([roomNode, breadcrumb]);
}

/**
 * Listing-page graph — ItemList of lightweight refs to detail-page @ids.
 */
export function buildMeetingsListGraph(
  rooms: MeetingRoom[],
  config: SiteConfig,
): JsonLdGraph {
  const itemListElement = rooms.map((room, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: buildMeetingRoomRef(room, config),
  }));

  const listNode: JsonLdNode = {
    '@type': 'ItemList',
    '@id': `${meetingsListUrl(config)}#list`,
    itemListElement,
  };

  return wrap([listNode]);
}

/**
 * Full JSON-LD graph for the public Lütze page (`/restaurant`).
 * Declares the venue entity once plus BreadcrumbList — Home → Restaurant.
 */
export function buildVenuePageGraph(
  venue: Venue,
  config: SiteConfig,
  breadcrumbLabels: { home: string; restaurant: string } = {
    home: 'Home',
    restaurant: 'Restaurant',
  },
): JsonLdGraph {
  const venueNode = buildVenueNode(venue, config);
  const breadcrumb = buildVenueBreadcrumbList(venue, config, breadcrumbLabels);
  return wrap([venueNode, breadcrumb]);
}
