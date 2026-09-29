import type { CollectionConfig } from 'payload'

/**
 * Derivative widths = largest measured on-route card <img> CSS width × 2
 * (Playwright @ 1440 viewport, 2026-09-29):
 *
 *   spotlight 304 · amenity 302 · place strip (tip-card) 323 · borrowed 432
 *   → card = 432 × 2 = 864. Admin minimum = card size.
 *
 *   hero     CSS 1440 (--site-max)                → 2880
 *   portrait CSS 320  (entity identity, on-route) → 640×640 1:1
 *   thumb    300 (admin); og 1200×630 cover
 */
const webp = {
  format: 'webp' as const,
  options: { quality: 80 },
}

const CARD_WIDTH = 864

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    description: {
      de: `Kartenfotos mindestens ${CARD_WIDTH} px breit (größtes gemessenes Karten-CSS × 2).`,
      en: `Card photos need a minimum width of ${CARD_WIDTH} px (largest measured card CSS × 2).`,
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      // Localized since amenities / baseline (`media_locales`). Existing values
      // were moved to `en` by F4; `de` stays empty until editors fill it.
      localized: true,
    },
  ],
  upload: {
    crop: true,
    focalPoint: true,
    adminThumbnail: 'thumb',
    // Originals stay as uploaded; WebP is applied per size only.
    imageSizes: [
      {
        name: 'thumb',
        width: 300,
        height: 300,
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'card',
        width: CARD_WIDTH,
        // Omit (no sizes.card) when source is narrower than CARD_WIDTH.
        // Payload's withoutEnlargement:true would still write a capped webp;
        // leaving it unset uses the width-only omit path so mediaSizedUrl
        // falls back to the original.
        formatOptions: webp,
      },
      {
        name: 'portrait',
        width: 640,
        height: 640,
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'hero',
        width: 2880,
        // Same omit semantics as card for width-only sizes.
        formatOptions: webp,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: webp,
      },
    ],
  },
}
