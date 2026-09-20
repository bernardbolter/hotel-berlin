import type { Amenity } from '@/payload-types'

import {
  splitAmenityGraph,
  type SchemaAmenity,
} from '@/lib/aeo-schema/src/builders/amenity'
import { defaultConfig } from '@/lib/aeo-schema/src/lib/config'
import { mediaUrl } from '@/lib/spotlight/media'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'

import { amenityHoursMode } from './formatHours'
import { getSchemaAmenities } from './resolve'

export type LocationFeatureSpecification = {
  '@type': 'LocationFeatureSpecification'
  name: string
  value: true
}

function toSchemaAmenity(doc: Amenity, locale: 'de' | 'en'): SchemaAmenity {
  const image = typeof doc.image === 'object' && doc.image ? mediaUrl(doc.image) : null
  return {
    slug: doc.slug,
    name: doc.title,
    description: doc.summary?.trim() || lexicalToPlain(doc.details) || undefined,
    image: image || undefined,
    schemaType: doc.schemaType ?? 'none',
    linkType: doc.link?.type ?? 'none',
    venueSlug:
      typeof doc.link?.venue === 'object' && doc.link.venue ? doc.link.venue.slug : undefined,
    hoursMode: amenityHoursMode({
      openingHours: doc.openingHours,
      specialHours: doc.specialHours,
      hoursOverride: doc.hoursOverride,
      locale,
      labels: { closed: 'Closed', onRequest: 'On request' },
    }),
    openingHours: doc.openingHours,
  }
}

/** @deprecated Prefer `buildHotelAmenityJsonLd`. Kept for existing tests. */
export function amenitiesToAmenityFeature(docs: Amenity[]): LocationFeatureSpecification[] {
  return docs
    .map((doc) => doc.title?.trim())
    .filter((name): name is string => Boolean(name))
    .map((name) => ({
      '@type': 'LocationFeatureSpecification' as const,
      name,
      value: true as const,
    }))
}

export async function buildHotelAmenityJsonLd(locale: string): Promise<{
  amenityFeature: Record<string, unknown>[]
  containsPlace: Record<string, unknown>[]
}> {
  const loc = locale === 'de' ? 'de' : 'en'
  const docs = await getSchemaAmenities(loc)
  const mapped = docs.map((doc) => toSchemaAmenity(doc, loc))
  return splitAmenityGraph(mapped, defaultConfig)
}

export async function getHotelAmenityFeature(locale: string): Promise<LocationFeatureSpecification[]> {
  const { amenityFeature } = await buildHotelAmenityJsonLd(locale)
  return amenityFeature.filter(
    (node): node is LocationFeatureSpecification => node['@type'] === 'LocationFeatureSpecification',
  )
}
