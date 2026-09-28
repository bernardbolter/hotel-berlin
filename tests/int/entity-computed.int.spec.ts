import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { getTrip } from '../../src/lib/entity/computed/getTrip'
import { orderPicks } from '../../src/lib/entity/computed/orderPicks'
import {
  nearestStation,
  formatStationValue,
  NEAREST_STATION_MAX_M,
} from '../../src/lib/entity/computed/nearestStation'
import {
  formatDistance,
  tripChipCopy,
  tripMetaLine,
  tripLegCopy,
} from '../../src/lib/entity/computed/formatTrip'
import { haversineMeters, estimateWalkMeters } from '../../src/lib/entity/computed/haversine'
import { fitBounds, routeForZoom, projectToPixel } from '../../src/lib/entity/computed/mercator'
import { entityMapAvailable } from '../../src/lib/entity/computed/staticMap'
import type { LngLat, TripPick } from '../../src/lib/entity/computed/types'

const HOTEL: LngLat = { lng: 13.3522, lat: 52.5036 }
/** ~1.1 km north of hotel — short walk */
const NEAR: LngLat = { lng: 13.3522, lat: 52.5136 }
/** Olympiastadion area */
const FAR: LngLat = { lng: 13.2398, lat: 52.5146 }

describe('haversine / estimate', () => {
  it('measures hotel → near at roughly a kilometre', () => {
    const m = haversineMeters(HOTEL, NEAR)
    expect(m).toBeGreaterThan(900)
    expect(m).toBeLessThan(1300)
  })

  it('estimate applies the 1.3 detour factor', () => {
    const straight = haversineMeters(HOTEL, NEAR)
    expect(estimateWalkMeters(HOTEL, NEAR)).toBe(Math.round(straight * 1.3))
  })
})

describe('getTrip precedence', () => {
  const originalFetch = globalThis.fetch
  const env = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...env }
    delete process.env.MAPBOX_SERVER_TOKEN
    delete process.env.MAPBOX_ACCESS_TOKEN
    delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env = env
  })

  it('uses Directions when a token is set', async () => {
    process.env.MAPBOX_SERVER_TOKEN = 'test-token'
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            duration: 14 * 60,
            distance: 1100,
            geometry: {
              coordinates: [
                [HOTEL.lng, HOTEL.lat],
                [NEAR.lng, NEAR.lat],
              ],
            },
          },
        ],
      }),
    }) as unknown as typeof fetch

    const trip = await getTrip(HOTEL, NEAR)
    expect(trip.source).toBe('directions')
    expect(trip.minutes).toBe(14)
    expect(trip.meters).toBe(1100)
    expect(trip.mode).toBe('walk')
    expect(trip.geometry).toHaveLength(2)
    expect(globalThis.fetch).toHaveBeenCalledOnce()
    const url = String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0])
    expect(url).toContain('mapbox/walking')
    const init = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit & {
      next?: { revalidate: number }
    }
    expect(init?.next?.revalidate).toBe(2_592_000)
  })

  it('falls back to stored minutes when Directions fails', async () => {
    process.env.MAPBOX_SERVER_TOKEN = 'test-token'
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch

    const trip = await getTrip(HOTEL, NEAR, { storedMinutes: 18 })
    expect(trip.source).toBe('stored')
    expect(trip.minutes).toBe(18)
    expect(trip.geometry).toBeNull()
    expect(trip.mode).toBe('walk')
  })

  it('estimates when there is no token and no stored value', async () => {
    const trip = await getTrip(HOTEL, NEAR)
    expect(trip.source).toBe('estimate')
    expect(trip.geometry).toBeNull()
    expect(trip.minutes).toBeGreaterThan(0)
    expect(trip.mode).toBe('walk')
  })

  it('marks trips over 30 minutes as far', async () => {
    const trip = await getTrip(HOTEL, FAR, { storedMinutes: 120 })
    expect(trip.mode).toBe('far')
    expect(trip.minutes).toBe(120)
  })
})

describe('nearestStation', () => {
  it('returns Bayerischer Platz for a point on the square', () => {
    const hit = nearestStation({ lng: 13.34054, lat: 52.48858 })
    expect(hit).not.toBeNull()
    expect(hit!.name).toBe('Bayerischer Platz')
    expect(hit!.mode).toBe('U')
    expect(hit!.lines).toContain('U4')
    expect(hit!.lines).toContain('U7')
    expect(formatStationValue(hit!)).toBe('Bayerischer Platz · U4, U7')
  })

  it('returns a station near Olympiastadion within 1.2 km', () => {
    const hit = nearestStation(FAR)
    expect(hit).not.toBeNull()
    expect(hit!.meters).toBeLessThanOrEqual(NEAREST_STATION_MAX_M)
    expect(hit!.name === 'Olympiastadion' || hit!.name === 'Olympia-Stadion').toBe(true)
  })

  it('returns null beyond 1,200 m', () => {
    // Mid-Grunewald forest, away from listed stations
    const hit = nearestStation({ lng: 13.23, lat: 52.47 })
    expect(hit).toBeNull()
  })
})

