import type { Endorsement, JsonLdNode, NeighbourhoodPlace, SiteConfig } from '../types.js';
import { placeNodeId, reviewNodeId } from '../lib/ids.js';
import { buildPersonRef } from './person.js';
import { buildPlaceRef } from './place.js';
import { prune } from '../lib/prune.js';

/**
 * Builds one Review node per endorsement on a place.
 *
 * Deliberately NEVER emits `reviewRating`. There is no star-rating concept
 * in this data model (the xlsx has no numeric score, just an editorial
 * quote) — inventing one to try to earn Google's star-snippet treatment
 * would misrepresent the content and risks a manual action under Google's
 * structured-data policies. `buildReviewNode` has no parameter that could
 * introduce a rating; `reviewRatingIsAbsent()` below is a standing test
 * guard against that ever being added by accident.
 */
export function buildReviewNode(
  place: NeighbourhoodPlace,
  endorsement: Endorsement,
  config: SiteConfig,
): JsonLdNode {
  return prune({
    '@type': 'Review',
    '@id': reviewNodeId(place.slug, endorsement.person.slug, config),
    itemReviewed: buildPlaceRef(place, config),
    author: buildPersonRef(endorsement.person, config),
    reviewBody: endorsement.quote,
  });
}

export function buildReviewNodesForPlace(place: NeighbourhoodPlace, config: SiteConfig): JsonLdNode[] {
  if (!place.endorsements) return [];
  return place.endorsements.map((e) => buildReviewNode(place, e, config));
}

/** Test/lint guard — see doc comment above. */
export function reviewRatingIsAbsent(node: JsonLdNode): boolean {
  return !('reviewRating' in node);
}
