import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildAmenityNode, splitAmenityGraph, type SchemaAmenity } from '../src/builders/amenity'
import { defaultConfig } from '../src/lib/config'

const gym: SchemaAmenity = {
  slug: 'gym',
  name: 'Gym',
  description: 'Open around the clock',
  schemaType: 'ExerciseGym',
  hoursMode: 'always',
  openingHours: [{ dayOfWeek: 'Mo-Su', opens: '00:00', closes: '24:00' }],
}

const kttk: SchemaAmenity = {
  slug: 'kttk',
  name: 'KTTK',
  schemaType: 'SportsActivityLocation',
  hoursMode: 'schedule',
  openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
}

const parking: SchemaAmenity = {
  slug: 'parking',
  name: 'Parking',
  schemaType: 'ParkingFacility',
  hoursMode: 'unknown',
}

const sauna: SchemaAmenity = {
  slug: 'sauna',
  name: 'Sauna',
  schemaType: 'none',
  hoursMode: 'unknown',
}

const onRequest: SchemaAmenity = {
  slug: 'spa',
  name: 'Spa',
  schemaType: 'none',
  hoursMode: 'onRequest',
  openingHours: [{ dayOfWeek: 'Mo-Su', opens: '10:00', closes: '18:00' }],
}

test('schemaType ExerciseGym is a place linked from the hotel', () => {
  const node = buildAmenityNode(gym, defaultConfig)
  assert.equal(node?.['@type'], 'ExerciseGym')
  assert.equal(node?.['@id'], 'https://hotel-berlin.de/de/ausstattung#gym')
  assert.ok(Array.isArray(node?.openingHoursSpecification))
})

test('schemaType SportsActivityLocation and ParkingFacility', () => {
  assert.equal(buildAmenityNode(kttk, defaultConfig)?.['@type'], 'SportsActivityLocation')
  assert.equal(buildAmenityNode(parking, defaultConfig)?.['@type'], 'ParkingFacility')
  assert.equal(buildAmenityNode(parking, defaultConfig)?.openingHoursSpecification, undefined)
})

test('schemaType none is LocationFeatureSpecification with stable @id', () => {
  const node = buildAmenityNode(sauna, defaultConfig)
  assert.equal(node?.['@type'], 'LocationFeatureSpecification')
  assert.equal(node?.['@id'], 'https://hotel-berlin.de/de/ausstattung#sauna')
  assert.equal(node?.value, true)
})

test('onRequest and unknown do not emit openingHoursSpecification', () => {
  assert.equal(buildAmenityNode(onRequest, defaultConfig)?.openingHoursSpecification, undefined)
  assert.equal(buildAmenityNode(sauna, defaultConfig)?.openingHoursSpecification, undefined)
})

test('splitAmenityGraph parks typed nodes on containsPlace', () => {
  const { amenityFeature, containsPlace } = splitAmenityGraph(
    [gym, sauna, kttk],
    defaultConfig,
  )
  assert.equal(containsPlace.length, 2)
  assert.equal(amenityFeature.length, 1)
  assert.equal(amenityFeature[0]?.name, 'Sauna')
})
