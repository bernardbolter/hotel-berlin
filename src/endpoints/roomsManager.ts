import sharp from 'sharp'
import type { Endpoint, PayloadRequest } from 'payload'

import { isStaffUser } from '@/access'
import { ROOMS_REVALIDATE_PATHS } from '@/endpoints/roomsReorder'
import { revalidateCms } from '@/lib/payload/revalidate'
import { plainRichText } from '@/lib/richText/plainRichText'
import { truncateWithEllipsis } from '@/lib/rooms/roomDescription'

const ROOM_IMAGE_MAX_BYTES = 20 * 1024 * 1024
/** Soft guidance only — uploads below this still succeed (UI shows a warning). */
export const ROOM_IMAGE_RECOMMENDED_WIDTH = 2000
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'])

const PENDING_ALT_DE = 'Bildbeschreibung fehlt'
const PENDING_ALT_EN = 'Alt text missing'

type ApiLocale = 'de' | 'en'

function apiLocale(req: PayloadRequest): ApiLocale {
  // Prefer Accept-Language from Rooms Manager client (matches admin UI language).
  const accept = req.headers.get('accept-language')?.toLowerCase() ?? ''
  if (accept.startsWith('en')) return 'en'
  if (accept.startsWith('de')) return 'de'
  const fromI18n = req.i18n?.language?.toLowerCase()
  if (fromI18n?.startsWith('en')) return 'en'
  return 'de'
}

const endpointCopy = {
  de: {
    unauthorized: 'Keine Berechtigung.',
    badRoomId: 'Ungültige Zimmer-ID.',
    badMultipart: 'Erwarte Multipart-Formulardaten.',
    noFiles: 'Keine Dateien.',
    badJson: 'Ungültiges JSON.',
    badIndex: 'Ungültiger Bildindex.',
    oneFile: 'Genau eine Datei erforderlich.',
    indexRange: 'Bildindex außerhalb des Bereichs.',
    mediaIdsUnique: 'mediaIds müssen eindeutig sein.',
    unknownMedia: (id: number) => `Unbekannte Media-ID am Zimmer: ${id}`,
    fieldNotAllowed: (key: string) => `Feld nicht erlaubt: ${key}`,
    saveFailed: 'Speichern fehlgeschlagen.',
    errType: 'Nur JPG, PNG, WebP oder HEIC sind erlaubt.',
    errSize: 'Die Datei ist größer als 20 MB.',
    errRead: 'Das Bild konnte nicht gelesen werden. Bitte JPG, PNG, WebP oder HEIC verwenden.',
    duplicateMedia: (room: string) => `Dieses Medium wird bereits in „${room}“ verwendet.`,
    duplicateFilename: (name: string, room: string) =>
      `Dateiname „${name}“ bereits in „${room}“ verwendet.`,
  },
  en: {
    unauthorized: 'Unauthorized.',
    badRoomId: 'Invalid room id.',
    badMultipart: 'Expected multipart form data.',
    noFiles: 'No files.',
    badJson: 'Invalid JSON.',
    badIndex: 'Invalid image index.',
    oneFile: 'Exactly one file required.',
    indexRange: 'Image index out of range.',
    mediaIdsUnique: 'mediaIds must be unique.',
    unknownMedia: (id: number) => `Unknown media id on room: ${id}`,
    fieldNotAllowed: (key: string) => `Field not allowed: ${key}`,
    saveFailed: 'Save failed.',
    errType: 'Only JPG, PNG, WebP or HEIC are allowed.',
    errSize: 'The file is larger than 20 MB.',
    errRead: 'Could not read the image. Please use JPG, PNG, WebP or HEIC.',
    duplicateMedia: (room: string) => `This media is already used in “${room}”.`,
    duplicateFilename: (name: string, room: string) =>
      `Filename “${name}” is already used in “${room}”.`,
  },
} as const

function unauthorized(req: PayloadRequest) {
  return Response.json({ error: endpointCopy[apiLocale(req)].unauthorized }, { status: 401 })
}

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 })
}

function roomIdFromReq(req: PayloadRequest): number | null {
  const raw = req.routeParams?.id
  const id = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : NaN
  return Number.isFinite(id) ? id : null
}

function imageIndexFromReq(req: PayloadRequest): number | null {
  const raw = req.routeParams?.index
  const index = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : NaN
  return Number.isFinite(index) && index >= 0 ? Math.floor(index) : null
}

