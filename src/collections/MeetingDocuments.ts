import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const MeetingDocuments: CollectionConfig = {
  slug: 'meeting-documents',
  labels: {
    singular: 'Meeting document',
    plural: 'Meeting documents',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'area', 'pageRole', 'sortOrder', 'updatedAt'],
    description:
      'PDF library on /meetings. Switch locale (DE/EN) in the admin bar to set title + file per language. Add and delete documents freely — the site lists whatever is published here.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Localized — set DE and EN titles by switching the locale toggle.',
      },
    },
    slugField({
      name: 'key',
      useAsSlug: 'title',
      // Not localized — one stable id for both languages (seed + resolvers).
    }),
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      admin: {
        description:
          'PDF preferred. Localized — upload the German file with locale=DE, English with locale=EN.',
      },
      filterOptions: {
        mimeType: { contains: 'pdf' },
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Floor plan', value: 'floor-plan' },
        { label: 'Hybrid', value: 'hybrid' },
        { label: 'Sustainability', value: 'sustainability' },
      ],
    },
    {
      name: 'area',
      type: 'select',
      options: [
        { label: 'Berlin Ballroom', value: 'saal' },
        { label: 'Area A', value: 'bereich-a' },
        { label: 'Area B', value: 'bereich-b' },
        { label: 'Area C', value: 'bereich-c' },
      ],
      admin: {
        description:
          'Floor plans only — links this PDF on matching room detail pages.',
        condition: (_, siblingData) => siblingData?.category === 'floor-plan',
      },
    },
    {
      name: 'pageRole',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None (library only)', value: 'none' },
        { label: 'Hybrid teaser CTA', value: 'hybrid-teaser' },
        { label: 'Food & drink teaser CTA', value: 'banquet-teaser' },
      ],
      admin: {
        description:
          'Optional. Marks this file as the CTA target for a page teaser. At most one document should use each role.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: {
        description: 'Lower numbers appear first in the document library.',
      },
    },
  ],
}
