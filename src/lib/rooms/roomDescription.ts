import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'

/** Max length for teaser / meta / card copy derived from the long description. */
export const ROOM_SHORT_DESCRIPTION_MAX = 160

/**
 * Truncate plain text at `max` characters with an ellipsis.
 * Prefers a word boundary when the cut would land mid-word.
 */
export function truncateWithEllipsis(
  text: string,
  max = ROOM_SHORT_DESCRIPTION_MAX,
): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  if (normalized.length <= max) return normalized

  const budget = Math.max(1, max - 1)
  const cut = normalized.slice(0, budget).trimEnd()
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > budget * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${base}…`
}

/**
 * Prefer the long rich-text description, truncated for teaser contexts.
 * Falls back to legacy `shortDescription` when long copy is empty.
 */
export function roomTeaserDescription(room: {
  description?: unknown
  shortDescription?: string | null
}): string {
  const fromLong = lexicalToPlain(room.description)
  if (fromLong) return truncateWithEllipsis(fromLong)
  return room.shortDescription?.trim() ?? ''
}
