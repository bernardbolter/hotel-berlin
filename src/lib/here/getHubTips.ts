import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import {
  HUB_TIP_SLUGS,
  pickHubTips,
} from '@/lib/here/pickHubTips'
import { HERE_IMAGES } from '@/lib/here/images'
import { withPlaceImageFallback } from '@/lib/places/teaserImageFallbacks'
import { getPayloadClient } from '@/lib/payload/client'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow, getBerlinParts } from '@/lib/venue-time'
import type {
  IndoorOutdoor,
  PlaceCategory,
  TargetAudience,
} from '@/lib/neighbourhood/constants'
import type { NeighbourhoodPlace, Person } from '@/payload-types'

import type { TipCardEndorser, TipCardProps } from '@/components/here/TipCard'

export { pickHubTips, HUB_TIP_SLUGS } from '@/lib/here/pickHubTips'

export type HubTipCopy = {
  walk: (minutes: number) => string
  room: (n: string) => string
  placeholder: string
  noEndorser: string
  roleFallback: string
  categoryLabel: (category: PlaceCategory) => string
  roles: Record<string, string>
}

export type ExploreTipFilters = {
  category?: PlaceCategory | null
  indoorOutdoor?: IndoorOutdoor | null
  audience?: TargetAudience | null
}

function asPerson(value: unknown): Person | null {
  if (!value || typeof value === 'number') return null
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return value as Person
  }
  return null
}

export function leadPerson(place: NeighbourhoodPlace): Person | null {
  for (const row of place.endorsements ?? []) {
    const person = asPerson(row.person)
    if (person?.status === 'published') return person
  }
  return null
}

export function matchExploreFilters(
  place: NeighbourhoodPlace,
  filters: ExploreTipFilters,
): boolean {
  if (filters.category && place.category !== filters.category) return false

  if (filters.indoorOutdoor) {
    const indoor = place.indoorOutdoor
    if (filters.indoorOutdoor === 'both') {
      if (indoor !== 'both') return false
    } else if (indoor !== filters.indoorOutdoor && indoor !== 'both') {
      return false
    }
  }

  if (filters.audience) {
    const labels = (place.targetAudience ?? [])
      .map((row) => row.label)
      .filter((label): label is string => Boolean(label))
    if (!labels.includes(filters.audience)) return false
  }

  return true
}

function isRandomPlaceholder(src: string): boolean {
  return src.includes('picsum.photos')
}

const TIP_STAND_INS = [
  HERE_IMAGES.lutzeInterior,
  HERE_IMAGES.lutze,
  HERE_IMAGES.kttk,
  HERE_IMAGES.fkkb,
  HERE_IMAGES.muralSomari,
] as const

function standInForSlug(slug: string, alt: string): { src: string; alt: string } {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i)) | 0
  const pick = TIP_STAND_INS[Math.abs(hash) % TIP_STAND_INS.length]!
  return { src: pick.src, alt }
}

/**
 * Always fill the card: CMS photo, credited fallback, then a local stand-in.
 * Never picsum. Endorser portraits stay in the avatar, not the 4:3 media.
 */
export function tipCardImage(place: NeighbourhoodPlace): { src: string; alt: string } {
  const placeSrc = mediaUrl(place.image)
  const cms =
    placeSrc && !isRandomPlaceholder(placeSrc)
      ? { src: placeSrc, alt: mediaAlt(place.image, place.name) }
      : null

  const resolved = withPlaceImageFallback(place.slug, cms, null, place.name)
  const fromPlace =
    resolved.image?.src && !isRandomPlaceholder(resolved.image.src) ? resolved.image : null

  return fromPlace ?? standInForSlug(place.slug, place.name)
}

export function placeToTipCard(
  place: NeighbourhoodPlace,
  copy: HubTipCopy,
): TipCardProps {
  const category = place.category as PlaceCategory
  const person = leadPerson(place)
  const walk = place.walkingMinutes != null ? copy.walk(place.walkingMinutes) : null

  let endorser: TipCardEndorser | null = null
  let portrait: { src: string; alt: string } | null = null
  if (person) {
    const portraitSrc = mediaUrl(person.portrait)
    portrait = portraitSrc
      ? { src: portraitSrc, alt: mediaAlt(person.portrait, person.name) }
      : null
  }

  const image = tipCardImage(place)

  if (person) {
    endorser = {
      name: person.name,
      role: copy.roles[person.slug] || person.jobTitle?.trim() || copy.roleFallback,
      room:
        person.roomConfirmed && person.roomNumber?.trim()
          ? copy.room(person.roomNumber.trim())
          : null,
      href: person.slug ? `/you-me-berlin/${person.slug}` : null,
      portrait: portrait ?? image,
    }
  }

  return {
    slug: place.slug,
    name: place.name,
    category,
    categoryLabel: copy.categoryLabel(category),
    categoryColor: pinColorForCategory(category),
    description: place.description?.trim() || null,
    walkingLabel: walk,
    image,
    placeholderLabel: copy.placeholder,
    noEndorserLabel: copy.noEndorser,
    href: `/neighbourhood/${place.slug}`,
    endorser,
  }
}

export async function loadHubTipPlaces(locale: string): Promise<NeighbourhoodPlace[]> {
  const payload = await getPayloadClient()
  const loc = locale === 'de' ? 'de' : 'en'
  const { docs } = await payload
    .find({
      collection: 'neighbourhood-places',
      locale: loc,
      where: {
        and: [{ status: { equals: 'active' } }, { slug: { in: [...HUB_TIP_SLUGS] } }],
      },
      depth: 2,
      limit: 20,
    })
    .catch(() => ({ docs: [] as NeighbourhoodPlace[] }))

  const bySlug = new Map((docs as NeighbourhoodPlace[]).map((doc) => [doc.slug, doc]))
  return HUB_TIP_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (doc): doc is NeighbourhoodPlace => Boolean(doc),
  )
}

/**
 * Four tip cards for /here §6. Rotate over the ten seeded tips, never two
 * from the same endorser. Room pills only when `roomConfirmed`.
 */
export async function getHubTips(
  locale: string,
  copy: HubTipCopy,
  now: Date = getBerlinNow(),
): Promise<TipCardProps[]> {
  const ordered = await loadHubTipPlaces(locale)
  const { dateKey } = getBerlinParts(now)
  const candidates = ordered.map((place) => ({
    placeSlug: place.slug,
    endorserSlug: leadPerson(place)?.slug ?? null,
    place,
  }))

  return pickHubTips(candidates, dateKey, 4).map(({ place }) => placeToTipCard(place, copy))
}

/** All seeded tips matching combined explore filters — drives pins, list, and count. */
export async function getExploreTips(
  locale: string,
  copy: HubTipCopy,
  filters: ExploreTipFilters,
): Promise<{ places: NeighbourhoodPlace[]; cards: TipCardProps[] }> {
  const ordered = await loadHubTipPlaces(locale)
  const places = ordered.filter((place) => matchExploreFilters(place, filters))
  return {
    places,
    cards: places.map((place) => placeToTipCard(place, copy)),
  }
}
