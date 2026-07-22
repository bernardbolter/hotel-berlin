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
const rooms = roomsSeed as RoomSeedRecord[]

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const SKIP_FILENAMES = new Set(['unknown.jpg'])

function resolveAssetsRoot(): string {
  const fromEnv = process.env.ROOM_ASSETS_DIR?.trim()
  if (fromEnv) return path.resolve(fromEnv)

  const candidates = [
    path.resolve(__dirname, 'assets/scraped'),
    path.resolve(__dirname, '../../../hotel-berlin.de/current_hotel_berlin_website_assets'),
    path.resolve(__dirname, 'assets/rooms'),
  ]

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue

    if (isScrapedLayout(candidate)) return candidate

    const slugDirs = fs
      .readdirSync(candidate, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    if (slugDirs.length > 0) return candidate
  }

  throw new Error(
    'Room assets not found. Copy scraped assets to src/seed/assets/scraped or src/seed/assets/rooms/{slug}/, or set ROOM_ASSETS_DIR.',
  )
}

function isScrapedLayout(assetsRoot: string): boolean {
  return fs.existsSync(
    path.join(assetsRoot, roomImageSources.assetsSubpath),
  )
}

function resolveRoomImageDir(assetsRoot: string, slug: string): string | null {
  const bySlug = path.join(assetsRoot, slug)
  if (fs.existsSync(bySlug)) return bySlug

  const scrapedFolder = roomImageSources.rooms[slug as keyof typeof roomImageSources.rooms]
  if (!scrapedFolder) return null

  const scrapedImages = path.join(
    assetsRoot,
    roomImageSources.assetsSubpath,
    scrapedFolder,
    'images',
  )
  if (fs.existsSync(scrapedImages)) return scrapedImages

  return null
}

function listRoomImageFiles(dir: string): string[] {
  const files = fs
    .readdirSync(dir)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase()
      if (!IMAGE_EXTENSIONS.has(ext)) return false
      if (SKIP_FILENAMES.has(name.toLowerCase())) return false
      return true
    })
    .map((name) => path.join(dir, name))

  return files.sort((a, b) => imageSortKey(a).localeCompare(imageSortKey(b)))
}

function imageSortKey(filePath: string): string {
  const base = path.basename(filePath).toLowerCase()
  const rank =
    base.includes('-thumb') ? '2' : base.startsWith('hbb-') ? '0' : '1'
  return `${rank}-${base}`
}

async function seedRoomImages() {
  const force = process.argv.includes('--force') || process.env.SEED_ROOM_IMAGES_FORCE === '1'
  const assetsRoot = resolveAssetsRoot()
  const scraped = isScrapedLayout(assetsRoot)

  console.log(`Using room assets from: ${assetsRoot}`)
  console.log(`Layout: ${scraped ? 'scraped site folders' : 'slug folders'}`)

  const payload = await getPayload({ config })

  for (const room of rooms) {
    const imageDir = resolveRoomImageDir(assetsRoot, room.slug)
    if (!imageDir) {
      console.warn(`  Skip ${room.slug}: no image folder found`)
      continue
    }

    const imageFiles = listRoomImageFiles(imageDir)
    if (imageFiles.length === 0) {
      console.warn(`  Skip ${room.slug}: no usable images in ${imageDir}`)
      continue
    }

    const existing = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: room.slug } },
      depth: 0,
      limit: 1,
    })

    const roomDoc = existing.docs[0]
    if (!roomDoc) {
      console.warn(`  Skip ${room.slug}: room not in database (run npm run seed:rooms first)`)
      continue
    }

    if (roomDoc.images?.length && !force) {
      console.log(`  Skip ${room.slug}: already has ${roomDoc.images.length} image(s) (use --force to replace)`)
      continue
    }

    const altBase = room.name.en
    const images = []

    for (const filePath of imageFiles) {
      const fileName = path.basename(filePath)
      const alt =
        imageFiles.length === 1
          ? altBase
          : `${altBase} — ${fileName.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}`

      const media = await payload.create({
        collection: 'media',
        data: { alt },
        filePath,
      })

      images.push({
        image: media.id,
        alt,
      })
    }

    await payload.update({
      collection: 'rooms',
      id: roomDoc.id,
      data: { images },
    })

    console.log(`  ${room.slug}: uploaded ${images.length} image(s)`)
  }

  console.log('Room images seed complete.')
  process.exit(0)
}

seedRoomImages().catch((error) => {
  console.error('Room images seed failed:', error)
  process.exit(1)
})
