import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { enforceHeroSlideCompletenessOnEnable } from '@/lib/completeness/enforceHeroEnable'
import { heroSlidesNormaliseEndpoint, heroSlidesReorderEndpoint } from '@/endpoints/heroSlidesReorder'
import { heroPathsForContext } from '@/endpoints/heroSlidesReorder'
import { revalidateCms } from '@/lib/payload/revalidate'

const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  const context = doc.context === 'here' ? 'here' : 'homepage'
  await revalidateCms(req, ['hero-slides'], heroPathsForContext(context))
  return doc
}

const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const context = doc?.context === 'here' ? 'here' : 'homepage'
  await revalidateCms(req, ['hero-slides'], heroPathsForContext(context))
}

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: {
    singular: 'Hero slide',
    plural: 'Hero slides',
  },
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'context', 'order', 'enabled', 'updatedAt'],
    description:
      'Hero photo rotation for the homepage and /here guest hub. Prefer the guided views Hero Startseite / Hero Hier.',
    components: {
      beforeListTable: ['/components/admin/HeroManagerButtons#HeroManagerListLinks'],
    },
  },
  defaultSort: 'order',
  access: publicReadStaffWrite,
  endpoints: [heroSlidesReorderEndpoint, heroSlidesNormaliseEndpoint],
  hooks: {
    beforeChange: [enforceHeroSlideCompletenessOnEnable],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    {
      name: 'completeness',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/admin/CompletenessPanel#CompletenessPanel',
        },
      },
    },
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
      maxLength: 120,
      admin: {
        description: 'Descriptive alt text — required for both DE and EN (max 120).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      admin: {
        description:
          'Longer factual description — feeds ImageObject.description. Not shown on the page.',
      },
    },
    {
      name: 'keywords',
      type: 'text',
      localized: true,
      admin: {
        description: 'Comma-separated terms — feeds ImageObject.keywords.',
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
      name: 'aiNotes',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Admin-only notes from the AI reply (hinweiseDe / hinweiseEn). Not shown on the site.',
      },
    },
    {
      name: 'context',
      type: 'select',
      required: true,
      defaultValue: 'homepage',
      index: true,
      options: [
        { label: 'Homepage', value: 'homepage' },
        { label: '/here guest hub', value: 'here' },
      ],
      admin: {
        description:
          'Which hero this slide appears in. Existing slides default to homepage. Duplicate a slide (same image) to show it in both heroes.',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Controls rotation sequence (lower first). Managed by the guided reorder UI.',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to pause this slide without deleting it.',
        position: 'sidebar',
      },
    },
  ],
}
