import { BERLIN_BBOX, isInsideBerlin, MIN_GEOCODE_RELEVANCE } from './constants'
import type { GeocodeResult, PlaceAddressInput } from './types'

const NOMINATIM_UA =
  process.env.NOMINATIM_USER_AGENT?.trim() ||
  'HotelBerlinGeocode/1.0 (https://hotel-berlin.de; neighbourhood places seed)'

type NominatimAddress = {
  road?: string
  house_number?: string
  postcode?: string
}

type NominatimHit = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  importance?: number
  class?: string
  type?: string
  address?: NominatimAddress
}

function buildQuery(name: string, address?: PlaceAddressInput | null): string {
  const street = address?.streetAddress?.trim()
  const postal = address?.postalCode?.trim()
  const locality = address?.addressLocality?.trim() || 'Berlin'

  if (street) {
    const parts = [street]
    if (postal) parts.push(postal)
    parts.push(locality)
    return parts.join(', ')
  }

  return `${name}, ${locality}`
}

/**
 * Map Nominatim `importance` (~0–1) onto a relevance-like score.
 * Street-address searches get a boost when they resolve inside Berlin.
 */
function scoreHit(hit: NominatimHit, usedStreet: boolean): number {
  const importance = hit.importance ?? 0.5
  // Reject pure city / administrative centroids
  if (hit.class === 'place' && hit.type && ['city', 'town', 'state', 'country'].includes(hit.type)) {
    return 0
  }
  if (hit.class === 'boundary') return 0

  let score = Math.min(1, Math.max(0.35, importance + 0.25))
  if (usedStreet && hit.address?.road) score = Math.max(score, 0.85)
  if (hit.class === 'tourism' || hit.class === 'amenity' || hit.class === 'historic') {
    score = Math.max(score, 0.8)
  }
  return Math.min(1, score)
}

function extractStreet(hit: NominatimHit): string | undefined {
  const road = hit.address?.road
  const num = hit.address?.house_number
  if (road && num) return `${road} ${num}`
  if (road) return road
  return undefined
}

/**
 * Forward-geocode via OpenStreetMap Nominatim.
 *
 * Mapbox Geocoding (v5) with typical public tokens returns little/no Berlin POI
 * coverage for museum/gallery names — Nominatim is reliable for these landmarks.
 * Walking minutes still come from Mapbox Directions (`mapboxWalkingMinutes`).
 */
export async function nominatimGeocodePlace(input: {
  name: string
  address?: PlaceAddressInput | null
}): Promise<GeocodeResult | null> {
  const usedStreet = Boolean(input.address?.streetAddress?.trim())
  const query = buildQuery(input.name, input.address)

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'de',
    addressdetails: '1',
    viewbox: `${BERLIN_BBOX.west},${BERLIN_BBOX.north},${BERLIN_BBOX.east},${BERLIN_BBOX.south}`,
    bounded: usedStreet ? '0' : '1',
  })

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': NOMINATIM_UA, Accept: 'application/json' },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Nominatim geocode ${res.status}: ${body.slice(0, 200)}`)
  }

  const hits = (await res.json()) as NominatimHit[]
  if (!Array.isArray(hits) || hits.length === 0) return null

  const ranked = hits
    .map((hit) => {
      const latitude = Number(hit.lat)
      const longitude = Number(hit.lon)
      const relevance = scoreHit(hit, usedStreet)
      return { hit, latitude, longitude, relevance }
    })
    .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
    .filter((r) => isInsideBerlin(r.latitude, r.longitude))
    .filter((r) => r.relevance >= MIN_GEOCODE_RELEVANCE)
    .sort((a, b) => b.relevance - a.relevance)

  const best = ranked[0]
  if (!best) {
    const raw = hits[0]
    const latitude = Number(raw.lat)
    const longitude = Number(raw.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    return {
      latitude,
      longitude,
      relevance: scoreHit(raw, usedStreet),
      mapboxId: `nominatim:${raw.place_id}`,
      placeName: raw.display_name,
      streetAddress: extractStreet(raw),
      postalCode: raw.address?.postcode,
      query,
    }
  }

  return {
    latitude: best.latitude,
    longitude: best.longitude,
    relevance: best.relevance,
    mapboxId: `nominatim:${best.hit.place_id}`,
    placeName: best.hit.display_name,
    streetAddress: extractStreet(best.hit),
    postalCode: best.hit.address?.postcode,
    query,
  }
}

export function isConfidentGeocode(result: GeocodeResult): boolean {
  return result.relevance >= MIN_GEOCODE_RELEVANCE && isInsideBerlin(result.latitude, result.longitude)
}
