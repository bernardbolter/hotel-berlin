import type { JsonLdNode, SiteConfig } from '../types'
import { amenityNodeId, hotelNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

export type AmenitySchemaType = 'none' | 'ExerciseGym' | 'SportsActivityLocation' | 'ParkingFacility'
export type AmenityHoursMode = 'always' | 'schedule' | 'onRequest' | 'unknown'

export type SchemaAmenity = {
  slug: string
  name: string
  description?: string
  image?: string
  schemaType?: AmenitySchemaType | null
  hoursMode: AmenityHoursMode
  openingHours?: { dayOfWeek?: string | null; opens?: string | null; closes?: string | null }[] | null
}

const DAYS: Record<string, string[]> = {
  'mo-su': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'mo-so': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'mon-sun': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'mo-fr': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  'sa-su': ['Saturday', 'Sunday'],
  'sa-so': ['Saturday', 'Sunday'],
}

function dayOfWeek(token: string | null | undefined): string[] | string | undefined {
  if (!token) return undefined
  const key = token.trim().toLowerCase().replace(/–/g, '-')
  if (DAYS[key]) return DAYS[key]
  return token
}

function openingHoursSpecification(amenity: SchemaAmenity): JsonLdNode[] | undefined {
  if (amenity.hoursMode !== 'always' && amenity.hoursMode !== 'schedule') return undefined
  const rows = amenity.openingHours?.filter((row) => row.opens?.trim()) ?? []
  if (amenity.hoursMode === 'always' && rows.length === 0) {
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS['mo-su'],
        opens: '00:00',
        closes: '24:00',
      },
    ]
  }
  if (rows.length === 0) return undefined
  return rows.map((row) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: dayOfWeek(row.dayOfWeek),
    opens: row.opens,
    closes: row.closes,
  }))
}

export function buildAmenityNode(amenity: SchemaAmenity, config: SiteConfig): JsonLdNode | null {
  const schemaType = amenity.schemaType && amenity.schemaType !== 'none' ? amenity.schemaType : null
  const id = amenityNodeId(amenity.slug, config)

  if (schemaType) {
    return prune({
      '@type': schemaType,
      '@id': id,
      name: amenity.name,
      description: amenity.description,
      image: amenity.image,
      containedInPlace: { '@id': hotelNodeId(config) },
      openingHoursSpecification: openingHoursSpecification(amenity),
    })
  }

  return prune({
    '@type': 'LocationFeatureSpecification',
    '@id': id,
    name: amenity.name,
    description: amenity.description,
    value: true,
    image: amenity.image,
  })
}

export function splitAmenityGraph(
  amenities: SchemaAmenity[],
  config: SiteConfig,
): { amenityFeature: JsonLdNode[]; containsPlace: JsonLdNode[] } {
  const amenityFeature: JsonLdNode[] = []
  const containsPlace: JsonLdNode[] = []
  for (const amenity of amenities) {
    const node = buildAmenityNode(amenity, config)
    if (!node) continue
    if (amenity.schemaType && amenity.schemaType !== 'none') containsPlace.push(node)
    else amenityFeature.push(node)
  }
  return { amenityFeature, containsPlace }
}
