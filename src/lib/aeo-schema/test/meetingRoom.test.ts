import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMeetingRoomPageGraph,
  buildMeetingsListGraph,
} from '../src/builders/graph'
import { buildMeetingRoomNode } from '../src/builders/meetingRoom'
import { defaultConfig } from '../src/lib/config'
import type { MeetingRoom } from '../src/types'

const berlin3: MeetingRoom = {
  id: '4',
  slug: 'berlin-3',
  name: 'Berlin 3',
  description: '180m² combinable conference room.',
  floorSizeM2: 180,
  occupancyMax: 260,
  images: [
    {
      url: 'https://example.com/berlin-3.jpg',
      altText: 'Berlin 3 conference setup',
    },
  ],
  amenities: [{ name: 'Screen' }, { name: 'Projector' }],
}

test('buildMeetingRoomNode emits MeetingRoom with no Offer fields', () => {
  const node = buildMeetingRoomNode(berlin3, defaultConfig)
  assert.equal(node['@type'], 'MeetingRoom')
  assert.equal(node['@id'], 'https://hotel-berlin.de/de/tagungen/berlin-3#room')
  assert.equal(node.description, berlin3.description)
  assert.deepEqual(node.floorSize, {
    '@type': 'QuantitativeValue',
    value: 180,
    unitCode: 'MTK',
  })
  assert.equal(node.price, undefined)
})

test('buildMeetingRoomPageGraph includes room + breadcrumb, no Offer', () => {
  const graph = buildMeetingRoomPageGraph(berlin3, defaultConfig)
  const types = graph['@graph'].map((n) => n['@type'])
  assert.ok(types.includes('MeetingRoom'))
  assert.ok(types.includes('BreadcrumbList'))
  assert.ok(!types.includes('Offer'))
})

test('buildMeetingsListGraph emits ItemList of lightweight refs only', () => {
  const graph = buildMeetingsListGraph([berlin3], defaultConfig)
  const list = graph['@graph'][0]
  assert.equal(list?.['@type'], 'ItemList')
  const items = list?.itemListElement as {
    item: { '@id': string; description?: string }
  }[]
  assert.equal(items[0]?.item['@id'], 'https://hotel-berlin.de/de/tagungen/berlin-3#room')
  assert.equal(items[0]?.item.description, undefined)
})
