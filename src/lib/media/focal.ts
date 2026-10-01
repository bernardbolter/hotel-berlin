/**
 * Payload stores focalX/focalY as 0–1 fractions. Convert to CSS object-position.
 * Centre (50% 50%) when unset.
 */
export function focalToObjectPosition(
  focalX?: number | null,
  focalY?: number | null,
): string {
  if (focalX == null && focalY == null) return '50% 50%'
  const x = focalX == null ? 50 : focalX * 100
  const y = focalY == null ? 50 : focalY * 100
  return `${x}% ${y}%`
}

/** UI / AI use 0–100 percent; Payload media uses 0–1. */
export function percentToFocal(n: number): number {
  return Math.min(1, Math.max(0, n / 100))
}

export function focalToPercent(n: number | null | undefined): number {
  if (n == null || Number.isNaN(n)) return 50
  // Tolerate accidental 0–100 storage
  if (n > 1) return Math.min(100, Math.max(0, n))
  return Math.min(100, Math.max(0, n * 100))
}
