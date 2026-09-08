/**
 * Clone existing homepage hero-slides into context: 'here' (same media, no re-upload).
 *
 * Safe to re-run: skips when /here slides already exist unless --force.
 *
 * Usage: pnpm exec tsx src/seed/here-hero-slides.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

async function seed() {
  const force = process.argv.includes('--force')
  const payload = await getPayload({ config })

  const existingHere = await payload.find({
    collection: 'hero-slides',
    where: { context: { equals: 'here' } },
    limit: 1,
    depth: 0,
  })

  if (existingHere.totalDocs > 0 && !force) {
    console.log(
      `Skip: ${existingHere.totalDocs} /here hero-slide(s) already exist (use --force to replace)`,
    )
    process.exit(0)
  }

  if (force && existingHere.totalDocs > 0) {
    const allHere = await payload.find({
      collection: 'hero-slides',
      where: { context: { equals: 'here' } },
      limit: 100,
      depth: 0,
    })
    for (const doc of allHere.docs) {
      await payload.delete({ collection: 'hero-slides', id: doc.id })
    }
    console.log(`Cleared ${allHere.docs.length} existing /here hero-slides.`)
  }

  const homepage = await payload.find({
    collection: 'hero-slides',
    where: {
      or: [{ context: { equals: 'homepage' } }, { context: { exists: false } }],
    },
    limit: 50,
    sort: 'order',
    depth: 0,
    locale: 'en',
  })

  if (homepage.docs.length === 0) {
    console.warn('No homepage hero-slides to clone. Run seed:hero-images first.')
    process.exit(1)
  }

  for (const doc of homepage.docs) {
    const imageId = typeof doc.image === 'object' ? doc.image?.id : doc.image
    const venueId = typeof doc.venue === 'object' ? doc.venue?.id : doc.venue

    const hereDoc = await payload.create({
      collection: 'hero-slides',
      locale: 'en',
      data: {
        adminTitle: `${doc.adminTitle ?? 'Slide'} (/here)`,
        image: imageId,
        altText: doc.altText ?? '',
        captionOverride: doc.captionOverride ?? undefined,
        venue: venueId ?? undefined,
        credit: doc.credit ?? undefined,
        order: doc.order,
        enabled: true,
        context: 'here',
      },
    })

    const deDoc = await payload.findByID({
      collection: 'hero-slides',
      id: doc.id,
      locale: 'de',
      depth: 0,
    })

    await payload.update({
      collection: 'hero-slides',
      id: hereDoc.id,
      locale: 'de',
      data: {
        altText: deDoc.altText ?? doc.altText ?? '',
        captionOverride: deDoc.captionOverride ?? doc.captionOverride ?? undefined,
      },
    })

    console.log(`✓ /here slide ${hereDoc.id} ← homepage ${doc.id} (${doc.adminTitle})`)
  }

  console.log(
    `Done: ${homepage.docs.length} /here-context slide(s) cloned from homepage photos.`,
  )
  process.exit(0)
}

seed().catch((error) => {
  console.error('here-hero-slides seed failed:', error)
  process.exit(1)
})
