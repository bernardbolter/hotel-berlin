import type { ArtFloor, FloorFilter } from './types'
import { ART_FLOORS } from './types'

export function matchesFloorFilter(floor: ArtFloor | null, filter: FloorFilter): boolean {
  if (filter === 'all' || filter === 'exhibition') return true
  if (!floor) return false
  if (filter === 'outside') return floor === 'outside'
  if (filter === 'lobby') return floor === 'lobby'
  if (filter === 'basement') return floor === 'basement'
  if (filter === 'floors1to4') return floor === '1' || floor === '2' || floor === '3' || floor === '4'
  if (filter === 'floors5to10') {
    return (
      floor === '5' ||
      floor === '6' ||
      floor === '7' ||
      floor === '8' ||
      floor === '9' ||
      floor === '10'
    )
  }
  return false
}

/** Floor group used for “more on this level” borrowing and mosaic variety. */
export function floorGroupOf(floor: ArtFloor | null): FloorFilter | null {
  if (!floor) return null
  if (floor === 'outside') return 'outside'
  if (floor === 'basement') return 'basement'
  if (floor === 'lobby') return 'lobby'
  if (floor === '1' || floor === '2' || floor === '3' || floor === '4') return 'floors1to4'
  if (
    floor === '5' ||
    floor === '6' ||
    floor === '7' ||
    floor === '8' ||
    floor === '9' ||
    floor === '10'
  ) {
    return 'floors5to10'
  }
  return null
}

export function locationChip(floor: ArtFloor | null, spot: string | null, locationTbc: string): string {
  if (!floor && !spot) return locationTbc
  if (floor && spot) return `${floorLabel(floor)} · ${spot}`
  return (floor ? floorLabel(floor) : null) || spot || locationTbc
}

/** Short DE labels for chips / locator (site primary). */
export function floorLabel(floor: ArtFloor, locale: 'de' | 'en' = 'de'): string {
  if (floor === 'outside') return locale === 'en' ? 'Outside' : 'Außen'
  if (floor === 'basement') return locale === 'en' ? 'Basement' : 'Keller'
  if (floor === 'lobby') return 'Lobby'
  return locale === 'en' ? `Floor ${floor}` : `${floor}. Etage`
}

/**
 * Locator bars, bottom → top in DOM (CSS column-reverse puts Außen at the bottom).
 * Outside is not floor zero — a gap separates it from Keller.
 */
export const FLOOR_LOCATOR_LEVELS = [
  'outside',
  'basement',
  'lobby',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const

export type FloorLocatorLevel = (typeof FLOOR_LOCATOR_LEVELS)[number]

export function locatorLevelFor(floor: ArtFloor | null): FloorLocatorLevel | null {
  if (!floor) return null
  if (FLOOR_LOCATOR_LEVELS.includes(floor as FloorLocatorLevel)) {
    return floor as FloorLocatorLevel
  }
  return null
}

export function isArtFloor(value: unknown): value is ArtFloor {
  return typeof value === 'string' && (ART_FLOORS as readonly string[]).includes(value)
}

export function objectPosition(focalX?: number | null, focalY?: number | null): string | undefined {
  if (focalX == null && focalY == null) return undefined
  const x = focalX == null ? 50 : focalX * 100
  const y = focalY == null ? 50 : focalY * 100
  return `${x}% ${y}%`
}

export function sortLiveWorks<T extends { artworkType: string; order: string }>(works: T[]): T[] {
  return [...works].sort((a, b) => {
    const muralDelta = Number(a.artworkType !== 'mural') - Number(b.artworkType !== 'mural')
    if (muralDelta !== 0) return muralDelta
    return a.order.localeCompare(b.order, 'en', { numeric: true })
  })
}

export function isUntitledTitle(title: string | null | undefined): boolean {
  return !title?.trim()
}

/**
 * Pick works for the hub mosaic: no two from the same floor group while
 * unused groups remain (`outside` is its own group).
 */
export function pickWorksWithFloorVariety<T extends { floor?: ArtFloor | null }>(
  works: T[],
  limit: number,
): T[] {
  if (limit <= 0) return []
  const picked: T[] = []
  const used = new Set<FloorFilter>()
  const remaining = [...works]

  while (picked.length < limit && remaining.length > 0) {
    const unusedLeft = remaining.some((w) => {
      const g = floorGroupOf(w.floor ?? null)
      return g != null && !used.has(g)
    })
    const idx = remaining.findIndex((w) => {
      const g = floorGroupOf(w.floor ?? null)
      if (g == null) return true
      if (!used.has(g)) return true
      return !unusedLeft
    })
    if (idx < 0) break
    const [next] = remaining.splice(idx, 1)
    const g = floorGroupOf(next.floor ?? null)
    if (g) used.add(g)
    picked.push(next)
  }

  return picked
}
