import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite, hideFromHotelStaff } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const Exhibitions: CollectionConfig = {
  slug: 'exhibitions',
  ...collectionCacheHooks('exhibitions', [
    '/here',
    '/here/art',
    '/happenings',
    '/here/events',
  ]),
  access: publicReadStaffWrite,
  admin: {
    hidden: hideFromHotelStaff,
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'title' }),
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'runType',
      type: 'select',
      required: true,
      defaultValue: 'dated',
      options: [
        { label: 'Dated', value: 'dated' },
        { label: 'Permanent', value: 'permanent' },
      ],
      admin: {
        description:
          'Dated shows open and close. Permanent installations stay current and never outrank a dated show for the lead tile.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        condition: (_, siblingData) => siblingData?.runType !== 'permanent',
        description: 'Required for dated shows. Hidden for permanent installations.',
      },
      validate: (value, { siblingData }) => {
        const runType = (siblingData as { runType?: string } | undefined)?.runType
        if (runType === 'permanent') return true
        if (!value) return 'End date is required for dated exhibitions'
        return true
      },
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      required: true,
      filterOptions: {
        venueType: { equals: 'ArtGallery' },
      },
      admin: {
        description: 'Hosting gallery. Floor and room come from the venue record.',
      },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'artists', type: 'relationship', relationTo: 'artists', hasMany: true },
    { name: 'artworks', type: 'relationship', relationTo: 'artworks', hasMany: true },
  ],
}
