/**
 * Geocode neighbourhood-places via Mapbox (dry-run by default).
 *
 *   npm run geocode:neighbourhood
 *   npm run geocode:neighbourhood -- --write
 *   npm run geocode:neighbourhood -- --write --force
 *   npm run geocode:neighbourhood -- --slug=koenig-galerie
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import { enrichNeighbourhoodPlace } from '../lib/geocode'
import config from '../payload.config'

type Action = 'would-write' | 'wrote' | 'skip-existing' | 'low-confidence' | 'failed'

function parseArgs(argv: string[]) {
  const write = argv.includes('--write')
  const force = argv.includes('--force')
  const slugArg = argv.find((a) => a.startsWith('--slug='))
  const slug = slugArg?.slice('--slug='.length)?.trim() || null
  return { write, force, slug }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasGeo(doc: {
  geo?: { latitude?: number | null; longitude?: number | null } | null
}): boolean {
  return doc.geo?.latitude != null && doc.geo?.longitude != null
}

async function main() {
  const { write, force, slug } = parseArgs(process.argv.slice(2))

  // Keep bulk seed deterministic; this CLI owns geocoding writes.
  process.env.SKIP_GEOCODE_HOOK = '1'

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'neighbourhood-places',
    where: slug ? { slug: { equals: slug } } : undefined,
    limit: 200,
    depth: 0,
    pagination: false,
  })

  if (result.docs.length === 0) {
    console.error(slug ? `No place found for slug=${slug}` : 'No neighbourhood-places found')
    process.exit(1)
  }

  console.log(
    `Geocode neighbourhood-places (${result.docs.length}) — mode=${write ? 'WRITE' : 'DRY-RUN'}${force ? ' force' : ''}`,
  )
  console.log(
    [
      'slug'.padEnd(28),
      'action'.padEnd(16),
      'rel'.padEnd(6),
      'min'.padEnd(5),
      'tier'.padEnd(14),
      'lat'.padEnd(10),
      'lng'.padEnd(10),
      'hit',
    ].join(' '),
  )

  let wrote = 0
  let skipped = 0
  let failed = 0

  for (const doc of result.docs) {
    const existingGeo = hasGeo(doc)
    const existingWalk = doc.walkingMinutes != null
    const existingTier = doc.distanceTier != null

    if (!force && existingGeo && existingWalk && existingTier) {
      skipped++
      console.log(
        [
          doc.slug.padEnd(28),
          'skip-existing'.padEnd(16),
          '-'.padEnd(6),
          String(doc.walkingMinutes ?? '-').padEnd(5),
          String(doc.distanceTier ?? '-').padEnd(14),
          String(doc.geo?.latitude ?? '-').padEnd(10),
          String(doc.geo?.longitude ?? '-').padEnd(10),
          '(unchanged)',
        ].join(' '),
      )
      continue
    }

    const outcome = await enrichNeighbourhoodPlace({
      name: doc.name,
      address: doc.address,
    })

    // Nominatim ≤1 req/s; plus Mapbox Directions per place
    await sleep(1100)

    if (!outcome.ok) {
      failed++
      const action: Action =
        outcome.failure.reason === 'low-confidence' || outcome.failure.reason === 'outside-berlin'
          ? 'low-confidence'
          : 'failed'
      console.log(
        [
          doc.slug.padEnd(28),
          action.padEnd(16),
          (outcome.failure.relevance?.toFixed(2) ?? '-').padEnd(6),
          '-'.padEnd(5),
          '-'.padEnd(14),
          (outcome.failure.coords?.latitude?.toFixed(5) ?? '-').padEnd(10),
          (outcome.failure.coords?.longitude?.toFixed(5) ?? '-').padEnd(10),
          outcome.failure.message.slice(0, 60),
        ].join(' '),
      )
      continue
    }

    const { result: enrich } = outcome
    const action: Action = write ? 'wrote' : 'would-write'

    if (write) {
      const address = {
        streetAddress: doc.address?.streetAddress || enrich.streetAddress || undefined,
        addressLocality: doc.address?.addressLocality || 'Berlin',
        postalCode: doc.address?.postalCode || enrich.postalCode || undefined,
      }

      await payload.update({
        collection: 'neighbourhood-places',
        id: doc.id,
        data: {
          geo: {
            latitude: enrich.geo.latitude,
            longitude: enrich.geo.longitude,
          },
          walkingMinutes: force || !existingWalk ? enrich.walkingMinutes : doc.walkingMinutes,
          distanceTier: force || !existingTier ? enrich.distanceTier : doc.distanceTier,
          address,
        },
        overrideAccess: true,
      })
      wrote++
    }

    console.log(
      [
        doc.slug.padEnd(28),
        action.padEnd(16),
        enrich.relevance.toFixed(2).padEnd(6),
        String(enrich.walkingMinutes).padEnd(5),
        enrich.distanceTier.padEnd(14),
        enrich.geo.latitude.toFixed(5).padEnd(10),
        enrich.geo.longitude.toFixed(5).padEnd(10),
        enrich.placeName.slice(0, 50),
      ].join(' '),
    )
  }

  console.log(
    `\nDone. wrote=${wrote} skipped=${skipped} failed=${failed}${write ? '' : ' (dry-run — pass --write to apply)'}`,
  )
  process.exit(failed > 0 && wrote === 0 && skipped === 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
