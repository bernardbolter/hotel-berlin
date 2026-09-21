import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { openingHoursArrayField } from '../fields/openingHours'
import { specialHoursArrayField } from '../fields/specialHours'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const Venues: CollectionConfig = {
  slug: 'venues',
  ...collectionCacheHooks('venues'),
  access: publicReadStaffWrite,
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'venueType',
      type: 'select',
      required: true,
      options: [
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'Bar', value: 'Bar' },
        { label: 'Art Gallery', value: 'ArtGallery' },
        { label: 'Sports Activity Location', value: 'SportsActivityLocation' },
        { label: 'Event Venue', value: 'EventVenue' },
        { label: 'Local Business', value: 'LocalBusiness' },
      ],
    },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'e.g. "B2 Basement", "Ground Floor", "Lützowplatz 17"' },
    },
    {
      name: 'spotlightLocation',
      type: 'text',
      admin: {
        description:
          'Short in-building location for spotlight/hero secondary meta, e.g. "B2 Basement"',
      },
    },
    { name: 'telephone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'text' },
    { name: 'instagramUrl', type: 'text' },
    {
      name: 'venueMonogram',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional SVG/logo mark for SpotlightCard identity row' },
    },
    openingHoursArrayField(),
    specialHoursArrayField(),
    {
      name: 'servesCuisine',
      type: 'text',
      admin: { description: 'Restaurant only. e.g. Italian, International' },
    },
    { name: 'reservationUrl', type: 'text' },
    { name: 'menuUrl', type: 'text' },
    { name: 'priceRange', type: 'text' },
    { name: 'isOpenToPublic', type: 'checkbox', defaultValue: true },
    { name: 'isGuestFacing', type: 'checkbox', defaultValue: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
      ],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'displayOrder', type: 'number' },
  ],
}
