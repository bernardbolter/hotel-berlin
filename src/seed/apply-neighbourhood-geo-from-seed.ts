/**
 * Apply geo / walkingMinutes / distanceTier / address from neighbourhood-v1-places.json
 * without re-running people seed or live geocoding APIs.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import placesSeed from './data/neighbourhood-v1-places.json'

async function main() {
  process.env.SKIP_GEOCODE_HOOK = '1'
  const payload = await getPayload({ config })

  for (const place of placesSeed) {
    const found = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: place.slug } },
      limit: 1,
      depth: 0,
    })
    const doc = found.docs[0]
    if (!doc) {
      console.log('missing', place.slug)
      continue
    }

    const geo =
      place.geo && place.geo.latitude != null && place.geo.longitude != null
        ? { latitude: place.geo.latitude, longitude: place.geo.longitude }
        : undefined

    await payload.update({
      collection: 'neighbourhood-places',
      id: doc.id,
      data: {
        address: place.address,
        ...(geo ? { geo } : {}),
        ...(place.walkingMinutes != null ? { walkingMinutes: place.walkingMinutes } : {}),
        ...(place.distanceTier != null
          ? { distanceTier: place.distanceTier as 'walkable' | 'short-transit' | 'further-out' }
          : {}),
      },
      overrideAccess: true,
    })

    console.log(
      `updated ${place.slug}: ${geo ? `${geo.latitude},${geo.longitude}` : 'no-geo'} ${place.walkingMinutes ?? '-'}m ${place.distanceTier ?? '-'}`,
    )
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
