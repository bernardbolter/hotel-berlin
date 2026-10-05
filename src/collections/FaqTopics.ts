import type { CollectionConfig } from 'payload'

import { hideFromHotelStaff } from '@/access'

/**
 * Topic taxonomy for FAQs. Editors can add topics without a deploy.
 * Seeded from HotelBerlin_FAQ_Reconciliation.xlsx → Topics (revised).
 */
export const FaqTopics: CollectionConfig = {
  slug: 'faq-topics',
  admin: {
    hidden: hideFromHotelStaff,
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'sortOrder'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'Stable id used in code and the reconciliation workbook, e.g. checkin-checkout. Do not rename after FAQs reference it.',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'EN + DE label shown on /faq topic grouping and in the admin.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order of topic groups on the full FAQ pages. Lower comes first.',
      },
    },
  ],
}
