import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Max 160 chars. AI citation length.' },
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'fromPrice', type: 'number', admin: { description: 'From-price in EUR' } },
    { name: 'currency', type: 'text', defaultValue: 'EUR' },
    { name: 'floorSizeM2', type: 'number', admin: { description: 'Floor area in m²' } },
    {
      name: 'bedConfiguration',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Queen (160×200cm)', value: 'queen' },
            { label: 'King (180×200cm)', value: 'king' },
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
      name: 'amenities',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: { type: { equals: 'amenity' } },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
        { name: 'caption', type: 'text' },
      ],
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
      admin: { description: 'Show on homepage rooms teaser' },
    },
    { name: 'displayOrder', type: 'number', admin: { description: 'Order on rooms index page' } },
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
