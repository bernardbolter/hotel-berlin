import type { CollectionConfig } from 'payload'

import { roomsAccess } from '@/access'
import {
  roomsImagesPatchEndpoint,
  roomsImagesReorderEndpoint,
  roomsImagesReplaceEndpoint,
  roomsImagesUploadEndpoint,
  roomsQuickUpdateEndpoint,
} from '@/endpoints/roomsManager'
import { roomsReorderPageEndpoint, roomsReorderSliderEndpoint } from '@/endpoints/roomsReorder'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  access: roomsAccess,
  versions: {
    maxPerDoc: 20,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'visibleOnSite',
      'fromPrice',
      'floorSizeM2',
      'bathroomLabel',
      'featured',
      'displayOrder',
    ],
    components: {
      beforeListTable: ['/components/admin/RoomsManagerButtons#RoomsManagerListLink'],
    },
  },
  endpoints: [
    roomsReorderPageEndpoint,
    roomsReorderSliderEndpoint,
    roomsImagesReorderEndpoint,
    roomsImagesReplaceEndpoint,
    roomsImagesUploadEndpoint,
    roomsImagesPatchEndpoint,
    roomsQuickUpdateEndpoint,
  ],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'visibleOnSite',
      type: 'checkbox',
      defaultValue: true,
      label: {
        de: 'Auf der Website anzeigen',
        en: 'Show on website',
      },
      admin: {
        description: {
          de: 'Ausgeblendete Zimmer erscheinen nicht im Startseiten-Slider, unter /rooms und in der Sitemap.',
          en: 'Hidden rooms disappear from the homepage slider, /rooms and the sitemap.',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Auto-derived from the long description (max 160 chars + …). Prefer editing description; teaser surfaces truncate the long text.',
      },
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'fromPrice', type: 'number', admin: { description: 'From-price in EUR' } },
    { name: 'currency', type: 'text', defaultValue: 'EUR', admin: { readOnly: true } },
    { name: 'floorSizeM2', type: 'number', admin: { description: 'Floor area in m²' } },
    {
      name: 'bedConfiguration',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Double (140×200cm)', value: 'double' },
            { label: 'Queen (160×200cm)', value: 'queen' },
            { label: 'King (180×200cm)', value: 'king' },
            { label: 'King freestanding (200×210cm)', value: 'king-freestanding' },
            { label: 'Twin (2× 90×200cm)', value: 'twin' },
            { label: 'Bunk beds (2× 90×200cm)', value: 'bunk' },
          ],
        },
        { name: 'details', type: 'text' },
      ],
    },
    {
      name: 'occupancy',
      type: 'group',
      fields: [
        { name: 'maxAdults', type: 'number' },
        { name: 'maxChildren', type: 'number' },
        { name: 'maxTotal', type: 'number' },
      ],
    },
    {
      name: 'childAgeMin',
      type: 'number',
      label: 'Minimum child age (years)',
      admin: { description: 'e.g. 5 for bunk beds. Leave blank if no child restriction.' },
    },
    {
      name: 'bathroomLabel',
      type: 'select',
      label: 'Bathroom type',
      admin: { description: 'Short label shown in spec strip on homepage and room cards.' },
      options: [
        { label: 'Shower', value: 'shower' },
        { label: 'Rain shower', value: 'rain-shower' },
        { label: 'Bath & shower', value: 'bath-shower' },
        { label: 'Spa bathroom', value: 'spa-bathroom' },
      ],
    },
    {
      name: 'bathroomDescription',
      type: 'text',
      label: 'Bathroom description (full)',
      admin: {
        description:
          'Used on the room detail page. e.g. "Mini SPA bathroom — 2 basins, freestanding tub, walk-in rain shower, makeup table"',
      },
    },
    {
      name: 'hasBalcony',
      type: 'checkbox',
      defaultValue: false,
      label: 'Has balcony',
      admin: { description: 'Some Premium rooms only.' },
    },
    {
      name: 'hasSauna',
      type: 'checkbox',
      defaultValue: false,
      label: 'Has private sauna',
      admin: { description: 'Studio 45 only.' },
    },
    {
      name: 'hasSeparateLiving',
      type: 'checkbox',
      defaultValue: false,
      label: 'Has separate living area',
    },
    {
      name: 'isAccessible',
      type: 'checkbox',
      defaultValue: false,
      label: 'Wheelchair accessible',
    },
    {
      name: 'accessibilityFeatures',
      type: 'richText',
      label: 'Accessibility features detail',
      admin: { condition: (data) => Boolean(data.isAccessible) },
    },
    {
      name: 'amenities',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: { type: { equals: 'amenity' } },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: {
          de: 'Erstes Foto = Titelbild. Reihenfolge: wide, zweiter Winkel, Bett, Bad, Detail, Aussicht. Querformat 3:2; 2000 px Breite empfohlen, kleinere Fotos sind erlaubt.',
          en: 'First photo = cover. Order: wide, second angle, bed, bath, detail, view. Landscape 3:2; 2000px width recommended, smaller photos are allowed.',
        },
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true, localized: true },
        { name: 'caption', type: 'text', localized: true },
        {
          name: 'shotType',
          type: 'select',
          options: [
            { label: 'Wide', value: 'wide' },
            { label: 'Bed', value: 'bed' },
            { label: 'Bath', value: 'bath' },
            { label: 'Detail', value: 'detail' },
            { label: 'View', value: 'view' },
          ],
          admin: {
            description: 'Optional shot category for gallery ordering guidance.',
          },
        },
      ],
    },
    {
      name: 'socialImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional og:image / twitter:image override. Falls back to the first gallery image if empty.',
      },
    },
    {
      name: 'bookingUrl',
      type: 'text',
      admin: { description: 'Radisson booking deep-link for this room type' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Legacy homepage flag — prefer Homepage teaser → Enabled.' },
    },
    { name: 'displayOrder', type: 'number', admin: { description: 'Order on rooms index page' } },
    {
      name: 'homepageTeaser',
      type: 'group',
      label: 'Homepage teaser',
      admin: {
        description:
          'Controls the Sleep & Relax rotation on the homepage (Outside_short.pdf).',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Include this room in the homepage teaser rotation.',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: { description: 'Rotation sequence (lower first).' },
        },
        {
          name: 'teaserImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            hidden: true,
            description:
              'Unused for display — homepage always uses the room’s first gallery image. Kept for legacy CMS data only.',
          },
        },
        {
          name: 'featuredAmenities',
          type: 'relationship',
          relationTo: 'tags',
          hasMany: true,
          filterOptions: { type: { equals: 'amenity' } },
          admin: {
            description: 'Curated amenity subset for the compact teaser (max ~4).',
          },
          validate: (value) => {
            if (Array.isArray(value) && value.length > 4) {
              return 'Pick at most 4 featured amenities for the teaser.'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'storyConnection',
      type: 'group',
      admin: { description: 'You, Me & Berlin — insider story link' },
      fields: [
        { name: 'hasStory', type: 'checkbox', defaultValue: false },
        { name: 'storyTeaser', type: 'text', localized: true },
      ],
    },
  ],
}
