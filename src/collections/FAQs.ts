import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question' },
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
          'Self-contained answer. Front-load the answer. Name the hotel explicitly. Max ~120 words.',
      },
    },
    {
      name: 'audience',
      type: 'select',
      required: true,
      options: [
        { label: 'Prospect (main site)', value: 'prospect' },
        { label: 'Guest (/here)', value: 'guest' },
        { label: 'Both', value: 'both' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Check-in / Check-out', value: 'check-in' },
        { label: 'Cancellation', value: 'cancellation' },
        { label: 'Payment', value: 'payment' },
        { label: 'Parking', value: 'parking' },
        { label: 'Pets', value: 'pets' },
        { label: 'Transport', value: 'transport' },
        { label: 'Dining', value: 'dining' },
        { label: 'Amenities', value: 'amenities' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Local Area', value: 'local' },
        { label: 'Events & Culture', value: 'events' },
      ],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    {
      name: 'priority',
      type: 'number',
      admin: { description: 'Lower = shown first. Use for homepage FAQ ordering.' },
    },
    { name: 'publishedAt', type: 'date' },
  ],
}
