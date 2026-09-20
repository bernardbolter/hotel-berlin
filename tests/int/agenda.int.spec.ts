import { describe, expect, it } from 'vitest'

import {
  buildAgendaDays,
  featuredSkipKeys,
  parseAgendaFilter,
  type AgendaRow,
} from '../../src/lib/events/agenda'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import type { EventOccurrence } from '../../src/lib/payload/getEventOccurrences'
import type { Event } from '../../src/payload-types'

function occ(
  partial: Partial<Event> & Pick<Event, 'id' | 'slug' | 'name'>,
  start: Date,
  extra: Partial<EventOccurrence> = {},
): EventOccurrence {
  return {
    event: {
      category: 'Music',
      isFree: true,
      ...partial,
    } as Event,
    start,
    end: null,
    alwaysOn: false,
    ...extra,
  }
}

describe('parseAgendaFilter', () => {
  it('maps DE and EN query tokens', () => {
    expect(parseAgendaFilter('musik')).toBe('music')
    expect(parseAgendaFilter('music')).toBe('music')
    expect(parseAgendaFilter('kunst')).toBe('art')
    expect(parseAgendaFilter('unknown')).toBe('all')
  })
})

describe('buildAgendaDays', () => {
  const now = berlinLocalToUtc(2026, 9, 20, 12, 0, 0)

  it('groups by Berlin day, skips empty days, and puts always-on under today', () => {
    const days = buildAgendaDays({
      occurrences: [
        occ({ id: 1, slug: 'vinyl', name: 'Vinyl' }, berlinLocalToUtc(2026, 9, 20, 18, 0, 0)),
        occ({ id: 2, slug: 'open-play', name: 'Open Play' }, berlinLocalToUtc(2026, 9, 20, 13, 0, 0), {
          alwaysOn: true,
        }),
        occ(
          { id: 3, slug: 'later', name: 'Later', category: 'Sport' },
          berlinLocalToUtc(2026, 9, 22, 19, 0, 0),
        ),
      ],
      now,
      locale: 'de',
    })

    expect(days.map((d) => d.kind)).toEqual(['today', 'weekday'])
    expect(days[0]?.dateShort).toBe('20.9.')
    expect(days[0]?.rows.map((r) => r.slug)).toEqual(['open-play', 'vinyl'])
    expect(days[0]?.rows[0]?.allDay).toBe(true)
    expect(days[1]?.rows[0]?.slug).toBe('later')
  })

  it('keeps a daily always-on event as one Heute row', () => {
    const days = buildAgendaDays({
      occurrences: [
        occ({ id: 2, slug: 'open-play', name: 'Open Play' }, berlinLocalToUtc(2026, 9, 20, 13, 0, 0), {
          alwaysOn: true,
        }),
        occ({ id: 2, slug: 'open-play', name: 'Open Play' }, berlinLocalToUtc(2026, 9, 21, 13, 0, 0), {
          alwaysOn: true,
        }),
        occ({ id: 2, slug: 'open-play', name: 'Open Play' }, berlinLocalToUtc(2026, 9, 22, 13, 0, 0), {
          alwaysOn: true,
        }),
      ],
      now,
      locale: 'de',
    })
    expect(days).toHaveLength(1)
    expect(days[0]?.kind).toBe('today')
    expect(days[0]?.rows).toHaveLength(1)
    expect(days[0]?.rows[0]?.slug).toBe('open-play')
  })

  it('does not repeat featured items on the same day', () => {
    const vinyl = occ({ id: 1, slug: 'vinyl', name: 'Vinyl' }, berlinLocalToUtc(2026, 9, 20, 18, 0, 0))
    const skip = featuredSkipKeys([{ kind: 'event', occurrence: vinyl }], now)
    const days = buildAgendaDays({
      occurrences: [vinyl],
      now,
      locale: 'en',
      skipKeys: skip,
    })
    expect(days).toEqual([])
  })

  it('filters by category and keeps exhibitions under today once', () => {
    const days = buildAgendaDays({
      occurrences: [
        occ({ id: 1, slug: 'vinyl', name: 'Vinyl', category: 'Music' }, berlinLocalToUtc(2026, 9, 21, 18, 0, 0)),
      ],
      exhibition: {
        id: 9,
        title: 'Duo',
        slug: 'duo',
        endDate: '2026-09-30',
        venue: { name: 'FKKB', slug: 'fkkb' } as never,
      },
      now,
      locale: 'de',
      filter: 'art',
    })
    expect(days).toHaveLength(1)
    expect(days[0]?.kind).toBe('today')
    expect(days[0]?.rows.map((r: AgendaRow) => r.kind)).toEqual(['exhibition'])
    expect(days[0]?.rows[0]?.price).toMatch(/^bis /)
  })
})
