/**
 * A borrowed row is a design element with a fixed shape.
 * Return exactly `limit` items, or nothing — never a partial row.
 */
export function takeFilledRow<T>(items: readonly T[], limit = 3): T[] {
  if (items.length < limit) return []
  return items.slice(0, limit)
}
