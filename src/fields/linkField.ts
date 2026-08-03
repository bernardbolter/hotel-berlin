import type { Field } from 'payload'

/** Reusable internal/external link fields for footer columns and partner strips. */
export const linkField: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    localized: true,
  },
  {
    name: 'linkType',
    type: 'radio',
    options: [
      { label: 'Internal page', value: 'internal' },
      { label: 'External URL', value: 'external' },
    ],
    defaultValue: 'internal',
  },
  {
    name: 'internalPage',
    type: 'relationship',
    relationTo: 'pages',
    admin: {
      condition: (_, siblingData) => siblingData?.linkType === 'internal',
      description: 'CMS page (slug becomes the href).',
    },
  },
  {
    name: 'externalUrl',
    type: 'text',
    admin: {
      condition: (_, siblingData) => siblingData?.linkType === 'external',
      description: 'Absolute URL or site path, e.g. https://… or /rooms',
    },
  },
  {
    name: 'showArrow',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'Adds the "→" treatment used for Lütze / FKKB / KTTK — links that exit to a different venue frontend rather than a page within this site.',
    },
  },
  {
    name: 'dividerBefore',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'Adds a small gap above this link — used to group related links within a column (e.g. before "Check-in/Check-out", or before "On the Walls").',
    },
  },
]
