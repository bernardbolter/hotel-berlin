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
  ],
}
