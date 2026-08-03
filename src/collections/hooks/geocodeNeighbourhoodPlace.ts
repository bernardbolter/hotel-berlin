import type { CollectionBeforeChangeHook } from 'payload'

import { enrichNeighbourhoodPlace } from '@/lib/geocode'

/**
 * Auto-fill geo / walkingMinutes / distanceTier when missing.
 * Skipped when SKIP_GEOCODE_HOOK=1 (seed + geocode CLI).
 * Fails soft — never blocks an editor save.
 */
export const geocodeNeighbourhoodPlaceBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
}) => {
  if (process.env.SKIP_GEOCODE_HOOK === '1') return data

  const name = (data.name ?? originalDoc?.name) as string | undefined
  if (!name) return data

  const nextGeo = data.geo ?? originalDoc?.geo
  const hasGeo = nextGeo?.latitude != null && nextGeo?.longitude != null
  if (hasGeo) return data

  const address = {
    streetAddress: data.address?.streetAddress ?? originalDoc?.address?.streetAddress,
    addressLocality:
      data.address?.addressLocality ?? originalDoc?.address?.addressLocality ?? 'Berlin',
    postalCode: data.address?.postalCode ?? originalDoc?.address?.postalCode,
  }

  try {
    const outcome = await enrichNeighbourhoodPlace({ name, address })
    if (!outcome.ok) {
      console.warn(
        `[geocode] ${operation} "${name}" skipped: ${outcome.failure.reason} — ${outcome.failure.message}`,
      )
      return data
    }

    const { result } = outcome
    data.geo = {
      latitude: result.geo.latitude,
      longitude: result.geo.longitude,
    }

    if (data.walkingMinutes == null && originalDoc?.walkingMinutes == null) {
      data.walkingMinutes = result.walkingMinutes
    }
    if (data.distanceTier == null && originalDoc?.distanceTier == null) {
      data.distanceTier = result.distanceTier
    }

    if (!data.address) data.address = {}
    if (!data.address.streetAddress && !originalDoc?.address?.streetAddress && result.streetAddress) {
      data.address.streetAddress = result.streetAddress
    }
    if (!data.address.postalCode && !originalDoc?.address?.postalCode && result.postalCode) {
      data.address.postalCode = result.postalCode
    }
    if (!data.address.addressLocality) {
      data.address.addressLocality = address.addressLocality
    }
  } catch (err) {
    console.warn(
      `[geocode] ${operation} "${name}" failed:`,
      err instanceof Error ? err.message : err,
    )
  }

  return data
}
