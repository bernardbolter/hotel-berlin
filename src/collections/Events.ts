import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    slugField({ name: 'slug', useAsSlug: 'name' }),
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Art', value: 'Art' },
        { label: 'Music', value: 'Music' },
        { label: 'Sport', value: 'Sport' },
        { label: 'Food', value: 'Food' },
        { label: 'Community', value: 'Community' },
        { label: 'Neighbourhood', value: 'Neighbourhood' },
        { label: 'Other', value: 'Other' },
      ],
    },
    { name: 'venue', type: 'relationship', relationTo: 'venues' },
    { name: 'price', type: 'number' },
    { name: 'ticketUrl', type: 'text' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'isRecurring', type: 'checkbox', defaultValue: false },
    { name: 'recurrenceNote', type: 'text' },
  ],
}
