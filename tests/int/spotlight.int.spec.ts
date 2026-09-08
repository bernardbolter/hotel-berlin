import { describe, expect, it } from 'vitest'

import {
  buildVenueSpotlightFromParts,
  pickBarOrPrimarySegment,
  resolveEventSpotlight,
  resolvePersonSpotlight,
} from '../../src/lib/spotlight/resolvers'
import {
  CATEGORY_TOKENS,
  categoryTokenForEventCategory,
  resolveCategoryToken,
} from '../../src/lib/spotlight/categoryTokens'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import type { Event, Person, Venue } from '../../src/payload-types'

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
    { dayOfWeek: 'Mo-Su', opens: '10:00', closes: '01:00', segment: 'Bar' },
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
    expect(segment).toMatchObject({
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
    expect(card?.locationLabel).toBe('Ground floor')
    expect(card?.primaryMeta).toMatch(/^On now · Free entry · Until /i)
    expect(card?.description).toBe('Surreal dreamscapes meet graffiti.')
    expect(card?.secondaryMeta).toBeUndefined()
    expect(card?.cta.categoryToken).toBe('food')
    expect(card?.cta.label).toBe('Explore Lütze')
  })

  it('uses the FKKB atrium placeholder when no spotlightLocation is set', () => {
    const fkkb = {
      ...lutzeVenue,
      slug: 'fkkb',
      name: 'FKKB — Freiluft Kunst Klub Berlin',
      venueType: 'ArtGallery',
      location: 'Hotel Berlin, Berlin — multiple floors',
      spotlightLocation: null,
    } as unknown as Venue

    const card = buildVenueSpotlightFromParts({
      venue: fkkb,
      exhibition: {
        id: 1,
        title: 'Magwie × CokyOne',
        slug: 'magwie-x-cokyone',
        status: 'current',
        endDate: '2026-09-30T21:59:00.000Z',
        updatedAt: '',
        createdAt: '',
      } as never,
    })

    expect(card?.locationLabel).toBe('In the atrium above the lobby')
    expect(card?.primaryMeta).toMatch(/Until /i)
    expect(card?.secondaryMeta).toBeUndefined()
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
    expect(card?.primaryMeta).toBe('Open · 01:00')
    expect(card?.locationLabel).toBe('Ground floor')
    expect(card?.secondaryMeta).toBeUndefined()
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

describe('category tokens (DESIGN.md card palette)', () => {
  it('maps all seven event categories to DESIGN.md fills', () => {
    expect(resolveCategoryToken('art')).toEqual(
      expect.objectContaining({ fill: '#2C6B7A', onFill: '#FFFFFF' }),
    )
    expect(resolveCategoryToken('sport')).toEqual(
      expect.objectContaining({ fill: '#F79B2E', onFill: '#1A2B4A' }),
    )
    expect(resolveCategoryToken('music')).toEqual(
      expect.objectContaining({ fill: '#F95D62', onFill: '#1A2B4A' }),
    )
    expect(resolveCategoryToken('food')).toEqual(
      expect.objectContaining({ fill: '#B87A2E', onFill: '#1A2B4A' }),
    )
    expect(resolveCategoryToken('neighbourhood')).toEqual(
      expect.objectContaining({ fill: '#56674F', onFill: '#FFFFFF' }),
    )
    expect(resolveCategoryToken('partnerships')).toEqual(
      expect.objectContaining({ fill: '#6B5B8D', onFill: '#FFFFFF' }),
    )
    expect(resolveCategoryToken('community')).toEqual(
      expect.objectContaining({ fill: '#216A95', onFill: '#FFFFFF' }),
    )
  })

  it('does not invent a skate / Wallride token', () => {
    expect(categoryTokenForEventCategory('Skate')).toBe('other')
    expect(CATEGORY_TOKENS).not.toHaveProperty('skate')
  })

  it('maps CMS Community to the community token, not the venue (food) token', () => {
    expect(categoryTokenForEventCategory('Community')).toBe('community')
    expect(categoryTokenForEventCategory('Food')).toBe('food')
  })
})

describe('resolveEventSpotlight', () => {
  it('puts venue location on the identity row and drops the duplicate bottom meta', async () => {
    const event = {
      id: 3,
      name: 'Zeichenstammtisch',
      slug: 'zeichenstammtisch',
      category: 'Community',
      shortDescription: 'Open drawing table.',
      startDate: berlinLocalToUtc(2026, 8, 27, 19, 0, 0).toISOString(),
      isRecurring: true,
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1TH',
      heroImage: { id: 11, url: '/media/zeichen.jpg', alt: 'Drawing' },
      venue: lutzeVenue,
      updatedAt: '',
      createdAt: '',
    } as unknown as Event

    const card = await resolveEventSpotlight(event, { now: atBerlin('2026-08-06T12:00:00') })
    expect(card?.badge.categoryToken).toBe('community')
    expect(card?.cta.categoryToken).toBe('community')
    expect(card?.venueLabel).toBe('Lütze')
    expect(card?.locationLabel).toBe('Ground Floor')
    expect(card?.secondaryMeta).toBeUndefined()
    expect(card?.cta.href).toBe('/happenings#zeichenstammtisch')
    expect(card?.framing).toBe('prospect')
    expect(card?.primaryMeta).toMatch(/19:00/)
    expect(card?.description).toBe('Open drawing table.')
  })

  it('guest framing fills the same slots with time-state and practical copy', async () => {
    const event = {
      id: 3,
      name: 'Zeichenstammtisch',
      slug: 'zeichenstammtisch',
      category: 'Community',
      shortDescription: 'Open drawing table.',
      bookingNote: 'no booking',
      isFree: true,
      startDate: berlinLocalToUtc(2026, 8, 27, 19, 0, 0).toISOString(),
      isRecurring: true,
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1TH',
      heroImage: { id: 11, url: '/media/zeichen.jpg', alt: 'Drawing' },
      venue: lutzeVenue,
      updatedAt: '',
      createdAt: '',
    } as unknown as Event

    const card = await resolveEventSpotlight(event, {
      now: atBerlin('2026-08-06T12:00:00'),
      framing: 'guest',
    })
    expect(card?.description).toBe('free entry · no booking')
    expect(card?.locationLabel).toBe('Ground floor')
    expect(card?.framing).toBe('guest')
    expect(card?.cta.label).toBe('See event')
    expect(card?.cta.href).toBe('/here/events#zeichenstammtisch')
    expect(card?.cta.href).not.toMatch(/\/here\/events\//)
  })
})

