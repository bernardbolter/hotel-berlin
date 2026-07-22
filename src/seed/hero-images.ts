import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'
import heroSlidesSeed from './data/hero-slides.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

type HeroSlideSeed = {
  file: string
  assetsSubpath?: string
  alt: { en: string; de: string }
  caption: { en: string; de: string }
  kbOrigin?: 'bottom-left' | 'top-right' | 'top-left' | 'bottom-right'
}

const { assetsSubpath: defaultSubpath, slides } = heroSlidesSeed as {
  assetsSubpath: string
  slides: HeroSlideSeed[]
}

function resolveAssetsRoot(): string {
  const fromEnv = process.env.HERO_ASSETS_DIR?.trim() || process.env.ROOM_ASSETS_DIR?.trim()
  if (fromEnv) return path.resolve(fromEnv)

  const candidates = [
    path.resolve(__dirname, 'assets/scraped'),
    path.resolve(__dirname, '../../../hotel-berlin.de/current_hotel_berlin_website_assets'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, defaultSubpath))) return candidate
  }

  throw new Error(
    'Hero assets not found. Copy scraped assets to src/seed/assets/scraped or set HERO_ASSETS_DIR.',
  )
}

function resolveImagePath(assetsRoot: string, slide: HeroSlideSeed): string {
  const subpath = slide.assetsSubpath ?? defaultSubpath
  const filePath = path.join(assetsRoot, subpath, slide.file)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Hero image not found: ${filePath}`)
  }
  return filePath
}

async function seedHeroImages() {
  const force = process.argv.includes('--force') || process.env.SEED_HERO_IMAGES_FORCE === '1'
  const assetsRoot = resolveAssetsRoot()

  console.log(`Using hero assets from: ${assetsRoot}`)

  const payload = await getPayload({ config })

  const existingCollection = await payload.find({
    collection: 'hero-slides',
    limit: 1,
    depth: 0,
  })

  if (existingCollection.totalDocs > 0 && !force) {
    console.log(
      `Skip: hero-slides already has ${existingCollection.totalDocs} slide(s) (use --force to replace)`,
    )
    process.exit(0)
  }

  if (force && existingCollection.totalDocs > 0) {
    const all = await payload.find({
      collection: 'hero-slides',
      limit: 100,
      depth: 0,
    })
    for (const doc of all.docs) {
      await payload.delete({ collection: 'hero-slides', id: doc.id })
    }
    console.log(`Cleared ${all.docs.length} existing hero-slides.`)
  }

  for (const [index, slide] of slides.entries()) {
    const filePath = resolveImagePath(assetsRoot, slide)
    const media = await payload.create({
      collection: 'media',
      data: { alt: slide.alt.en },
      filePath,
    })

    const doc = await payload.create({
      collection: 'hero-slides',
      locale: 'en',
      data: {
        adminTitle: slide.caption.en,
        image: media.id,
        altText: slide.alt.en,
        captionOverride: slide.caption.en,
        order: index,
        enabled: true,
      },
    })

    await payload.update({
      collection: 'hero-slides',
      id: doc.id,
      locale: 'de',
      data: {
        altText: slide.alt.de,
        captionOverride: slide.caption.de,
      },
    })

    console.log(`  Seeded: ${slide.file}`)
  }

  // Also keep legacy homepage global in sync for migration safety
  const collectionDocs = await payload.find({
    collection: 'hero-slides',
    limit: 50,
    sort: 'order',
    depth: 0,
    locale: 'en',
  })

  const heroSlidesEn = collectionDocs.docs.map((doc) => ({
    image: typeof doc.image === 'object' ? doc.image?.id : doc.image,
    alt: doc.altText ?? '',
    caption: doc.captionOverride ?? '',
    kbOrigin: 'bottom-left' as const,
  }))

  await payload.updateGlobal({
    slug: 'homepage',
    data: { heroSlides: heroSlidesEn },
    locale: 'en',
  })

  const collectionDocsDe = await payload.find({
    collection: 'hero-slides',
    limit: 50,
    sort: 'order',
    depth: 0,
    locale: 'de',
  })

  const heroSlidesDe = collectionDocsDe.docs.map((doc) => ({
    image: typeof doc.image === 'object' ? doc.image?.id : doc.image,
    alt: doc.altText ?? '',
    caption: doc.captionOverride ?? '',
    kbOrigin: 'bottom-left' as const,
  }))

  await payload.updateGlobal({
    slug: 'homepage',
    data: { heroSlides: heroSlidesDe },
    locale: 'de',
  })

  console.log(`Hero slides: ${slides.length} slide(s) seeded to hero-slides + homepage global.`)
  process.exit(0)
}

seedHeroImages().catch((error) => {
  console.error('Hero images seed failed:', error)
  process.exit(1)
})
