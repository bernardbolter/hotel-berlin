import sharp from 'sharp'

/**
 * Payload's generateFileData already calls `.rotate()` then optionally
 * appends metadata. We keep the same order here for sizes and for any
 * server-side re-encode of the master: apply EXIF orientation first,
 * then emit without metadata (no GPS, no camera serial on derivatives).
 */
export async function sharpRotateThenStrip(
  input: Buffer,
  options: { width?: number; height?: number; fit?: keyof sharp.FitEnum } = {},
): Promise<Buffer> {
  let pipeline = sharp(input).rotate()
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? 'inside',
      withoutEnlargement: true,
    })
  }
  // No .withMetadata() → sharp drops EXIF on output.
  return pipeline.toBuffer()
}
