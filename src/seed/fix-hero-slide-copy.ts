/**
 * Fill EN + DE altText / captionOverride on existing hero-slides.
 * Usage: npx tsx src/seed/fix-hero-slide-copy.ts
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'

const COPY = [
  {
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
  {
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
  {
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
  {
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
] as const

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'hero-slides',
    sort: 'order',
    limit: 50,
    depth: 0,
    locale: 'en',
  })

  for (const [index, doc] of docs.entries()) {
    const copy = COPY[index]
    if (!copy) {
      console.warn(`No copy for slide order=${doc.order} id=${doc.id}`)
      continue
    }

    await payload.update({
      collection: 'hero-slides',
      id: doc.id,
      locale: 'en',
      data: {
        adminTitle: copy.adminTitle,
        altText: copy.alt.en,
        captionOverride: copy.caption.en,
      },
    })

    await payload.update({
      collection: 'hero-slides',
      id: doc.id,
      locale: 'de',
      data: {
        altText: copy.alt.de,
        captionOverride: copy.caption.de,
      },
    })

    console.log(`Updated #${doc.id}: ${copy.caption.en} / ${copy.caption.de}`)
  }

  const checkEn = await payload.find({
    collection: 'hero-slides',
    sort: 'order',
    locale: 'en',
    depth: 0,
  })
  const checkDe = await payload.find({
    collection: 'hero-slides',
    sort: 'order',
    locale: 'de',
    depth: 0,
  })

  console.log('\nEN:')
  for (const d of checkEn.docs) {
    console.log(`  ${d.order} ${d.captionOverride}`)
    console.log(`     alt: ${d.altText}`)
  }
  console.log('\nDE:')
  for (const d of checkDe.docs) {
    console.log(`  ${d.order} ${d.captionOverride}`)
    console.log(`     alt: ${d.altText}`)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
