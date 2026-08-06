import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(dirname, 'assets/hero_map.png')
const filename = 'hero_map.png'

const force =
  process.argv.includes('--force') || process.env.HERO_MAP_SEED_FORCE === '1'

async function main() {
  const payload = await getPayload({ config })

  const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0 })
  if (hotel.heroMapImage && !force) {
    console.log('Skip: hotel.heroMapImage already set (use --force to replace)')
    process.exit(0)
  }

  let media = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!media || force) {
    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Map of Hotel Berlin, Berlin at Lützowplatz',
      },
      filePath,
    })
    console.log(`Uploaded media: ${filename} (id ${media.id})`)
  } else {
    console.log(`Reusing media: ${filename} (id ${media.id})`)
  }

  await payload.updateGlobal({
    slug: 'hotel',
    data: { heroMapImage: media.id as number },
  })

  console.log('Hotel heroMapImage updated.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
