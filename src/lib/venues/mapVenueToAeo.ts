import type { Venue as AeoVenue, VenueType } from '@/lib/aeo-schema/src/types'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import type { Media, Venue } from '@/payload-types'

const VENUE_TYPES: VenueType[] = [
  'Restaurant',
  'Bar',
  'ArtGallery',
  'SportsActivityLocation',
  'EventVenue',
  'LocalBusiness',
]

function isVenueType(value: Venue['venueType']): value is VenueType {
  return VENUE_TYPES.includes(value as VenueType)
}

function mediaDims(image: number | Media | null | undefined): {
  width?: number
  height?: number
} {
  if (!image || typeof image === 'number') return {}
  return {
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }
}

export type GalleryImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

/** Map a Payload Venue doc to the AEO Venue contract. */
export function mapVenueToAeo(venue: Venue): AeoVenue {
  const images =
    venue.images
      ?.map((entry) => {
        const url = mediaUrl(entry.image)
        if (!url) return null
        return { url, altText: entry.alt || venue.name }
      })
      .filter((img): img is { url: string; altText: string } => img !== null) ?? []

  const heroUrl = mediaUrl(venue.heroImage)
  if (heroUrl && !images.some((img) => img.url === heroUrl)) {
    images.unshift({
      url: heroUrl,
      altText: mediaAlt(venue.heroImage, venue.name),
    })
  }

  const sameAs =
    venue.sameAs
      ?.map((row) => row.url?.trim())
      .filter((url): url is string => Boolean(url)) ?? []

  return {
    id: String(venue.id),
    slug: venue.slug,
    name: venue.name,
    venueType: isVenueType(venue.venueType) ? venue.venueType : 'LocalBusiness',
    description: lexicalToPlain(venue.description) || venue.shortDescription || undefined,
    images,
    servesCuisine: venue.servesCuisine ?? undefined,
    priceRange: venue.priceRange ?? undefined,
    openingHours:
      venue.openingHours?.map((h) => ({
        dayOfWeek: h.dayOfWeek ?? undefined,
        opens: h.opens ?? undefined,
        closes: h.closes ?? undefined,
        segment: h.segment ?? undefined,
        note: h.note ?? undefined,
      })) ?? undefined,
    menuUrl: venue.menuUrl ?? undefined,
    reservationUrl: venue.reservationUrl ?? undefined,
    telephone: venue.telephone ?? undefined,
    email: venue.email ?? undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  }
}

export function venueGalleryImages(
  venue: Venue,
  fallback?: { src: string; alt: string } | null,
): GalleryImage[] {
  const seen = new Set<string>()
  const out: GalleryImage[] = []

  const push = (
    url: string | null,
    alt: string,
    dims: { width?: number; height?: number } = {},
  ) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    out.push({ src: url, alt, ...dims })
  }

  push(mediaUrl(venue.heroImage), mediaAlt(venue.heroImage, venue.name), mediaDims(venue.heroImage))

  for (const entry of venue.images ?? []) {
    const media = entry.image
    push(mediaUrl(media), entry.alt || mediaAlt(media, venue.name), mediaDims(media))
  }

  if (out.length === 0 && fallback?.src) {
    out.push({ src: fallback.src, alt: fallback.alt })
  }

  return out
}

export function resolveLocale(locale: string): 'de' | 'en' {
  return locale === 'en' ? 'en' : 'de'
}

export function restaurantCanonicalPath(locale: 'de' | 'en'): string {
  return locale === 'de' ? '/de/restaurant' : '/en/restaurant'
}
