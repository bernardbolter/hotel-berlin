export type AmenityStandInPhoto = {
  src: string
  alt: string
  filename?: string
  width?: number
  height?: number
}

const HINTS: Record<string, string[]> = {
  kttk: ['kttk', 'ping', 'open-play', 'tournament'],
  wallride: ['wallride', 'skate', 'ramp', 'kttk'],
  fingerboard: ['finger', 'skate', 'kttk', 'open-play'],
  gym: ['gym', 'fitness', 'sport', 'junior', 'standard'],
  sauna: ['sauna', 'spa', 'suite-45', 'suite45', 'wellness'],
  bettAndBike: ['bike', 'fahrrad', 'cycle', 'courtyard', 'lutze'],
  businessCenter: ['meet', 'saal', 'business', 'konferenz', 'hybrid'],
  eLaden: ['park', 'garage', 'laden', 'charg', 'exterior', 'facade'],
}

/** Specific matches first so sauna/KTTK don't get generic leftovers. */
export const STAND_IN_ASSIGN_ORDER = [
  'sauna',
  'kttk',
  'wallride',
  'businessCenter',
  'gym',
  'bettAndBike',
  'eLaden',
  'fingerboard',
] as const

function score(filename: string, hints: string[]): number {
  const hay = filename.toLowerCase()
  return hints.reduce((n, hint) => n + (hay.includes(hint) ? 10 : 0), 0)
}

/**
 * Unique temporary photos for amenities that have no venue hero yet.
 * Prefers filename hints, then remaining pool order.
 */
export function assignAmenityStandIns(
  keys: string[],
  occupiedSrc: Iterable<string>,
  pool: AmenityStandInPhoto[],
): Record<string, AmenityStandInPhoto> {
  const used = new Set(occupiedSrc)
  const available = pool.filter((photo) => photo.src && !used.has(photo.src))
  const result: Record<string, AmenityStandInPhoto> = {}
  const ordered = [
    ...STAND_IN_ASSIGN_ORDER.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !STAND_IN_ASSIGN_ORDER.includes(key as (typeof STAND_IN_ASSIGN_ORDER)[number])),
  ]

  for (const key of ordered) {
    const hints = HINTS[key] ?? []
    let pickIndex = 0
    let best = -1
    for (let i = 0; i < available.length; i++) {
      const photo = available[i]!
      const next = score(photo.filename || photo.src, hints)
      if (next > best) {
        best = next
        pickIndex = i
      }
    }
    const pick = available[pickIndex]
    if (!pick) break
    result[key] = pick
    used.add(pick.src)
    available.splice(pickIndex, 1)
  }

  return result
}
