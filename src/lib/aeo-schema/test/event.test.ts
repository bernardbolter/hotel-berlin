import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildEventPageGraph, rruleToSchedule } from '../src/builders/event'
import { defaultConfig } from '../src/lib/config'
import type { HotelEvent } from '../src/types'

/** 19:00 Europe/Berlin on 3 Sep 2026 (CEST). */
const weekly: HotelEvent = {
  id: '1',
  slug: 'kttk-tournament-night',
  name: 'KTTK Tournament Night',
  startDate: '2026-09-03T17:00:00.000Z',
  endDate: '2026-09-03T20:00:00.000Z',
  isRecurring: true,
  recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
  isFree: false,
  price: 5,
  priceCurrency: 'EUR',
  venue: { slug: 'kttk', name: 'KTTK' },
}

const daily: HotelEvent = {
  id: '2',
  slug: 'kttk-open-play',
  name: 'KTTK Open Play',
  startDate: '2026-08-01T11:00:00.000Z',
  endDate: '2026-08-01T21:00:00.000Z',
  isRecurring: true,
  recurrenceRule: 'FREQ=DAILY',
  isFree: false,
  price: 5,
  priceCurrency: 'EUR',
}

const monthly: HotelEvent = {
  id: '3',
  slug: 'zeichenstammtisch',
  name: 'Zeichenstammtisch',
  startDate: '2026-08-27T17:00:00.000Z',
  isRecurring: true,
  recurrenceRule: 'FREQ=MONTHLY;BYDAY=4TH',
  isFree: true,
  venue: { slug: 'lutze', name: 'Lütze' },
}

const oneOff: HotelEvent = {
  id: '4',
  slug: 'opening-night',
  name: 'Opening night',
  startDate: '2026-08-01T16:00:00.000Z',
  endDate: '2026-08-01T19:00:00.000Z',
  isRecurring: false,
  isFree: true,
}

test('FREQ=WEEKLY;BYDAY=TH maps to P1W Thursday Schedule', () => {
  const schedule = rruleToSchedule(weekly)
  assert.equal(schedule?.['@type'], 'Schedule')
  assert.equal(schedule?.repeatFrequency, 'P1W')
  assert.equal(schedule?.byDay, 'https://schema.org/Thursday')
  assert.equal(schedule?.startTime, '19:00')
  assert.equal(schedule?.scheduleTimezone, 'Europe/Berlin')
})

test('FREQ=DAILY maps to P1D with no byDay', () => {
  const schedule = rruleToSchedule(daily)
  assert.equal(schedule?.repeatFrequency, 'P1D')
  assert.equal('byDay' in (schedule ?? {}), false)
  assert.equal(schedule?.startTime, '13:00')
})

test('FREQ=MONTHLY;BYDAY=4TH maps to P1M Thursday', () => {
  const schedule = rruleToSchedule(monthly)
  assert.equal(schedule?.repeatFrequency, 'P1M')
  assert.equal(schedule?.byDay, 'https://schema.org/Thursday')
})

test('non-recurring events emit startDate/endDate and no eventSchedule', () => {
  const graph = buildEventPageGraph(oneOff, defaultConfig)
  const event = graph['@graph'].find((n) => n['@type'] === 'Event')
  assert.ok(event)
  assert.equal('eventSchedule' in event, false)
  assert.equal(event.startDate, oneOff.startDate)
  assert.equal(event.endDate, oneOff.endDate)
})

test('recurring event graph uses eventSchedule instead of a stale startDate', () => {
  const graph = buildEventPageGraph(weekly, defaultConfig)
  const event = graph['@graph'].find((n) => n['@type'] === 'Event')
  assert.ok(event)
  assert.equal('startDate' in event, false)
  assert.equal((event.eventSchedule as { repeatFrequency: string }).repeatFrequency, 'P1W')
  assert.equal(event.eventStatus, 'https://schema.org/EventScheduled')
  assert.equal(event.eventAttendanceMode, 'https://schema.org/OfflineEventAttendanceMode')
})

test('free events emit price 0 and isAccessibleForFree', () => {
  const graph = buildEventPageGraph(monthly, defaultConfig)
  const event = graph['@graph'].find((n) => n['@type'] === 'Event')
  assert.equal(event?.isAccessibleForFree, true)
  assert.deepEqual(event?.offers, { '@type': 'Offer', price: '0', priceCurrency: 'EUR' })
})
