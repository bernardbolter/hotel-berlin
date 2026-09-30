import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const ART_FLOORS = [
  'B2',
  'B1',
  'EG',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Dach',
] as const

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  orderable: true,
  ...collectionCacheHooks('artworks'),
  access: publicReadStaffWrite,
  labels: {
    singular: 'Artwork',
    plural: 'Artworks',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'artist', 'artworkType', 'visibility', 'pinned', 'status'],
    description:
      'Works in the building for /hier/art. Drag to reorder. Live works need an image. Sale status is separate from publishing.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description:
          'Leave blank for untitled works — the artist name becomes the page heading and JSON-LD omits `name`.',
      },
    },
    slugField({ name: 'slug', useAsSlug: 'title' }),
    {
      name: 'artworkType',
      type: 'select',
      required: true,
      defaultValue: 'mural',
      options: [
        { label: 'Mural', value: 'mural' },
        { label: 'Edition', value: 'edition' },
        { label: 'Installation', value: 'installation' },
      ],
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'live',
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Hidden', value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publishing. Hidden works leave /hier/art. Sale availability is the Status field.',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pinned works lead the mosaic and index. Drag order among pinned still applies.',
      },
    },
    { name: 'artist', type: 'relationship', relationTo: 'artists', required: true },
    { name: 'editionNumber', type: 'text' },
    {
      name: 'medium',
      type: 'text',
      label: 'Technik / Technique',
      admin: {
        description: 'Technique shown in the facts list, e.g. “Spray paint on plaster”.',
      },
    },
    { name: 'dimensions', type: 'text' },
    { name: 'year', type: 'number' },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      admin: {
        description:
          'The story on the work page and in structured data. Write natively per locale. Do not add a separate story field.',
      },
    },
    {
      name: 'locationInBuilding',
      type: 'group',
      admin: {
        description: 'Floor + spot for the grid caption and floor locator.',
      },
      fields: [
        {
          name: 'floor',
          type: 'select',
          options: ART_FLOORS.map((value) => ({ label: value, value })),
        },
        {
          name: 'spot',
          type: 'text',
          localized: true,
          maxLength: 40,
          admin: {
            description: 'e.g. „bei den Aufzügen“ / “near the lifts”. Max 40.',
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description:
          'Querformat und Hochformat willkommen; für die Übersicht wird 4:5 zugeschnitten – Fokuspunkt setzen.',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
      ],
    },
    {
      name: 'contextImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional step-back shot showing where the work hangs in the building.',
      },
    },
    {
      name: 'detailImages',
      type: 'array',
      admin: {
        description: 'Optional detail crops. Rare — most murals have one photo plus a context shot.',
      },
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
      admin: {
        description: 'Sale state for gallery editions. Independent of Visibility.',
      },
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
}
