import { describe, expect, it } from 'vitest'

import { getExhibitionStatus, berlinDay } from '../../src/lib/art/status'
import { buildArtWallMosaic, type ExhibitionMosaicInput, type WorkMosaicInput } from '../../src/lib/here/artWallMosaic'
import { buildAgendaDays, exhibitionDayKeys } from '../../src/lib/events/agenda'
import { getBerlinParts } from '../../src/lib/venue-time/berlin'

function show(
  partial: Partial<ExhibitionMosaicInput> & Pick<ExhibitionMosaicInput, 'id' | 'title' | 'chipVariant'>,
): ExhibitionMosaicInput {
  return {
    slug: String(partial.id),
    href: '/here/art',
    runType: 'dated',
    chip: partial.chip ?? 'Jetzt',
    galleryName: partial.galleryName ?? 'Galerie',
    subtitle: '',
    image: { src: '/x.jpg', alt: 'x' },
    ...partial,
  }
}

function work(
  partial: Partial<WorkMosaicInput> & Pick<WorkMosaicInput, 'id' | 'title' | 'floor'>,
): WorkMosaicInput {
  return {
    slug: String(partial.id),
    href: `/here/art/${partial.id}`,
    where: 'Lobby',
    image: { src: `/w-${partial.id}.jpg`, alt: 'w' },
    ...partial,
  }
}

const W = [
  work({ id: 1, title: 'Somari', floor: '4' }),
  work({ id: 2, title: 'deerBLN', floor: '2' }),
  work({ id: 3, title: 'Pisa73', floor: 'lobby' }),
  work({ id: 4, title: 'Magwie', floor: 'basement' }),
]

describe('getExhibitionStatus date boundaries', () => {
  const dated = {
    runType: 'dated' as const,
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-30T12:00:00.000Z',
  }

  it('ends today → still current', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-09-30'))).toBe('current')
  })

  it('ends tomorrow → current', () => {
    expect(
      getExhibitionStatus(
        { ...dated, endDate: '2026-10-01T12:00:00.000Z' },
        berlinDay('2026-09-30'),
      ),
    ).toBe('current')
  })

  it('ended yesterday → past', () => {
    expect(getExhibitionStatus(dated, berlinDay('2026-10-01'))).toBe('past')
  })
})

