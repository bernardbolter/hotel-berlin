import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  ...collectionCacheHooks('artworks'),
  access: publicReadStaffWrite,
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'title' }),
    { name: 'artist', type: 'relationship', relationTo: 'artists', required: true },
    { name: 'editionNumber', type: 'text' },
    { name: 'medium', type: 'text' },
    { name: 'dimensions', type: 'text' },
    { name: 'year', type: 'number' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'locationInBuilding',
      type: 'text',
      admin: {
        description:
          'Floor + wing for /here art wall captions, e.g. "Floor 4 · near the lifts". Blank shows Location TBC.',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Not for sale', value: 'not-for-sale' },
      ],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
}
