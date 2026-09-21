import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

/**
 * Derivative widths from schema-inventory.md §3 largest on-route CSS sizes:
 * card 1360 (spotlight), hero 2560 (full-bleed 2×1280), portrait 800 (identity 320×2.5 / YMB 25vw),
 * og 1200×630. `withoutEnlargement` keeps logos and small scans from being upscaled.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  ...collectionCacheHooks('media'),
  access: publicReadStaffWrite,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe the image for screen readers. Set German and English with the locale toggle.',
      },
    },
  ],
  upload: {
    crop: true,
    focalPoint: true,
    imageSizes: [
      {
        name: 'card',
        width: 1360,
        withoutEnlargement: true,
      },
      {
        name: 'hero',
        width: 2560,
        withoutEnlargement: true,
      },
      {
        name: 'portrait',
        width: 800,
        height: 1067,
        position: 'centre',
        withoutEnlargement: true,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        withoutEnlargement: true,
      },
    ],
  },
}
