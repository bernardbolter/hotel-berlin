import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNeighbourhoodListGraph,
  buildPeopleListGraph,
  buildPersonPageGraph,
  buildPlacePageGraph,
  dedupeById,
} from '../src/builders/graph.js';
import { defaultConfig } from '../src/lib/config.js';
import {
  hamburgerBahnhof,
  kristiane,
  koenigGalerie,
  schlossCharlottenburg,
} from './fixtures.js';

test('buildPlacePageGraph has exactly one @context and includes place + person stub + review', () => {
  const graph = buildPlacePageGraph(koenigGalerie, defaultConfig);
  assert.equal(graph['@context'], 'https://schema.org');

  const types = graph['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('TouristAttraction'));
  assert.ok(types.includes('Person'));
  assert.ok(types.includes('Review'));
  assert.equal(graph['@graph'].length, 3);
});

test('buildPlacePageGraph for an unattributed place has no Person/Review nodes', () => {
  const graph = buildPlacePageGraph(hamburgerBahnhof, defaultConfig);
  const types = graph['@graph'].map((n) => n['@type']);
  assert.deepEqual(types, ['Museum']);
});

test('buildPlacePageGraph for the many-to-many place includes two Person stubs and two Reviews', () => {
  const graph = buildPlacePageGraph(schlossCharlottenburg, defaultConfig);
  const byType = (t: string) => graph['@graph'].filter((n) => n['@type'] === t);
  assert.equal(byType('Person').length, 2);
  assert.equal(byType('Review').length, 2);
  assert.equal(byType('TouristAttraction').length, 1);
});

test('buildPersonPageGraph includes the full person node, place stub(s), and review(s)', () => {
  const graph = buildPersonPageGraph(
    kristiane,
    [{ place: koenigGalerie, quote: 'Its spaces are unbelievable.' }],
    defaultConfig,
  );
  const types = graph['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('Person'));
  assert.ok(types.includes('TouristAttraction'));
  assert.ok(types.includes('Review'));
});

test('CONSISTENCY: the Review node built from the place-page path matches the one built from the person-page path', () => {
  const placeGraph = buildPlacePageGraph(koenigGalerie, defaultConfig);
  const personGraph = buildPersonPageGraph(
    kristiane,
    [{ place: koenigGalerie, quote: 'Its spaces are unbelievable.' }],
    defaultConfig,
  );

  const reviewFromPlace = placeGraph['@graph'].find((n) => n['@type'] === 'Review');
  const reviewFromPerson = personGraph['@graph'].find((n) => n['@type'] === 'Review');

  assert.deepEqual(reviewFromPlace, reviewFromPerson);
});

test('listing graphs reference detail pages by @id only — no full nodes leak into the list', () => {
  const graph = buildNeighbourhoodListGraph([koenigGalerie, hamburgerBahnhof], defaultConfig);
  const list = graph['@graph'][0];
  const items = list.itemListElement as { item: { '@id': string; description?: string } }[];

  for (const { item } of items) {
    assert.ok(item['@id']);
    assert.equal('description' in item, false); // full field would leak here if this broke
  }
  assert.equal(items.length, 2);
});

test('people listing graph positions items in the order given', () => {
  const graph = buildPeopleListGraph([kristiane], defaultConfig);
  const list = graph['@graph'][0];
  const items = list.itemListElement as { position: number }[];
  assert.equal(items[0].position, 1);
});

test('dedupeById keeps the richer node when the same @id appears twice', () => {
  const thin = { '@type': 'Person', '@id': 'https://x/#p', name: 'X' };
  const rich = { '@type': 'Person', '@id': 'https://x/#p', name: 'X', jobTitle: 'Artist' };
  const result = dedupeById([thin, rich]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], rich);
});
