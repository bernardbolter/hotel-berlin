import { describe, expect, it } from 'vitest'

import { berlinLocalToUtc, getBerlinParts } from '../../src/lib/venue-time/berlin'
import { deriveGuestDiningStatus, deriveOpenClosed } from '../../src/lib/venue-time/deriveOpenClosed'
import { formatRelativeTime } from '../../src/lib/venue-time/formatRelativeTime'
import { expandOccurrencesInWindow, isAlwaysOnDailyRecurring, resolveOccurrence } from '../../src/lib/venue-time/recurrence'
import { selectCurrentExhibitionForVenue } from '../../src/lib/venue-time/selectCurrentExhibition'
import { selectCurrentOrNextEventToday } from '../../src/lib/venue-time/selectCurrentOrNextEventToday'
import { selectNextEventForVenue } from '../../src/lib/venue-time/selectNextEvent'
import type { OpeningHoursEntry, VenueTimeEvent, VenueTimeExhibition } from '../../src/lib/venue-time/types'

/** Fixed Berlin-local wall time as a UTC Instant. */
function atBerlin(isoLocal: string): Date {
  // isoLocal: "2026-08-06T14:00:00" (Thursday)
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y, m, d, Number(hh), Number(mm), Number(ss))
}

const lutzeHours: OpeningHoursEntry[] = [
  { dayOfWeek: 'Mo-Su', opens: '10:00', closes: '01:00', segment: 'Bar' },
  { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00', segment: 'Kitchen' },
  { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30', segment: 'Kitchen' },
]

const kttkHours: OpeningHoursEntry[] = [
  { dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00', segment: 'KTTK' },
]

describe('deriveOpenClosed', () => {
  it('returns empty when no hours', () => {
    expect(deriveOpenClosed([], atBerlin('2026-08-06T12:00:00'))).toEqual([])
    expect(deriveOpenClosed(null, atBerlin('2026-08-06T12:00:00'))).toEqual([])
  })

  it('returns a one-item array for a single-segment venue', () => {
    const noon = atBerlin('2026-08-06T14:00:00')
    expect(deriveOpenClosed(kttkHours, noon)).toEqual([
      { label: 'KTTK', status: 'Open', closesAt: '23:00', minutesUntilClose: 9 * 60 },
    ])

    const morning = atBerlin('2026-08-06T10:00:00')
    expect(deriveOpenClosed(kttkHours, morning)).toEqual([
      { label: 'KTTK', status: 'Closed', nextOpensAt: '13:00', nextOpensTomorrow: false },
    ])
  })

  it('returns independent bar + kitchen segments that can disagree', () => {
    // Between lunch and dinner — bar open, kitchen closed
    const afternoon = atBerlin('2026-08-06T16:00:00')
    expect(deriveOpenClosed(lutzeHours, afternoon)).toEqual([
      { label: 'Bar', status: 'Open', closesAt: '01:00', minutesUntilClose: 9 * 60 },
      { label: 'Kitchen', status: 'Closed', nextOpensAt: '17:00', nextOpensTomorrow: false },
    ])
  })

  it('treats exact open time as open and exact close as closed', () => {
    expect(deriveOpenClosed(kttkHours, atBerlin('2026-08-06T13:00:00'))).toEqual([
      { label: 'KTTK', status: 'Open', closesAt: '23:00', minutesUntilClose: 10 * 60 },
    ])
    expect(deriveOpenClosed(kttkHours, atBerlin('2026-08-06T23:00:00'))).toEqual([
      { label: 'KTTK', status: 'Closed', nextOpensAt: '13:00', nextOpensTomorrow: true },
    ])
  })
})

describe('deriveGuestDiningStatus', () => {
  it('reports kitchen open until close', () => {
    expect(deriveGuestDiningStatus(lutzeHours, atBerlin('2026-08-06T19:00:00'))).toEqual({
      kind: 'kitchenOpen',
      until: '22:30',
    })
  })

  it('reports kitchen closing within 30 minutes', () => {
    expect(deriveGuestDiningStatus(lutzeHours, atBerlin('2026-08-06T22:10:00'))).toEqual({
      kind: 'kitchenClosingSoon',
      minutes: 20,
    })
  })

  it('reports bar open with kitchen next today', () => {
    expect(deriveGuestDiningStatus(lutzeHours, atBerlin('2026-08-06T16:00:00'))).toEqual({
      kind: 'barOnly',
      kitchenOpensAt: '17:00',
      kitchenOpensTomorrow: false,
    })
  })

  it('reports both closed after bar close, kitchen later the same morning', () => {
    expect(deriveGuestDiningStatus(lutzeHours, atBerlin('2026-08-07T02:00:00'))).toEqual({
      kind: 'closed',
      kitchenOpensAt: '11:30',
      kitchenOpensTomorrow: false,
    })
  })

  it('reports bar open after kitchen close with kitchen tomorrow', () => {
    expect(deriveGuestDiningStatus(lutzeHours, atBerlin('2026-08-06T23:00:00'))).toEqual({
      kind: 'barOnly',
      kitchenOpensAt: '11:30',
      kitchenOpensTomorrow: true,
    })
  })
})

describe('formatRelativeTime', () => {
  const now = atBerlin('2026-08-06T16:00:00')

  it('returns now when event has started and not ended', () => {
    expect(
      formatRelativeTime(
        atBerlin('2026-08-06T15:00:00'),
        now,
        atBerlin('2026-08-06T18:00:00'),
      ),
    ).toEqual({ kind: 'now' })
  })

  it('returns soon within 2 hours', () => {
    expect(formatRelativeTime(atBerlin('2026-08-06T16:45:00'), now)).toEqual({
      kind: 'soon',
      minutesOrHours: '45 min',
    })
    expect(formatRelativeTime(atBerlin('2026-08-06T18:00:00'), now)).toEqual({
      kind: 'soon',
      minutesOrHours: '2 hours',
    })
  })

  it('returns scheduled clock beyond 2 hours', () => {
    expect(formatRelativeTime(atBerlin('2026-08-06T19:00:00'), now)).toEqual({
      kind: 'scheduled',
      time: '19:00',
    })
  })

  it('treats event starting exactly at now as now', () => {
    expect(formatRelativeTime(now, now, atBerlin('2026-08-06T18:00:00'))).toEqual({
      kind: 'now',
    })
  })
})

describe('selectCurrentExhibitionForVenue', () => {
  const exhibitions: VenueTimeExhibition[] = [
    {
      id: 1,
      title: 'Past Show',
      status: 'past',
      venue: 10,
    },
    {
      id: 2,
      title: 'Current Walls',
      status: 'current',
      venue: 10,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
    },
    {
      id: 3,
      title: 'Permanent Collection',
      status: 'permanent',
      venue: 11,
    },
  ]

  it('returns null when nothing matches', () => {
    expect(
      selectCurrentExhibitionForVenue(exhibitions, 99, atBerlin('2026-08-06T12:00:00')),
    ).toBeNull()
  })

  it('returns the current exhibition for a venue', () => {
    const result = selectCurrentExhibitionForVenue(
      exhibitions,
      10,
      atBerlin('2026-08-06T12:00:00'),
    )
    expect(result?.id).toBe(2)
  })

  it('falls back to permanent when no current', () => {
    const result = selectCurrentExhibitionForVenue(
      exhibitions,
      11,
      atBerlin('2026-08-06T12:00:00'),
    )
    expect(result?.id).toBe(3)
  })
})

describe('selectNextEventForVenue', () => {
  const events: VenueTimeEvent[] = [
    {
      id: 1,
      name: 'Vinyl Night',
      startDate: berlinLocalToUtc(2026, 8, 10, 18, 0, 0).toISOString(),
      venue: 5,
    },
    {
      id: 2,
      name: 'Tournament',
      startDate: berlinLocalToUtc(2026, 8, 6, 19, 0, 0).toISOString(),
      endDate: berlinLocalToUtc(2026, 8, 6, 23, 0, 0).toISOString(),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
      venue: 5,
    },
  ]

  it('returns null when venue has no upcoming events', () => {
    expect(
      selectNextEventForVenue(events, 99, atBerlin('2026-08-06T12:00:00')),
    ).toBeNull()
  })

  it('picks the soonest occurrence at the venue', () => {
    const result = selectNextEventForVenue(events, 5, atBerlin('2026-08-06T12:00:00'))
    expect(result?.event.id).toBe(2)
    expect(getBerlinParts(result!.occurrenceStart).hour).toBe(19)
  })
})

describe('selectCurrentOrNextEventToday', () => {
  it('returns null when nothing today', () => {
    const events: VenueTimeEvent[] = [
      {
        id: 1,
        name: 'Next Week',
        startDate: berlinLocalToUtc(2026, 8, 13, 18, 0, 0).toISOString(),
      },
    ]
    expect(selectCurrentOrNextEventToday(events, atBerlin('2026-08-06T12:00:00'))).toBeNull()
  })

  it('excludes always-on daily recurring events', () => {
    const events: VenueTimeEvent[] = [
      {
        id: 1,
        name: 'Open Play',
        startDate: berlinLocalToUtc(2026, 1, 1, 13, 0, 0).toISOString(),
        endDate: berlinLocalToUtc(2026, 1, 1, 23, 0, 0).toISOString(),
        isRecurring: true,
        recurrenceRule: 'FREQ=DAILY',
      },
      {
        id: 2,
        name: 'Vinyl Night',
        startDate: berlinLocalToUtc(2026, 8, 6, 18, 0, 0).toISOString(),
        endDate: berlinLocalToUtc(2026, 8, 6, 22, 0, 0).toISOString(),
      },
    ]

    expect(isAlwaysOnDailyRecurring(true, 'FREQ=DAILY')).toBe(true)

    const result = selectCurrentOrNextEventToday(events, atBerlin('2026-08-06T16:00:00'))
    expect(result?.id).toBe(2)
    expect(result?.relativeTime.kind).toBe('soon')
  })

  it('prefers an in-progress event over a later one today', () => {
    const events: VenueTimeEvent[] = [
      {
        id: 1,
        name: 'Afternoon Talk',
        startDate: berlinLocalToUtc(2026, 8, 6, 14, 0, 0).toISOString(),
        endDate: berlinLocalToUtc(2026, 8, 6, 17, 0, 0).toISOString(),
      },
      {
        id: 2,
        name: 'Evening Gig',
        startDate: berlinLocalToUtc(2026, 8, 6, 20, 0, 0).toISOString(),
      },
    ]

    const result = selectCurrentOrNextEventToday(events, atBerlin('2026-08-06T15:00:00'))
    expect(result?.id).toBe(1)
    expect(result?.relativeTime).toEqual({ kind: 'now' })
  })
})

describe('resolveOccurrence', () => {
  it('returns null for a past one-off event', () => {
    expect(
      resolveOccurrence(
        berlinLocalToUtc(2026, 8, 1, 18, 0, 0).toISOString(),
        berlinLocalToUtc(2026, 8, 1, 22, 0, 0).toISOString(),
        false,
        null,
        atBerlin('2026-08-06T12:00:00'),
      ),
    ).toBeNull()
  })

  it('resolves next weekly occurrence', () => {
    const occ = resolveOccurrence(
      berlinLocalToUtc(2026, 7, 2, 19, 0, 0).toISOString(), // a Thursday
      berlinLocalToUtc(2026, 7, 2, 23, 0, 0).toISOString(),
      true,
      'FREQ=WEEKLY;BYDAY=TH',
      atBerlin('2026-08-06T12:00:00'), // Thursday
    )
    expect(occ).not.toBeNull()
    expect(getBerlinParts(occ!.start).weekday).toBe(4)
    expect(getBerlinParts(occ!.start).hour).toBe(19)
  })

  it('resolves Zeichenstammtisch: FREQ=MONTHLY;BYDAY=-1TH (last Thursday)', () => {
    // Series anchored on a known last-Thursday (30 Jul 2026)
    const occ = resolveOccurrence(
      berlinLocalToUtc(2026, 7, 30, 19, 0, 0).toISOString(),
      berlinLocalToUtc(2026, 7, 30, 22, 0, 0).toISOString(),
      true,
      'FREQ=MONTHLY;BYDAY=-1TH',
      atBerlin('2026-08-06T12:00:00'),
    )
    expect(occ).not.toBeNull()
    const parts = getBerlinParts(occ!.start)
    // Last Thursday of August 2026 is the 27th
    expect(parts.year).toBe(2026)
    expect(parts.month).toBe(8)
    expect(parts.day).toBe(27)
    expect(parts.weekday).toBe(4)
    expect(parts.hour).toBe(19)
  })

  it('returns null for an unsupported RRULE rather than inventing a date', () => {
    expect(
      resolveOccurrence(
        berlinLocalToUtc(2026, 8, 1, 18, 0, 0).toISOString(),
        null,
        true,
        'FREQ=YEARLY;BYMONTH=8',
        atBerlin('2026-08-06T12:00:00'),
      ),
    ).toBeNull()
  })
})

describe('Berlin DST boundaries', () => {
  it('spring-forward 2026-03-29: local 02:00 does not exist — 01:30 CET and 03:30 CEST map correctly', () => {
    const before = atBerlin('2026-03-29T01:30:00')
    const after = atBerlin('2026-03-29T03:30:00')
    expect(getBerlinParts(before)).toMatchObject({ hour: 1, minute: 30, day: 29, month: 3 })
    expect(getBerlinParts(after)).toMatchObject({ hour: 3, minute: 30, day: 29, month: 3 })
    // Instant gap is 1 hour of wall time skipped → 1h real elapsed between these wall clocks? 
    // 01:30 CET = 00:30 UTC; 03:30 CEST = 01:30 UTC → 1 hour apart
    expect(after.getTime() - before.getTime()).toBe(60 * 60 * 1000)
  })

  it('fall-back 2026-10-25: opening-hours open check stays stable across the repeated hour', () => {
    // CEST ends 03:00 → 02:00 CET. A venue open 01:00–04:00 should be open at both interpretations of 02:30.
    const hours: OpeningHoursEntry[] = [
      { dayOfWeek: 'Mo-Su', opens: '01:00', closes: '04:00', segment: 'Night' },
    ]
    // berlinLocalToUtc converges; for ambiguous 02:30 we accept whichever offset it settles on —
    // the wall-clock hour used by deriveOpenClosed must still be 2.
    const ambiguous = atBerlin('2026-10-25T02:30:00')
    expect(getBerlinParts(ambiguous).hour).toBe(2)
    expect(deriveOpenClosed(hours, ambiguous)).toEqual([
      { label: 'Night', status: 'Open', closesAt: '04:00', minutesUntilClose: 90 },
    ])
  })

  it('weekly recurrence still lands on the correct Berlin weekday across a DST transition week', () => {
    // Thursday tournament spanning late March 2026
    const occ = resolveOccurrence(
      berlinLocalToUtc(2026, 3, 19, 19, 0, 0).toISOString(),
      berlinLocalToUtc(2026, 3, 19, 23, 0, 0).toISOString(),
      true,
      'FREQ=WEEKLY;BYDAY=TH',
      atBerlin('2026-03-30T12:00:00'), // Monday after spring-forward
    )
    expect(occ).not.toBeNull()
    const parts = getBerlinParts(occ!.start)
    expect(parts.weekday).toBe(4)
    expect(parts.day).toBe(2) // 2 Apr 2026
    expect(parts.month).toBe(4)
    expect(parts.hour).toBe(19)
  })
})

describe('expandOccurrencesInWindow', () => {
  it('expands weekly Thursdays across a seven-day window', () => {
    const occs = expandOccurrencesInWindow(
      berlinLocalToUtc(2026, 9, 3, 19, 0, 0).toISOString(),
      berlinLocalToUtc(2026, 9, 3, 22, 0, 0).toISOString(),
      true,
      'FREQ=WEEKLY;BYDAY=TH',
      atBerlin('2026-09-02T12:00:00'),
      atBerlin('2026-09-09T12:00:00'),
    )
    expect(occs).toHaveLength(1)
    const parts = getBerlinParts(occs[0]!.start)
    expect(parts).toMatchObject({ year: 2026, month: 9, day: 3, weekday: 4, hour: 19 })
  })

  it('expands daily Open Play once per day in the window, including in-progress', () => {
    const occs = expandOccurrencesInWindow(
      berlinLocalToUtc(2026, 8, 1, 13, 0, 0).toISOString(),
      berlinLocalToUtc(2026, 8, 1, 23, 0, 0).toISOString(),
      true,
      'FREQ=DAILY',
      atBerlin('2026-09-02T15:00:00'),
      atBerlin('2026-09-05T12:00:00'),
    )
    expect(occs.length).toBeGreaterThanOrEqual(3)
    expect(getBerlinParts(occs[0]!.start)).toMatchObject({ day: 2, hour: 13 })
  })

  it('includes Zeichenstammtisch last Thursday of September in a 30-day window', () => {
    const occs = expandOccurrencesInWindow(
      berlinLocalToUtc(2026, 8, 27, 19, 0, 0).toISOString(),
      berlinLocalToUtc(2026, 8, 27, 22, 0, 0).toISOString(),
      true,
      'FREQ=MONTHLY;BYDAY=-1TH',
      atBerlin('2026-09-02T12:00:00'),
      atBerlin('2026-10-02T12:00:00'),
    )
    expect(occs).toHaveLength(1)
    expect(getBerlinParts(occs[0]!.start)).toMatchObject({ year: 2026, month: 9, day: 24, hour: 19 })
  })

  it('excludes a past one-off', () => {
    expect(
      expandOccurrencesInWindow(
        berlinLocalToUtc(2026, 8, 13, 19, 0, 0).toISOString(),
        berlinLocalToUtc(2026, 8, 13, 22, 0, 0).toISOString(),
        false,
        null,
        atBerlin('2026-09-02T12:00:00'),
        atBerlin('2026-09-09T12:00:00'),
      ),
    ).toEqual([])
  })
})
