import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildArtworkNode, buildArtPageGraph } from '../src/builders/artwork'
import { defaultConfig } from '../src/lib/config'
import { hotelNodeId, personNodeId } from '../src/lib/ids'

test('VisualArtwork uses the German art page hash as @id', () => {
  const node = buildArtworkNode(
    { slug: 'somari', title: 'Somari', creatorName: 'Somari' },
    defaultConfig,
  )
  assert.equal(node['@type'], 'VisualArtwork')
  assert.equal(node['@id'], 'https://hotel-berlin.de/de/hier/art#werk-somari')
  assert.deepEqual(node.contentLocation, { '@id': hotelNodeId(defaultConfig) })
  assert.equal(node.locationCreated, undefined)
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

test('creator is a nameless-id Person when there is no people page', () => {
  const node = buildArtworkNode(
    { slug: 'deerbln', title: 'deerBLN', creatorName: 'deerBLN' },
    defaultConfig,
  )
  assert.deepEqual(node.creator, { '@type': 'Person', name: 'deerBLN' })
})

test('the page graph lists every live work', () => {
  const graph = buildArtPageGraph(
    [
      { slug: 'somari', title: 'Somari' },
      { slug: 'deerbln', title: 'deerBLN' },
    ],
    defaultConfig,
  )
  assert.equal(graph['@graph'].length, 2)
})
