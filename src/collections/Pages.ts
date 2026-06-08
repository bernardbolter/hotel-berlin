import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    description:
      'Site pages. Inside (/here) pages can be added to the guest hub navigation.',
    defaultColumns: ['title', 'slug', 'context', 'status'],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'URL slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'e.g. "rooms" → /rooms · "here/art" → /here/art (no leading slash)',
      },
    },
    {
      name: 'context',
      label: 'Context',
      type: 'select',
      required: true,
      options: [
        { label: 'Outside (main site)', value: 'outside' },
        { label: 'Inside (/here)', value: 'inside' },
        { label: 'Both', value: 'both' },
        { label: 'Policy / utility', value: 'policy' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Skeleton — not yet built', value: 'skeleton' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Live', value: 'live' },
      ],
      defaultValue: 'skeleton',
    },
  ],
}
