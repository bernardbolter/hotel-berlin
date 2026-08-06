import type { CollectionConfig } from 'payload'

import { geocodeNeighbourhoodPlaceBeforeChange } from './hooks/geocodeNeighbourhoodPlace'

export const NeighbourhoodPlaces: CollectionConfig = {
  slug: 'neighbourhood-places',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featuredOrder', 'distanceTier', 'status', 'updatedAt'],
    group: 'Neighbourhood',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [geocodeNeighbourhoodPlaceBeforeChange],
    afterChange: [
      async () => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel-berlin.de'
        const secret = process.env.REVALIDATE_SECRET

        if (!secret) return

        await fetch(`${baseUrl}/api/revalidate?path=/neighbourhood&secret=${secret}`)
        await fetch(`${baseUrl}/api/revalidate?path=/you-me-berlin&secret=${secret}`)
        await fetch(`${baseUrl}/api/revalidate?path=/&secret=${secret}`)
        await fetch(`${baseUrl}/api/revalidate?path=/en&secret=${secret}`)
        await fetch(`${baseUrl}/api/revalidate?path=/de&secret=${secret}`)
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Art', value: 'Art' },
        { label: 'Bar', value: 'Bar' },
        { label: 'Kids', value: 'Kids' },
        { label: 'Museum', value: 'Museum' },
        { label: 'Parks and Nature', value: 'Parks and Nature' },
        { label: 'Party', value: 'Party' },
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'Shopping', value: 'Shopping' },
        { label: 'Sightseeing', value: 'Sightseeing' },
      ],
      required: true,
    },
    {
      name: 'schemaType',
      type: 'select',
      options: [
        { label: 'TouristAttraction', value: 'TouristAttraction' },
        { label: 'LocalBusiness', value: 'LocalBusiness' },
        { label: 'Museum', value: 'Museum' },
        { label: 'Park', value: 'Park' },
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'BarOrPub', value: 'BarOrPub' },
        { label: 'ShoppingCenter', value: 'ShoppingCenter' },
      ],
      required: true,
      admin: {
        description:
          'Drives the JSON-LD @type — apply the category→schemaType mapping at seed time, not by editor judgment.',
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        {
          name: 'addressLocality',
          type: 'text',
          defaultValue: 'Berlin',
          required: true,
        },
        { name: 'postalCode', type: 'text' },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
    { name: 'walkingMinutes', type: 'number' },
    {
      name: 'transit',
      type: 'group',
      admin: {
        description:
          'Optional — render the transit row in PlaceInfoCard only when this is populated. Do not block launch on backfilling this for all places.',
      },
      fields: [
        { name: 'minutes', type: 'number' },
        {
          name: 'station',
          type: 'text',
          admin: { description: 'e.g. "Wittenbergplatz"' },
        },
        {
          name: 'line',
          type: 'text',
          admin: {
            description:
              'e.g. "U1" — free text, not a select, since S-Bahn/bus lines don\'t fit a clean enum.',
          },
        },
      ],
    },
    {
      name: 'distanceTier',
      type: 'select',
      options: [
        { label: 'Walkable', value: 'walkable' },
        { label: 'Short transit', value: 'short-transit' },
        { label: 'Further out', value: 'further-out' },
      ],
      admin: {
        description: 'Default filter on /nachbarschaft is "walkable".',
      },
    },
    {
      name: 'indoorOutdoor',
      type: 'select',
      options: [
        { label: 'Indoor', value: 'indoor' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Both', value: 'both' },
      ],
    },
    {
      name: 'targetAudience',
      type: 'array',
      fields: [{ name: 'label', type: 'text' }],
      admin: {
        description: 'xlsx "Zielgruppe" column — e.g. Alle, Kunstinteressierte, Freunde & Paare.',
      },
    },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'endorsements',
      type: 'array',
      admin: {
        description:
          'hasMany by design — one place can be endorsed by multiple people (e.g. Schloss Charlottenburg).',
      },
      fields: [
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'people',
          required: true,
        },
        {
          name: 'quote',
          type: 'text',
          required: true,
          admin: { description: 'Becomes reviewBody. Per-endorsement, not per-place.' },
        },
        {
          name: 'associatedRoom',
          type: 'text',
          admin: {
            description: 'xlsx "Room" column — this endorsement\'s letter location.',
          },
        },
      ],
    },
    { name: 'website', type: 'text' },
    { name: 'openingHours', type: 'text' },
    { name: 'priceRange', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imageCredit',
      type: 'group',
      admin: {
        description:
          "Populate whenever image is not the hotel's own photography — required for any CC-licensed source (e.g. Wikimedia Commons), optional/blank for licensed stock or original photography where no visible credit is contractually required.",
      },
      fields: [
        {
          name: 'creditText',
          type: 'text',
          admin: { description: 'e.g. "Photo: Jane Doe, CC BY-SA 4.0"' },
        },
        {
          name: 'creditUrl',
          type: 'text',
          admin: { description: 'Link to the source/license page.' },
        },
        {
          name: 'license',
          type: 'select',
          options: [
            { label: 'CC-BY', value: 'CC-BY' },
            { label: 'CC-BY-SA', value: 'CC-BY-SA' },
            { label: 'Licensed stock', value: 'licensed-stock' },
            { label: 'Original', value: 'original' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
    {
      name: 'authority',
      type: 'group',
      fields: [
        {
          name: 'identifier',
          type: 'array',
          fields: [
            {
              name: 'propertyID',
              type: 'select',
              options: ['Wikidata', 'GND', 'GoogleKG', 'GooglePlaceID'],
              required: true,
            },
            { name: 'value', type: 'text', required: true },
          ],
        },
        {
          name: 'sameAs',
          type: 'array',
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'homepageTeaser',
      type: 'group',
      label: 'Homepage teaser',
      admin: {
        description:
          'Independent from hereTeaser — feature a different set of places on the homepage map. Same pattern as rooms.homepageTeaser. Limit 5 via getTeaserPlaces.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Include this place on the homepage map teaser.' },
        },
        {
          name: 'order',
          type: 'number',
          admin: { description: 'Display order (lower first).' },
        },
      ],
    },
    {
      name: 'hereTeaser',
      type: 'group',
      label: '/here teaser',
      admin: {
        description:
          'Independent from homepageTeaser — feature a different set of places on the /here map teaser.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Include this place on the /here map teaser.' },
        },
        {
          name: 'order',
          type: 'number',
          admin: { description: 'Display order (lower first).' },
        },
      ],
    },
    {
      name: 'featuredOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description:
          'Legacy homepage map pagination order (1–15). Prefer homepageTeaser.enabled/order from the Neighbourhood Map revision brief going forward.',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'active',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
}
