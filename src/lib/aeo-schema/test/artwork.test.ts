import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildArtworkNode, buildArtIndexGraph } from '../src/builders/artwork'
import { defaultConfig } from '../src/lib/config'
import { hotelNodeId, personNodeId } from '../src/lib/ids'

test('VisualArtwork uses the German art work page URL as @id', () => {
  const node = buildArtworkNode(
    { slug: 'somari', title: 'Somari', creatorName: 'Somari' },
    defaultConfig,
  )
  assert.equal(node['@type'], 'VisualArtwork')
  assert.equal(node['@id'], 'https://hotel-berlin.de/de/hier/art/somari')
  assert.deepEqual(node.contentLocation, { '@id': hotelNodeId(defaultConfig) })
  assert.equal(node.locationCreated, undefined)
})

test('untitled works omit name', () => {
  const node = buildArtworkNode(
    { slug: 'untitled-mural', title: null, creatorName: 'Somari' },
    defaultConfig,
  )
  assert.equal(node.name, undefined)
  assert.deepEqual(node.creator, { '@type': 'Person', name: 'Somari' })
})

test('creator points at the people Person @id when the join exists', () => {
  const node = buildArtworkNode(
    {
      slug: 'pisa73',
      title: 'Pisa73',
      creatorName: 'Pisa73',
      creatorPersonSlug: 'kristiane-kegelmann',
    },
    defaultConfig,
  )
  assert.deepEqual(node.creator, {
    '@type': 'Person',
    '@id': personNodeId('kristiane-kegelmann', defaultConfig),
    name: 'Pisa73',
  })
})

test('the index graph lists @id references only', () => {
  const graph = buildArtIndexGraph(
    [
      { slug: 'somari', title: 'Somari' },
      { slug: 'deerbln', title: 'deerBLN' },
    ],
    defaultConfig,
    { name: 'Kunst im Haus' },
  )
  assert.equal(graph['@graph'].length, 2)
  const list = graph['@graph'][1] as { itemListElement: Array<{ item: { '@id': string } }> }
  assert.equal(list.itemListElement[0]?.item['@id'], 'https://hotel-berlin.de/de/hier/art/somari')
  assert.equal(list.itemListElement[1]?.item['@id'], 'https://hotel-berlin.de/de/hier/art/deerbln')
})
