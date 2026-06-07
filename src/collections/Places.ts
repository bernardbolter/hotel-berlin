import type { CollectionConfig } from 'payload'

export const Places: CollectionConfig = {
  slug: 'places',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'context', 'type', 'category', 'walkingMinutes'],
    group: 'Neighbourhood',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async () => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel-berlin.de'
        const secret = process.env.REVALIDATE_SECRET

        if (!secret) return

        await fetch(`${baseUrl}/api/revalidate?path=/neighbourhood&secret=${secret}`)
        await fetch(`${baseUrl}/api/revalidate?path=/here/explore&secret=${secret}`)
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Display name shown on map and cards' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier — auto-generated from name, editable' },
    },
    {
      name: 'context',
      type: 'select',
      required: true,
      options: [
        { label: 'Outside — neighbourhood map only (/neighbourhood)', value: 'outside' },
        { label: 'Inside — guest explore only (/here/explore)', value: 'inside' },
        { label: 'Both — appears on both maps', value: 'both' },
      ],
      admin: {
        description:
          'Controls which map this place appears on. "Both" = hotel concierge picks visible to all.',
        components: {
          Cell: '/components/admin/ContextBadge',
        },
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Monument — landmark, site, or attraction', value: 'monument' },
        { label: 'Concierge pick — team recommendation', value: 'concierge' },
        { label: 'In the building — inside the hotel', value: 'in-building' },
      ],
      admin: {
        description:
          'Monument = static editorial content. Concierge = team voice, updated seasonally. In the building = Lütze, KTTK, FKKB etc.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Park & outdoor', value: 'park' },
        { label: 'Museum', value: 'museum' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Music & culture', value: 'culture' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Bar', value: 'bar' },
        { label: 'Café', value: 'cafe' },
        { label: 'Shop', value: 'shop' },
        { label: 'Transport', value: 'transport' },
        { label: 'Sport', value: 'sport' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'shortDescription',
      type: 'text',
      required: true,
      admin: {
        description:
          'One line — shown in map popup and card previews. Max 120 characters. Write in the hotel voice — direct, specific, no superlatives.',
      },
    },
    {
      name: 'shortDescriptionDE',
      type: 'text',
      admin: { description: 'German version of short description. Write natively — do not translate.' },
    },
    {
      name: 'fullDescription',
      type: 'richText',
      admin: {
        description:
          'Used on detail pages and expanded card views. Optional for monuments, recommended for concierge picks.',
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'lat',
          type: 'number',
          required: true,
          admin: { description: 'Latitude — e.g. 52.5027' },
        },
        {
          name: 'lng',
          type: 'number',
          required: true,
          admin: { description: 'Longitude — e.g. 13.3583' },
        },
      ],
    },
    {
      name: 'address',
      type: 'text',
      admin: { description: 'Street address — shown in popup. Optional for parks and landmarks.' },
    },
    {
      name: 'walkingMinutes',
      type: 'number',
      admin: {
        condition: (data) => data.type !== 'in-building',
        description:
          'Walking time from hotel in minutes. Fill this in manually — the team knows whether it is a nice walk or not. Leave empty for in-building places.',
      },
    },
    {
      name: 'walkingNote',
      type: 'text',
      admin: {
        condition: (data) => data.type !== 'in-building',
        description: 'Optional note on the walk — e.g. "Nice route along the canal". Keep it short.',
      },
    },
    {
      name: 'floor',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'in-building',
        description: 'For in-building places only — e.g. "Ground floor", "B2 Basement", "Every floor". Replaces walking time in the UI.',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Full URL including https://' },
    },
    {
      name: 'hours',
      type: 'text',
      admin: {
        description: 'Opening hours as a simple string — e.g. "Daily 10:00–22:00" or "Thu–Sun from 18:00"',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used in card views and detail pages. Not shown on the map itself.' },
    },
    {
      name: 'pinIcon',
      type: 'select',
      options: [
        { label: 'Default (set by category)', value: 'auto' },
        { label: 'Building', value: 'building' },
        { label: 'Tree / park', value: 'park' },
        { label: 'Music', value: 'music' },
        { label: 'Coffee', value: 'cafe' },
        { label: 'Shop', value: 'shop' },
        { label: 'Gallery / art', value: 'gallery' },
        { label: 'Waves / water', value: 'waves' },
        { label: 'Architecture', value: 'arch' },
        { label: 'Table tennis', value: 'sport' },
      ],
      defaultValue: 'auto',
      admin: {
        description:
          'Overrides the automatic icon set by category. Leave as "auto" unless you need something specific.',
      },
    },
    {
      name: 'schemaType',
      type: 'select',
      options: [
        { label: 'LodgingBusiness', value: 'LodgingBusiness' },
        { label: 'TouristAttraction', value: 'TouristAttraction' },
        { label: 'LocalBusiness', value: 'LocalBusiness' },
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'CafeOrCoffeeShop', value: 'CafeOrCoffeeShop' },
        { label: 'BarOrPub', value: 'BarOrPub' },
        { label: 'Park', value: 'Park' },
        { label: 'ArtGallery', value: 'ArtGallery' },
        { label: 'Museum', value: 'Museum' },
        { label: 'SportsActivityLocation', value: 'SportsActivityLocation' },
      ],
      defaultValue: 'TouristAttraction',
      admin: {
        description:
          'Schema.org type used in JSON-LD output. Defaults to TouristAttraction — change for restaurants, bars etc.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Featured places are shown on the homepage MapTeaser. Keep to 6–8 maximum.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide from maps and lists without deleting the record.' },
    },
  ],
}
