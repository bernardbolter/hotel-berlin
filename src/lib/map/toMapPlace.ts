import type { PlaceInfoCardEndorsement } from '@/components/map/PlaceInfoCard'
import type { MapViewPlace } from '@/components/map/PlacesMapView'
import { personInitials } from '@/lib/people/initials'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export function mediaFileUrl(
  image: { url?: string | null } | number | null | undefined,
): string | null {
  return typeof image === 'object' && image && image.url ? image.url : null
}

export function mediaFileAlt(
  image: { url?: string | null; alt?: string | null } | number | null | undefined,
  fallback = '',
): string {
  if (typeof image === 'object' && image && 'alt' in image) {
    return image.alt || fallback
  }
  return fallback
}

type EndorsementPerson = NonNullable<NeighbourhoodPlaceDoc['endorsements']>[number]['person']

export function personFromEndorsement(
  person: EndorsementPerson,
  opts: { requirePublished?: boolean } = {},
): {
  slug: string
  name: string
  jobTitle?: string | null
  portrait?: { url?: string | null } | number | null
} | null {
  if (!person || typeof person !== 'object') return null
  if (typeof person.slug !== 'string') return null
  if (opts.requirePublished && person.status && person.status !== 'published') {
    return null
  }
  return {
    slug: person.slug,
    name: person.name,
    jobTitle: person.jobTitle,
    portrait: person.portrait ?? null,
  }
}

export function endorsementChips(
  place: NeighbourhoodPlaceDoc,
  opts: { requirePublished?: boolean } = {},
): PlaceInfoCardEndorsement[] {
  return (
    place.endorsements
      ?.map((entry) => personFromEndorsement(entry.person, opts))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map((p) => ({
        person: {
          name: p.name,
          slug: p.slug,
          initials: personInitials(p.name),
        },
      })) ?? []
  )
}

type TransitLabels = {
  walkingLabel?: string
  transitLabel?: string
  categoryLabel: string
}

export function toMapViewPlace(
  place: NeighbourhoodPlaceDoc,
  labels: TransitLabels,
  opts: {
    requirePublishedEndorsers?: boolean
    leadPersonSlug?: string | null
  } = {},
): MapViewPlace | null {
  const lat = place.geo?.latitude
  const lng = place.geo?.longitude
  if (lat == null || lng == null) return null

  const transitRaw = place.transit
  const transit =
    transitRaw?.minutes != null && transitRaw.station && transitRaw.line
      ? {
          minutes: transitRaw.minutes,
          station: transitRaw.station,
          line: transitRaw.line,
        }
      : null

  const imageSrc = mediaFileUrl(place.image)
  const creditText = place.imageCredit?.creditText?.trim()
  const endorsements = endorsementChips(place, {
    requirePublished: opts.requirePublishedEndorsers,
  })

  const leadEntry = opts.leadPersonSlug
    ? place.endorsements?.find((entry) => {
        const person = personFromEndorsement(entry.person)
        return person?.slug === opts.leadPersonSlug
      })
    : place.endorsements?.find((entry) =>
        personFromEndorsement(entry.person, {
          requirePublished: opts.requirePublishedEndorsers,
        }),
      )

  const leadResolved = leadEntry
    ? personFromEndorsement(leadEntry.person, {
        requirePublished: opts.requirePublishedEndorsers && !opts.leadPersonSlug,
      })
    : null

  const leadPerson = leadResolved
    ? {
        name: leadResolved.name,
        slug: leadResolved.slug,
        jobTitle: leadResolved.jobTitle,
        initials: personInitials(leadResolved.name),
        portraitUrl: mediaFileUrl(leadResolved.portrait),
        quote: leadEntry?.quote ?? null,
      }
    : null

  return {
    id: String(place.id),
    slug: place.slug,
    name: place.name,
    category: place.category as PlaceCategory,
    categoryLabel: labels.categoryLabel,
    description: place.description,
    walkingMinutes: place.walkingMinutes,
    walkingLabel: labels.walkingLabel,
    transit,
    transitLabel: transit ? labels.transitLabel : undefined,
    image: imageSrc
      ? { src: imageSrc, alt: mediaFileAlt(place.image, place.name) }
      : null,
    imageCredit: creditText
      ? {
          creditText,
          creditUrl: place.imageCredit?.creditUrl?.trim() || null,
        }
      : null,
    endorsements,
    leadPerson,
    latitude: lat,
    longitude: lng,
  }
}

export function mapPlaceLabels(
  place: NeighbourhoodPlaceDoc,
  t: {
    category: (category: string) => string
    walking: (minutes: number) => string
    transit: (args: { minutes: number; line: string; station: string }) => string
  },
) {
  const transitRaw = place.transit
  const hasTransit =
    transitRaw?.minutes != null && Boolean(transitRaw.station) && Boolean(transitRaw.line)

  return {
    categoryLabel: t.category(place.category),
    walkingLabel:
      place.walkingMinutes != null ? t.walking(place.walkingMinutes) : undefined,
    transitLabel:
      hasTransit && transitRaw
        ? t.transit({
            minutes: transitRaw.minutes!,
            line: transitRaw.line!,
            station: transitRaw.station!,
          })
        : undefined,
  }
}
