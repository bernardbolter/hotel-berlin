/** Reject stock / CDN stand-in photographs — empty states are designed, not stock. */
export function isRejectedMediaUrl(src: string | null | undefined): boolean {
  if (!src) return true
  const lower = src.toLowerCase()
  return (
    lower.includes('picsum.photos') ||
    lower.includes('images.unsplash.com') ||
    lower.includes('unsplash.com') ||
    lower.includes('upload.wikimedia.org') ||
    lower.includes('commons.wikimedia.org') ||
    lower.includes('blob.vercel-storage.com')
  )
}

export function safeMediaUrl(src: string | null | undefined): string | null {
  if (!src || isRejectedMediaUrl(src)) return null
  return src
}
