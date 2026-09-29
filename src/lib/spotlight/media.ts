import type { Media } from '@/payload-types'
import {
  mediaAlt as resolveMediaAlt,
  mediaSizedUrl,
  mediaUrl as originalMediaUrl,
  type MediaImageSize,
} from '@/lib/media/url'

export type { MediaImageSize }

/** Prefer a named size when provided; otherwise the original. */
export function mediaUrl(
  image: number | Media | null | undefined,
  size?: MediaImageSize,
): string | null {
  if (size) return mediaSizedUrl(image, size)
  return originalMediaUrl(image)
}

export function mediaAlt(
  image: number | Media | null | undefined,
  fallback = '',
): string {
  return resolveMediaAlt(image, fallback)
}