async function withTransaction(
  req: PayloadRequest,
  run: () => Promise<Response>,
): Promise<Response> {
  const transactionID =
    typeof req.payload.db.beginTransaction === 'function'
      ? await req.payload.db.beginTransaction()
      : null
  if (transactionID) {
    ;(req as { transactionID?: string | number }).transactionID = transactionID
  }
  try {
    const response = await run()
    if (transactionID && typeof req.payload.db.commitTransaction === 'function') {
      await req.payload.db.commitTransaction(transactionID)
    }
    return response
  } catch (error) {
    if (transactionID && typeof req.payload.db.rollbackTransaction === 'function') {
      await req.payload.db.rollbackTransaction(transactionID)
    }
    console.error('[rooms-manager]', error)
    const message = error instanceof Error ? error.message : endpointCopy[apiLocale(req)].saveFailed
    return Response.json({ error: message }, { status: 500 })
  }
}

function mediaIdOf(row: RoomImageRow): number | null {
  if (typeof row.image === 'number') return row.image
  if (row.image && typeof row.image === 'object' && 'id' in row.image) return row.image.id
  return null
}

type RoomImageRow = {
  id?: string | null
  image: number | { id: number }
  alt?: string | null
  caption?: string | null
  shotType?: 'wide' | 'bed' | 'bath' | 'detail' | 'view' | null
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

async function prepareRoomImageFile(
  file: File,
  locale: ApiLocale,
): Promise<
  | { ok: true; buffer: Buffer; width: number; name: string; mimetype: string }
  | { ok: false; error: string }
> {
  const t = endpointCopy[locale]
  const mime = (file.type || '').toLowerCase()
  const ext = extOf(file.name)
  if (!ALLOWED_MIME.has(mime) && !ALLOWED_EXT.has(ext)) {
    return { ok: false, error: t.errType }
  }
  if (file.size > ROOM_IMAGE_MAX_BYTES) {
    return { ok: false, error: t.errSize }
  }

  const input = Buffer.from(await file.arrayBuffer())
  try {
    // EXIF auto-orient — smaller than 2000px is allowed (UI warns only).
    const rotated = await sharp(input).rotate().toBuffer({ resolveWithObject: true })
    const width = rotated.info.width ?? 0
    const outMime =
      mime === 'image/png'
        ? 'image/png'
        : mime === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg'
    let buffer = rotated.data
    let name = file.name
    if (outMime === 'image/jpeg' && !/\.jpe?g$/i.test(name)) {
      name = name.replace(/\.[^.]+$/, '') + '.jpg'
    }
    if (outMime === 'image/jpeg') {
      buffer = await sharp(rotated.data).jpeg({ quality: 90 }).toBuffer()
    }
    return { ok: true, buffer, width, name, mimetype: outMime }
  } catch {
    return { ok: false, error: t.errRead }
  }
}

async function loadRoomImages(
  req: PayloadRequest,
  roomId: number,
  locale: 'de' | 'en',
): Promise<RoomImageRow[]> {
  const room = await req.payload.findByID({
    collection: 'rooms',
    id: roomId,
    depth: 0,
    locale,
    overrideAccess: true,
    req,
  })
  return (room.images ?? []) as RoomImageRow[]
}

async function writeRoomImagesBothLocales(
  req: PayloadRequest,
  roomId: number,
  rowsEn: RoomImageRow[],
  rowsDe: RoomImageRow[],
): Promise<void> {
  const enPayload = rowsEn.map((row) => {
    const image = mediaIdOf(row)
    if (image == null) throw new Error('Room image row missing media id')
    return {
      ...(row.id ? { id: row.id } : {}),
      image,
      alt: (row.alt && String(row.alt).trim()) || PENDING_ALT_EN,
      caption: row.caption ?? null,
      shotType: row.shotType ?? null,
    }
  })

  const updated = (await req.payload.update({
    collection: 'rooms',
    id: roomId,
    data: { images: enPayload },
    depth: 0,
    locale: 'en',
    overrideAccess: true,
    context: { disableRevalidate: true },
    req,
  })) as { images?: RoomImageRow[] | null }

  const saved = (updated.images ?? []) as RoomImageRow[]
  const dePayload = saved.map((row, i) => {
    const image = mediaIdOf(row)
    if (image == null) throw new Error('Room image row missing media id')
    return {
      id: row.id,
      image,
      shotType: row.shotType ?? null,
      alt: (rowsDe[i]?.alt && String(rowsDe[i]!.alt).trim()) || PENDING_ALT_DE,
      caption: rowsDe[i]?.caption ?? null,
    }
  })

  await req.payload.update({
    collection: 'rooms',
    id: roomId,
    data: { images: dePayload },
    depth: 0,
    locale: 'de',
    overrideAccess: true,
    context: { disableRevalidate: true },
    req,
  })
}

async function createMediaFromPrepared(
  req: PayloadRequest,
  prepared: { buffer: Buffer; name: string; mimetype: string },
): Promise<number> {
  const media = await req.payload.create({
    collection: 'media',
    data: { alt: PENDING_ALT_EN },
    file: {
      data: prepared.buffer,
      mimetype: prepared.mimetype,
      name: prepared.name,
      size: prepared.buffer.length,
    },
    locale: 'en',
    overrideAccess: true,
    context: { disableRevalidate: true },
    req,
  })
  await req.payload.update({
    collection: 'media',
    id: media.id,
    data: { alt: PENDING_ALT_DE },
    locale: 'de',
    overrideAccess: true,
    context: { disableRevalidate: true },
    req,
  })
  return media.id
}

type DuplicateHit = { kind: 'media' | 'filename'; roomName: string; filename?: string }

async function findDuplicates(
  req: PayloadRequest,
  roomId: number,
  opts: { mediaId?: number; filename?: string },
): Promise<DuplicateHit[]> {
  const hits: DuplicateHit[] = []
  const all = await req.payload.find({
    collection: 'rooms',
    limit: 100,
    depth: 1,
    locale: 'en',
    overrideAccess: true,
    req,
  })

  for (const room of all.docs) {
    if (room.id === roomId) continue
    const images = (room.images ?? []) as Array<{
      image?: number | { id?: number; filename?: string | null } | null
    }>
    for (const row of images) {
      const img = row.image
      const mid = typeof img === 'number' ? img : img?.id
      const fname =
        typeof img === 'object' && img && 'filename' in img ? (img.filename ?? '') : ''
      if (opts.mediaId != null && mid === opts.mediaId) {
        hits.push({ kind: 'media', roomName: room.name || room.slug })
      }
      if (
        opts.filename &&
        fname &&
        fname.toLowerCase() === opts.filename.toLowerCase()
      ) {
        hits.push({
          kind: 'filename',
          roomName: room.name || room.slug,
          filename: fname,
        })
      }
    }
  }
  return hits
}

async function filesFromFormData(formData: FormData): Promise<File[]> {
  const files: File[] = []
  for (const [key, value] of formData.entries()) {
    if ((key === 'file' || key === 'files') && value instanceof File && value.size > 0) {
      files.push(value)
    }
  }
  return files
}

/**
 * POST /api/rooms/:id/images — multipart upload, append to rooms.images[].
 */
export const roomsImagesUploadEndpoint: Endpoint = {
  path: '/:id/images',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return unauthorized(req)
    const locale = apiLocale(req)
    const t = endpointCopy[locale]
    const roomId = roomIdFromReq(req)
    if (roomId == null) return badRequest(t.badRoomId)

    let formData: FormData
    try {
      formData = await req.formData!()
    } catch {
      return badRequest(t.badMultipart)
    }

    const files = await filesFromFormData(formData)
    if (files.length === 0) return badRequest(t.noFiles)

    return withTransaction(req, async () => {
      const existingEn = await loadRoomImages(req, roomId, 'en')
      const existingDe = await loadRoomImages(req, roomId, 'de')
      const warnings: string[] = []
      const appendedEn: RoomImageRow[] = [...existingEn]
      const appendedDe: RoomImageRow[] = [...existingDe]

      for (const file of files) {
        const prepared = await prepareRoomImageFile(file, locale)
        if (!prepared.ok) throw new Error(prepared.error)

        const mediaId = await createMediaFromPrepared(req, prepared)
        const dups = await findDuplicates(req, roomId, {
          mediaId,
          filename: prepared.name,
        })
        for (const d of dups) {
          if (d.kind === 'media') {
            warnings.push(t.duplicateMedia(d.roomName))
          } else {
            warnings.push(t.duplicateFilename(d.filename ?? prepared.name, d.roomName))
          }
        }

        appendedEn.push({
          image: mediaId,
          alt: PENDING_ALT_EN,
          caption: null,
          shotType: null,
        })
        appendedDe.push({
          image: mediaId,
          alt: PENDING_ALT_DE,
          caption: null,
          shotType: null,
        })
      }

      await writeRoomImagesBothLocales(req, roomId, appendedEn, appendedDe)
      await revalidateCms(req, ['rooms', 'media'], ROOMS_REVALIDATE_PATHS)

      return Response.json({
        ok: true,
        count: appendedEn.length,
        added: files.length,
        warnings,
      })
    })
  },
}

