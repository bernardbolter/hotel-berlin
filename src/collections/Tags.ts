import type { CollectionConfig, TextField } from 'payload'

import { hideFromHotelStaff, tagsAccess } from '@/access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: tagsAccess,
  admin: { useAsTitle: 'name', hidden: hideFromHotelStaff },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'description',
      type: 'text',
      localized: true,
      admin: {
        description:
          'One-line amenity description reused on room detail grids. Amenity tags only.',
        condition: (data) => data.type === 'amenity',
      },
    },
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
        { label: 'Subject', value: 'subject' },
        { label: 'Amenity', value: 'amenity' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
      ],
    },
  ],
}
