import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite, hideFromHotelStaff } from '@/access'
import { artPhotoHelp } from '@/lib/art/photoHelp'
import {
  ART_ARTFORM_OPTIONS,
  ART_FLOORS,
  ART_PERMISSION_OPTIONS,
} from '@/lib/art/types'
import { enforceArtworkCompletenessOnPublish } from '@/lib/completeness'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

const artCache = collectionCacheHooks('artworks', [
  '/here',
  '/here/art',
  '/happenings',
  '/here/events',
])

export { ART_FLOORS }
export const Artworks: CollectionConfig = {
  slug: 'artworks',
  orderable: true,
  access: publicReadStaffWrite,
  labels: {
    singular: 'Artwork',
    plural: 'Artworks',
  },
  admin: {
    hidden: hideFromHotelStaff,
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'artist', 'artworkType', 'visibility', 'pinned', 'status'],
    description:
      'Works in the building for /hier/art. Drag to reorder. Live works need an image. Sale status is separate from publishing.',
    components: {
      beforeListTable: ['/components/admin/NeuesWerkButton#NeuesWerkListButton'],
    },
  },
  hooks: {
    ...artCache.hooks,
    beforeChange: [enforceArtworkCompletenessOnPublish],
  },
  fields: [
    {
      name: 'completeness',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/admin/CompletenessPanel#CompletenessPanel',
        },
      },
    },
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
      name: 'artform',
      type: 'select',
      options: ART_ARTFORM_OPTIONS.map((o) => ({
        label: { de: o.label.de, en: o.label.en },
        value: o.value,
      })),
      admin: {
        description: 'VisualArtwork.artform — controlled list for consistent structured data.',
      },
    },
    {
      name: 'medium',
      type: 'text',
      localized: true,
      label: { de: 'Technik', en: 'Technique' },
      admin: {
        description: 'Technique → artMedium, e.g. “Sprühfarbe” / “Spray paint”.',
      },
    },
    {
      name: 'surface',
      type: 'text',
      localized: true,
      label: { de: 'Untergrund', en: 'Surface' },
      admin: {
        description: 'artworkSurface — Putz/plaster, Beton/concrete…',
      },
    },
    { name: 'dimensions', type: 'text' },
    { name: 'year', type: 'number' },
    {
      name: 'subjects',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: {
        type: { equals: 'subject' },
      },
      admin: {
        description: 'What is depicted (Vogel, Porträt…). JSON-LD keywords. type=subject only.',
      },
    },
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
        description: 'Place in / on the building + spot for the grid caption and locator.',
      },
      fields: [
        {
          name: 'floor',
          type: 'select',
          options: ART_FLOORS.map((value) => {
            const labels: Record<string, { de: string; en: string }> = {
              outside: { de: 'Außen', en: 'Outside' },
              basement: { de: 'Keller', en: 'Basement' },
              lobby: { de: 'Lobby', en: 'Lobby' },
            }
            const label = labels[value] ?? {
              de: `${value}. Etage`,
              en: `Floor ${value}`,
            }
            return { label, value }
          }),
        },
        {
          name: 'spot',
          type: 'text',
          localized: true,
          maxLength: 40,
          admin: {
            description:
              'Indoors: „bei den Aufzügen“. Outside: „Fassade zur Straße“, „beim Parkplatz“, „Hof, linke Wand“. Max 40.',
          },
        },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      admin: {
        description: 'Outdoor works only — never guess.',
        condition: (data) => data?.locationInBuilding?.floor === 'outside',
      },
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
    {
      name: 'permission',
      type: 'select',
      defaultValue: 'open',
      options: ART_PERMISSION_OPTIONS.map((o) => ({
        label: { de: o.label.de, en: o.label.en },
        value: o.value,
      })),
      admin: {
        description:
          'Artist consent to publish the photograph. Open and denied block publishing.',
      },
    },
    {
      name: 'permissionNote',
      type: 'textarea',
      admin: {
        description: 'Optional note about the consent (date, channel, caveats).',
      },
    },
    {
      name: 'creditText',
      type: 'text',
      admin: {
        description: 'Photo credit → ImageObject.creditText / copyrightNotice.',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: {
          de: artPhotoHelp.de.photo.short,
          en: artPhotoHelp.en.photo.short,
        },
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
        description: {
          de: artPhotoHelp.de.context.short,
          en: artPhotoHelp.en.context.short,
        },
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