/**
 * POST /api/rooms/:id/images/replace
 * Body multipart: file + index (slot). Keeps position, cover, caption; resets focal + alt.
 */
export const roomsImagesReplaceEndpoint: Endpoint = {
  path: '/:id/images/replace',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return unauthorized(req)
    const locale = apiLocale(req)
    const t = endpointCopy[locale]
    const roomId = roomIdFromReq(req)
    if (roomId == null) return badRequest(t.badRoomId)

    let formData: FormData
    try {
      formData = await req.formData!()
    } catch {
      return badRequest(t.badMultipart)
    }

    const indexRaw = formData.get('index')
    const index = typeof indexRaw === 'string' ? Number(indexRaw) : NaN
    if (!Number.isFinite(index) || index < 0) {
      return badRequest(t.badIndex)
    }

    const files = await filesFromFormData(formData)
    if (files.length !== 1) return badRequest(t.oneFile)

    return withTransaction(req, async () => {
      const en = await loadRoomImages(req, roomId, 'en')
      const de = await loadRoomImages(req, roomId, 'de')
      if (index >= en.length) return badRequest(t.indexRange)

      const prepared = await prepareRoomImageFile(files[0]!, locale)
      if (!prepared.ok) return badRequest(prepared.error)

      const mediaId = await createMediaFromPrepared(req, prepared)
      // Reset focal to 50/50 (percent)
      await req.payload.update({
        collection: 'media',
        id: mediaId,
        data: { focalX: 50, focalY: 50 },
        depth: 0,
        overrideAccess: true,
        context: { disableRevalidate: true },
        req,
      })

      const warnings: string[] = []
      const dups = await findDuplicates(req, roomId, {
        mediaId,
        filename: prepared.name,
      })
      for (const d of dups) {
        if (d.kind === 'media') {
          warnings.push(t.duplicateMedia(d.roomName))
        } else {
          warnings.push(t.duplicateFilename(d.filename ?? prepared.name, d.roomName))
        }
      }

      const rowEn = en[index]!
      const rowDe = de[index] ?? en[index]!
      const nextEn = en.map((row, i) =>
        i === index
          ? {
              ...rowEn,
              image: mediaId,
              alt: PENDING_ALT_EN,
              // keep caption + shotType
              caption: rowEn.caption ?? null,
              shotType: rowEn.shotType ?? null,
            }
          : row,
      )
      const nextDe = de.map((row, i) =>
        i === index
          ? {
              ...rowDe,
              image: mediaId,
              alt: PENDING_ALT_DE,
              caption: rowDe.caption ?? null,
              shotType: rowDe.shotType ?? rowEn.shotType ?? null,
            }
          : row,
      )
      while (nextDe.length < nextEn.length) nextDe.push(nextEn[nextDe.length]!)

      await writeRoomImagesBothLocales(req, roomId, nextEn, nextDe)
      await revalidateCms(req, ['rooms', 'media'], ROOMS_REVALIDATE_PATHS)
      return Response.json({ ok: true, index, mediaId, warnings })
    })
  },
}

