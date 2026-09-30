import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

const identityDescription =
  'Only identifiers the artist publishes themselves. Never guess a Q-number, and never use an entry for someone with the same name. / Nur Kennungen, die die Künstlerin oder der Künstler selbst veröffentlicht. Niemals eine Q-Nummer raten und niemals den Eintrag einer gleichnamigen Person verwenden.'

export const Artists: CollectionConfig = {
  slug: 'artists',
  ...collectionCacheHooks('artists'),
  access: publicReadStaffWrite,
  admin: { useAsTitle: 'name', group: 'Content' },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ name: 'slug', useAsSlug: 'name' }),
    { name: 'alias', type: 'text' },
    {
      name: 'realName',
      type: 'text',
      label: { de: 'Bürgerlicher Name', en: 'Legal / real name' },
      admin: {
        description:
          'Optional — only when the artist publishes it themselves. Many street artists work under an alias deliberately.',
      },
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'people',
      admin: {
        description:
          'Optional join to a You, Me & Berlin person. The name links out only when this is set and that person has a public page. Dedicated artist routes are still open (O-F3).',
      },
    },
    { name: 'bio', type: 'richText', localized: true },
    {
      name: 'shortBio',
      type: 'textarea',
      localized: true,
      maxLength: 140,
      admin: {
        description: 'One factual sentence, max 140 characters. No praise.',
      },
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'nationality', type: 'text' },
    { name: 'basedIn', type: 'text' },
    { name: 'medium', type: 'text' },
    {
      name: 'wikidataId',
      type: 'text',
      admin: { description: identityDescription },
      validate: (value: unknown) => {
        if (value == null || value === '') return true
        if (typeof value === 'string' && /^Q\d+$/.test(value.trim())) return true
        return 'Wikidata ID must look like Q12345'
      },
    },
    {
      name: 'sameAs',
      type: 'array',
      admin: { description: identityDescription },
      fields: [{ name: 'url', type: 'text', required: true }],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
}
