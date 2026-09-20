import { describe, expect, it } from 'vitest'

import { artPanelOrder, locationChip, matchesFloorFilter, sortLiveWorks } from '../../src/lib/art/floors'
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
    expect(matchesFloorFilter('Dach', 'floors5to10')).toBe(false)
  })

  it('joins floor and spot for the caption chip', () => {
    expect(locationChip('4', 'bei den Aufzügen', 'Ort folgt')).toBe('4 · bei den Aufzügen')
    expect(locationChip(null, null, 'Ort folgt')).toBe('Ort folgt')
  })
})

describe('art panel order', () => {
  it('places the panel after the last tile of the open row', () => {
    expect(artPanelOrder(0, 5, 4)).toEqual({ tile: 0, panel: 7 })
    expect(artPanelOrder(3, 5, 4)).toEqual({ tile: 6, panel: 7 })
    expect(artPanelOrder(4, 5, 4)).toEqual({ tile: 8, panel: 9 })
    expect(artPanelOrder(1, 3, 2)).toEqual({ tile: 2, panel: 3 })
  })
})

describe('live wall', () => {
  it('drops hidden works and works without an image, murals first', () => {
    const live = sortLiveWorks(
      ARTWORK_FIXTURES.filter((work) => work.visibility === 'live' && work.image),
    )
    expect(live.map((work) => work.slug)).toEqual([
      'somari',
      'deerbln',
      'pisa73',
      'wall-piece',
      'edition-01',
    ])
  })
})
