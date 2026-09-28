/** Reject random stock placeholders — grey name-block is the correct empty state. */
export function isRejectedMediaUrl(src: string | null | undefined): boolean {
  if (!src) return true
  return src.includes('picsum.photos')
}

export function safeMediaUrl(src: string | null | undefined): string | null {
  if (!src || isRejectedMediaUrl(src)) return null
  return src
}
