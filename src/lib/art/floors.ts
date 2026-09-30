import type { ArtFloor, FloorFilter } from './types'

export function matchesFloorFilter(floor: ArtFloor | null, filter: FloorFilter): boolean {
  if (filter === 'all' || filter === 'exhibition') return true
  if (!floor) return false
  if (filter === 'lobby') return floor === 'EG'
  if (filter === 'basement') return floor === 'B1' || floor === 'B2'
  if (filter === 'floors1to4') return floor === '1' || floor === '2' || floor === '3' || floor === '4'
  if (filter === 'floors5to10') {
    return (
      floor === '5' ||
      floor === '6' ||
      floor === '7' ||
      floor === '8' ||
      floor === '9' ||
      floor === '10' ||
      floor === 'Dach'
    )
  }
  return false
}

/** Floor group used for “Mehr auf der n. Etage” borrowing. */
export function floorGroupOf(floor: ArtFloor | null): FloorFilter | null {
  if (!floor) return null
  if (floor === 'EG') return 'lobby'
  if (floor === 'B1' || floor === 'B2') return 'basement'
  if (floor === '1' || floor === '2' || floor === '3' || floor === '4') return 'floors1to4'
  if (
    floor === '5' ||
    floor === '6' ||
    floor === '7' ||
    floor === '8' ||
    floor === '9' ||
    floor === '10' ||
    floor === 'Dach'
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

export function floorLabel(floor: ArtFloor): string {
  if (floor === 'EG') return 'EG'
  if (floor === 'B1' || floor === 'B2') return floor
  if (floor === 'Dach') return 'Dach'
  return `${floor}.`
}

/**
 * Locator bars, bottom → top in DOM (CSS column-reverse puts Keller at the bottom).
 * B1/B2 share Keller; Dach shares the top with 10.
 */
export const FLOOR_LOCATOR_LEVELS = [
  'Keller',
  'EG',
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
  if (floor === 'B1' || floor === 'B2') return 'Keller'
  if (floor === 'EG') return 'EG'
  if (floor === 'Dach') return '10'
  if (FLOOR_LOCATOR_LEVELS.includes(floor as FloorLocatorLevel)) {
    return floor as FloorLocatorLevel
  }
  return null
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
