/**
 * One-off: copy Homepage global heroSlides → hero-slides collection,
 * with EN + DE altText / captionOverride, then clear the Homepage array.
 *
 * Usage: npx tsx src/seed/migrate-homepage-hero-to-collection.ts
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'

type LocalizedSlide = {
  id?: string | null
  image?: number | { id: number; url?: string | null; alt?: string | null } | null
  alt?: string | null
  caption?: string | null
  kbOrigin?: string | null
}

/** Fallback copy keyed by media filename when Homepage fields are thin */
const COPY_BY_FILENAME: Record<
  string,
  { adminTitle: string; alt: { en: string; de: string }; caption: { en: string; de: string } }
> = {
  'hbb-carousel-hm-centred2.jpg': {
    adminTitle: 'Courtyard',
    alt: {
      en: 'The inner courtyard of Hotel Berlin, Berlin — Lützowplatz 17, Tiergarten, with lush greenery and terrace seating',
      de: 'Der Innenhof des Hotel Berlin, Berlin — Lützowplatz 17, Tiergarten, mit viel Grün und Terrassenplätzen',
    },
    caption: {
      en: 'COURTYARD · TIERGARTEN',
      de: 'INNENHOF · TIERGARTEN',
    },
  },
  '0lui-tze-interior.jpg': {
    adminTitle: 'Lütze',
    alt: {
      en: 'Lütze bar and restaurant at Hotel Berlin, Berlin — warm interior with terracotta seating',
      de: 'Lütze Bar und Restaurant im Hotel Berlin, Berlin — warmes Interieur mit Terrakotta-Sitzmöbeln',
    },
    caption: {
      en: 'LÜTZE · GROUND FLOOR',
      de: 'LÜTZE · ERDGESCHOSS',
    },
  },
  'hbb-carousel-hm-centred7.jpg': {
    adminTitle: 'Rooms',
    alt: {
      en: 'A guest room at Hotel Berlin, Berlin — designed interior with artwork on the walls',
      de: 'Ein Gästezimmer im Hotel Berlin, Berlin — gestaltetes Interieur mit Kunst an den Wänden',
    },
    caption: {
      en: 'ROOMS · ON THE WALLS',
      de: 'ZIMMER · ON THE WALLS',
    },
  },
  'hbb-carousel-hm-centred4.jpg': {
    adminTitle: 'FKKB Gallery',
    alt: {
      en: 'FKKB gallery at Hotel Berlin, Berlin — exhibition space with large-scale contemporary artworks',
      de: 'FKKB Galerie im Hotel Berlin, Berlin — Ausstellungsraum mit großformatiger zeitgenössischer Kunst',
    },
    caption: {
      en: 'FKKB · GALLERY',
      de: 'FKKB · GALERIE',
    },
  },
}

function mediaId(image: LocalizedSlide['image']): number | null {
  if (typeof image === 'number') return image
  if (image && typeof image === 'object' && typeof image.id === 'number') return image.id
  return null
}

function mediaFilename(image: LocalizedSlide['image']): string | null {
  if (!image || typeof image === 'number') return null
  const url = image.url ?? ''
  const parts = url.split('/')
  return parts[parts.length - 1] || null
}

function pickCopy(
  enSlide: LocalizedSlide,
  deSlide: LocalizedSlide | undefined,
  filename: string | null,
) {
  const fallback = filename ? COPY_BY_FILENAME[filename] : undefined

  const altEn =
    enSlide.alt?.trim() ||
    fallback?.alt.en ||
    'Hotel Berlin, Berlin'
  const altDe =
    deSlide?.alt?.trim() ||
    fallback?.alt.de ||
    altEn
  const captionEn =
    enSlide.caption?.trim() ||
    fallback?.caption.en ||
    ''
  const captionDe =
    deSlide?.caption?.trim() ||
    fallback?.caption.de ||
    captionEn
  const adminTitle =
    fallback?.adminTitle ||
    captionEn ||
    filename ||
    `Hero slide`

  return { adminTitle, altEn, altDe, captionEn, captionDe }
}

async function migrate() {
  const force = process.argv.includes('--force')
  const payload = await getPayload({ config })

  const [enPage, dePage] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', locale: 'en', depth: 1 }),
    payload.findGlobal({ slug: 'homepage', locale: 'de', depth: 1 }),
  ])

  const enSlides = (enPage.heroSlides ?? []) as LocalizedSlide[]
  const deSlides = (dePage.heroSlides ?? []) as LocalizedSlide[]

  if (enSlides.length === 0) {
    console.log('No slides found on Homepage global — nothing to migrate.')
    process.exit(0)
  }

  const existing = await payload.find({
    collection: 'hero-slides',
    limit: 100,
    depth: 0,
  })

  if (existing.totalDocs > 0 && !force) {
    console.log(
      `Hero Slides already has ${existing.totalDocs} doc(s). Re-run with --force to replace them.`,
    )
    process.exit(1)
  }

  if (force && existing.docs.length > 0) {
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'hero-slides', id: doc.id })
    }
    console.log(`Cleared ${existing.docs.length} existing Hero Slide(s).`)
  }

  console.log(`Migrating ${enSlides.length} Homepage slide(s) → Hero Slides…`)

  for (const [index, enSlide] of enSlides.entries()) {
    const imageId = mediaId(enSlide.image)
    if (imageId == null) {
      console.warn(`  Skip slide ${index}: missing image`)
      continue
    }

    const deSlide = deSlides[index]
    const filename = mediaFilename(enSlide.image)
    const copy = pickCopy(enSlide, deSlide, filename)

    const doc = await payload.create({
      collection: 'hero-slides',
      locale: 'en',
      data: {
        adminTitle: copy.adminTitle,
        image: imageId,
        altText: copy.altEn,
        captionOverride: copy.captionEn,
        order: index,
        enabled: true,
      },
    })

    await payload.update({
      collection: 'hero-slides',
      id: doc.id,
      locale: 'de',
      data: {
        altText: copy.altDe,
        captionOverride: copy.captionDe,
      },
    })

    console.log(
      `  ✓ #${doc.id} order=${index} ${filename ?? imageId} — ${copy.captionEn} / ${copy.captionDe}`,
    )
  }

  // Clear legacy Homepage array so editors only use Hero Slides
  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'en',
    data: { heroSlides: [] },
  })
  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'de',
    data: { heroSlides: [] },
  })

  console.log('Cleared Homepage.heroSlides (EN + DE). Migration done.')
  process.exit(0)
}

migrate().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
