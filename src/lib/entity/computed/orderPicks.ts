import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'

import { getTrip } from './getTrip'
import { haversineMeters } from './haversine'
import type { LngLat, OrderedPicks, TripPick } from './types'

const hotelPoint = (): LngLat => ({
  lng: DEFAULT_HOTEL_COORDS.lng,
  lat: DEFAULT_HOTEL_COORDS.lat,
})

/**
 * Greedy nearest-neighbour from the hotel, then return.
 * Ties break by the editor's pick order (`editorIndex`).
 * Editor numbers stay on each pick; walk order may differ.
 */
export async function orderPicks<T extends TripPick>(
  picks: readonly T[],
  opts?: { hotel?: LngLat },
): Promise<OrderedPicks<T>> {
  const hotel = opts?.hotel ?? hotelPoint()
  if (picks.length === 0) {
    return { stops: [], returnLeg: null }
  }

  const remaining = [...picks].sort((a, b) => a.editorIndex - b.editorIndex)
  const ordered: T[] = []
  let current = hotel

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineMeters(current, remaining[i]!.point)
      const cand = remaining[i]!
      const best = remaining[bestIdx]!
      if (
        d < bestDist - 1e-6 ||
        (Math.abs(d - bestDist) <= 1e-6 && cand.editorIndex < best.editorIndex)
      ) {
        bestDist = d
        bestIdx = i
      }
    }
    const next = remaining.splice(bestIdx, 1)[0]!
    ordered.push(next)
    current = next.point
  }

  const stops = []
  let from = hotel
  for (const pick of ordered) {
    const leg = await getTrip(from, pick.point)
    stops.push({ pick, leg })
    from = pick.point
  }

  const last = ordered[ordered.length - 1]!
  const returnLeg = await getTrip(last.point, hotel)

  return { stops, returnLeg }
}
