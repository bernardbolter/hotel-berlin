import type { Media } from '@/payload-types'

export function mediaUrl(image: number | Media | null | undefined): string | null {
  return typeof image === 'object' && image && 'url' in image && image.url ? image.url : null
}

export function mediaAlt(
  image: number | Media | null | undefined,
  fallback = '',
): string {
  if (typeof image === 'object' && image && 'alt' in image) {
    return image.alt || fallback
  }
  return fallback
}
