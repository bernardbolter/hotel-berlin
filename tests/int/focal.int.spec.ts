import { describe, expect, it } from 'vitest'

import { focalToObjectPosition, focalToPercent } from '@/lib/media/focal'

describe('focalToPercent', () => {
  it('treats values > 1 as already-percent', () => {
    expect(focalToPercent(50)).toBe(50)
  })

  it('treats 0–1 fractions as fractions', () => {
    expect(focalToPercent(0.5)).toBe(50)
  })

  it('defaults unset to centre', () => {
    expect(focalToPercent(null)).toBe(50)
    expect(focalToPercent(undefined)).toBe(50)
  })
})

describe('focalToObjectPosition', () => {
  it('maps percent storage 50 → 50% 50%', () => {
    expect(focalToObjectPosition(50, 50)).toBe('50% 50%')
  })

  it('maps fraction storage 0.5 → 50% 50%', () => {
    expect(focalToObjectPosition(0.5, 0.5)).toBe('50% 50%')
  })

  it('defaults unset axes to centre', () => {
    expect(focalToObjectPosition(null, null)).toBe('50% 50%')
    expect(focalToObjectPosition(0.25, null)).toBe('25% 50%')
  })
})
