import type { CollectionConfig } from 'payload'

import { geocodeNeighbourhoodPlaceBeforeChange } from './hooks/geocodeNeighbourhoodPlace'

export const NeighbourhoodPlaces: CollectionConfig = {
  slug: 'neighbourhood-places',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'distanceTier', 'status', 'updatedAt'],
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
