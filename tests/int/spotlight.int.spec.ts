import { describe, expect, it } from 'vitest'

import {
  buildVenueSpotlightFromParts,
  pickBarOrPrimarySegment,
  resolvePersonSpotlight,
} from '../../src/lib/spotlight/resolvers'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import type { Person, Venue } from '../../src/payload-types'

function atBerlin(isoLocal: string): Date {
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y, m, d, Number(hh), Number(mm), Number(ss))
}

const lutzeVenue = {
  id: 1,
  name: 'Lütze',
  slug: 'lutze',
  venueType: 'Restaurant',
  shortDescription: 'Italian deli café, bar, and garden.',
  location: 'Ground Floor',
  spotlightLocation: 'Ground floor',
  openingHours: [
    { dayOfWeek: 'Mo-Su', opens: '10:00', closes: 'open end', segment: 'Bar' },
    { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00', segment: 'Kitchen' },
    { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30', segment: 'Kitchen' },
  ],
  heroImage: { id: 10, url: '/media/lutze.jpg', alt: 'Lütze' },
  updatedAt: '',
  createdAt: '',
} as unknown as Venue

describe('pickBarOrPrimarySegment', () => {
  it('prefers Bar when kitchen is closed (compact-card rule)', () => {
    const segment = pickBarOrPrimarySegment(
      lutzeVenue.openingHours,
      atBerlin('2026-08-06T16:00:00'),
    )
    expect(segment).toEqual({
      label: 'Bar',
      status: 'Open',
    })
  })
})

describe('buildVenueSpotlightFromParts', () => {
  it('returns null when nothing current or scheduled', () => {
    expect(
      buildVenueSpotlightFromParts({
        venue: lutzeVenue,
        exhibition: null,
        nextEvent: null,
      }),
    ).toBeNull()
  })

  it('uses exhibition seed title and body, not the venue name', () => {
    const card = buildVenueSpotlightFromParts({
      venue: lutzeVenue,
      exhibition: {
        id: 1,
        title: 'Magwie × CokyOne',
        slug: 'magwie-x-cokyone',
        subtitle: 'A duo show',
        status: 'current',
        endDate: '2026-09-30T21:59:00.000Z',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', text: 'Surreal dreamscapes meet graffiti.', version: 1 }],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        updatedAt: '',
        createdAt: '',
      } as never,
    })
    expect(card?.title).toBe('Magwie × CokyOne')
    expect(card?.venueLabel).toBe('Lütze')
    expect(card?.primaryMeta).toBe('On now · Free entry')
    expect(card?.description).toBe('Surreal dreamscapes meet graffiti.')
    expect(card?.secondaryMeta?.left).toBe('Ground floor')
    expect(card?.secondaryMeta?.right).toMatch(/Until/i)
    expect(card?.cta.categoryToken).toBe('food')
    expect(card?.cta.label).toBe('Explore Lütze')
  })

  it('prefers populated exhibition heroImage over venue fallback', () => {
    const card = buildVenueSpotlightFromParts({
      venue: lutzeVenue,
      exhibition: {
        id: 1,
        title: 'Wall Works',
        slug: 'wall-works',
        status: 'current',
        heroImage: {
          id: 99,
          url: '/media/exhibition-wall-works.jpg',
          alt: 'Wall Works install',
        },
        updatedAt: '',
        createdAt: '',
      } as never,
    })
    expect(card?.image).toEqual({
      src: '/media/exhibition-wall-works.jpg',
      alt: 'Wall Works install',
    })
  })

  it('falls back to venue image when exhibition heroImage is a bare upload id', () => {
    const card = buildVenueSpotlightFromParts({
      venue: lutzeVenue,
      exhibition: {
        id: 1,
        title: 'Wall Works',
        slug: 'wall-works',
        status: 'current',
        heroImage: 99,
        updatedAt: '',
        createdAt: '',
      } as never,
    })
    expect(card?.image).toEqual({
      src: '/media/lutze.jpg',
      alt: 'Lütze',
    })
  })

  it('uses bar-only open status for multi-segment venues on the event path', () => {
    const card = buildVenueSpotlightFromParts({
      venue: lutzeVenue,
      nextEvent: {
        event: {
          id: 2,
          name: 'Vinyl Night',
          startDate: berlinLocalToUtc(2026, 8, 6, 18, 0, 0).toISOString(),
        },
        occurrenceStart: atBerlin('2026-08-06T18:00:00'),
        occurrenceEnd: atBerlin('2026-08-06T22:00:00'),
      },
      now: atBerlin('2026-08-06T16:00:00'),
    })
    expect(card?.primaryMeta).toBe('Open')
    expect(card?.secondaryMeta?.left).toBe('Ground floor')
    expect(card?.identityMark).toBeUndefined()
  })
})

describe('resolvePersonSpotlight', () => {
  it('skips identityMark and collapses room-only secondaryMeta', () => {
    const person = {
      id: 1,
      name: 'Ada',
      slug: 'ada',
      type: 'curator',
      jobTitle: 'Curator',
      shortBio: 'Lives upstairs.',
      roomNumber: '412',
      portrait: { id: 9, url: '/media/ada.jpg', alt: 'Ada' },
      updatedAt: '',
      createdAt: '',
    } as unknown as Person

    const card = resolvePersonSpotlight(person)
    expect(card?.identityMark).toBeUndefined()
    expect(card?.secondaryMeta).toEqual({ left: 'Room 412', right: '' })
    expect(card?.badge.categoryToken).toBe('curator')
  })

  it('returns null without a portrait', () => {
    const person = {
      id: 1,
      name: 'Ada',
      slug: 'ada',
      type: 'artist',
      updatedAt: '',
      createdAt: '',
    } as unknown as Person
    expect(resolvePersonSpotlight(person)).toBeNull()
  })
})
