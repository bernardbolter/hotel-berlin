import type { CollectionConfig } from 'payload'

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: {
    singular: 'Hero slide',
    plural: 'Hero slides',
  },
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'order', 'enabled', 'updatedAt'],
    description:
      'Homepage hero photo rotation. Unlimited slides — disable to pause without deleting.',
  },
  defaultSort: 'order',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'adminTitle',
      type: 'text',
      admin: {
        description: 'Internal label for the admin list (not shown on the site).',
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
        description: 'Descriptive alt text — required for both DE and EN.',
      },
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      admin: {
        description:
          'Optional. When set, caption is derived from venue name + floor/location.',
      },
    },
    {
      name: 'captionOverride',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Optional. Used when the slide is not tied to a venue, or needs custom wording.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Photographer/agency credit — feeds ImageObject.creditText.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Controls rotation sequence (lower first).',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to pause this slide without deleting it.',
      },
    },
  ],
}
