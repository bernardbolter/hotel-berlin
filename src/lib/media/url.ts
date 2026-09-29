import type { Media } from '@/payload-types'

export type MediaImageSize = 'thumb' | 'card' | 'portrait' | 'hero' | 'og'

type MediaLike = {
  url?: string | null
  alt?: string | null
  sizes?: Partial<
    Record<MediaImageSize, { url?: string | null } | null | undefined>
  > | null
}

/**
 * Prefer a named Payload image size; fall back to the original URL when the
 * derivative is missing (e.g. before regenerate-sizes has run).
 */
export function mediaSizedUrl(
  image: MediaLike | Media | number | null | undefined,
  size: MediaImageSize,
): string | null {
  if (typeof image !== 'object' || !image) return null
  const sized = image.sizes?.[size]?.url
  if (typeof sized === 'string' && sized.length > 0) return sized
  return typeof image.url === 'string' && image.url.length > 0 ? image.url : null
}

export function mediaUrl(image: MediaLike | Media | number | null | undefined): string | null {
  if (typeof image !== 'object' || !image) return null
  return typeof image.url === 'string' && image.url.length > 0 ? image.url : null
}

export function mediaAlt(
  image: MediaLike | Media | number | null | undefined,
  fallback = '',
): string {
  if (typeof image === 'object' && image && 'alt' in image) {
    return image.alt || fallback
  }
  return fallback
}
