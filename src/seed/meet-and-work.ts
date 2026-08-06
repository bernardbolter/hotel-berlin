import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, 'assets/meet-and-work')

const force =
  process.argv.includes('--force') || process.env.MEET_AND_WORK_SEED_FORCE === '1'

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

/** Filename stem → display caption (hyphens/underscores → spaces, title case). */
function captionFromFilename(filename: string): string {
  const stem = path.parse(filename).name
  return stem
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const copy = {
  en: {
    kicker: 'Meet & Work',
    subhead: 'Serious business, playful spaces',
    body: 'Business is in our DNA. With over 4,000 m² of flexible conference and meeting spaces, cutting-edge event technology, and a dedicated team, we ensure everything from conferences to workshops runs smoothly — leaving space for ideas and connections to take the lead.',
    ctaLabel: 'All meeting rooms',
  },
  de: {
    kicker: 'Tagen & Arbeiten',
    subhead: 'Ernsthaftes Business, verspielte Räume',
    body: 'Business liegt in unserer DNA. Mit über 4.000 m² flexibler Konferenz- und Meetingflächen, modernster Eventtechnik und einem engagierten Team sorgen wir dafür, dass alles von Konferenzen bis Workshops reibungslos läuft — mit Raum für Ideen und Begegnungen.',
    ctaLabel: 'Alle Meetingräume',
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

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  })
  console.log(`Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function main() {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true })
    console.error(
      `No images yet. Drop photos into:\n  ${assetsDir}\nThen re-run: npm run seed:meet-and-work -- --force`,
    )
    process.exit(1)
  }

  const files = fs
    .readdirSync(assetsDir)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  if (files.length === 0) {
    console.error(
      `No images in ${assetsDir}. Add .jpg/.png/.webp files, then re-run npm run seed:meet-and-work -- --force`,
    )
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0, locale: 'en' })
  if ((hotel.meetAndWork?.slides?.length ?? 0) > 0 && !force) {
    console.log('Skip: hotel.meetAndWork.slides already set (use --force to replace)')
    process.exit(0)
  }

  const slidesMeta: { id: number; caption: string }[] = []
  for (const file of files) {
    const caption = captionFromFilename(file)
    const media = await uploadOrReuse(payload, path.join(assetsDir, file), caption)
    slidesMeta.push({ id: media.id as number, caption })
    console.log(`  caption: "${caption}"`)
  }

  // Same caption for EN + DE for now; both localized fields are set so they can diverge later in admin.
  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'en',
    data: {
      meetAndWork: {
        kicker: copy.en.kicker,
        subhead: copy.en.subhead,
        body: copy.en.body,
        ctaLabel: copy.en.ctaLabel,
        slides: slidesMeta.map(({ id, caption }) => ({
          image: id,
          imageAlt: caption,
          caption,
        })),
      },
    },
  })

  await payload.updateGlobal({
    slug: 'hotel',
    locale: 'de',
    data: {
      meetAndWork: {
        kicker: copy.de.kicker,
        subhead: copy.de.subhead,
        body: copy.de.body,
        ctaLabel: copy.de.ctaLabel,
        slides: slidesMeta.map(({ id, caption }) => ({
          image: id,
          imageAlt: caption,
          caption,
        })),
      },
    },
  })

  console.log(`Hotel meetAndWork updated with ${slidesMeta.length} slide(s) (en + de).`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
