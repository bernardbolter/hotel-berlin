import type { CollectionConfig, TextField } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { openingHoursArrayField } from '@/fields/openingHours'
import { specialHoursArrayField } from '@/fields/specialHours'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  orderable: true,
  ...collectionCacheHooks('amenities'),
  access: publicReadStaffWrite,
  labels: {
    singular: 'Amenity',
    plural: 'Amenities',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'kind', 'location', 'hidden', 'pending', 'updatedAt'],
    description:
      'Hotel facilities on /hier (Im Haus) and /ausstattung. Drag the list to reorder. Hidden rows leave the site; pending rows show with a dashed border. Switch locale (DE/EN) in the admin bar for titles and copy.',
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'facility',
      options: [
        { label: 'Facility / Anlage', value: 'facility' },
        { label: 'Service', value: 'service' },
      ],
      admin: {
        description:
          'Im Haus = Anlage (facility). Services = die zweite Gruppe auf /ausstattung. / Facility → Im Haus group; service → Services group.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Card heading, e.g. “Sauna & Sanarium” / “Gym”.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Stable id, e.g. sauna, kttk. Do not change after create.',
      },
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      admin: {
        description: 'Eyebrow on the card, e.g. “B2 Keller” / “In the hotel”. Leave empty for “Ort folgt”.',
      },
    },
    {
      name: 'lucideIcon',
      type: 'text',
      label: 'Lucide icon',
      admin: {
        components: {
          Field: '/components/admin/LucideIconPicker#LucideIconPicker',
        },
        description: 'Glyph shown when there is no photograph.',
      },
    } satisfies TextField,
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional photograph. Without one the card shows the icon on a flat block. Alt text lives on the media record.',
      },
    },
    openingHoursArrayField({
      admin: {
        description:
          'Weekly hours for the “Wann” line. Leave empty if there are no advertised hours. Do not pick a sauna schedule here until the hotel confirms one.',
      },
    }),
    specialHoursArrayField(),
    {
      name: 'hoursOverride',
      type: 'text',
      localized: true,
      admin: {
        description:
          'If set, shown as Wann instead of formatted opening hours. Use while hours are unconfirmed (e.g. “Zeiten noch zu bestätigen”).',
      },
    },
    {
      name: 'price',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional “Preis” spec, e.g. “5 € / 30 Min.”',
      },
    },
    {
      name: 'what',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional “Was” spec, e.g. “8 × Typ 2” or “Permanent”.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      maxLength: 90,
      admin: {
        description:
          'Eine Zeile, max. 90 Zeichen. Fallback auf der Hub-Karte und Unterzeile in der Liste. / One line, max 90. Hub fallback and list sub-line.',
      },
    },
    {
      name: 'details',
      type: 'richText',
      localized: true,
      admin: {
        description:
          'Nur die geöffnete Zeile auf /ausstattung. / Open-row body on the list page only.',
      },
    },
    {
      name: 'access',
      type: 'text',
      localized: true,
      maxLength: 80,
      admin: {
        description:
          'z. B. „Mit der Zimmerkarte“ / „Anmeldung an der Rezeption“. Steht in den Fakten der offenen Zeile. / e.g. “With the room key”. Open-row facts only.',
      },
    },
    {
      name: 'subline',
      type: 'textarea',
      localized: true,
      admin: {
        hidden: true,
        description: 'Legacy — copied into summary. Do not edit.',
      },
    },
    {
      name: 'href',
      type: 'text',
      admin: {
        hidden: true,
        description: 'Legacy extra-page URL. Prefer the link group. Hub cards still go to /ausstattung#{slug}.',
      },
    },
    {
      name: 'link',
      type: 'group',
      admin: {
        description:
          'Optional extra page or venue. Hub cards always go to /ausstattung#{slug}. This is the list’s “Mehr zu …” link, and venue links reuse the venue JSON-LD @id.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Page', value: 'page' },
            { label: 'Venue', value: 'venue' },
          ],
        },
        {
          name: 'page',
          type: 'select',
          options: [
            { label: 'Wallride', value: 'wallride' },
            { label: 'Art', value: 'art' },
            { label: 'Dining', value: 'dining' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Meetings', value: 'meetings' },
            { label: 'Neighbourhood', value: 'neighbourhood' },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'page',
          },
        },
        {
          name: 'venue',
          type: 'relationship',
          relationTo: 'venues',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'venue',
          },
        },
      ],
    },
    {
      name: 'schemaType',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'none (amenityFeature)', value: 'none' },
        { label: 'ExerciseGym', value: 'ExerciseGym' },
        { label: 'SportsActivityLocation', value: 'SportsActivityLocation' },
        { label: 'ParkingFacility', value: 'ParkingFacility' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Nur ändern, wenn du weißt, was es bedeutet. / Only change if you know what it means.',
      },
    },
    {
      name: 'showInHub',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'Im-Haus-Reihe auf /hier, max. 6 in Zugreihenfolge. Nur Anlagen (facility). / Hub row, max 6 in drag order. Facilities only.',
      },
    },
    {
      name: 'pending',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Dashed border — content still waiting on the hotel. Still shown unless Hidden.',
        position: 'sidebar',
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Omit from Im Haus, /ausstattung, and JSON-LD without deleting the record.',
        position: 'sidebar',
      },
    },
    {
      name: 'includeInSchema',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Hotel JSON-LD amenityFeature. Turn off for pending or non-facility rows (e.g. Fingerboard).',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedFaqs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: {
        description:
          'FAQs that state the same fact. Stored for the FAQ view (H.13); not rendered on the amenity card.',
      },
    },
  ],
}
