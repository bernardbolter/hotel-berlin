import type { PersonCardProps } from '@/components/here/PersonCard'
import { getPayloadClient } from '@/lib/payload/client'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow, getBerlinParts } from '@/lib/venue-time'
import type { NeighbourhoodPlace, Person } from '@/payload-types'

function hashDay(dateKey: string): number {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function rotateByDay<T>(items: T[], dateKey: string): T[] {
  if (items.length === 0) return items
  const start = hashDay(dateKey) % items.length
  return [...items.slice(start), ...items.slice(0, start)]
}

function recsFromPicks(
  person: Person,
  walkLabel: (minutes: number) => string,
): PersonCardProps['recs'] {
  const docs = person.picks?.docs ?? []
  const recs: PersonCardProps['recs'] = []
  for (const doc of docs) {
    if (!doc || typeof doc === 'number') continue
    const place = doc as NeighbourhoodPlace
    if (!place.name) continue
    recs.push({
      name: place.name,
      distance:
        place.walkingMinutes != null ? walkLabel(place.walkingMinutes) : '',
    })
    if (recs.length >= 3) break
  }
  return recs
}

/**
 * Four people: featured first, then displayOrder, rotated by Berlin date
 * so a three-night stay sees different faces. No second clock.
 */
export async function getHubPeople(
  locale: string,
  copy: {
    walk: (minutes: number) => string
    room: (n: string) => string
    cta: string
    roleFallback: string
  },
  now: Date = getBerlinNow(),
): Promise<PersonCardProps[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({
      collection: 'people',
      locale: locale === 'de' ? 'de' : 'en',
      where: { status: { equals: 'published' } },
      depth: 2,
      limit: 50,
      sort: 'displayOrder',
    })
    .catch(() => ({ docs: [] as Person[] }))

  if (docs.length === 0) return []

  const people = docs as Person[]
  people.sort((a, b) => {
    const feat = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    if (feat !== 0) return feat
    const orderA = a.displayOrder ?? 999
    const orderB = b.displayOrder ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })

  const { dateKey } = getBerlinParts(now)
  const rotated = rotateByDay(people, dateKey).slice(0, 4)

  return rotated.map((person) => {
    const src = mediaUrl(person.portrait)
    return {
      role: person.jobTitle?.trim() || copy.roleFallback,
      room: person.roomConfirmed && person.roomNumber?.trim()
        ? copy.room(person.roomNumber.trim())
        : null,
      name: person.name,
      subline: person.shortBio?.trim() || person.basedIn?.trim() || null,
      recs: recsFromPicks(person, copy.walk),
      cta: copy.cta,
      href: person.slug ? `/you-me-berlin/${person.slug}` : null,
      portrait: src
        ? { src, alt: mediaAlt(person.portrait, person.name) }
        : null,
    }
  })
}
