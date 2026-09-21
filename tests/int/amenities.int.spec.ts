import { describe, expect, it } from 'vitest'

import { amenitiesToAmenityFeature } from '../../src/lib/amenities/schema'
import { amenityHoursMode, formatAmenityHours, formatAmenityNotice, specialHoursForToday } from '../../src/lib/amenities/formatHours'
import { resolveLucideIcon } from '../../src/lib/amenities/lucide'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'

const labels = { closed: 'Geschlossen', onRequest: 'Auf Anfrage' }

describe('formatAmenityHours', () => {
  it('formats a weekly window', () => {
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
        locale: 'de',
        labels,
      }),
    ).toBe('Mo–So, 13:00–23:00')
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
        locale: 'en',
        labels,
      }),
    ).toBe('Mon–Sun, 13:00–23:00')
  })

  it('collapses full-day weekly hours to 24/7', () => {
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '00:00', closes: '24:00' }],
        locale: 'de',
        labels,
      }),
    ).toBe('24/7')
  })

  it('uses hoursOverride when weekly hours are empty', () => {
    expect(
      formatAmenityHours({
        openingHours: [],
        hoursOverride: 'Zeiten noch zu bestätigen',
        locale: 'de',
        labels,
      }),
    ).toBe('Zeiten noch zu bestätigen')
  })

  it('omits Wann when nothing is set', () => {
    expect(
      formatAmenityHours({
        openingHours: [],
        locale: 'de',
        labels,
      }),
    ).toBeNull()
  })

  it('lets special hours win on the Berlin calendar day', () => {
    const christmas = berlinLocalToUtc(2026, 12, 25, 12, 0, 0)
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
        specialHours: [
          {
            validFrom: '2026-12-24',
            validThrough: '2026-12-26',
            kind: 'closed',
            note: 'Weihnachtspause',
          },
        ],
        locale: 'de',
        labels,
        now: christmas,
      }),
    ).toBe('Weihnachtspause')
  })

  it('formats on-request and replacement hours', () => {
    const day = berlinLocalToUtc(2026, 6, 20, 10, 0, 0)
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '18:00', closes: '23:00' }],
        specialHours: [{ validFrom: '2026-06-20', kind: 'on-request' }],
        locale: 'de',
        labels,
        now: day,
      }),
    ).toBe('Auf Anfrage')
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '18:00', closes: '23:00' }],
        specialHours: [
          {
            validFrom: '2026-06-20',
            kind: 'hours',
            opens: '15:00',
            closes: '23:00',
            note: 'Sommer',
          },
        ],
        locale: 'de',
        labels,
        now: day,
      }),
    ).toBe('15:00–23:00 · Sommer')
  })

  it('ignores special hours outside the window so weekly hours remain', () => {
    const ordinary = berlinLocalToUtc(2026, 9, 20, 12, 0, 0)
    expect(
      formatAmenityHours({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
        specialHours: [{ validFrom: '2026-12-24', validThrough: '2026-12-26', kind: 'closed' }],
        locale: 'de',
        labels,
        now: ordinary,
      }),
    ).toBe('Mo–So, 13:00–23:00')
    expect(
      specialHoursForToday(
        [{ validFrom: '2026-12-24', validThrough: '2026-12-26', kind: 'closed' }],
        ordinary,
      ),
    ).toBeNull()
  })

  it('derives notice from special hours and hours mode for JSON-LD', () => {
    const day = berlinLocalToUtc(2026, 6, 20, 10, 0, 0)
    expect(
      formatAmenityNotice({
        specialHours: [{ validFrom: '2026-06-20', kind: 'closed', note: 'Feiertag' }],
        locale: 'de',
        labels,
        now: day,
      }),
    ).toBe('Feiertag')
    expect(
      amenityHoursMode({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '00:00', closes: '24:00' }],
        locale: 'de',
        labels,
      }),
    ).toBe('always')
    expect(
      amenityHoursMode({
        hoursOverride: 'Zeiten noch zu bestätigen',
        locale: 'de',
        labels,
      }),
    ).toBe('unknown')
    expect(
      amenityHoursMode({
        openingHours: [{ dayOfWeek: 'Mo-Su', opens: '10:00', closes: '18:00' }],
        specialHours: [{ validFrom: '2026-06-20', kind: 'on-request' }],
        locale: 'de',
        labels,
        now: day,
      }),
    ).toBe('onRequest')
  })
})

describe('amenitiesToAmenityFeature', () => {
  it('maps titles to LocationFeatureSpecification and drops empty names', () => {
    expect(
      amenitiesToAmenityFeature([
        { title: 'Gym' },
        { title: '  ' },
        { title: 'Sauna & Sanarium' },
      ] as never),
    ).toEqual([
      { '@type': 'LocationFeatureSpecification', name: 'Gym', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Sauna & Sanarium', value: true },
    ])
  })
})

describe('resolveLucideIcon', () => {
  it('returns Circle when the CMS name is missing or unknown', () => {
    expect(resolveLucideIcon(null).displayName || resolveLucideIcon(null).name).toBeTruthy()
    expect(resolveLucideIcon('NotARealIcon')).toBe(resolveLucideIcon(undefined))
    expect(resolveLucideIcon('Dumbbell')).not.toBe(resolveLucideIcon(null))
  })
})
