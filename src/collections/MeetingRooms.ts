import type { CollectionConfig } from 'payload'

export const MeetingRooms: CollectionConfig = {
  slug: 'meeting-rooms',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    { name: 'floorSizeM2', type: 'number', required: true },
    {
      name: 'area',
      type: 'select',
      options: [
        { label: 'Ballroom (Berlin, Berlin)', value: 'ballroom' },
        { label: 'Area A', value: 'area-a' },
        { label: 'Area B', value: 'area-b' },
        { label: 'Area C', value: 'area-c' },
      ],
    },
    {
      name: 'capacity',
      type: 'group',
      fields: [
        { name: 'classroom', type: 'number' },
        { name: 'theatre', type: 'number' },
        { name: 'banquet', type: 'number' },
        { name: 'uShape', type: 'number' },
        { name: 'cabaret', type: 'number' },
        { name: 'reception', type: 'number' },
        { name: 'block', type: 'number' },
      ],
    },
    {
      name: 'features',
      type: 'group',
      fields: [
        { name: 'screen', type: 'checkbox', defaultValue: false },
        { name: 'projector', type: 'checkbox', defaultValue: false },
        { name: 'divisible', type: 'checkbox', defaultValue: false },
        { name: 'naturalLight', type: 'checkbox', defaultValue: false },
        { name: 'hybridReady', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'combinableWith',
      type: 'relationship',
      relationTo: 'meeting-rooms',
      hasMany: true,
      admin: { description: 'Other rooms this can be combined with' },
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
      name: 'enquiryUrl',
      type: 'text',
      defaultValue: 'https://hotel-berlin.de/en/meet-work/request-for-proposal',
    },
    { name: 'displayOrder', type: 'number' },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Show on meetings page teaser' },
    },
  ],
}
