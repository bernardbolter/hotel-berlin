import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const People: CollectionConfig = {
  slug: 'people',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'name' }),
    { name: 'role', type: 'text' },
    { name: 'bio', type: 'richText', localized: true },
    { name: 'shortBio', type: 'textarea' },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    {
      name: 'isInsider',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Marks as You, Me & Berlin profile' },
    },
  ],
}
