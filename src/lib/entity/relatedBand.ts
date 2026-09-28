import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { districtFromPostalCode } from '@/lib/places/district'
import { haversineMeters } from '@/lib/entity/computed/haversine'
import type { LngLat } from '@/lib/entity/computed/types'
import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { getPayloadClient } from '@/lib/payload/client'
import type { NeighbourhoodPlace, Person } from '@/payload-types'

export type RelatedBandSource = 'endorser' | 'district' | 'mixed'

export type RelatedStripItem = {
  name: string
  slug: string
  category: PlaceCategory
  /** Endorsement quote shown in the strip cell */
  quote: string | null
  /** Name under the quote when not the endorser band */
  quoteByName: string | null
  /** 1-based editor pick number — only set in the endorser band */
  editorIndex: number | null
  geo: LngLat | null
  walkingMinutes: number | null
}

export type RelatedPlacesBand = {
  source: RelatedBandSource
  items: RelatedStripItem[]
  /** Lead endorser when source is endorser (for CTA / heading) */
  endorser: { id: number | string; name: string; slug: string; firstName: string } | null
  district: string | null
}

type Tagged = {
  place: NeighbourhoodPlace
  via: 'endorser' | 'district' | 'category' | 'nearest'
}

function firstName(full: string): string {
  const part = full.trim().split(/\s+/)[0]
  return part || full
}

function geoOf(place: NeighbourhoodPlace): LngLat | null {
  const lat = place.geo?.latitude
  const lng = place.geo?.longitude
  if (lat == null || lng == null) return null
  return { lat: Number(lat), lng: Number(lng) }
}

function quoteFromPlace(
  place: NeighbourhoodPlace,
  preferPersonId?: string | number | null,
): { quote: string | null; byName: string | null } {
  const ents = place.endorsements ?? []
  if (preferPersonId != null) {
    const hit = ents.find((e) => {
      const id = typeof e.person === 'object' ? e.person?.id : e.person
      return id === preferPersonId
    })
    if (hit?.quote?.trim()) {
      const person = typeof hit.person === 'object' ? hit.person : null
      return { quote: hit.quote.trim(), byName: person?.name ?? null }
    }
  }
  const first = ents.find((e) => e.quote?.trim())
  if (!first) return { quote: null, byName: null }
  const person = typeof first.person === 'object' ? first.person : null
  return { quote: first.quote.trim(), byName: person?.name ?? null }
}

function toStripItem(
  place: NeighbourhoodPlace,
  opts: {
    editorIndex: number | null
    preferPersonId?: string | number | null
    showQuoteBy: boolean
  },
): RelatedStripItem {
  const q = quoteFromPlace(place, opts.preferPersonId)
  return {
    name: place.name,
    slug: place.slug,
    category: place.category as PlaceCategory,
    quote: q.quote,
    quoteByName: opts.showQuoteBy ? q.byName : null,
    editorIndex: opts.editorIndex,
    geo: geoOf(place),
    walkingMinutes: place.walkingMinutes ?? null,
  }
}

/**
 * One always-filled borrowed band (Direction C R3).
 * Widens: endorser → district → category → nearest by metres.
 * Exactly 3 or null.
 */
export async function getRelatedPlacesBand(args: {
  excludeSlug: string
  category: PlaceCategory
  district: string | null
  leadEndorser: Person | null
  locale: 'de' | 'en'
  hotel?: LngLat
}): Promise<RelatedPlacesBand | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'neighbourhood-places',
    locale: args.locale,
    fallbackLocale: 'en',
    where: {
      and: [
        { status: { equals: 'active' } },
        { slug: { not_equals: args.excludeSlug } },
      ],
    },
    depth: 2,
    limit: 200,
    sort: 'name',
  })

  const hotel = args.hotel ?? {
    lng: DEFAULT_HOTEL_COORDS.lng,
    lat: DEFAULT_HOTEL_COORDS.lat,
  }

  const seen = new Set<string>()
  const picked: Tagged[] = []

  const take = (place: NeighbourhoodPlace, via: Tagged['via']) => {
    if (seen.has(place.slug) || picked.length >= 3) return
    seen.add(place.slug)
    picked.push({ place, via })
  }

  // Editor pick order for the lead endorser (for numbers + endorser pool)
  let endorserPickOrder = new Map<string, number>()
  if (args.leadEndorser) {
    const person = await payload.findByID({
      collection: 'people',
      id: args.leadEndorser.id,
      locale: args.locale,
      depth: 1,
      joins: { picks: { limit: 100 } },
    })
    const pickDocs = (person.picks?.docs ?? []).filter(
      (d): d is NeighbourhoodPlace =>
        typeof d === 'object' && d != null && d.status === 'active',
    )
    endorserPickOrder = new Map(pickDocs.map((p, i) => [p.slug, i + 1]))

    for (const place of pickDocs) {
      if (place.slug === args.excludeSlug) continue
      const full = docs.find((d) => d.slug === place.slug) ?? place
      take(full, 'endorser')
    }
  }

  if (picked.length < 3 && args.district) {
    for (const place of docs) {
      if (districtFromPostalCode(place.address?.postalCode) === args.district) {
        take(place, 'district')
      }
    }
  }

  if (picked.length < 3) {
    for (const place of docs) {
      if (place.category === args.category) take(place, 'category')
    }
  }

  if (picked.length < 3) {
    const withDist = docs
      .map((place) => {
        const g = geoOf(place)
        return {
          place,
          meters: g ? haversineMeters(hotel, g) : Number.POSITIVE_INFINITY,
        }
      })
      .sort((a, b) => a.meters - b.meters)
    for (const { place } of withDist) take(place, 'nearest')
  }

  if (picked.length < 3) return null

  const items3 = picked.slice(0, 3)
  const vias = items3.map((t) => t.via)
  let source: RelatedBandSource = 'mixed'
  if (vias.every((v) => v === 'endorser')) source = 'endorser'
  else if (vias.every((v) => v === 'district')) source = 'district'

  const showQuoteBy = source !== 'endorser'
  const preferId = source === 'endorser' ? args.leadEndorser?.id : null

  const items = items3.map(({ place }) =>
    toStripItem(place, {
      editorIndex:
        source === 'endorser' ? (endorserPickOrder.get(place.slug) ?? null) : null,
      preferPersonId: preferId,
      showQuoteBy,
    }),
  )

  const endorser =
    source === 'endorser' && args.leadEndorser
      ? {
          id: args.leadEndorser.id,
          name: args.leadEndorser.name,
          slug: args.leadEndorser.slug,
          firstName: firstName(args.leadEndorser.name),
        }
      : null

  return {
    source,
    items,
    endorser,
    district: args.district,
  }
}

/** Count of active places a person endorses (for “empfiehlt n Orte”). */
export async function countPlacesByPerson(
  personId: string | number,
  locale: 'de' | 'en',
): Promise<number> {
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.find({
    collection: 'neighbourhood-places',
    locale,
    where: {
      and: [
        { status: { equals: 'active' } },
        { 'endorsements.person': { equals: personId } },
      ],
    },
    depth: 0,
    limit: 1,
  })
  return totalDocs
}
