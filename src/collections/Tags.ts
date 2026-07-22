import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'lucideIcon',
      type: 'text',
      label: 'Lucide icon name',
      admin: {
        description:
          'Exact PascalCase component name from lucide-react. e.g. "Wifi", "BedDouble", "ShowerHead". Leave blank if no icon needed.',
        condition: (data) => data.type === 'amenity',
      },
    },
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
