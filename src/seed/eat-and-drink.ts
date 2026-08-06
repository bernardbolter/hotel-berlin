/**
 * Seed Hotel.eatAndDrink homepage teaser (copy + interior photo).
 *
 * Usage: npm run seed:eat-and-drink
 *        npm run seed:eat-and-drink -- --force
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, 'assets/food')
const interiorPath = path.join(assetsDir, 'interior.jpg')

const force =
  process.argv.includes('--force') || process.env.EAT_AND_DRINK_SEED_FORCE === '1'

const copy = {
  en: {
    kicker: 'Eat & Drink',
    heading: 'The place to eat, play, and hang all day.',
    body: "In the heart of the hotel — open to guests and Berliners alike. Breakfast from the counter. Lunch on the terrace. Cocktails until the city stops. Happy hour isn't a time slot. It's a state of mind.",
    ctaLabel: 'Eat & Drink',
    imageAlt: 'Lütze interior at Hotel Berlin, Berlin',
  },
  de: {
    kicker: 'Essen & Trinken',
    heading: 'Der Ort zum Essen, Spielen und Verweilen.',
    body: 'Im Herzen des Hotels — offen für Gäste und Berliner. Frühstück an der Theke. Mittagessen auf der Terrasse. Cocktails bis die Stadt schläft. Happy Hour ist kein Zeitfenster. Es ist eine Einstellung.',
    ctaLabel: 'Essen & Trinken',
    imageAlt: 'Lütze-Interieur im Hotel Berlin, Berlin',
  },
} as const

async function uploadOrReuse(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  alt: string,
) {
  const filename = path.basename(filePath)
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`Reusing media: ${filename} (id ${existing.id})`)
    return existing
  }

  if (existing && force) {
    // Re-upload as new file — keep it simple; overwrite reference on hotel global
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  })
  console.log(`Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function main() {
  if (!fs.existsSync(interiorPath)) {
    console.error(`Missing photo: ${interiorPath}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0, locale: 'en' })
  if (hotel.eatAndDrink?.image && !force) {
    console.log('Skip: hotel.eatAndDrink.image already set (use --force to replace)')
    process.exit(0)
  }

  const media = await uploadOrReuse(payload, interiorPath, copy.en.imageAlt)

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'en',
    data: {
      eatAndDrink: {
        kicker: copy.en.kicker,
        heading: copy.en.heading,
        body: copy.en.body,
        ctaLabel: copy.en.ctaLabel,
        image: media.id as number,
        imageAlt: copy.en.imageAlt,
      },
    },
  })
  console.log('✓ hotel.eatAndDrink (en)')

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'de',
    data: {
      eatAndDrink: {
        kicker: copy.de.kicker,
        heading: copy.de.heading,
        body: copy.de.body,
        ctaLabel: copy.de.ctaLabel,
        image: media.id as number,
        imageAlt: copy.de.imageAlt,
      },
    },
  })
  console.log('✓ hotel.eatAndDrink (de)')

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
