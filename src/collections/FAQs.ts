import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'context', 'category', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
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
          'Plain text, not richText. Keep it to 1–3 sentences — this ships verbatim into FAQPage JSON-LD acceptedAnswer.text. If a question needs links or lists, summarize here and point to a policy page.',
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
          'prospect = /faq and mini blocks on outside pages. guest = /here/faq and mini blocks on /here. No "both" — duplicate the record if needed.',
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
      ],
      admin: {
        description:
          'Use a category that matches this record’s context. Taxonomy is provisional until real questions land.',
      },
    },
    {
      name: 'relevantPages',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      admin: {
        description:
          'Optional pin — forces this question into a page’s mini block regardless of category. Use sparingly; category matching covers most cases.',
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
  ],
}
