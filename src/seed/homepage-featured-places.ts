/**
 * Assign homepageTeaser / hereTeaser on curated neighbourhood-places.
 * Also keeps legacy featuredOrder in sync for the transitional fallback.
 *
 * Usage: pnpm exec tsx src/seed/homepage-featured-places.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Homepage teaser — first 5 (order 1–5).
 * Prefer walkable / near-hotel picks that exist in the current neighbourhood seed.
 */
const HOMEPAGE_TEASER_SLUGS = [
  'neue-nationalgalerie',
  'kaethe-kollwitz-museum',
  'hamburger-bahnhof',
  'koenig-galerie',
  '893-ryotei-bar',
] as const

/** /here teaser — independently curated set. */
const HERE_TEASER_SLUGS = [
  '893-ryotei-bar',
  'hamburger-bahnhof',
  'koenig-galerie',
  'schloss-charlottenburg',
  'anjoy',
] as const

/** Legacy featuredOrder 1–15 (pagination fallback / migration). */
const FEATURED_SLUGS = [
  ...HOMEPAGE_TEASER_SLUGS,
  'schloss-charlottenburg',
  'anjoy',
  'britzer-garten',
] as const

async function clearTeaserFlags(
  payload: Awaited<ReturnType<typeof getPayload>>,
  field: 'homepageTeaser' | 'hereTeaser' | 'featuredOrder',
) {
  if (field === 'featuredOrder') {
    const previouslyFeatured = await payload.find({
      collection: 'neighbourhood-places',
      where: { featuredOrder: { exists: true } },
      limit: 200,
      depth: 0,
    })
    for (const doc of previouslyFeatured.docs) {
      await payload.update({
        collection: 'neighbourhood-places',
        id: doc.id,
        data: { featuredOrder: null },
        overrideAccess: true,
      })
    }
    return
  }

  const enabled = await payload.find({
    collection: 'neighbourhood-places',
    where: { [`${field}.enabled`]: { equals: true } },
    limit: 200,
    depth: 0,
  })
  for (const doc of enabled.docs) {
    await payload.update({
      collection: 'neighbourhood-places',
      id: doc.id,
      data: { [field]: { enabled: false, order: null } },
      overrideAccess: true,
    })
  }
}

async function setTeaser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slugs: readonly string[],
  field: 'homepageTeaser' | 'hereTeaser',
) {
  console.log(`--- Setting ${field} on ${slugs.length} places ---`)
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const order = i + 1
    const existing = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const doc = existing.docs[0]
    if (!doc) {
      console.warn(`✗ missing place slug=${slug} — skip`)
      continue
    }
    await payload.update({
      collection: 'neighbourhood-places',
      id: doc.id,
      data: { [field]: { enabled: true, order } },
      overrideAccess: true,
    })
    console.log(`✓ ${field} ${order}. ${slug}`)
  }
}

async function seed() {
  const payload = await getPayload({ config })

  console.log('--- Clearing existing teaser / featuredOrder flags ---')
  await clearTeaserFlags(payload, 'homepageTeaser')
  await clearTeaserFlags(payload, 'hereTeaser')
  await clearTeaserFlags(payload, 'featuredOrder')

  await setTeaser(payload, HOMEPAGE_TEASER_SLUGS, 'homepageTeaser')
  await setTeaser(payload, HERE_TEASER_SLUGS, 'hereTeaser')

  // KaDeWe is one of 5 homepage teaser places — populate transit so the card row isn't empty.
  const kadewe = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: 'kadewe' } },
    limit: 1,
    depth: 0,
  })
  if (kadewe.docs[0]) {
    await payload.update({
      collection: 'neighbourhood-places',
      id: kadewe.docs[0].id,
      data: {
        transit: { minutes: 6, station: 'Wittenbergplatz', line: 'U1' },
      },
      overrideAccess: true,
    })
    console.log('✓ transit on kadewe')
  } else {
    console.warn('✗ missing place slug=kadewe — skip transit')
  }

  console.log(`--- Setting legacy featuredOrder on ${FEATURED_SLUGS.length} places ---`)
  for (let i = 0; i < FEATURED_SLUGS.length; i++) {
    const slug = FEATURED_SLUGS[i]
    const order = i + 1
    const existing = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const doc = existing.docs[0]
    if (!doc) {
      console.warn(`✗ missing place slug=${slug} — skip`)
      continue
    }
    await payload.update({
      collection: 'neighbourhood-places',
      id: doc.id,
      data: { featuredOrder: order },
      overrideAccess: true,
    })
    console.log(`✓ featuredOrder ${order}. ${slug}`)
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
