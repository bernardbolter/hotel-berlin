import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    description:
      'Homepage settings. Hero photos live in the Hero slides collection.',
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
      name: 'heroSlides',
      label: 'Hero slides (legacy)',
      type: 'array',
      minRows: 0,
      maxRows: 8,
      admin: {
        description:
          'Deprecated — manage slides in the Hero slides collection instead. Kept empty after migration.',
        hidden: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Descriptive alt text for the photo.' },
        },
        {
          name: 'caption',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: 'Short label over the photo, e.g. "LÜTZE · GROUND FLOOR".',
          },
        },
        {
          name: 'kbOrigin',
          label: 'Ken Burns origin',
          type: 'select',
          required: true,
          defaultValue: 'bottom-left',
          options: [
            { label: 'Bottom left', value: 'bottom-left' },
            { label: 'Top right', value: 'top-right' },
            { label: 'Top left', value: 'top-left' },
            { label: 'Bottom right', value: 'bottom-right' },
          ],
        },
      ],
    },
    {
      name: 'roomsTeaser',
      label: 'Rooms teaser',
      type: 'group',
      admin: {
        description: 'Homepage “Sleep & Relax” block — editable DE/EN copy.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: { description: 'Section heading, e.g. "Sleep & Relax".' },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Supporting paragraph under the heading.' },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Line-CTA label, e.g. "Discover our rooms" / "Zimmer entdecken".',
          },
        },
      ],
    },
  ],
}
