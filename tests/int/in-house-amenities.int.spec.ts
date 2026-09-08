import { describe, expect, it } from 'vitest'

import { assignAmenityStandIns } from '../../src/lib/here/assignAmenityStandIns'

describe('assignAmenityStandIns', () => {
  const pool = [
    { src: '/a.jpg', filename: 'suite-45-01.jpg', alt: 'spa' },
    { src: '/b.jpg', filename: 'kttk-open-play.jpg', alt: 'tables' },
    { src: '/c.jpg', filename: 'meet-01.jpg', alt: 'meeting' },
    { src: '/d.jpg', filename: 'standard-01.jpg', alt: 'room' },
    { src: '/e.jpg', filename: 'food-drink.jpg', alt: 'food' },
  ]

  it('matches filename hints and does not reuse occupied urls', () => {
    const assigned = assignAmenityStandIns(
      ['sauna', 'businessCenter', 'gym'],
      ['/b.jpg'],
      pool,
    )
    expect(assigned.sauna?.src).toBe('/a.jpg')
    expect(assigned.businessCenter?.src).toBe('/c.jpg')
    expect(assigned.gym?.src).toBe('/d.jpg')
    expect(new Set(Object.values(assigned).map((p) => p.src)).size).toBe(3)
  })
})