describe('buildArtWallMosaic states A–G', () => {
  const currentA = [
    show({ id: 'a', title: 'Closing Soon', chipVariant: 'now', chip: 'Jetzt · bis 30.9.' }),
    show({ id: 'b', title: 'Later Close', chipVariant: 'now', chip: 'Jetzt · bis 24.10.' }),
  ]
  const upcoming = [
    show({ id: 'u', title: 'Nachtschicht', chipVariant: 'soon', chip: 'Ab 12.10.' }),
  ]

  it('A · two current → two wide + works + Alle Werke', () => {
    const mosaic = buildArtWallMosaic({
      current: currentA,
      upcoming: [],
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.columns).toBe(4)
    expect(mosaic?.tiles.map((t) => [t.kind, t.span.cols, t.span.rows])).toEqual([
      ['exhibition', 2, 1],
      ['exhibition', 2, 1],
      ['work', 1, 1],
      ['work', 1, 1],
      ['work', 1, 1],
      ['more', 1, 1],
    ])
    expect(mosaic?.tiles[0]?.title).toBe('Closing Soon')
  })

  it('B · one current + upcoming → big + soon small', () => {
    const mosaic = buildArtWallMosaic({
      current: [currentA[0]!],
      upcoming,
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles[0]?.span).toEqual({ cols: 2, rows: 2 })
    expect(mosaic?.tiles[1]?.chipVariant).toBe('soon')
    expect(mosaic?.tiles[1]?.span).toEqual({ cols: 1, rows: 1 })
    expect(mosaic?.tiles.filter((t) => t.kind === 'work')).toHaveLength(2)
    expect(mosaic?.tiles.at(-1)?.kind).toBe('more')
  })

  it('C · one current only → big lead', () => {
    const mosaic = buildArtWallMosaic({
      current: [currentA[0]!],
      upcoming: [],
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles[0]?.span).toEqual({ cols: 2, rows: 2 })
    expect(mosaic?.tiles.filter((t) => t.kind === 'work')).toHaveLength(3)
  })

  it('D · none current, upcoming in window → soon as big lead', () => {
    const mosaic = buildArtWallMosaic({
      current: [],
      upcoming,
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles[0]?.chipVariant).toBe('soon')
    expect(mosaic?.tiles[0]?.span).toEqual({ cols: 2, rows: 2 })
  })

  it('E · no shows → works lead large', () => {
    const mosaic = buildArtWallMosaic({
      current: [],
      upcoming: [],
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles[0]?.kind).toBe('work')
    expect(mosaic?.tiles[0]?.span).toEqual({ cols: 2, rows: 2 })
    expect(mosaic?.tiles.at(-1)?.kind).toBe('more')
  })

  it('F · two works only → sparse 3-col, no big', () => {
    const mosaic = buildArtWallMosaic({
      current: [],
      upcoming: [],
      works: W.slice(0, 2),
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.columns).toBe(3)
    expect(mosaic?.tiles.every((t) => t.span.cols === 1 && t.span.rows === 1)).toBe(true)
    expect(mosaic?.tiles).toHaveLength(3)
  })

  it('G · nothing → null', () => {
    expect(
      buildArtWallMosaic({ current: [], upcoming: [], works: [], moreLabel: 'Alle Werke' }),
    ).toBeNull()
  })

  it('works without images never reach the mosaic', () => {
    const mosaic = buildArtWallMosaic({
      current: [],
      upcoming: [],
      works: [
        work({ id: 9, title: 'Ghost', floor: '1', image: null }),
        ...W.slice(0, 2),
      ],
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles.filter((t) => t.kind === 'work').map((t) => t.title)).not.toContain(
      'Ghost',
    )
  })

  it('permanent alongside a dated show: dated leads, permanent second wide', () => {
    const mosaic = buildArtWallMosaic({
      current: [
        show({ id: 'dated', title: 'Dated', chipVariant: 'now' }),
        show({
          id: 'perm',
          title: 'Permanent',
          chipVariant: 'permanent',
          runType: 'permanent',
          chip: 'Dauerhaft',
        }),
      ],
      upcoming: [],
      works: W,
      moreLabel: 'Alle Werke',
    })
    expect(mosaic?.tiles[0]?.title).toBe('Dated')
    expect(mosaic?.tiles[1]?.chipVariant).toBe('permanent')
    expect(mosaic?.tiles[0]?.span).toEqual({ cols: 2, rows: 1 })
    expect(mosaic?.tiles[1]?.span).toEqual({ cols: 2, rows: 1 })
  })
})

describe('agenda exhibition expansion', () => {
  const now = berlinDay('2026-09-20')
  const today = getBerlinParts(now).dateKey

  it('dated show appears once per day of its run inside the window', () => {
    const days = buildAgendaDays({
      occurrences: [],
      exhibitions: [
        {
          id: 1,
          title: 'Duo',
          slug: 'duo',
          runType: 'dated',
          startDate: '2026-09-18T12:00:00.000Z',
          endDate: '2026-09-22T12:00:00.000Z',
          venue: { name: 'Galerie A', slug: 'gal-a' } as never,
        },
      ],
      now,
      locale: 'de',
      filter: 'art',
    })
    // today 20 → end 22 inclusive = 3 days (18–19 before today clamped)
    expect(days.map((d) => d.dateKey)).toEqual(['2026-09-20', '2026-09-21', '2026-09-22'])
    expect(days.every((d) => d.rows[0]?.allDay && d.rows[0]?.slug === 'duo')).toBe(true)
    expect(days[0]?.rows[0]?.venueShort).toBe('Galerie A')
  })

  it('permanent show appears once, not daily', () => {
    const days = buildAgendaDays({
      occurrences: [],
      exhibitions: [
        {
          id: 2,
          title: 'Dauer',
          slug: 'dauer',
          runType: 'permanent',
          startDate: '2020-01-01T00:00:00.000Z',
          venue: { name: 'Galerie B', slug: 'gal-b' } as never,
        },
      ],
      now,
      locale: 'de',
      filter: 'art',
    })
    expect(days).toHaveLength(1)
    expect(days[0]?.dateKey).toBe(today)
    expect(days[0]?.rows).toHaveLength(1)
    expect(days[0]?.rows[0]?.key).toBe(`exhibition:2:${today}`)
  })

  it('exhibitionDayKeys clamps to today…windowEnd', () => {
    expect(
      exhibitionDayKeys({
        startDate: '2026-09-01T12:00:00.000Z',
        endDate: '2026-09-22T12:00:00.000Z',
        today: '2026-09-20',
        windowEnd: '2026-10-19',
      }),
    ).toEqual(['2026-09-20', '2026-09-21', '2026-09-22'])
  })
})
