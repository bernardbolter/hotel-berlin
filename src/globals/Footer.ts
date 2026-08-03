import type { GlobalConfig } from 'payload'

import { linkField } from '../fields/linkField'
import { lucideIconField } from '../fields/lucideIconField'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    description:
      'Public site footer: book-direct strip, contact, link columns, awards, partners, copyright.',
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidatePath } = await import('next/cache')
          revalidatePath('/', 'layout')
        } catch {
          // No-op outside Next.js request context (e.g. seed scripts)
        }
      },
    ],
  },
  fields: [
    {
      name: 'bookDirectStrip',
      type: 'group',
      label: 'Book-direct CTA strip',
      admin: {
        description:
          'Separate bar above the footer. Toggle visibility independently of the footer body.',
      },
      fields: [
        {
          name: 'visible',
          type: 'checkbox',
          label: 'Show strip',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide the book-direct CTA strip site-wide.',
          },
        },
        {
          name: 'message',
          type: 'text',
          localized: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.visible),
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.visible),
          },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          defaultValue: '/book',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.visible),
          },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'sinceYear',
          type: 'text',
          defaultValue: '1958',
        },
        {
          name: 'addressLines',
          type: 'array',
          fields: [{ name: 'line', type: 'text', required: true }],
        },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
        {
          name: 'transitLines',
          type: 'array',
          labels: { singular: 'Transit line', plural: 'Transit lines' },
          fields: [
            {
              name: 'line',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
          admin: {
            description:
              'e.g. "Bus 100, 106, 187", "U Nollendorfplatz 7 min", "S+U Zoo 10 min" — rendered joined by " · ".',
          },
        },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        lucideIconField('icon', 'Column icon'),
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'links',
          type: 'array',
          minRows: 1,
          fields: linkField,
        },
      ],
    },
    {
      name: 'alreadyHereColumn',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        lucideIconField('icon', 'Column icon'),
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: linkField,
        },
      ],
    },
    {
      name: 'awards',
      type: 'array',
      label: 'Awards & sustainability logos',
      labels: { singular: 'Logo', plural: 'Logos' },
      admin: {
        description:
          'Sustainability certifications and award badges. Add, remove, or reorder freely. Uncheck “Show on website” to hide a logo without deleting it.',
      },
      fields: [
        {
          name: 'visible',
          type: 'checkbox',
          label: 'Show on website',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide this logo on the public site without removing it from the CMS.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'altText',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: 'Accessible name for the logo (also used as fallback text if the image fails).',
          },
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'External link',
          admin: {
            description:
              'Optional URL opened in a new tab when the logo is clicked (e.g. certification page). Leave blank if not clickable.',
          },
        },
      ],
    },
    {
      name: 'awardsHeading',
      type: 'text',
      localized: true,
      admin: {
        description: 'Label above the awards row, e.g. "Awards & Recognition".',
      },
    },
    {
      name: 'partnerLinks',
      type: 'array',
      label: 'Partner / brand links',
      labels: { singular: 'Partner link', plural: 'Partner links' },
      admin: {
        description:
          '“Part of …” strip under the awards. Add, remove, or reorder freely. Uncheck “Show on website” to hide a link without deleting it.',
      },
      fields: [
        {
          name: 'visible',
          type: 'checkbox',
          label: 'Show on website',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide this partner link on the public site without removing it.',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'External URL opened in a new tab.',
          },
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal / bottom bar links',
      labels: { singular: 'Legal link', plural: 'Legal links' },
      admin: {
        description:
          'Bottom bar links (Imprint, Privacy, Terms, …). Add, remove, or reorder freely. Uncheck “Show on website” to hide a link without deleting it.',
      },
      fields: [
        {
          name: 'visible',
          type: 'checkbox',
          label: 'Show on website',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide this link on the public site without removing it.',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Site path or absolute URL, e.g. /imprint or https://…',
          },
        },
      ],
    },
    {
      name: 'copyrightEntity',
      type: 'text',
      defaultValue: 'Pandox Berlin GmbH',
      admin: {
        description: 'Year is generated at render time — do not include a year here.',
      },
    },
  ],
}
