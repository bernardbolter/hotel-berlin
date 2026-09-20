import type { ArtFloor, FloorFilter } from './types'

export function matchesFloorFilter(floor: ArtFloor | null, filter: FloorFilter): boolean {
  if (filter === 'all') return true
  if (!floor) return false
  if (filter === 'lobby') return floor === 'EG'
  if (filter === 'basement') return floor === 'B1' || floor === 'B2'
  if (filter === 'floors1to4') return floor === '1' || floor === '2' || floor === '3' || floor === '4'
  if (filter === 'floors5to10') {
    return floor === '5' || floor === '6' || floor === '7' || floor === '8' || floor === '9' || floor === '10'
  }
  return false
}

export function locationChip(floor: ArtFloor | null, spot: string | null, locationTbc: string): string {
  if (!floor && !spot) return locationTbc
  if (floor && spot) return `${floor} · ${spot}`
  return floor || spot || locationTbc
}

/** Tile CSS order = index*2; the open panel sits after the last tile of that row. */
export function artPanelOrder(index: number, count: number, columns: number): { tile: number; panel: number } {
  const cols = Math.max(1, columns)
  const rowStart = Math.floor(index / cols) * cols
  const rowEnd = Math.min(rowStart + cols - 1, count - 1)
  return { tile: index * 2, panel: rowEnd * 2 + 1 }
}

export function gridColumnCount(template: string): number {
  const parts = template.trim().split(/\s+/).filter(Boolean)
  return Math.max(1, parts.length)
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
