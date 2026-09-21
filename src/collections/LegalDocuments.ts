import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { revalidateCms } from '@/lib/payload/revalidate'

type LegalSlug = 'imprint' | 'privacy' | 'terms' | 'cookies' | 'disclaimer'

const LEGAL_PATHS: Record<LegalSlug, [string, string]> = {
  imprint: ['/en/imprint', '/de/impressum'],
  privacy: ['/en/privacy', '/de/datenschutz'],
  terms: ['/en/terms', '/de/agb'],
  cookies: ['/en/cookies', '/de/cookies'],
  disclaimer: ['/en/disclaimer', '/de/haftungsausschluss'],
}

export const LegalDocuments: CollectionConfig = {
  slug: 'legal-documents',
  labels: {
    singular: 'Legal page',
    plural: 'Legal pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description:
      'Imprint, privacy, terms, cookies, and disclaimer. Switch locale (DE/EN) in the admin bar to edit each language. The slug maps to a fixed URL and should not be changed.',
  },
  access: publicReadStaffWrite,
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (req.context?.disableRevalidate) return doc
        const slug = doc.slug as LegalSlug
        const paths = LEGAL_PATHS[slug] ?? []
        await revalidateCms(req, ['legal'], paths)
        return doc
      },
    ],
    afterDelete: [
      async ({ req }) => {
        await revalidateCms(req, ['legal'])
      },
    ],
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Imprint', value: 'imprint' },
        { label: 'Privacy', value: 'privacy' },
        { label: 'Terms', value: 'terms' },
        { label: 'Cookies', value: 'cookies' },
        { label: 'Disclaimer', value: 'disclaimer' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Locks this document to a site URL (e.g. imprint → /imprint, /de/impressum). Do not change after create.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Page heading, e.g. “Privacy Policy” / “Datenschutzerklärung”.',
      },
    },
    {
      name: 'updatedLabel',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Optional date line shown under the heading, e.g. “24th April 2026”. Leave empty to hide.',
      },
    },
    {
      name: 'lede',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional intro under the heading (used on privacy). Not shown on Terms.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      admin: {
        description:
          'Full legal text. Use headings (H2/H3), numbered or bullet lists, and links. Edit German and English separately with the locale switcher.',
      },
    },
  ],
}