/**
 * POST /api/rooms/:id/images/reorder
 * Body: { mediaIds: number[] } — full ordered list (subset = removals).
 */
export const roomsImagesReorderEndpoint: Endpoint = {
  path: '/:id/images/reorder',
  method: 'post',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return unauthorized(req)
    const t = endpointCopy[apiLocale(req)]
    const roomId = roomIdFromReq(req)
    if (roomId == null) return badRequest(t.badRoomId)

    let body: { mediaIds?: number[] }
    try {
      body = (await req.json?.()) as { mediaIds?: number[] }
    } catch {
      return badRequest(t.badJson)
    }
    const mediaIds = Array.isArray(body.mediaIds)
      ? body.mediaIds.map(Number).filter((n) => Number.isFinite(n))
      : []
    if (new Set(mediaIds).size !== mediaIds.length) {
      return badRequest(t.mediaIdsUnique)
    }

    return withTransaction(req, async () => {
      const en = await loadRoomImages(req, roomId, 'en')
      const de = await loadRoomImages(req, roomId, 'de')
      const byMediaEn = new Map(
        en.map((row) => [mediaIdOf(row), row] as const).filter(([id]) => id != null),
      )
      const byMediaDe = new Map(
        de.map((row) => [mediaIdOf(row), row] as const).filter(([id]) => id != null),
      )

      for (const id of mediaIds) {
        if (!byMediaEn.has(id)) {
          return badRequest(t.unknownMedia(id))
        }
      }

      const nextEn = mediaIds.map((id) => byMediaEn.get(id)!)
      const nextDe = mediaIds.map((id) => byMediaDe.get(id) ?? byMediaEn.get(id)!)

      await writeRoomImagesBothLocales(req, roomId, nextEn, nextDe)
      await revalidateCms(req, ['rooms'], ROOMS_REVALIDATE_PATHS)
      return Response.json({ ok: true, mediaIds })
    })
  },
}

