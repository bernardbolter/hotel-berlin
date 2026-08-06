import type { GlobalConfig } from 'payload'

export const Hotel: GlobalConfig = {
  slug: 'hotel',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'legalName', type: 'text' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Max 160 chars. Used for meta descriptions and AI citation.' },
    },
    { name: 'url', type: 'text' },
    { name: 'telephone', type: 'text' },
    { name: 'conferencePhone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressCountry', type: 'text' },
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
    { name: 'hasMap', type: 'text', admin: { description: 'Google Maps URL' } },
    {
      name: 'directionsUrl',
      type: 'text',
      admin: {
        description:
          '“Get directions” link — Google Maps directions URL. Falls back to hasMap, then coords.',
      },
    },
    {
      name: 'mapBounds',
      type: 'group',
      admin: {
        description: 'Viewport for neighbourhood map and homepage map teaser.',
      },
      fields: [
        { name: 'north', type: 'number' },
        { name: 'south', type: 'number' },
        { name: 'west', type: 'number' },
        { name: 'east', type: 'number' },
      ],
    },
    { name: 'checkinTime', type: 'text' },
    { name: 'checkoutTime', type: 'text' },
    {
      name: 'guestStay',
      label: 'Guest stay info (/here StayInfoCard)',
      type: 'group',
      fields: [
        {
          name: 'checkoutNote',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "noon" / "Mittag"' },
        },
        {
          name: 'breakfastLocation',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "Lütze ground floor"' },
        },
        {
          name: 'wifiNetwork',
          type: 'text',
          admin: { description: 'Guest WiFi SSID — shown in monospace pill' },
        },
        {
          name: 'wifiPassword',
          type: 'text',
          admin: { description: 'Guest WiFi password — shown in monospace pill' },
        },
        {
          name: 'parkingSummary',
          type: 'text',
          localized: true,
          admin: {
            description:
              'e.g. "Underground · 200+ spaces · €4/hr · max €25/day"',
          },
        },
        {
          name: 'luggageNote',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g. "Available after check-out · ask at reception"',
          },
        },
      ],
    },
    { name: 'starRating', type: 'number' },
    { name: 'priceRange', type: 'text' },
    { name: 'totalRooms', type: 'number' },
    { name: 'foundingDate', type: 'text' },
    { name: 'brand', type: 'text' },
    { name: 'parentOrganization', type: 'text' },
    { name: 'wikidataId', type: 'text', admin: { description: 'e.g. Q1630833' } },
    {
      name: 'sameAs',
      type: 'array',
      fields: [{ name: 'url', type: 'text' }],
    },
    {
      name: 'amenityFeature',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'value', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'openingHours',
      type: 'group',
      fields: [
        { name: 'reception', type: 'text', defaultValue: 'Mo-Su 00:00-24:00' },
        { name: 'breakfast', type: 'text', defaultValue: 'Mo-Su 06:30-10:00' },
      ],
    },
    {
      name: 'heroMapImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Circular map image in the homepage hero. Upload a square image (~600×600). Replaces the generated Mapbox preview when set.',
      },
    },
    {
      name: 'getDirectionsLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Hero map CTA label, e.g. "Get Directions" / "Wegbeschreibung".',
      },
    },
    {
      name: 'heroShortAddress',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Short display address under the hero map (e.g. "Lützowplatz 17, Tiergarten"). Distinct from the full structured address.',
      },
    },
    {
      name: 'meetAndWork',
      label: 'Meet & Work',
      type: 'group',
      admin: {
        description:
          'Homepage “Meet & Work” teaser — editable DE/EN copy and rotating photos. Links to /meetings.',
      },
      fields: [
        {
          name: 'kicker',
          type: 'text',
          localized: true,
          admin: { description: 'Section kicker, e.g. "Meet & Work" / "Tagen & Arbeiten".' },
        },
        {
          name: 'subhead',
          type: 'text',
          localized: true,
          admin: {
            description: 'Bold subhead, e.g. "Serious business, playful spaces".',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short pitch paragraph under the subhead.' },
        },
        {
          name: 'slides',
          type: 'array',
          labels: { singular: 'Slide', plural: 'Slides' },
          minRows: 1,
          maxRows: 8,
          admin: {
            description:
              'Rotating photos (like Sleep & Relax). Each slide has an image and a typewriter caption (DE/EN).',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'imageAlt',
              type: 'text',
              localized: true,
              admin: {
                description: 'Descriptive alt text — AEO ImageObject.description.',
              },
            },
            {
              name: 'caption',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Typewriter line under the body, e.g. room/space name. Localize DE + EN.',
              },
            },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Line-CTA label, e.g. "All meeting rooms" / "Alle Meetingräume".',
          },
        },
      ],
    },
    {
      name: 'eatAndDrink',
      label: 'Eat & Drink',
      type: 'group',
      admin: {
        description:
          'Homepage Lütze / Eat & Drink teaser — Rooms-style layout (text + arch photo + one Sweep CTA). Links to /restaurant.',
      },
      fields: [
        {
          name: 'kicker',
          type: 'text',
          localized: true,
          admin: { description: 'Small label above the heading, e.g. "Eat & Drink" / "Essen & Trinken".' },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          admin: {
            description: 'Serif headline, e.g. "The place to eat, play, and hang all day."',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short pitch paragraph under the heading.' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Arch-topped teaser photo (interior / terrace).' },
        },
        {
          name: 'imageAlt',
          type: 'text',
          localized: true,
          admin: {
            description: 'Descriptive alt text — AEO ImageObject.description.',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Sweep-CTA label, e.g. "Eat & Drink" / "Essen & Trinken".',
          },
        },
      ],
    },
  ],
}
