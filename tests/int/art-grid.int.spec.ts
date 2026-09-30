import { describe, expect, it } from 'vitest'

import {
  floorGroupOf,
  locationChip,
  locatorLevelFor,
  matchesFloorFilter,
} from '../../src/lib/art/floors'
import { ARTWORK_FIXTURES } from '../fixtures/artworks'

describe('art floor chips', () => {
  it('maps EG to Lobby and B2/B1 to Keller', () => {
    expect(matchesFloorFilter('EG', 'lobby')).toBe(true)
    expect(matchesFloorFilter('4', 'lobby')).toBe(false)
    expect(matchesFloorFilter('B2', 'basement')).toBe(true)
    expect(matchesFloorFilter('B1', 'basement')).toBe(true)
    expect(matchesFloorFilter('2', 'floors1to4')).toBe(true)
    expect(matchesFloorFilter('8', 'floors5to10')).toBe(true)
    expect(matchesFloorFilter('Dach', 'all')).toBe(true)
    expect(matchesFloorFilter('Dach', 'floors5to10')).toBe(true)
  })

  it('joins floor and spot for the caption chip', () => {
    expect(locationChip('4', 'bei den Aufzügen', 'Ort folgt')).toBe('4. · bei den Aufzügen')
    expect(locationChip(null, null, 'Ort folgt')).toBe('Ort folgt')
  })

  it('maps floors onto locator bars', () => {
    expect(locatorLevelFor('B2')).toBe('Keller')
    expect(locatorLevelFor('EG')).toBe('EG')
    expect(locatorLevelFor('4')).toBe('4')
    expect(locatorLevelFor('Dach')).toBe('10')
    expect(floorGroupOf('4')).toBe('floors1to4')
  })
})

describe('live wall fixtures', () => {
  it('keeps live imaged murals ahead of other types in the fixture set', () => {
    const live = ARTWORK_FIXTURES.filter((work) => work.visibility === 'live' && work.image)
    expect(live.map((work) => work.slug)).toContain('somari')
    expect(live.map((work) => work.slug)).toContain('edition-01')
  })
})