type ImagePatchBody = {
  altDe?: string
  altEn?: string
  captionDe?: string | null
  captionEn?: string | null
  shotType?: 'wide' | 'bed' | 'bath' | 'detail' | 'view' | null
  /** Focal as 0–100 percent (written to media as-is). */
  focalX?: number
  focalY?: number
  remove?: boolean
}

/**
 * PATCH /api/rooms/:id/images/:index
 */
export const roomsImagesPatchEndpoint: Endpoint = {
  path: '/:id/images/:index',
  method: 'patch',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return unauthorized(req)
    const t = endpointCopy[apiLocale(req)]
    const roomId = roomIdFromReq(req)
    const index = imageIndexFromReq(req)
    if (roomId == null || index == null) {
      return badRequest(t.badIndex)
    }

    let body: ImagePatchBody
    try {
      body = (await req.json?.()) as ImagePatchBody
    } catch {
      return badRequest(t.badJson)
    }

    return withTransaction(req, async () => {
      const en = await loadRoomImages(req, roomId, 'en')
      const de = await loadRoomImages(req, roomId, 'de')
      if (index >= en.length) return badRequest(t.indexRange)

      if (body.remove) {
        const nextEn = en.filter((_, i) => i !== index)
        const nextDe = de.filter((_, i) => i !== index)
        await writeRoomImagesBothLocales(req, roomId, nextEn, nextDe)
        await revalidateCms(req, ['rooms'], ROOMS_REVALIDATE_PATHS)
        return Response.json({ ok: true, removed: true })
      }

      const rowEn = { ...en[index]! }
      const rowDe = { ...(de[index] ?? en[index]!) }
      if (body.altEn != null) rowEn.alt = String(body.altEn).slice(0, 120)
      if (body.altDe != null) rowDe.alt = String(body.altDe).slice(0, 120)
      if (body.captionEn !== undefined) rowEn.caption = body.captionEn
      if (body.captionDe !== undefined) rowDe.caption = body.captionDe
      if (body.shotType !== undefined) {
        rowEn.shotType = body.shotType
        rowDe.shotType = body.shotType
      }

      const nextEn = en.map((row, i) => (i === index ? rowEn : row))
      const nextDe = de.map((row, i) => (i === index ? rowDe : row))
      while (nextDe.length < nextEn.length) {
        nextDe.push(nextEn[nextDe.length]!)
      }

      await writeRoomImagesBothLocales(req, roomId, nextEn, nextDe)

      const mid = mediaIdOf(rowEn)
      if (
        mid != null &&
        (typeof body.focalX === 'number' || typeof body.focalY === 'number')
      ) {
        const media = await req.payload.findByID({
          collection: 'media',
          id: mid,
          depth: 0,
          overrideAccess: true,
          req,
        })
        const focalX =
          typeof body.focalX === 'number'
            ? Math.min(100, Math.max(0, body.focalX))
            : (media.focalX ?? 50)
        const focalY =
          typeof body.focalY === 'number'
            ? Math.min(100, Math.max(0, body.focalY))
            : (media.focalY ?? 50)
        await req.payload.update({
          collection: 'media',
          id: mid,
          data: { focalX, focalY },
          depth: 0,
          overrideAccess: true,
          context: { disableRevalidate: true },
          req,
        })
      }

      await revalidateCms(req, ['rooms', 'media'], ROOMS_REVALIDATE_PATHS)
      return Response.json({ ok: true, index })
    })
  },
}

