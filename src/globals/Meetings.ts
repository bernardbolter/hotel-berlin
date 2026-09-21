import type { GlobalConfig } from 'payload'

import { staffWritableGlobal } from '@/access'
import { globalCacheHooks } from '@/lib/payload/revalidate'

export const Meetings: GlobalConfig = {
  slug: 'meetings',
  ...globalCacheHooks('meetings'),
  access: staffWritableGlobal,
  label: 'Meetings page',
  admin: {
    description:
      'Editorial content for /meetings (DE: /tagungen). Hero, event formats, hybrid & food teasers, facilities.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroKicker',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Small line above the headline, e.g. “Award-winning business hotel in Berlin”.',
              },
            },
            {
              name: 'heroHeadline',
              type: 'text',
              localized: true,
            },
            {
              name: 'heroIntro',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'heroContactLabel',
              type: 'text',
              localized: true,
              admin: {
                description: 'Label above phone/email, e.g. “Kontaktieren Sie uns:”.',
              },
            },
            {
              name: 'heroSlides',
              type: 'array',
              labels: { singular: 'Hero slide', plural: 'Hero slides' },
              admin: {
                description: 'Full-bleed hero rotation. Order = playback order.',
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
                  localized: true,
                  required: true,
                },
              ],
            },
            {
              name: 'contactPhone',
              type: 'text',
              defaultValue: '+49 30 2605 2700',
            },
            {
              name: 'contactEmail',
              type: 'text',
              defaultValue: 'meetings@hotel-berlin.de',
            },
          ],
        },
        {
          label: 'Event formats',
          description:
            'Add or remove format cards below the room finder. Photos: seed folder event-formats/{key}.jpg (e.g. meetings.jpg).',
          fields: [
            {
              name: 'eventTypesHeading',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Section title above the format cards. Leave blank to hide the heading.',
              },
            },
            {
              name: 'eventTypes',
              type: 'array',
              label: 'Format cards',
              labels: { singular: 'Format card', plural: 'Format cards' },
              admin: {
                description:
                  'Add, reorder, or delete cards. Use a stable key matching the seed filename (meetings, conferences, fairs, exhibitions).',
              },
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  defaultValue: '',
                  admin: {
                    description:
                      'Stable id for seeding photos, e.g. meetings → event-formats/meetings.jpg',
                  },
                },
                { name: 'label', type: 'text', required: true, localized: true },
                { name: 'description', type: 'textarea', required: true, localized: true },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Card photo. Prefer seeding from event-formats/{key}.jpg',
                  },
                },
                {
                  name: 'lucideIcon',
                  type: 'text',
                  admin: {
                    description:
                      'Optional Lucide icon if no photo yet, e.g. Users, Presentation, Store, Frame.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Hybrid teaser',
          description:
            'Split block under the format cards. Upload the photo here (Media library). CTA usually links to the hybrid PDF in Meeting documents.',
          fields: [
            {
              name: 'hybridTeaser',
              type: 'group',
              label: 'Hybrid / virtual meetings',
              fields: [
                { name: 'kicker', type: 'text', localized: true },
                { name: 'headline', type: 'text', localized: true },
                { name: 'body', type: 'textarea', localized: true },
                { name: 'ctaLabel', type: 'text', localized: true },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Wide photo for the split teaser. Suggested seed path: src/seed/assets/meet-and-work/teasers/hybrid.jpg',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Food & drink teaser',
          description:
            'Second split block (image on the opposite side). Upload the photo here. CTA usually links to the banquet PDF.',
          fields: [
            {
              name: 'foodDrinkTeaser',
              type: 'group',
              label: 'Food & drink / Meet & Eat',
              fields: [
                { name: 'kicker', type: 'text', localized: true },
                { name: 'headline', type: 'text', localized: true },
                { name: 'body', type: 'textarea', localized: true },
                { name: 'ctaLabel', type: 'text', localized: true },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Wide photo for the split teaser. Suggested seed path: src/seed/assets/meet-and-work/teasers/food-drink.jpg',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Facilities',
          fields: [
            {
              name: 'facilities',
              type: 'array',
              maxRows: 12,
              fields: [
                { name: 'label', type: 'text', required: true, localized: true },
                { name: 'description', type: 'textarea', required: true, localized: true },
                {
                  name: 'lucideIcon',
                  type: 'text',
                  required: true,
                  admin: { description: 'Lucide icon name, e.g. Wifi, ParkingCircle.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Closing',
          fields: [
            {
              name: 'closingHeadline',
              type: 'text',
              localized: true,
            },
            {
              name: 'closingCtaLabel',
              type: 'text',
              localized: true,
            },
          ],
        },
      ],
    },
  ],
}