describe('orderPicks determinism', () => {
  beforeEach(() => {
    delete process.env.MAPBOX_SERVER_TOKEN
    delete process.env.MAPBOX_ACCESS_TOKEN
    delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  })

  it('visits nearest first and keeps editor numbers on the picks', async () => {
    const picks: TripPick[] = [
      { id: 'a', editorIndex: 1, point: { lng: 13.36, lat: 52.51 } }, // farther north-east
      { id: 'b', editorIndex: 2, point: { lng: 13.353, lat: 52.505 } }, // nearer hotel
    ]
    const ordered = await orderPicks(picks, { hotel: HOTEL })
    expect(ordered.stops.map((s) => s.pick.id)).toEqual(['b', 'a'])
    expect(ordered.stops[0]!.pick.editorIndex).toBe(2)
    expect(ordered.stops[1]!.pick.editorIndex).toBe(1)
    expect(ordered.returnLeg).not.toBeNull()
    expect(ordered.stops).toHaveLength(2)
  })

  it('breaks distance ties by editorIndex', async () => {
    // Same distance east and west of hotel
    const east: LngLat = { lng: HOTEL.lng + 0.01, lat: HOTEL.lat }
    const west: LngLat = { lng: HOTEL.lng - 0.01, lat: HOTEL.lat }
    const picks: TripPick[] = [
      { id: 'east', editorIndex: 2, point: east },
      { id: 'west', editorIndex: 1, point: west },
    ]
    const ordered = await orderPicks(picks, { hotel: HOTEL })
    expect(ordered.stops[0]!.pick.id).toBe('west')
  })

  it('returns empty stops when there are no picks', async () => {
    const ordered = await orderPicks([], { hotel: HOTEL })
    expect(ordered.stops).toEqual([])
    expect(ordered.returnLeg).toBeNull()
  })
})

describe('formatTrip (R1)', () => {
  const walkTrip = {
    minutes: 14,
    meters: 1100,
    geometry: null,
    source: 'directions' as const,
    mode: 'walk' as const,
  }
  const farTrip = {
    minutes: 120,
    meters: 9200,
    geometry: null,
    source: 'stored' as const,
    mode: 'far' as const,
  }
  const station = {
    name: 'Olympiastadion',
    lines: ['S3', 'S9'],
    mode: 'S' as const,
    lng: 13.24,
    lat: 52.51,
    meters: 400,
  }

  it('formats German distances with a comma', () => {
    expect(formatDistance(1100, 'de')).toBe('1,1 km')
    expect(formatDistance(9200, 'de')).toBe('9,2 km')
    expect(formatDistance(420, 'de')).toBe('400 m')
  })

  it('builds walk vs far chip copy', () => {
    expect(tripChipCopy(walkTrip, { locale: 'de' })).toEqual({
      primary: '14 Min.',
      secondary: 'zu Fuß · 1,1 km',
    })
    expect(tripChipCopy(farTrip, { locale: 'de', station })).toEqual({
      primary: '9,2 km',
      secondary: 'Olympiastadion · S3, S9',
    })
  })

  it('builds strip meta and leg copy without U-Bahn advice', () => {
    expect(tripMetaLine(walkTrip, 'Buchladen', 'de')).toBe('Buchladen · 14 Min.')
    expect(tripMetaLine(farTrip, 'Stadion', 'de')).toBe('Stadion · 9,2 km')
    expect(tripLegCopy(walkTrip, { locale: 'de' }).short).toBe('↓ 14 Min. zu Fuß')
    expect(tripLegCopy(farTrip, { locale: 'de', station }).short).toBe(
      '↓ 9,2 km · Olympiastadion (S3, S9)',
    )
    expect(tripLegCopy(farTrip, { locale: 'de', returning: true }).short).toBe(
      '↓ 9,2 km zurück zum Hotel',
    )
  })

  it('prefixes estimates with ca.', () => {
    const est = { ...walkTrip, source: 'estimate' as const }
    expect(tripChipCopy(est, { locale: 'de' }).primary).toBe('ca. 14 Min.')
  })
})

describe('entityMapAvailable', () => {
  const env = { ...process.env }

  afterEach(() => {
    process.env = env
  })

  it('is true when MAPBOX_SERVER_TOKEN is set', () => {
    process.env = { ...env, MAPBOX_SERVER_TOKEN: 'server', MAPBOX_ACCESS_TOKEN: '' }
    delete process.env.MAPBOX_ACCESS_TOKEN
    expect(entityMapAvailable()).toBe(true)
  })

  it('is true when only MAPBOX_ACCESS_TOKEN is set', () => {
    process.env = { ...env }
    delete process.env.MAPBOX_SERVER_TOKEN
    process.env.MAPBOX_ACCESS_TOKEN = 'access'
    expect(entityMapAvailable()).toBe(true)
  })

  it('is false when neither server token is set', () => {
    process.env = { ...env }
    delete process.env.MAPBOX_SERVER_TOKEN
    delete process.env.MAPBOX_ACCESS_TOKEN
    expect(entityMapAvailable()).toBe(false)
  })
})

describe('mercator fit / route zoom (R6)', () => {
  it('clamps zoom to 10–16 and widens for Olympiastadion', () => {
    const vp = fitBounds([HOTEL, FAR], { width: 640, height: 480 })
    expect(vp.zoom).toBeGreaterThanOrEqual(10)
    expect(vp.zoom).toBeLessThanOrEqual(16)
    expect(vp.zoom).toBeLessThan(13)
  })

  it('drops geometry at zoom ≤ 12 (Olympiastadion ~11.5)', () => {
    const geometry = [HOTEL, { lng: 13.35, lat: 52.51 }, FAR]
    expect(routeForZoom(geometry, HOTEL, FAR, 11.5)).toEqual([HOTEL, FAR])
    expect(routeForZoom(geometry, HOTEL, FAR, 12)).toEqual([HOTEL, FAR])
    expect(routeForZoom(geometry, HOTEL, FAR, 12.25)).toEqual(geometry)
  })

  it('projects hotel near the image centre for a hotel-centred viewport', () => {
    const vp = { center: HOTEL, zoom: 14, width: 640, height: 480 }
    const { x, y } = projectToPixel(HOTEL, vp)
    expect(x).toBeCloseTo(320, 0)
    expect(y).toBeCloseTo(240, 0)
  })
})
