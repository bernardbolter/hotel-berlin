import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonNode, buildPersonRef } from '../src/builders/person';
import { defaultConfig } from '../src/lib/config';
import { kristiane, maike } from './fixtures';

test('buildPersonRef is a minimal stub with a stable @id', () => {
  const ref = buildPersonRef(kristiane, defaultConfig);
  assert.deepEqual(ref, {
    '@type': 'Person',
    '@id': 'https://hotel-berlin.de/de/you-me-and-berlin/kristiane-kegelmann#person',
    name: 'Kristiane Kegelmann',
  });
});

test('buildPersonNode always resolves @id against the canonical (de) locale', () => {
  const node = buildPersonNode(kristiane, defaultConfig);
  assert.equal(
    node['@id'],
    'https://hotel-berlin.de/de/you-me-and-berlin/kristiane-kegelmann#person',
  );
});

test('buildPersonNode carries jobTitle, bio, website, affiliation', () => {
  const node = buildPersonNode(kristiane, defaultConfig);
  assert.equal(node.jobTitle, 'Artist / Sculptor');
  assert.equal(node.description, kristiane.shortBio);
  assert.equal(node.url, 'https://kristianekegelmann.com/');
  assert.deepEqual(node.affiliation, { '@id': 'https://hotel-berlin.de/#hotel' });
});

test('buildPersonNode merges instagram into sameAs without duplicating', () => {
  const withInstagram = { ...kristiane, instagram: 'https://instagram.com/kristianekegelmann' };
  const node = buildPersonNode(withInstagram, defaultConfig);
  assert.ok((node.sameAs as string[]).includes('https://instagram.com/kristianekegelmann'));
  assert.ok((node.sameAs as string[]).includes(kristiane.authority!.sameAs![0]));
  assert.equal(new Set(node.sameAs as string[]).size, (node.sameAs as string[]).length);
});

test('buildPersonNode omits sameAs/identifier entirely when a person has no authority data', () => {
  const node = buildPersonNode(maike, defaultConfig);
  assert.equal('sameAs' in node, false);
  assert.equal('identifier' in node, false);
});

test('buildPersonNode never includes an empty jobTitle/description for a bare-minimum record', () => {
  const node = buildPersonNode(maike, defaultConfig);
  assert.equal('jobTitle' in node, false);
  assert.equal('description' in node, false);
  assert.equal('url' in node, false);
});
