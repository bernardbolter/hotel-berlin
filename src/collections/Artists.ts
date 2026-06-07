import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const Artists: CollectionConfig = {
  slug: 'artists',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'name' }),
    { name: 'alias', type: 'text' },
    { name: 'bio', type: 'richText', localized: true },
    { name: 'shortBio', type: 'textarea' },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'nationality', type: 'text' },
    { name: 'basedIn', type: 'text' },
    { name: 'medium', type: 'text' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
}
