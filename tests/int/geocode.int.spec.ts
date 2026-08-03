import { describe, expect, it } from 'vitest'

import { isInsideBerlin, tierFromMinutes } from '../../src/lib/geocode/constants'

describe('tierFromMinutes', () => {
  it('maps walkable / short-transit / further-out thresholds', () => {
    expect(tierFromMinutes(1)).toBe('walkable')
    expect(tierFromMinutes(20)).toBe('walkable')
    expect(tierFromMinutes(21)).toBe('short-transit')
    expect(tierFromMinutes(45)).toBe('short-transit')
    expect(tierFromMinutes(46)).toBe('further-out')
  })
})

describe('isInsideBerlin', () => {
  it('accepts Lützowplatz and rejects far cities', () => {
    expect(isInsideBerlin(52.5036, 13.3522)).toBe(true)
    expect(isInsideBerlin(48.137, 11.575)).toBe(false) // Munich
  })
})
