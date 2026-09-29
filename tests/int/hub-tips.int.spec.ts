import { describe, expect, it } from 'vitest'

import { matchExploreFilters, tipCardImage } from '../../src/lib/here/getHubTips'
import { pickHubTips } from '../../src/lib/here/pickHubTips'
import type { NeighbourhoodPlace } from '../../src/payload-types'

describe('pickHubTips', () => {
  const tips = [
    { placeSlug: 'koenig-galerie', endorserSlug: 'kristiane-kegelmann' },
    { placeSlug: 'einsunternull', endorserSlug: 'kristiane-kegelmann' },
    { placeSlug: 'lokal', endorserSlug: 'kristiane-kegelmann' },
    { placeSlug: 'nobelhart-und-schmutzig', endorserSlug: 'kristiane-kegelmann' },
    { placeSlug: 'kaethe-kollwitz-museum', endorserSlug: 'iris-berndt' },
    { placeSlug: 'bayerischer-platz', endorserSlug: 'christiane-fritsch-weith' },
    { placeSlug: 'olympiastadion', endorserSlug: 'jennifer-oeser' },
    { placeSlug: 'anjoy', endorserSlug: 'gita-kurdpoor' },
    { placeSlug: 'holocaust-memorial', endorserSlug: 'gita-kurdpoor' },
    { placeSlug: 'einar-und-bert-bookshop', endorserSlug: 'katja-morkel' },
  ]

  it('never lets one endorser hold two slots in the visible row', () => {
    const picked = pickHubTips(tips, '2026-09-08', 4)
    const endorsers = picked.map((t) => t.endorserSlug)
    expect(endorsers.filter(Boolean)).toHaveLength(new Set(endorsers.filter(Boolean)).size)
    expect(picked).toHaveLength(4)
  })

  it('still fills four cards when the first four tips share an endorser', () => {
    const picked = pickHubTips(tips, '2026-09-08', 4)
    const kristiane = picked.filter((t) => t.endorserSlug === 'kristiane-kegelmann')
    expect(kristiane.length).toBeLessThanOrEqual(1)
    expect(picked).toHaveLength(4)
  })

  it('allows a slot with no endorser without blocking others', () => {
    const withGap = [{ placeSlug: 'hotel-pick', endorserSlug: null }, ...tips]
    const picked = pickHubTips(withGap, '2026-09-08', 4)
    expect(picked).toHaveLength(4)
  })
})

describe('tipCardImage', () => {
  it('prefers a real CMS place photo', () => {
    const place = {
      slug: 'lokal',
      name: 'Lokal',
      image: { url: '/api/media/file/lokal.jpg', alt: 'Lokal' },
    } as NeighbourhoodPlace
    expect(tipCardImage(place)?.src).toBe('/api/media/file/lokal.jpg')
  })

  it('returns null when CMS media is missing — name block empty state', () => {
    const place = {
      slug: 'olympiastadion',
      name: 'Olympiastadion',
      image: null,
    } as NeighbourhoodPlace
    expect(tipCardImage(place)).toBeNull()
  })

  it('rejects picsum / unsplash / wikimedia stand-ins', () => {
    for (const url of [
      'https://picsum.photos/800/600?random=x',
      'https://images.unsplash.com/photo-123',
      'https://upload.wikimedia.org/wikipedia/commons/x.jpg',
    ]) {
      const place = {
        slug: 'anjoy',
        name: 'Anjoy',
        image: { url, alt: 'x' },
      } as NeighbourhoodPlace
      expect(tipCardImage(place)).toBeNull()
    }
  })
})

describe('matchExploreFilters', () => {
  function place(
    overrides: Pick<NeighbourhoodPlace, 'category' | 'indoorOutdoor'> & {
      audience?: string[]
    },
  ): NeighbourhoodPlace {
    return {
      category: overrides.category,
      indoorOutdoor: overrides.indoorOutdoor,
      targetAudience: (overrides.audience ?? []).map((label) => ({ label })),
    } as NeighbourhoodPlace
  }

  const museumIndoor = place({
    category: 'Museum',
    indoorOutdoor: 'indoor',
    audience: ['Alle'],
  })
  const museumBoth = place({
    category: 'Museum',
    indoorOutdoor: 'both',
    audience: ['Alle'],
  })
  const artIndoor = place({
    category: 'Art',
    indoorOutdoor: 'indoor',
    audience: ['Kunstinteressierte'],
  })
  const sightOutdoor = place({
    category: 'Sightseeing',
    indoorOutdoor: 'outdoor',
    audience: ['Alle'],
  })
  const restaurantPairs = place({
    category: 'Restaurant',
    indoorOutdoor: 'indoor',
    audience: ['Paare', 'Business'],
  })

  it('returns the full set when no filters are set', () => {
    const all = [museumIndoor, museumBoth, artIndoor, sightOutdoor, restaurantPairs]
    expect(all.filter((p) => matchExploreFilters(p, {}))).toHaveLength(5)
  })

  it('filters by category', () => {
    expect(matchExploreFilters(museumIndoor, { category: 'Museum' })).toBe(true)
    expect(matchExploreFilters(artIndoor, { category: 'Museum' })).toBe(false)
  })

  it('treats Indoor/Outdoor as matching indoor or outdoor, but not the reverse', () => {
    expect(matchExploreFilters(museumBoth, { indoorOutdoor: 'indoor' })).toBe(true)
    expect(matchExploreFilters(museumBoth, { indoorOutdoor: 'outdoor' })).toBe(true)
    expect(matchExploreFilters(museumIndoor, { indoorOutdoor: 'both' })).toBe(false)
    expect(matchExploreFilters(museumBoth, { indoorOutdoor: 'both' })).toBe(true)
  })

  it('filters by audience label', () => {
    expect(matchExploreFilters(artIndoor, { audience: 'Kunstinteressierte' })).toBe(true)
    expect(matchExploreFilters(museumIndoor, { audience: 'Kunstinteressierte' })).toBe(false)
    expect(matchExploreFilters(restaurantPairs, { audience: 'Paare' })).toBe(true)
  })

  it('combines filters with AND — pin set, list, and count share one result', () => {
    const all = [museumIndoor, museumBoth, artIndoor, sightOutdoor, restaurantPairs]
    const filtered = all.filter((p) =>
      matchExploreFilters(p, {
        category: 'Museum',
        indoorOutdoor: 'indoor',
        audience: 'Alle',
      }),
    )
    expect(filtered).toEqual([museumIndoor, museumBoth])
  })
})
