import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const MeetingRooms: CollectionConfig = {
  slug: 'meeting-rooms',
  ...collectionCacheHooks('meeting-rooms'),
  access: publicReadStaffWrite,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'floorSizeM2', 'displayOrder', 'featured'],
  },
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
      admin: { description: 'Show on homepage Meet & Work teaser if used.' },
    },
  ],
}
