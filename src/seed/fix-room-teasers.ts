/**
 * Assign a distinct preferred teaser image per room (scraped folders reused the same
 * superior photo across types). Sets homepageTeaser.enabled/order/teaserImage.
 *
 * Usage: npx tsx src/seed/fix-room-teasers.ts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'
import roomImageSources from './data/room-image-sources.json'
import roomsSeed from './data/rooms.json'
import type { RoomSeedRecord } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsRoot = path.resolve(__dirname, 'assets/scraped')
const rooms = roomsSeed as RoomSeedRecord[]
const preferred = roomImageSources.preferredTeasers as Record<
  string,
  { relativePath: string; hints?: string[] }
>

async function findMediaByFilename(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fileName: string,
) {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: fileName } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

async function main() {
  const payload = await getPayload({ config })

  for (const room of rooms) {
    const pref = preferred[room.slug]
    if (!pref) {
      console.warn(`  Skip ${room.slug}: no preferredTeaser mapping`)
      continue
    }

    const absolute = path.join(assetsRoot, pref.relativePath)
    if (!fs.existsSync(absolute)) {
      console.warn(`  Skip ${room.slug}: missing file ${absolute}`)
      continue
    }

    const fileName = path.basename(absolute)
    let media = await findMediaByFilename(payload, fileName)

    if (!media) {
      media = await payload.create({
        collection: 'media',
        data: { alt: `${room.name.en} teaser` },
        filePath: absolute,
      })
      console.log(`  Uploaded ${fileName} for ${room.slug}`)
    }

    const existing = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: room.slug } },
      limit: 1,
      depth: 0,
    })
    const roomDoc = existing.docs[0]
    if (!roomDoc) {
      console.warn(`  Skip ${room.slug}: room not in database`)
      continue
    }

    await payload.update({
      collection: 'rooms',
      id: roomDoc.id,
      data: {
        homepageTeaser: {
          enabled: true,
          order: room.displayOrder,
          teaserImage: media.id,
        },
      },
    })

    console.log(`  ${room.slug}: teaser → ${fileName} (order ${room.displayOrder})`)
  }

  console.log('Room teasers updated.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
