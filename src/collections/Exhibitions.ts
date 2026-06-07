import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const Exhibitions: CollectionConfig = {
  slug: 'exhibitions',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'title' }),
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'richText', localized: true },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'location', type: 'text' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'artists', type: 'relationship', relationTo: 'artists', hasMany: true },
    { name: 'artworks', type: 'relationship', relationTo: 'artworks', hasMany: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Current', value: 'current' },
        { label: 'Past', value: 'past' },
      ],
    },
  ],
}
