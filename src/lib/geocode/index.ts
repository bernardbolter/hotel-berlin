import { getMapboxGeocodeToken, isInsideBerlin, MIN_GEOCODE_RELEVANCE, tierFromMinutes } from './constants'
import { isConfidentGeocode, nominatimGeocodePlace } from './nominatimGeocode'
import { mapboxWalkingMinutes } from './mapboxWalking'
import type {
  EnrichmentFailure,
  EnrichmentResult,
  PlaceAddressInput,
} from './types'

export type EnrichPlaceInput = {
  name: string
  address?: PlaceAddressInput | null
  accessToken?: string
}

export type EnrichPlaceOutcome =
  | { ok: true; result: EnrichmentResult }
  | { ok: false; failure: EnrichmentFailure }

/**
 * Geocode a place (Nominatim), then derive walkingMinutes + distanceTier
 * from the hotel via Mapbox Directions (walking).
 */
export async function enrichNeighbourhoodPlace(
  input: EnrichPlaceInput,
): Promise<EnrichPlaceOutcome> {
  try {
    const geocoded = await nominatimGeocodePlace({
      name: input.name,
      address: input.address,
    })

    if (!geocoded) {
      return {
        ok: false,
        failure: {
          reason: 'no-result',
          message: 'Nominatim returned no features',
          query: `${input.name}, Berlin`,
        },
      }
    }

    if (!isInsideBerlin(geocoded.latitude, geocoded.longitude)) {
      return {
        ok: false,
        failure: {
          reason: 'outside-berlin',
          message: `Hit outside Berlin bbox: ${geocoded.placeName}`,
          query: geocoded.query,
          relevance: geocoded.relevance,
          coords: { latitude: geocoded.latitude, longitude: geocoded.longitude },
        },
      }
    }

    if (!isConfidentGeocode(geocoded)) {
      return {
        ok: false,
        failure: {
          reason: 'low-confidence',
          message: `Relevance ${geocoded.relevance.toFixed(2)} < ${MIN_GEOCODE_RELEVANCE} (${geocoded.placeName})`,
          query: geocoded.query,
          relevance: geocoded.relevance,
          coords: { latitude: geocoded.latitude, longitude: geocoded.longitude },
        },
      }
    }

    const token = input.accessToken ?? getMapboxGeocodeToken()
    if (!token) {
      return {
        ok: false,
        failure: {
          reason: 'no-token',
          message: 'Missing MAPBOX_ACCESS_TOKEN or NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (needed for walking minutes)',
          query: geocoded.query,
          relevance: geocoded.relevance,
          coords: { latitude: geocoded.latitude, longitude: geocoded.longitude },
        },
      }
    }

    let walkingMinutes: number
    try {
      walkingMinutes = await mapboxWalkingMinutes(
        { latitude: geocoded.latitude, longitude: geocoded.longitude },
        { accessToken: token },
      )
    } catch (err) {
      return {
        ok: false,
        failure: {
          reason: 'directions-failed',
          message: err instanceof Error ? err.message : String(err),
          query: geocoded.query,
          relevance: geocoded.relevance,
          coords: { latitude: geocoded.latitude, longitude: geocoded.longitude },
        },
      }
    }

    return {
      ok: true,
      result: {
        geo: { latitude: geocoded.latitude, longitude: geocoded.longitude },
        walkingMinutes,
        distanceTier: tierFromMinutes(walkingMinutes),
        streetAddress: geocoded.streetAddress,
        postalCode: geocoded.postalCode,
        relevance: geocoded.relevance,
        mapboxId: geocoded.mapboxId,
        placeName: geocoded.placeName,
        query: geocoded.query,
      },
    }
  } catch (err) {
    return {
      ok: false,
      failure: {
        reason: 'error',
        message: err instanceof Error ? err.message : String(err),
      },
    }
  }
}

export { tierFromMinutes, getMapboxGeocodeToken, MIN_GEOCODE_RELEVANCE } from './constants'
export { nominatimGeocodePlace, isConfidentGeocode } from './nominatimGeocode'
/** Alias — geocoding is Nominatim; name kept for call-site clarity during migration. */
export { nominatimGeocodePlace as mapboxGeocodePlace } from './nominatimGeocode'
export { mapboxWalkingMinutes } from './mapboxWalking'
export type * from './types'
