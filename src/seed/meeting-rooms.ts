import 'dotenv/config'
import './guard'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'
import { meetingRoomsSeed } from './data'
import { plainRichText } from './richText'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsRoot = path.resolve(dirname, 'assets/meet-and-work/meeting-rooms')

const force =
  process.argv.includes('--force') || process.env.MEETING_ROOMS_SEED_FORCE === '1'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

type MeetingRoomSeed = (typeof meetingRoomsSeed)[number] & {
  description?: { en: string; de: string }
}

function parseSlugFilter(): string | null {
  const slugArg = process.argv.find((arg) => arg.startsWith('--slug='))
  if (slugArg) return slugArg.slice('--slug='.length)

  const slugIndex = process.argv.indexOf('--slug')
  if (slugIndex !== -1 && process.argv[slugIndex + 1]) {
    return process.argv[slugIndex + 1]
  }

  return null
}

function listImageFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(dir, name))
}

async function uploadOrReuse(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  uniqueFilename: string,
  alt: string,
) {
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: uniqueFilename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`  reuse media ${uniqueFilename} (id ${existing.id})`)
    return existing.id as number
  }

  // Copy to a temp name so Payload stores a stable, unique filename.
  const tmpDir = path.join(dirname, '.tmp-meeting-room-images')
  fs.mkdirSync(tmpDir, { recursive: true })
  const tmpPath = path.join(tmpDir, uniqueFilename)
  fs.copyFileSync(filePath, tmpPath)

  try {
    if (existing && force) {
      await payload.delete({ collection: 'media', id: existing.id })
    }
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: tmpPath,
    })
    console.log(`  uploaded ${uniqueFilename} (id ${media.id})`)
    return media.id as number
  } finally {
    fs.rmSync(tmpPath, { force: true })
  }
}

async function main() {
  const slugFilter = parseSlugFilter()
  const rooms = (
    slugFilter
      ? meetingRoomsSeed.filter((room) => room.slug === slugFilter)
      : meetingRoomsSeed
  ) as MeetingRoomSeed[]

  if (slugFilter && rooms.length === 0) {
    throw new Error(`Unknown meeting room slug: ${slugFilter}`)
  }

  const payload = await getPayload({ config })

  for (const room of rooms) {
    console.log(`Meeting room: ${room.slug}`)

    let existing = (
      await payload.find({
        collection: 'meeting-rooms',
        where: { slug: { equals: room.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]

    if (!existing) {
      console.log(`  creating new document`)
      const created = await payload.create({
        collection: 'meeting-rooms',
        locale: 'en',
        data: {
          slug: room.slug,
          name: room.name.en,
          shortDescription: room.shortDescription.en,
          floorSizeM2: room.floorSizeM2,
          area: room.area,
          displayOrder: room.displayOrder,
          capacity: room.capacity,
          hasScreen: room.hasScreen,
          hasProjector: room.hasProjector,
          isDivisible: room.isDivisible,
          hasDaylight: room.hasDaylight,
          featured: room.featured ?? false,
        },
      })
      existing = created
    }

    const imageDir = path.join(assetsRoot, room.slug)
    const imageFiles = listImageFiles(imageDir)
    const imageIds: { image: number; alt: string }[] = []

    for (const filePath of imageFiles) {
      const base = path.basename(filePath)
      const uniqueFilename = `meeting-${room.slug}-${base}`
      const altEn = `${room.name.en} — ${path.parse(base).name.replace(/-/g, ' ')}`
      const id = await uploadOrReuse(payload, filePath, uniqueFilename, altEn)
      imageIds.push({ image: id, alt: altEn })
    }

    if (imageFiles.length === 0) {
      console.log(`  no images in ${imageDir}`)
    }

    const { combinableWith, name, shortDescription, description, ...rest } = room

    let combinableIds: number[] | undefined
    if (combinableWith?.length) {
      combinableIds = []
      for (const relatedSlug of combinableWith) {
        const related = (
          await payload.find({
            collection: 'meeting-rooms',
            where: { slug: { equals: relatedSlug } },
            limit: 1,
            depth: 0,
          })
        ).docs[0]
        if (related) combinableIds.push(related.id as number)
        else console.warn(`  combinableWith missing: ${relatedSlug}`)
      }
    }

    const enData: Record<string, unknown> = {
      ...rest,
      name: name.en,
      shortDescription: shortDescription.en,
      ...(description ? { description: plainRichText(description.en) } : {}),
      ...(combinableIds ? { combinableWith: combinableIds } : {}),
      ...(imageIds.length > 0
        ? {
            images: imageIds,
            teaserImage: imageIds[0].image,
          }
        : {}),
    }

    await payload.update({
      collection: 'meeting-rooms',
      id: existing.id,
      locale: 'en',
      data: enData,
    })

    await payload.update({
      collection: 'meeting-rooms',
      id: existing.id,
      locale: 'de',
      data: {
        name: name.de,
        shortDescription: shortDescription.de,
        ...(description ? { description: plainRichText(description.de) } : {}),
        ...(imageIds.length > 0
          ? {
              images: imageIds.map((entry, i) => ({
                image: entry.image,
                alt: `${room.name.de} — ${path.parse(path.basename(imageFiles[i])).name.replace(/-/g, ' ')}`,
              })),
            }
          : {}),
      },
    })

    console.log(
      `  updated id ${existing.id}` +
        (imageIds.length ? ` · ${imageIds.length} image(s)` : ''),
    )
  }

  // Clean temp dir if empty
  const tmpDir = path.join(dirname, '.tmp-meeting-room-images')
  if (fs.existsSync(tmpDir) && fs.readdirSync(tmpDir).length === 0) {
    fs.rmdirSync(tmpDir)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
