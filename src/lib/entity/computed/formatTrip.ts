import type { NearestStation, Trip, TripMode } from './types'
import { formatStationValue } from './nearestStation'

/**
 * Distance for `far` / meta lines.
 * One decimal, German comma; `km` above 1 km, else metres rounded to 50.
 */
export function formatDistance(meters: number, locale: 'de' | 'en' = 'de'): string {
  if (meters >= 1000) {
    const km = meters / 1000
    const rounded = Math.round(km * 10) / 10
    const num =
      locale === 'de'
        ? rounded.toFixed(1).replace('.', ',')
        : rounded.toFixed(1)
    return `${num} km`
  }
  const rounded = Math.round(meters / 50) * 50
  return `${rounded} m`
}

export function formatMinutes(minutes: number, estimated: boolean): string {
  const body = `${minutes} Min.`
  return estimated ? `ca. ${body}` : body
}

export type TripChipCopy = {
  primary: string
  secondary: string
}

/**
 * Map chip / strip meta / leg copy by mode (R1).
 * Station is the destination's nearest station — never invent a journey.
 */
export function tripChipCopy(
  trip: Trip,
  opts: {
    locale: 'de' | 'en'
    station?: NearestStation | null
    placeName?: string
  },
): TripChipCopy {
  const estimated = trip.source === 'estimate'
  const distance = formatDistance(trip.meters, opts.locale)

  if (trip.mode === 'walk') {
    const primary = formatMinutes(trip.minutes, estimated)
    const secondary =
      opts.locale === 'de' ? `zu Fuß · ${distance}` : `on foot · ${distance}`
    return { primary, secondary }
  }

  // far
  const primary = estimated ? `ca. ${distance}` : distance
  let secondary = ''
  if (opts.station) {
    secondary = `${opts.station.name} · ${opts.station.lines.join(', ')}`
  } else if (opts.placeName) {
    secondary = opts.placeName
  }
  return { primary, secondary }
}

/** Strip / list meta: `Buchladen · 14 Min.` or `Stadion · 4,2 km` */
export function tripMetaLine(
  trip: Trip,
  categoryOrLabel: string,
  locale: 'de' | 'en' = 'de',
): string {
  const estimated = trip.source === 'estimate'
  if (trip.mode === 'walk') {
    return `${categoryOrLabel} · ${formatMinutes(trip.minutes, estimated)}`
  }
  const distance = formatDistance(trip.meters, locale)
  return `${categoryOrLabel} · ${estimated ? `ca. ${distance}` : distance}`
}

export type LegCopy = {
  /** Visible short form, e.g. `↓ 11 Min. zu Fuß` */
  short: string
  /** Accessible full sentence without the arrow */
  accessible: string
}

/** Timeline leg copy (R1 / R2). */
export function tripLegCopy(
  trip: Trip,
  opts: {
    locale: 'de' | 'en'
    station?: NearestStation | null
    returning?: boolean
  },
): LegCopy {
  const estimated = trip.source === 'estimate'
  const distance = formatDistance(trip.meters, opts.locale)
  const isDe = opts.locale === 'de'

  if (opts.returning) {
    if (trip.mode === 'walk') {
      const mins = formatMinutes(trip.minutes, estimated)
      return {
        short: isDe ? `↓ ${mins} zurück ins Hotel` : `↓ ${mins} back to the hotel`,
        accessible: isDe
          ? `${mins} zurück ins Hotel`
          : `${mins} back to the hotel`,
      }
    }
    const dist = estimated ? `ca. ${distance}` : distance
    return {
      short: isDe ? `↓ ${dist} zurück zum Hotel` : `↓ ${dist} back to the hotel`,
      accessible: isDe ? `${dist} zurück zum Hotel` : `${dist} back to the hotel`,
    }
  }

  if (trip.mode === 'walk') {
    const mins = formatMinutes(trip.minutes, estimated)
    return {
      short: isDe ? `↓ ${mins} zu Fuß` : `↓ ${mins} on foot`,
      accessible: isDe
        ? `${trip.minutes} Minuten zu Fuß bis`
        : `${trip.minutes} minutes on foot to`,
    }
  }

  // far — destination station when known
  const dist = estimated ? `ca. ${distance}` : distance
  if (opts.station) {
    const lines = opts.station.lines.join(', ')
    const stationBit = lines
      ? `${opts.station.name} (${lines})`
      : opts.station.name
    return {
      short: `↓ ${dist} · ${stationBit}`,
      accessible: isDe
        ? `${dist} bis ${stationBit}`
        : `${dist} to ${stationBit}`,
    }
  }
  return {
    short: `↓ ${dist}`,
    accessible: dist,
  }
}

export function stationRowLabel(mode: 'U' | 'S', locale: 'de' | 'en'): string {
  if (mode === 'U') return 'U-Bahn'
  return locale === 'de' ? 'S-Bahn' : 'S-Bahn'
}

export { formatStationValue }
export type { TripMode }
