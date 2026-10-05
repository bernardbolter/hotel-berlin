import type { CollectionConfig } from 'payload'

import { hideFromHotelStaff, isEditorOrAdminUser } from '@/access'
import { faqPublishBracketGuard, faqTokenTypoGuard } from '@/lib/faq/hooks'
import { FAQ_ROUTE_OPTIONS } from '@/lib/faq/routes'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    hidden: hideFromHotelStaff,
    useAsTitle: 'question',
    defaultColumns: ['question', 'audience', 'topic', 'priority', '_status', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [faqTokenTypoGuard],
    beforeChange: [faqPublishBracketGuard],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Write as someone would ask an AI assistant. Not "Check-in procedures" but "What time can I check in at Hotel Berlin?"',
      },
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description:
          'Plain text, not richText. Keep it to 1–3 sentences — this ships verbatim into FAQPage JSON-LD acceptedAnswer.text. May contain {{tokens}} (resolved at render in a later step). URLs, emails and phone numbers are auto-linked on the site.',
      },
    },
    {
      name: 'context',
      type: 'select',
      required: true,
      options: [
        { label: 'Prospect (main site)', value: 'prospect' },
        { label: 'Guest (/here)', value: 'guest' },
      ],
      admin: {
        description:
          'DEPRECATED — being replaced by `audience` (which adds "both"). Kept for the current fetch path; do not edit for new FAQs. Will be hidden after audience backfill is verified.',
      },
    },
    {
      name: 'audience',
      type: 'select',
      options: [
        { label: 'Prospect (main site)', value: 'prospect' },
        { label: 'Guest (/here)', value: 'guest' },
        { label: 'Both', value: 'both' },
      ],
      admin: {
        description:
          'Who this FAQ is for. "both" replaces duplicate prospect/guest pairs. Not required until the structure backfill is verified; then it becomes required and replaces context.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        // prospect
        { label: 'Rooms & booking', value: 'rooms-booking' },
        { label: 'Check-in / Check-out', value: 'checkin-checkout' },
        { label: 'Dining', value: 'dining' },
        { label: 'Meetings', value: 'meetings' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Getting here', value: 'getting-here' },
        { label: 'Pets & parking', value: 'pets-parking' },
        { label: 'General', value: 'general' },
        // guest
        { label: 'WiFi & tech', value: 'wifi-tech' },
        { label: 'Guest services', value: 'guest-services' },
        { label: 'Neighbourhood (guest)', value: 'neighbourhood-guest' },
        { label: 'Arrival & departure', value: 'arrival-departure' },
        { label: 'In the room', value: 'in-room' },
        { label: 'Money & payment', value: 'money-payment' },
        { label: 'Health & emergency', value: 'health-emergency' },
        { label: 'Getting around (guest)', value: 'getting-around' },
        { label: 'House & rules', value: 'house-rules' },
      ],
      admin: {
        hidden: true,
        description:
          'Provisional taxonomy — superseded by topic → faq-topics. Hidden; kept until the category→topic map is verified, then retired.',
      },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'faq-topics',
      admin: {
        description:
          'Primary topic for grouping on /faq and for route placement fill. Required after structure backfill is verified.',
      },
    },
    {
      name: 'secondaryTopics',
      type: 'relationship',
      relationTo: 'faq-topics',
      hasMany: true,
      admin: {
        description: 'Optional extra topics so this FAQ can fill more than one route placement.',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: '1 — most important', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
      admin: {
        description:
          'When a route is over its cap, lower numbers survive first. Pinned FAQs are never trimmed (Step 2).',
      },
    },
    {
      name: 'pinnedRoutes',
      type: 'select',
      hasMany: true,
      options: FAQ_ROUTE_OPTIONS,
      admin: {
        description:
          'Force this FAQ onto these route keys regardless of topic fill. Options come from src/lib/faq/routes.ts.',
      },
    },
    {
      name: 'pinnedEntities',
      type: 'relationship',
      relationTo: ['rooms', 'meeting-rooms', 'venues', 'pages'],
      hasMany: true,
      admin: {
        description:
          'Pin this FAQ to specific entities (e.g. balcony FAQ only on rooms that have balconies). Used by room-detail / meeting placements in Step 2.',
      },
    },
    {
      name: 'aliasSlugs',
      type: 'array',
      admin: {
        description:
          'Old slugs/anchors that must keep opening this FAQ after a merge (Step 3). Do not clear absorbed slugs.',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          admin: {
            description: 'Former FAQ slug, e.g. guest-checkin after merge into check-in-time.',
          },
        },
      ],
    },
    {
      name: 'mergedInto',
      type: 'relationship',
      relationTo: 'faqs',
      admin: {
        description:
          'If this record was absorbed into another FAQ, point at the survivor. Set in Step 3; leave empty until then.',
      },
    },
    {
      name: 'relevantPages',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      admin: {
        hidden: true,
        description:
          'OLD pin model — unused in live data. Hidden; replaced by pinnedRoutes / pinnedEntities. Not dropped (hide-don\'t-delete).',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order within a category, and tiebreaker for mini-block fallback fill.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Anchor id for deep links, e.g. /faq#pet-policy.',
      },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      access: {
        read: ({ req: { user } }) => isEditorOrAdminUser(user),
        update: ({ req: { user } }) => isEditorOrAdminUser(user),
      },
      admin: {
        description:
          'Open questions, source notes, HOLD reasons. Admin-only — never rendered on the site.',
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Chatbot', value: 'chatbot' },
        { label: 'Website', value: 'website' },
        { label: 'Staff', value: 'staff' },
      ],
      admin: {
        description: 'Where this Q&A came from. Existing 47 are website; chatbot triage fills gaps later.',
      },
    },
    {
      name: 'lastReviewed',
      type: 'date',
      admin: {
        description: 'Last content review date. Drives a "stale >12 months" admin filter later.',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
  ],
}
