export type HereImage = { src: string; alt: string }

/**
 * Local hotel photos used only when CMS media is present on the same
 * surface via Payload. No Unsplash / Wikimedia / picsum stand-ins (F5).
 * Callers must tolerate null — do not invent a photo.
 */
export function firstHereImage(
  ...candidates: Array<HereImage | null | undefined>
): HereImage | null {
  for (const candidate of candidates) {
    if (candidate?.src) return candidate
  }
  return null
}
