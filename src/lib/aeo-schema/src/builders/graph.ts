import type { JsonLdGraph, JsonLdNode, NeighbourhoodPlace, Person, SiteConfig } from '../types';
import { buildPersonNode, buildPersonRef } from './person';
import { buildPlaceNode, buildPlaceRef } from './place';
import { buildReviewNodesForPlace } from './review';
import { neighbourhoodListUrl, peopleListUrl } from '../lib/ids';

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
