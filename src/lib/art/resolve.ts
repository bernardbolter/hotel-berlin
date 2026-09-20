import type { Artist, Artwork, Exhibition, Media, Person } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload/client'
import { getVenueBySlug } from '@/lib/payload/venues'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow } from '@/lib/venue-time'
import { getCurrentExhibitionForVenue } from '@/lib/venue-time/queries'

import { objectPosition, sortLiveWorks } from './floors'
import type { ArtArtist, ArtExhibitionTile, ArtFloor, ArtImage, ArtPageData, ArtWork } from './types'

function isPopulated<T extends object>(value: number | T | null | undefined): value is T {
  return typeof value === 'object' && value != null
}

function firstImage(doc: Artwork): ArtImage | null {
  const row = doc.images?.[0]
  if (!row || !isPopulated<Media>(row.image)) return null
  const src = mediaUrl(row.image)
  if (!src) return null
  return {
    src,
    alt: row.alt?.trim() || mediaAlt(row.image, doc.title),
    objectPosition: objectPosition(row.image.focalX, row.image.focalY),
  }
}

function artistFromDoc(value: number | Artist): ArtArtist {
  if (!isPopulated<Artist>(value)) {
    return { name: '', slug: '', person: null }
  }
  const person = isPopulated<Person>(value.person) ? value.person : null
  return {
    name: value.name,
    slug: value.slug,
    person: person
      ? {
          slug: person.slug,
          name: person.name,
          published: person.status === 'published',
        }
      : null,
  }
}

function asFloor(value: unknown): ArtFloor | null {
  const floors: ArtFloor[] = ['B2', 'B1', 'EG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Dach']
  return floors.includes(value as ArtFloor) ? (value as ArtFloor) : null
}

export function artworkFromDoc(doc: Artwork): ArtWork {
  const loc = doc.locationInBuilding
  return {
    slug: doc.slug,
    title: doc.title,
    artworkType: doc.artworkType,
    visibility: doc.visibility,
    status: doc.status ?? null,
    artist: artistFromDoc(doc.artist),
    floor: asFloor(loc && typeof loc === 'object' ? loc.floor : null),
    spot: loc && typeof loc === 'object' ? loc.spot?.trim() || null : null,
    year: doc.year ?? null,
    technique: doc.medium?.trim() || null,
    dimensions: doc.dimensions?.trim() || null,
    description: doc.description ?? null,
    image: firstImage(doc),
    order: doc._order ?? String(doc.id),
  }
}

export function visibleWorks(docs: Artwork[]): ArtWork[] {
  return sortLiveWorks(
    docs
      .map(artworkFromDoc)
      .filter((work) => work.visibility === 'live' && work.image != null),
  )
}

function formatUntil(endDate: string | null | undefined, locale: string): string | null {
  if (!endDate) return null
  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

export async function getCurrentArtExhibition(
  locale: string,
  nowUntil: (date: string) => string,
  nowChip: string,
): Promise<ArtExhibitionTile | null> {
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()
  const fkkb = await getVenueBySlug('fkkb', loc).catch(() => null)
  if (!fkkb) return null
  const exhibition = await getCurrentExhibitionForVenue(fkkb.id, now).catch(() => null)
  if (!exhibition) return null

  const until = formatUntil(exhibition.endDate, loc)
  const src = mediaUrl(exhibition.heroImage) || mediaUrl(fkkb.heroImage)
  const image: ArtImage | null = src
    ? {
        src,
        alt: mediaAlt(
          (exhibition.heroImage as Media | null) ?? (fkkb.heroImage as Media | null),
          exhibition.title,
        ),
      }
    : null

  return {
    slug: exhibition.slug,
    title: exhibition.title,
    href: '/here/gallery',
    chip: until ? nowUntil(until) : nowChip,
    image,
  }
}

export async function getArtPageData(
  locale: string,
  copy: { nowUntil: (date: string) => string; nowChip: string },
): Promise<ArtPageData> {
  const loc = locale === 'de' ? 'de' : 'en'
  const payload = await getPayloadClient()

  const [result, exhibition] = await Promise.all([
    payload
      .find({
        collection: 'artworks',
        locale: loc,
        fallbackLocale: loc === 'de' ? 'en' : 'de',
        depth: 2,
        limit: 200,
        sort: '_order',
        where: { visibility: { equals: 'live' } },
      })
      .catch(() => ({ docs: [] as Artwork[] })),
    getCurrentArtExhibition(loc, copy.nowUntil, copy.nowChip).catch(() => null),
  ])

  return {
    works: visibleWorks(result.docs as Artwork[]),
    exhibition,
  }
}

export function exhibitionFromDoc(
  exhibition: Pick<Exhibition, 'slug' | 'title' | 'endDate' | 'heroImage'>,
  locale: string,
  nowUntil: (date: string) => string,
  nowChip: string,
): ArtExhibitionTile {
  const until = formatUntil(exhibition.endDate, locale)
  const src = mediaUrl(exhibition.heroImage)
  return {
    slug: exhibition.slug,
    title: exhibition.title,
    href: '/here/gallery',
    chip: until ? nowUntil(until) : nowChip,
    image: src
      ? { src, alt: mediaAlt(exhibition.heroImage, exhibition.title) }
      : null,
  }
}
