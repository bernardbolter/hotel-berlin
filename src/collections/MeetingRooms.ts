import type { CollectionConfig } from 'payload'

import { meetingRoomsAccess } from '@/access'
import {
  meetingRoomsImagesPatchEndpoint,
  meetingRoomsImagesReorderEndpoint,
  meetingRoomsImagesReplaceEndpoint,
  meetingRoomsImagesUploadEndpoint,
  meetingRoomsQuickUpdateEndpoint,
} from '@/endpoints/meetingRoomsManager'
import {
  meetingRoomsReorderPageEndpoint,
  meetingRoomsReorderSliderEndpoint,
} from '@/endpoints/meetingRoomsReorder'

export const MeetingRooms: CollectionConfig = {
  slug: 'meeting-rooms',
  access: meetingRoomsAccess,
  versions: {
    maxPerDoc: 20,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'visibleOnSite',
      'area',
      'floorSizeM2',
      'displayOrder',
      'homepageTeaser',
    ],
    components: {
      beforeListTable: [
        '/components/admin/MeetingRoomsManagerButtons#MeetingRoomsManagerListLink',
      ],
    },
  },
  endpoints: [
    meetingRoomsReorderPageEndpoint,
    meetingRoomsReorderSliderEndpoint,
    meetingRoomsImagesReorderEndpoint,
    meetingRoomsImagesReplaceEndpoint,
    meetingRoomsImagesUploadEndpoint,
    meetingRoomsImagesPatchEndpoint,
    meetingRoomsQuickUpdateEndpoint,
  ],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Same slug for /meetings/[slug] and /tagungen/[slug].',
      },
    },
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
          de: 'Ausgeblendete Räume erscheinen nicht auf der Startseite, unter /tagungen und in der Sitemap.',
          en: 'Hidden rooms disappear from the homepage, /meetings and the sitemap.',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'area',
      type: 'select',
      required: true,
      options: [
        { label: 'Berlin Ballroom', value: 'saal' },
        { label: 'Area A', value: 'bereich-a' },
        { label: 'Area B', value: 'bereich-b' },
        { label: 'Area C', value: 'bereich-c' },
        { label: 'Meeting Island', value: 'sonderflaeche' },
      ],
    },
    { name: 'displayOrder', type: 'number', required: true },
    {
      name: 'floorSizeM2',
      type: 'number',
      required: true,
      admin: { description: 'Floor area in m² (brief sizeM2).' },
    },
    { name: 'ceilingHeightM', type: 'number' },
    { name: 'hasDaylight', type: 'checkbox', defaultValue: false },
    { name: 'isDivisible', type: 'checkbox', defaultValue: false },
    { name: 'hasScreen', type: 'checkbox', defaultValue: false },
    { name: 'hasProjector', type: 'checkbox', defaultValue: false },
    {
      name: 'combinableWith',
      type: 'relationship',
      relationTo: 'meeting-rooms',
      hasMany: true,
      admin: {
        description:
          'Self-referencing — e.g. Berlin 1 combinable with Berlin 2 + Berlin 3.',
      },
    },
    {
      name: 'capacity',
      type: 'group',
      admin: {
        description:
          'Leave any field blank if that layout isn\'t offered — renders as "–", not 0.',
      },
      fields: [
        { name: 'theater', type: 'number' },
        { name: 'classroom', type: 'number' },
        { name: 'banquet', type: 'number' },
        { name: 'uShape', type: 'number' },
        { name: 'cabaret', type: 'number' },
        { name: 'reception', type: 'number' },
        { name: 'block', type: 'number' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: {
          de: 'Erstes Foto = Titelbild (Startseite und Karten). Querformat 3:2; 2000 px Breite empfohlen.',
          en: 'First photo = cover (homepage and cards). Landscape 3:2; 2000px width recommended.',
        },
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'teaserImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. Falls back to the first gallery image if empty.',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Card / teaser copy. Keep ~160 chars.' },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Legacy homepage flag — prefer Homepage teaser → Enabled.' },
    },
    {
      name: 'homepageTeaser',
      type: 'group',
      label: 'Homepage teaser',
      admin: {
        description: 'Controls the Meet & Work rotation on the homepage.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Include this meeting room in the homepage teaser rotation.',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: { description: 'Rotation sequence (lower first).' },
        },
      ],
    },
  ],
}
