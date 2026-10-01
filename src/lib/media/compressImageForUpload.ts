import {
  MEDIA_JPEG_QUALITY,
  MEDIA_MASTER_EDGE,
  MEDIA_MAX_FILE_SIZE,
} from './limits'
import { readExifGps, readExifOrientation, type ExifGps } from './exifGps'
import { stripGpsFromJpeg } from './stripGpsFromJpeg'

export class MediaImageTooSmallError extends Error {
  readonly longEdge: number

  constructor(longEdge: number) {
    super(
      `Image too small: long edge is ${longEdge}px, need at least ${MEDIA_MASTER_EDGE}px for the hero size.`,
    )
    this.name = 'MediaImageTooSmallError'
    this.longEdge = longEdge
  }
}

export type PreparedUploadImage = {
  file: File
  /** GPS read from the phone original before it was stripped. */
  gps: ExifGps | null
  /** Long edge in px after orientation bake, when the browser could decode the image. */
  longEdge?: number
}

/**
 * Prepare a phone original for storage:
 * - read EXIF GPS first (for the outdoor location offer)
 * - reject if long edge < 2880 (F3 hero) when required
 * - downscale to 2880 only when larger
 * - bake EXIF orientation into pixels when re-encoding (portrait phones stay upright)
 * - strip GPS from the stored original; other EXIF may remain when we only strip
 * - JPEG at MEDIA_JPEG_QUALITY; drop quality (not pixels) if over the byte cap
 */
export async function compressImageForUpload(
  file: File,
  options: { requireMasterEdge?: boolean } = { requireMasterEdge: true },
): Promise<PreparedUploadImage> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return { file, gps: null }
  }

  const gps = await readExifGps(file)
  const orientation = await readExifOrientation(file)

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(
      file,
      // Bake EXIF orientation so portrait phone shots stay upright.
      { imageOrientation: 'from-image' } as unknown as ImageBitmapOptions,
    )
  } catch {
    // HEIC / unsupported decode — fall through; size / dimension gates may reject later.
    const stripped = await maybeStripGpsOnly(file)
    return { file: stripped, gps }
  }

  try {
    const { width, height } = bitmap
    const longEdge = Math.max(width, height)

    if (options.requireMasterEdge !== false && longEdge < MEDIA_MASTER_EDGE) {
      throw new MediaImageTooSmallError(longEdge)
    }

    const scale = longEdge > MEDIA_MASTER_EDGE ? MEDIA_MASTER_EDGE / longEdge : 1
    const needsReencode =
      scale !== 1 ||
      file.size > MEDIA_MAX_FILE_SIZE ||
      file.type !== 'image/jpeg' ||
      orientation !== 1

    if (!needsReencode) {
      // Keep other EXIF; remove GPS only.
      const stripped = await maybeStripGpsOnly(file)
      return { file: stripped, gps, longEdge }
    }

    const targetW = Math.max(1, Math.round(width * scale))
    const targetH = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      const stripped = await maybeStripGpsOnly(file)
      return { file: stripped, gps }
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)

    const qualities = [MEDIA_JPEG_QUALITY, 0.75, 0.68, 0.6]
    let blob: Blob | null = null
    for (const q of qualities) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', q)
      })
      if (blob && blob.size <= MEDIA_MAX_FILE_SIZE) break
    }
    if (!blob) {
      const stripped = await maybeStripGpsOnly(file)
      return { file: stripped, gps }
    }

    const base = file.name.replace(/\.[^.]+$/, '') || 'photo'
    // Canvas JPEG has no EXIF → GPS already gone; orientation is baked in.
    return {
      file: new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }),
      gps,
      longEdge: Math.max(targetW, targetH),
    }
  } finally {
    bitmap.close()
  }
}

async function maybeStripGpsOnly(file: File): Promise<File> {
  if (file.type !== 'image/jpeg' && !/\.jpe?g$/i.test(file.name)) {
    return file
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const stripped = stripGpsFromJpeg(bytes)
    if (stripped === bytes || sameBytes(stripped, bytes)) return file
    return new File([stripped], file.name, {
      type: file.type || 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}
