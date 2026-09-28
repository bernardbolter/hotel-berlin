import { describe, expect, it } from 'vitest'

import { visibleFactRows } from '../../src/components/entity/EntityFacts'
import { takeFilledRow } from '../../src/lib/entity/takeFilledRow'
import { isRejectedMediaUrl, safeMediaUrl } from '../../src/lib/entity/mediaUrl'
import {
  expandSchedule,
  isPastOneOff,
  scheduleSummary,
} from '../../src/lib/events/schedule'
import { districtFromPostalCode } from '../../src/lib/places/district'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'

describe('takeFilledRow', () => {
  it('returns exactly limit items when the source is long enough', () => {
    expect(takeFilledRow([1, 2, 3, 4], 3)).toEqual([1, 2, 3])
  })

  it('returns [] for a partial row', () => {
    expect(takeFilledRow([1, 2], 3)).toEqual([])
    expect(takeFilledRow([1], 3)).toEqual([])
    expect(takeFilledRow([], 3)).toEqual([])
  })
})

describe('visibleFactRows', () => {
  it('drops falsy rows and renders nothing when none remain', () => {
    expect(visibleFactRows([null, false, { term: '', value: 'x' }])).toEqual([])
    expect(visibleFactRows([{ term: 'A', value: '1' }, null])).toEqual([{ term: 'A', value: '1' }])
  })
})

describe('districtFromPostalCode', () => {
  it('maps known Berlin codes and returns null for junk', () => {
    expect(districtFromPostalCode('10785')).toBe('Tiergarten')
    expect(districtFromPostalCode('10969')).toBe('Kreuzberg')
    expect(districtFromPostalCode('10435')).toBe('Prenzlauer Berg')
    expect(districtFromPostalCode('not-a-code')).toBeNull()
    expect(districtFromPostalCode(null)).toBeNull()
  })
})

describe('media url guard', () => {
  it('rejects picsum', () => {
    expect(isRejectedMediaUrl('https://picsum.photos/800')).toBe(true)
    expect(safeMediaUrl('https://picsum.photos/800')).toBeNull()
    expect(safeMediaUrl('/api/media/file/x.jpg')).toBe('/api/media/file/x.jpg')
  })
})

describe('schedule', () => {
  const weekly = {
    startDate: berlinLocalToUtc(2026, 9, 3, 19, 0, 0).toISOString(),
    endDate: berlinLocalToUtc(2026, 9, 3, 22, 0, 0).toISOString(),
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
  }

  const daily = {
    startDate: berlinLocalToUtc(2026, 8, 1, 13, 0, 0).toISOString(),
    endDate: berlinLocalToUtc(2026, 8, 1, 23, 0, 0).toISOString(),
    isRecurring: true,
    recurrenceRule: 'FREQ=DAILY',
  }

  const oneOffPast = {
    startDate: berlinLocalToUtc(2026, 8, 13, 19, 0, 0).toISOString(),
    endDate: berlinLocalToUtc(2026, 8, 13, 22, 0, 0).toISOString(),
    isRecurring: false,
    recurrenceRule: null,
  }

  it('summarises weekly and daily rules in Berlin time', () => {
    expect(scheduleSummary(weekly, 'de')).toBe('Jeden Donnerstag, 19:00–22:00 Uhr')
    expect(scheduleSummary(daily, 'de')).toBe('Täglich 13:00–23:00 Uhr')
    expect(scheduleSummary(oneOffPast, 'de')).toBeNull()
  })

  it('expands a weekly series into several dated rows, not a single date', () => {
    const from = berlinLocalToUtc(2026, 9, 1, 0, 0, 0)
    const occs = expandSchedule(weekly, { from, count: 8 })
    expect(occs.length).toBeGreaterThan(1)
    expect(occs.length).toBeLessThanOrEqual(8)
  })

  it('does not expand a FREQ=DAILY always-on series into identical rows', () => {
    const from = berlinLocalToUtc(2026, 9, 1, 0, 0, 0)
    expect(expandSchedule(daily, { from, count: 8 })).toEqual([])
  })

  it('treats a past one-off as past, not 404', () => {
    const now = berlinLocalToUtc(2026, 9, 16, 12, 0, 0)
    expect(isPastOneOff(oneOffPast, now)).toBe(true)
    expect(isPastOneOff(weekly, now)).toBe(false)
  })
})
