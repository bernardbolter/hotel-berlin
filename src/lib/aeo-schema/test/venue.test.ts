import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildVenuePageGraph } from '../src/builders/graph'
import { buildVenueNode, toSchemaDays } from '../src/builders/venue'
import { defaultConfig } from '../src/lib/config'
import { venueTypeToSchemaType } from '../src/types'
import type { Venue } from '../src/types'

const lutze: Venue = {
  id: '1',
  slug: 'lutze',
  name: 'Lütze',
  venueType: 'Restaurant',
  description: 'Italian deli café, bar, and garden at Lützowplatz 17.',
  servesCuisine: 'Italian, International',
  priceRange: '€€',
  reservationUrl: 'https://example.com/reserve',
  menuUrl: 'https://example.com/menu.pdf',
  telephone: '+49 30 000',
  email: 'luetze@hotel-berlin.de',
  sameAs: ['https://instagram.com/lutze'],
  openingHours: [
    { dayOfWeek: 'Mo-Su', opens: '10:00', closes: 'open end' },
    { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00' },
    { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30' },
  ],
  images: [
    { url: 'https://example.com/lutze.jpg', altText: 'Lütze interior' },
  ],
}

const kttk: Venue = {
  id: '3',
  slug: 'kttk',
  name: 'KTTK',
  venueType: 'SportsActivityLocation',
  description: 'Four JOOLA tables in the basement.',
  openingHours: [
    { dayOfWeek: 'Thursday', opens: '19:00', closes: 'open end' },
  ],
}

test('venueTypeToSchemaType maps every Payload venueType', () => {
  assert.equal(venueTypeToSchemaType('Restaurant'), 'Restaurant')
  assert.equal(venueTypeToSchemaType('Bar'), 'BarOrPub')
  assert.equal(venueTypeToSchemaType('ArtGallery'), 'ArtGallery')
  assert.equal(venueTypeToSchemaType('SportsActivityLocation'), 'SportsActivityLocation')
  assert.equal(venueTypeToSchemaType('EventVenue'), 'EventVenue')
  assert.equal(venueTypeToSchemaType('LocalBusiness'), 'LocalBusiness')
})

test('toSchemaDays expands Mo-Su and Thursday', () => {
  assert.deepEqual(toSchemaDays('Mo-Su'), [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ])
  assert.equal(toSchemaDays('Thursday'), 'Thursday')
})

test('buildVenueNode emits Restaurant for Lütze with cuisine, menu, reservations', () => {
  const node = buildVenueNode(lutze, defaultConfig)
  assert.equal(node['@type'], 'Restaurant')
  assert.equal(node['@id'], 'https://hotel-berlin.de/de/restaurant#venue')
  assert.equal(node.url, 'https://hotel-berlin.de/de/restaurant')
  assert.equal(node.servesCuisine, 'Italian, International')
  assert.equal(node.menu, lutze.menuUrl)
  assert.equal(node.acceptsReservations, true)
  assert.deepEqual(node.containedInPlace, { '@id': 'https://hotel-berlin.de/#hotel' })
  const images = node.image as { description: string }[]
  assert.equal(images[0]?.description, 'Lütze interior')
  const hours = node.openingHoursSpecification as { closes?: string }[]
  assert.equal(hours.length, 3)
  assert.equal(hours[0]?.closes, undefined)
})

test('buildVenueNode omits servesCuisine for non-dining venueTypes', () => {
  const node = buildVenueNode(kttk, defaultConfig)
  assert.equal(node['@type'], 'SportsActivityLocation')
  assert.equal(node.servesCuisine, undefined)
  assert.equal(node.menu, undefined)
  assert.equal(node.acceptsReservations, false)
})

test('buildVenuePageGraph includes venue + breadcrumb, no Offer', () => {
  const graph = buildVenuePageGraph(lutze, defaultConfig)
  const types = graph['@graph'].map((n) => n['@type'])
  assert.ok(types.includes('Restaurant'))
  assert.ok(types.includes('BreadcrumbList'))
  assert.ok(!types.includes('Offer'))
})
