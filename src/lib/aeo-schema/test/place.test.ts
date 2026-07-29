import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlaceNode, buildPlaceRef } from '../src/builders/place';
import { defaultConfig } from '../src/lib/config';
import { hamburgerBahnhof, koenigGalerie } from './fixtures';

test('buildPlaceRef @type reflects schemaType, not the editorial category', () => {
  const ref = buildPlaceRef(koenigGalerie, defaultConfig);
  assert.equal(ref['@type'], 'TouristAttraction');
  assert.equal(
    ref['@id'],
    'https://hotel-berlin.de/de/nachbarschaft/koenig-galerie#place',
  );
});

test('buildPlaceNode includes walkingMinutesFromHotel as additionalProperty', () => {
  const node = buildPlaceNode(koenigGalerie, defaultConfig);
  const props = node.additionalProperty as { name: string; value: unknown }[];
  const walking = props.find((p) => p.name === 'walkingMinutesFromHotel');
  assert.equal(walking?.value, 18);
});

test('buildPlaceNode omits additionalProperty entirely when no distance data exists', () => {
  const node = buildPlaceNode(hamburgerBahnhof, defaultConfig);
  assert.equal('additionalProperty' in node, false);
});

test('buildPlaceNode review array references Review @ids, not full nodes', () => {
  const node = buildPlaceNode(koenigGalerie, defaultConfig);
  assert.deepEqual(node.review, [
    { '@id': 'https://hotel-berlin.de/de/nachbarschaft/koenig-galerie#review-kristiane-kegelmann' },
  ]);
});

test('buildPlaceNode omits review entirely for an unattributed place', () => {
  const node = buildPlaceNode(hamburgerBahnhof, defaultConfig);
  assert.equal('review' in node, false);
});

test('buildPlaceNode always sets addressCountry DE and defaults locality', () => {
  const node = buildPlaceNode(koenigGalerie, defaultConfig);
  assert.deepEqual(node.address, {
    '@type': 'PostalAddress',
    addressLocality: 'Berlin',
    addressCountry: 'DE',
  });
});
