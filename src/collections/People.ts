import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const People: CollectionConfig = {
  slug: 'people',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'updatedAt'],
    group: 'Neighbourhood',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'name' }),
    { name: 'jobTitle', type: 'text' },
    {
      name: 'shortBio',
      type: 'textarea',
      admin: { description: 'AI citation length — 2–3 sentences.' },
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
      admin: {
        description: 'The full "You, Me & Berlin" letter/story. Write natively per locale, du register.',
      },
    },
    {
      name: 'quote',
      type: 'text',
      admin: { description: 'Pull quote / signature line.' },
    },
    {
      name: 'video',
      type: 'text',
      admin: { description: 'YouTube/Vimeo embed URL, optional.' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      // Alt text lives on Media (`alt`, required) — same rule as HerePage_BuildBrief.
    },
    { name: 'website', type: 'text' },
    { name: 'instagram', type: 'text' },
    {
      name: 'roomNumber',
      type: 'text',
      admin: { description: 'Physical room where their welcome letter is placed.' },
    },
    {
      name: 'basedIn',
      type: 'text',
      admin: { description: 'e.g. "Neukölln"' },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Artist', value: 'artist' },
        { label: 'Curator', value: 'curator' },
        { label: 'Host', value: 'host' },
        { label: 'Partner', value: 'partner' },
        { label: 'Staff', value: 'staff' },
        { label: 'Local', value: 'local' },
      ],
      required: true,
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'relatedVenue', type: 'relationship', relationTo: 'venues' },
    {
      name: 'authority',
      type: 'group',
      fields: [
        {
          name: 'identifier',
          type: 'array',
          fields: [
            {
              name: 'propertyID',
              type: 'select',
              options: ['Wikidata', 'GND', 'VIAF', 'GoogleKG'],
              required: true,
            },
            { name: 'value', type: 'text', required: true },
          ],
        },
        {
          name: 'sameAs',
          type: 'array',
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'picks',
      type: 'join',
      collection: 'neighbourhood-places',
      on: 'endorsements.person',
      admin: {
        description:
          'Read-only — auto-populated from neighbourhoodPlaces.endorsements. Do not hand-maintain. (Payload join field — confirmed on 3.85)',
        defaultColumns: ['name', 'category', 'status'],
        allowCreate: false,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
}
