import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthorityProps } from '../src/lib/authority.js';

test('returns nothing for undefined authority', () => {
  assert.deepEqual(buildAuthorityProps(undefined), {});
});

test('returns nothing for empty arrays (so prune() can drop the key)', () => {
  assert.deepEqual(buildAuthorityProps({ identifier: [], sameAs: [] }), {
    sameAs: undefined,
    identifier: undefined,
  });
});

test('maps identifier entries to PropertyValue shape', () => {
  const result = buildAuthorityProps({
    identifier: [
      { propertyID: 'Wikidata', value: 'Q12345' },
      { propertyID: 'GND', value: '118500000' },
    ],
  });

  assert.deepEqual(result.identifier, [
    { '@type': 'PropertyValue', propertyID: 'Wikidata', value: 'Q12345' },
    { '@type': 'PropertyValue', propertyID: 'GND', value: '118500000' },
  ]);
});

test('passes sameAs URLs through unchanged', () => {
  const result = buildAuthorityProps({
    sameAs: ['https://de.wikipedia.org/wiki/Foo', 'https://www.wikidata.org/wiki/Q1'],
  });
  assert.deepEqual(result.sameAs, [
    'https://de.wikipedia.org/wiki/Foo',
    'https://www.wikidata.org/wiki/Q1',
  ]);
});
