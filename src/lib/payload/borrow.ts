import type { Where } from 'payload'

import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { districtFromPostalCode } from '@/lib/places/district'
import { takeFilledRow } from '@/lib/entity/takeFilledRow'
import { safeMediaUrl } from '@/lib/entity/mediaUrl'
import { mediaFileAlt, mediaFileUrl, personFromEndorsement } from '@/lib/map/toMapPlace'
import { getPayloadClient } from '@/lib/payload/client'
import { getEventOccurrences } from '@/lib/payload/getEventOccurrences'
import { getBerlinNow } from '@/lib/venue-time'
import type { Event, NeighbourhoodPlace, Person } from '@/payload-types'

export type PlaceCardData = {
  name: string
  slug: string
  category: PlaceCategory
  walkingMinutes?: number | null
  description?: string | null
  imageUrl?: string | null
  imageAlt?: string
  district: string | null
  endorsements: { personSlug: string; personName: string }[]
}

export type PersonCardData = {
  name: string
  slug: string
  jobTitle?: string | null
  roomNumber?: string | null
  shortBio?: string | null
  portraitUrl?: string | null
  portraitAlt?: string
  tags: string[]
}

export type EventCardData = {
  name: string
  slug: string
  category?: string | null
  venueName?: string | null
  start: Date
  alwaysOn: boolean
  isFree?: boolean | null
  price?: number | null
}

type Locale = 'de' | 'en'

function toPlaceCard(place: NeighbourhoodPlace): PlaceCardData {
  const imageUrl = safeMediaUrl(mediaFileUrl(place.image))
  const endorsements =
    place.endorsements
      ?.map((entry) => personFromEndorsement(entry.person, { requirePublished: true }))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map((p) => ({ personSlug: p.slug, personName: p.name })) ?? []

  return {
    name: place.name,
    slug: place.slug,
    category: place.category,
    walkingMinutes: place.walkingMinutes,
    description: place.description,
    imageUrl,
    imageAlt: mediaFileAlt(place.image, place.name),
    district: districtFromPostalCode(place.address?.postalCode),
    endorsements,
  }
}

function toPersonCard(person: Person): PersonCardData {
  const tags =
    person.tags
      ?.map((tag) => (typeof tag === 'object' && tag ? tag.name : null))
      .filter((name): name is string => Boolean(name)) ?? []

  return {
    name: person.name,
    slug: person.slug,
    jobTitle: person.jobTitle,
    roomNumber: person.roomConfirmed ? person.roomNumber : null,
    shortBio: person.shortBio,
    portraitUrl: safeMediaUrl(mediaFileUrl(person.portrait)),
    portraitAlt: mediaFileAlt(person.portrait, person.name),
    tags,
  }
}

function toEventCard(args: {
  event: Event
  start: Date
  alwaysOn: boolean
}): EventCardData {
  const venue = typeof args.event.venue === 'object' && args.event.venue ? args.event.venue : null
  return {
    name: args.event.name,
    slug: args.event.slug,
    category: args.event.category,
    venueName: venue?.name ?? null,
    start: args.start,
    alwaysOn: args.alwaysOn,
    isFree: args.event.isFree,
    price: args.event.price,
  }
}

async function findActivePlaces(locale: Locale, extraWhere?: Where) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'neighbourhood-places',
    locale,
    fallbackLocale: 'en',
    where: extraWhere
      ? { and: [{ status: { equals: 'active' } }, extraWhere] }
      : { status: { equals: 'active' } },
    depth: 2,
    limit: 200,
    sort: 'name',
  })
  return docs
}

export async function getPlacesByPerson(
  personId: string | number,
  excludeSlug: string,
  locale: Locale,
  limit = 3,
): Promise<PlaceCardData[]> {
  const docs = await findActivePlaces(locale, {
    'endorsements.person': { equals: personId },
    slug: { not_equals: excludeSlug },
  })
  return takeFilledRow(docs.map(toPlaceCard), limit)
}

export async function getPlacesInDistrict(
  district: string,
  excludeSlug: string,
  locale: Locale,
  limit = 3,
): Promise<PlaceCardData[]> {
  const docs = await findActivePlaces(locale, { slug: { not_equals: excludeSlug } })
  const inDistrict = docs.filter((doc) => districtFromPostalCode(doc.address?.postalCode) === district)
  if (inDistrict.length >= limit) return takeFilledRow(inDistrict.map(toPlaceCard), limit)

  const category = inDistrict[0]?.category
  if (!category) return []

  const sameCategory = docs.filter(
    (doc) => doc.category === category && !inDistrict.some((d) => d.slug === doc.slug),
  )
  const widened = [...inDistrict, ...sameCategory]
  return takeFilledRow(widened.map(toPlaceCard), limit)
}

export async function getPeopleSharingTags(
  personId: string | number,
  locale: Locale,
  limit = 3,
): Promise<PersonCardData[]> {
  const payload = await getPayloadClient()
  const person = await payload.findByID({
    collection: 'people',
    id: personId,
    locale,
    depth: 1,
  })

  const tagIds =
    person.tags
      ?.map((tag) => (typeof tag === 'object' && tag ? tag.id : tag))
      .filter((id): id is number => typeof id === 'number') ?? []

  if (tagIds.length === 0) return []

  const { docs } = await payload.find({
    collection: 'people',
    locale,
    where: {
      and: [
        { status: { equals: 'published' } },
        { id: { not_equals: personId } },
        { tags: { in: tagIds } },
      ],
    },
    depth: 1,
    limit: 20,
    sort: 'name',
  })

  return takeFilledRow(docs.map(toPersonCard), limit)
}

export async function getEventsInWindow(
  excludeSlug: string,
  locale: Locale,
  limit = 3,
  now: Date = getBerlinNow(),
): Promise<EventCardData[]> {
  const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const occs = await getEventOccurrences({
    from: now,
    to,
    locale,
    includeAlwaysOn: true,
  })

  const seen = new Set<string>()
  const unique: EventCardData[] = []
  for (const occ of occs) {
    if (occ.event.slug === excludeSlug || seen.has(occ.event.slug)) continue
    seen.add(occ.event.slug)
    unique.push(toEventCard({ event: occ.event, start: occ.start, alwaysOn: occ.alwaysOn }))
  }

  return takeFilledRow(unique, limit)
}
