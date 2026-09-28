export type LngLat = { lng: number; lat: number }

export type TripSource = 'directions' | 'stored' | 'estimate'

/** `far` when minutes > 30 — never present as a walking suggestion. */
export type TripMode = 'walk' | 'far'

export type Trip = {
  minutes: number
  meters: number
  geometry: LngLat[] | null
  source: TripSource
  mode: TripMode
}

export type Station = {
  name: string
  lines: string[]
  mode: 'U' | 'S'
  lng: number
  lat: number
}

export type NearestStation = Station & {
  meters: number
}

export type TripPick = {
  /** Stable id for determinism / React keys */
  id: string | number
  /** Editor order (1-based). Kept for numbering even when walk order differs. */
  editorIndex: number
  point: LngLat
}

export type OrderedStop<T extends TripPick> = {
  pick: T
  leg: Trip
}

export type OrderedPicks<T extends TripPick> = {
  stops: OrderedStop<T>[]
  /** Final leg from the last stop back to the hotel. Null when there are no stops. */
  returnLeg: Trip | null
}
