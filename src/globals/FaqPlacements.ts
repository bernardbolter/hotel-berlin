import type { GlobalConfig } from 'payload'

import { hideFromHotelStaff, staffWritableGlobal } from '@/access'
import { FAQ_ROUTE_OPTIONS } from '@/lib/faq/routes'
import { globalCacheHooks } from '@/lib/payload/revalidate'

export const FaqPlacements: GlobalConfig = {
  slug: 'faq-placements',
  ...globalCacheHooks('faq-placements'),
  access: staffWritableGlobal,
  label: 'FAQ placements',
  admin: {
    hidden: hideFromHotelStaff,
    description:
      'Per-route FAQ placement: audience, topics, cap, and optional heading. Used by getFAQsForRoute when FAQ_ROUTING_V2 is on. Seed from doc/faqs/faq-placements.json.',
  },
  fields: [
    {
      name: 'placements',
      type: 'array',
      labels: { singular: 'Placement', plural: 'Placements' },
      admin: {
        description: 'One row per route key. Route must be unique across rows.',
      },
      fields: [
        {
          name: 'route',
          type: 'select',
          required: true,
          unique: true,
          options: FAQ_ROUTE_OPTIONS,
          admin: {
            description: 'Route registry key from src/lib/faq/routes.ts.',
          },
        },
        {
          name: 'audience',
          type: 'select',
          required: true,
          options: [
            { label: 'Prospect', value: 'prospect' },
            { label: 'Guest', value: 'guest' },
            { label: 'Both', value: 'both' },
          ],
          admin: {
            description:
              'Fill matches FAQs whose audience is this value or "both". Placement "both" matches every FAQ audience.',
          },
        },
        {
          name: 'topics',
          type: 'relationship',
          relationTo: 'faq-topics',
          hasMany: true,
          admin: {
            description:
              'Topics that fill this route. Ignored when showAll is checked. Empty + not showAll → pins only.',
          },
        },
        {
          name: 'showAll',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'When checked, fill includes every topic (subject to audience). Cap is ignored.',
          },
        },
        {
          name: 'cap',
          type: 'number',
          admin: {
            description:
              'Max items on the surface (pinned never trimmed). Ignored when showAll is checked. Leave empty for uncapped non-showAll only if intentional.',
          },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional section heading override for this route. Leave empty to use i18n default.',
          },
        },
      ],
    },
  ],
}
