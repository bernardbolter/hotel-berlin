import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewNode, buildReviewNodesForPlace, reviewRatingIsAbsent } from '../src/builders/review.js';
import { defaultConfig } from '../src/lib/config.js';
import { koenigGalerie, kristiane, schlossCharlottenburg } from './fixtures.js';

test('Review @id lives under the PLACE url, not the person url', () => {
  const node = buildReviewNode(koenigGalerie, koenigGalerie.endorsements![0], defaultConfig);
  assert.equal(
    node['@id'],
    'https://hotel-berlin.de/de/nachbarschaft/koenig-galerie#review-kristiane-kegelmann',
  );
});

test('itemReviewed and author are @id-only refs, not full nodes', () => {
  const node = buildReviewNode(koenigGalerie, koenigGalerie.endorsements![0], defaultConfig);
  assert.deepEqual(node.itemReviewed, {
    '@type': 'TouristAttraction',
    '@id': 'https://hotel-berlin.de/de/nachbarschaft/koenig-galerie#place',
    name: 'König Galerie',
  });
  assert.deepEqual(node.author, {
    '@type': 'Person',
    '@id': 'https://hotel-berlin.de/de/you-me-and-berlin/kristiane-kegelmann#person',
    name: 'Kristiane Kegelmann',
  });
});

test('reviewBody carries the editorial quote verbatim', () => {
  const node = buildReviewNode(koenigGalerie, koenigGalerie.endorsements![0], defaultConfig);
  assert.equal(node.reviewBody, 'Its spaces are unbelievable.');
});

// --- The guard that matters most -----------------------------------------
// There is no star-rating in this content model. Fabricating one to chase
// Google's rich-result star snippet would misrepresent the content and
// risks a manual action. Every one of these assertions should keep passing
// even after future edits to the builder or its inputs.

test('GUARD: buildReviewNode never emits reviewRating, even if upstream data smuggles one in', () => {
  // Simulates a future/careless caller passing extra data through — e.g. if
  // Payload's endorsement shape ever grows a stray `reviewRating` field.
  // `Endorsement` has no such field; this cast exists purely to prove the
  // builder itself doesn't pass unknown properties through.
  const withExtraJunk = {
    person: kristiane,
    quote: 'Great spot.',
    reviewRating: { ratingValue: 5 },
  } as unknown as Parameters<typeof buildReviewNode>[1];

  const node = buildReviewNode(koenigGalerie, withExtraJunk, defaultConfig);
  assert.ok(reviewRatingIsAbsent(node));
  assert.equal('reviewRating' in node, false);
});

test('GUARD: reviewRatingIsAbsent fails loudly if a rating is ever added to the type', () => {
  const nodeWithRating = { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: 5 } };
  assert.equal(reviewRatingIsAbsent(nodeWithRating), false);
});

test('buildReviewNodesForPlace produces one Review per endorsement (many-to-many case)', () => {
  const nodes = buildReviewNodesForPlace(schlossCharlottenburg, defaultConfig);
  assert.equal(nodes.length, 2);

  const authors = nodes.map((n) => (n.author as { name: string }).name);
  assert.deepEqual(new Set(authors), new Set(['Maike', 'Alessandra Botts']));

  // Both reviews point at the same place, each with a distinct @id.
  const placeIds = new Set(nodes.map((n) => (n.itemReviewed as { '@id': string })['@id']));
  assert.equal(placeIds.size, 1);
  const reviewIds = new Set(nodes.map((n) => n['@id']));
  assert.equal(reviewIds.size, 2);
});

test('buildReviewNodesForPlace returns an empty array for an unattributed place', () => {
  const unattributed = { ...koenigGalerie, endorsements: undefined };
  assert.deepEqual(buildReviewNodesForPlace(unattributed, defaultConfig), []);
});
