import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildHotelRoomPageGraph, buildRoomsListGraph } from '../src/builders/graph'
import { buildHotelRoomNode, buildOfferNode } from '../src/builders/hotelRoom'
import { defaultConfig } from '../src/lib/config'
import type { HotelRoom } from '../src/types'

const studio45: HotelRoom = {
  id: '11',
  slug: 'studio-45',
  name: 'Studio 45',
  description: '95m² with DJ deck and private sauna.',
  fromPrice: 389,
  currency: 'EUR',
  bookingUrl: 'https://www.radissonhotels.com/example',
  floorSizeM2: 95,
  occupancyMax: 2,
  bedType: 'king-freestanding',
  numberOfBeds: 1,
  images: [
    {
      url: 'https://example.com/studio.jpg',
      altText: 'Studio 45 freestanding king bed',
    },
  ],
  amenities: [{ name: 'Private sauna' }, { name: 'DJ deck' }],
}

test('buildHotelRoomNode emits HotelRoom with ImageObject alts and floorSize', () => {
  const node = buildHotelRoomNode(studio45, defaultConfig)
  assert.equal(node['@type'], 'HotelRoom')
  assert.equal(node['@id'], 'https://hotel-berlin.de/de/zimmer/studio-45#room')
  assert.equal(node.description, studio45.description)
  assert.deepEqual(node.floorSize, {
    '@type': 'QuantitativeValue',
    value: 95,
    unitCode: 'MTK',
  })
  const images = node.image as { description: string }[]
  assert.equal(images[0]?.description, 'Studio 45 freestanding king bed')
})

test('buildOfferNode links Offer to the room @id', () => {
  const offer = buildOfferNode(studio45, defaultConfig)
  assert.ok(offer)
  assert.equal(offer['@type'], 'Offer')
  assert.equal(offer.price, 389)
  assert.deepEqual(offer.itemOffered, {
    '@id': 'https://hotel-berlin.de/de/zimmer/studio-45#room',
  })
})

test('buildHotelRoomPageGraph includes room + offer', () => {
  const graph = buildHotelRoomPageGraph(studio45, defaultConfig)
  assert.equal(graph['@context'], 'https://schema.org')
  const types = graph['@graph'].map((n) => n['@type'])
  assert.ok(types.includes('HotelRoom'))
  assert.ok(types.includes('Offer'))
})

test('buildRoomsListGraph emits ItemList of lightweight refs only', () => {
  const graph = buildRoomsListGraph([studio45], defaultConfig)
  const list = graph['@graph'][0]
  assert.equal(list?.['@type'], 'ItemList')
  const items = list?.itemListElement as { item: { '@id': string; description?: string } }[]
  assert.equal(items[0]?.item['@id'], 'https://hotel-berlin.de/de/zimmer/studio-45#room')
  assert.equal(items[0]?.item.description, undefined)
})