const QUICK_UPDATE_KEYS = new Set([
  'name',
  'description',
  'floorSizeM2',
  'fromPrice',
  'featured',
  'amenities',
  'maxGuests',
  'visibleOnSite',
])

type QuickUpdateBody = {
  name?: { de?: string; en?: string }
  /** Plain-text long description per locale (converted to Lexical on save). */
  description?: { de?: string; en?: string }
  floorSizeM2?: number | null
  fromPrice?: number | null
  featured?: boolean
  amenities?: number[]
  maxGuests?: number | null
  visibleOnSite?: boolean
}

/**
 * PATCH /api/rooms/:id/quick-update — whitelisted Details fields, both locales.
 */
export const roomsQuickUpdateEndpoint: Endpoint = {
  path: '/:id/quick-update',
  method: 'patch',
  handler: async (req) => {
    if (!isStaffUser(req.user)) return unauthorized(req)
    const t = endpointCopy[apiLocale(req)]
    const roomId = roomIdFromReq(req)
    if (roomId == null) return badRequest(t.badRoomId)

    let body: QuickUpdateBody
    try {
      body = (await req.json?.()) as QuickUpdateBody
    } catch {
      return badRequest(t.badJson)
    }

    for (const key of Object.keys(body)) {
      if (!QUICK_UPDATE_KEYS.has(key)) {
        return badRequest(t.fieldNotAllowed(key))
      }
    }

    return withTransaction(req, async () => {
      const roomEn = await req.payload.findByID({
        collection: 'rooms',
        id: roomId,
        depth: 0,
        locale: 'en',
        overrideAccess: true,
        req,
      })

      const shared: Record<string, unknown> = {}
      if (body.floorSizeM2 !== undefined) shared.floorSizeM2 = body.floorSizeM2
      if (body.fromPrice !== undefined) shared.fromPrice = body.fromPrice
      if (body.featured !== undefined) shared.featured = body.featured
      if (body.amenities !== undefined) shared.amenities = body.amenities
      if (body.visibleOnSite !== undefined) {
        shared.visibleOnSite = body.visibleOnSite
        if (body.visibleOnSite === false) {
          shared.homepageTeaser = {
            ...(typeof roomEn.homepageTeaser === 'object' && roomEn.homepageTeaser
              ? roomEn.homepageTeaser
              : {}),
            enabled: false,
          }
        }
      }
      if (body.maxGuests !== undefined) {
        shared.occupancy = {
          ...(typeof roomEn.occupancy === 'object' && roomEn.occupancy ? roomEn.occupancy : {}),
          maxTotal: body.maxGuests,
        }
      }

      const enDescription =
        body.description?.en != null ? String(body.description.en) : null
      const deDescription =
        body.description?.de != null ? String(body.description.de) : null

      await req.payload.update({
        collection: 'rooms',
        id: roomId,
        data: {
          ...shared,
          ...(body.name?.en != null ? { name: body.name.en } : {}),
          ...(enDescription != null
            ? {
                description: plainRichText(enDescription),
                // Keep shortDescription in sync for legacy consumers / meta caches.
                shortDescription: truncateWithEllipsis(enDescription),
              }
            : {}),
        },
        depth: 0,
        locale: 'en',
        overrideAccess: true,
        context: { disableRevalidate: true },
        req,
      })

      await req.payload.update({
        collection: 'rooms',
        id: roomId,
        data: {
          ...shared,
          ...(body.name?.de != null ? { name: body.name.de } : {}),
          ...(deDescription != null
            ? {
                description: plainRichText(deDescription),
                shortDescription: truncateWithEllipsis(deDescription),
              }
            : {}),
        },
        depth: 0,
        locale: 'de',
        overrideAccess: true,
        context: { disableRevalidate: true },
        req,
      })

      await revalidateCms(req, ['rooms'], ROOMS_REVALIDATE_PATHS)
      return Response.json({ ok: true })
    })
  },
}
