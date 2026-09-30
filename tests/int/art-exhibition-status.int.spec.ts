import { describe, expect, it } from 'vitest'

import { berlinDay, getExhibitionStatus } from '../../src/lib/art/status'

describe('getExhibitionStatus', () => {
  const dated = {
    runType: 'dated' as const,
    startDate: '2026-09-01T00:00:00.000Z',
    // Noon UTC on 30 Sep → still 30 Sep in Berlin (CEST)
    endDate: '2026-09-30T12:00:00.000Z',
  }

  it('is upcoming the day before opening', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-08-31'))).toBe('upcoming')
  })

  it('is current on the opening day', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-09-01'))).toBe('current')
  })

  it('is current on the closing day', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-09-30'))).toBe('current')
  })

  it('is past the day after closing', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-10-01'))).toBe('past')
  })

  it('treats permanent runs as always current', () => {
    expect(
      getExhibitionStatus(
        { runType: 'permanent', startDate: '2020-01-01T00:00:00.000Z' },
        berlinDay('2026-09-30'),
      ),
    ).toBe('current')
    expect(
      getExhibitionStatus(
        { runType: 'permanent', startDate: '2030-01-01T00:00:00.000Z' },
        berlinDay('2026-09-30'),
      ),
    ).toBe('current')
  })

  it('accepts legacy status=permanent as runType', () => {
    expect(
      getExhibitionStatus(
        { status: 'permanent', startDate: '2020-01-01T00:00:00.000Z' },
        berlinDay('2026-09-30'),
      ),
    ).toBe('current')
  })
})
