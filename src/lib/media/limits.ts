/**
 * Media master constraints for F3 hero (2880) and storage weight.
 *
 * Step-1 / upload pipeline:
 * - Long edge must be ≥ 2880 px (reject smaller — otherwise `hero` is omitted).
 * - Long edge is capped at 2880 px (downscale only if larger, never below).
 * - Re-encoded as JPEG at quality 0.82; if still over the byte cap, quality is
 *   lowered in steps — dimension stays 2880.
 */
export const MEDIA_MASTER_EDGE = 2880

/** JPEG quality for the browser-prepared master (0–1). */
export const MEDIA_JPEG_QUALITY = 0.82

/**
 * Hard ceiling after compression. Sized for a 2880 JPEG of a mural at ~0.82;
 * raised above Vercel’s ~4.5 MB API body so Neues Werk compresses client-side
 * first, then posts a small master.
 */
export const MEDIA_MAX_FILE_SIZE = 10 * 1024 * 1024

export const MEDIA_MAX_FILE_SIZE_MB = MEDIA_MAX_FILE_SIZE / (1024 * 1024)

/** @deprecated use MEDIA_MASTER_EDGE — kept as alias for older imports */
export const MEDIA_MASTER_MAX_EDGE = MEDIA_MASTER_EDGE

export function isMediaFileTooLarge(size: number): boolean {
  return size > MEDIA_MAX_FILE_SIZE
}
