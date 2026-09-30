import { describe, expect, it } from 'vitest'

import {
  floorGroupOf,
  locationChip,
  locatorLevelFor,
  matchesFloorFilter,
} from '../../src/lib/art/floors'
import { ARTWORK_FIXTURES } from '../fixtures/artworks'

describe('art floor chips', () => {
  it('maps outside / lobby / basement and floor bands', () => {
    expect(matchesFloorFilter('lobby', 'lobby')).toBe(true)
    expect(matchesFloorFilter('4', 'lobby')).toBe(false)
    expect(matchesFloorFilter('basement', 'basement')).toBe(true)
    expect(matchesFloorFilter('outside', 'outside')).toBe(true)
    expect(matchesFloorFilter('2', 'floors1to4')).toBe(true)
    expect(matchesFloorFilter('8', 'floors5to10')).toBe(true)
    expect(matchesFloorFilter('outside', 'all')).toBe(true)
    expect(matchesFloorFilter('outside', 'floors5to10')).toBe(false)
  })

  it('joins floor and spot for the caption chip', () => {
    expect(locationChip('4', 'bei den Aufzügen', 'Ort folgt')).toBe('4. Etage · bei den Aufzügen')
    expect(locationChip('outside', 'Fassade', 'Ort folgt')).toBe('Außen · Fassade')
    expect(locationChip(null, null, 'Ort folgt')).toBe('Ort folgt')
  })

  it('maps floors onto locator bars', () => {
    expect(locatorLevelFor('basement')).toBe('basement')
    expect(locatorLevelFor('lobby')).toBe('lobby')
    expect(locatorLevelFor('outside')).toBe('outside')
    expect(locatorLevelFor('4')).toBe('4')
    expect(floorGroupOf('4')).toBe('floors1to4')
    expect(floorGroupOf('outside')).toBe('outside')
  })
})

describe('live wall fixtures', () => {
  it('keeps live imaged murals ahead of other types in the fixture set', () => {
    const live = ARTWORK_FIXTURES.filter((work) => work.visibility === 'live' && work.image)
    expect(live.map((work) => work.slug)).toContain('somari')
    expect(live.map((work) => work.slug)).toContain('edition-01')
  })
})
