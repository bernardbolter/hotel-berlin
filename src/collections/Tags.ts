import type { CollectionConfig, TextField } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'lucideIcon',
      type: 'text',
      label: 'Lucide icon',
      admin: {
        components: {
          Field: '/components/admin/LucideIconPicker#LucideIconPicker',
        },
        description: 'Pick a Lucide icon. Leave blank for no icon.',
        condition: (data) => data.type === 'amenity',
      },
    } satisfies TextField,
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Medium', value: 'medium' },
        { label: 'Theme', value: 'theme' },
        { label: 'Amenity', value: 'amenity' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
      ],
    },
  ],
}
