import { describe, expect, it } from 'vitest'

import { datedCount, pickHubStrip } from '../../src/lib/here/pickHubStrip'
import type { EventOccurrence } from '../../src/lib/payload/getEventOccurrences'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import type { Event } from '../../src/payload-types'

function atBerlin(isoLocal: string): Date {
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y!, m!, d!, Number(hh), Number(mm), Number(ss))
}

function occ(
  id: number,
  slug: string,
  start: Date,
  end: Date,
  alwaysOn = false,
): EventOccurrence {
  return {
    event: { id, slug, name: slug, startDate: start.toISOString() } as Event,
    start,
    end,
    alwaysOn,
  }
}

describe('pickHubStrip', () => {
  it('fills four cards on a thin week: now + dated + always-on + exhibition', () => {
    const now = atBerlin('2026-09-02T15:00:00') // Wed, Open Play in progress
    const items = pickHubStrip(
      [
        occ(
          1,
          'kttk-open-play',
          atBerlin('2026-09-02T13:00:00'),
          atBerlin('2026-09-02T23:00:00'),
          true,
        ),
        occ(
          2,
          'kttk-tournament-night',
          atBerlin('2026-09-03T19:00:00'),
          atBerlin('2026-09-03T22:00:00'),
        ),
        occ(
          3,
          'vinyl-nights',
          atBerlin('2026-09-07T18:00:00'),
          atBerlin('2026-09-07T22:00:00'),
        ),
      ],
      true,
      now,
      4,
    )
    expect(items).toHaveLength(4)
    expect(items[0]).toMatchObject({ kind: 'event', occurrence: { event: { slug: 'kttk-open-play' } } })
    expect(items[1]).toMatchObject({
      kind: 'event',
      occurrence: { event: { slug: 'kttk-tournament-night' } },
    })
    expect(items[2]).toMatchObject({ kind: 'event', occurrence: { event: { slug: 'vinyl-nights' } } })
    expect(items[3]).toEqual({ kind: 'exhibition' })
    expect(datedCount(items)).toBe(2)
  })

  it('pushes always-on and exhibition off when four dated cards exist', () => {
    const now = atBerlin('2026-09-02T10:00:00')
    const items = pickHubStrip(
      [
        occ(10, 'a', atBerlin('2026-09-02T18:00:00'), atBerlin('2026-09-02T20:00:00')),
        occ(11, 'b', atBerlin('2026-09-03T18:00:00'), atBerlin('2026-09-03T20:00:00')),
        occ(12, 'c', atBerlin('2026-09-04T18:00:00'), atBerlin('2026-09-04T20:00:00')),
        occ(13, 'd', atBerlin('2026-09-05T18:00:00'), atBerlin('2026-09-05T20:00:00')),
        occ(
          1,
          'kttk-open-play',
          atBerlin('2026-09-02T13:00:00'),
          atBerlin('2026-09-02T23:00:00'),
          true,
        ),
      ],
      true,
      now,
      4,
    )
    expect(items).toHaveLength(4)
    expect(items.every((i) => i.kind === 'event')).toBe(true)
    expect(datedCount(items)).toBe(4)
  })
})
