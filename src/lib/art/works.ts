import type { Artist, Artwork, Exhibition, Media, Person, Venue } from '@/payload-types'
import { getCurrentExhibitions, loadGalleryExhibitions } from '@/lib/art/exhibitions'
import { getExhibitionStatus } from '@/lib/art/status'
import { floorGroupOf, matchesFloorFilter, objectPosition } from '@/lib/art/floors'
import type {
  ArtArtist,
  ArtArtistListItem,
  ArtExhibitionTile,
  ArtFloor,
  ArtImage,
  ArtPageData,
  ArtWork,
  ArtWorkExhibitionBand,
  FloorFilter,
} from '@/lib/art/types'
import { getPayloadClient } from '@/lib/payload/client'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow } from '@/lib/venue-time'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'

function isPopulated<T extends object>(value: number | T | null | undefined): value is T {
  return typeof value === 'object' && value != null
}

function artworkId(value: number | Artwork): number | null {
  if (typeof value === 'number') return value
  if (isPopulated<Artwork>(value)) return value.id
  return null
}

function mediaImage(media: number | Media | null | undefined, fallbackAlt: string): ArtImage | null {
  if (!isPopulated<Media>(media)) return null
  const src = mediaUrl(media, 'card') || mediaUrl(media, 'hero') || media.url
  if (!src) return null
  return {
    src,
    alt: mediaAlt(media, fallbackAlt),
    objectPosition: objectPosition(media.focalX, media.focalY),
  }
}

function titleFallback(doc: Artwork): string {
  return doc.title?.trim() || (isPopulated<Artist>(doc.artist) ? doc.artist.name : 'Artwork')
}

function firstGalleryImage(doc: Artwork): ArtImage | null {
  const row = doc.images?.[0]
  if (!row || !isPopulated<Media>(row.image)) return null
  const src = mediaUrl(row.image, 'card') || mediaUrl(row.image, 'hero') || row.image.url
  if (!src) return null
  return {
    src,
    alt: row.alt?.trim() || mediaAlt(row.image, titleFallback(doc)),
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

function hasImage(doc: Artwork): boolean {
  return firstGalleryImage(doc) != null
}

function sortWorks(a: Artwork, b: Artwork): number {
  const aPinned = Boolean(a.pinned)
  const bPinned = Boolean(b.pinned)
  if (aPinned !== bPinned) return aPinned ? -1 : 1
  if (aPinned && bPinned) {
    return String(a._order ?? a.id).localeCompare(String(b._order ?? b.id), 'en', { numeric: true })
  }
  const aCreated = new Date(a.createdAt).getTime()
  const bCreated = new Date(b.createdAt).getTime()
  if (aCreated !== bCreated) return bCreated - aCreated
  return String(b.id).localeCompare(String(a.id), 'en', { numeric: true })
}

export type GetWorksArgs = {
  locale?: 'de' | 'en'
  floorGroup?: FloorFilter
  artist?: string
  exhibition?: string
  limit?: number
}

async function exhibitionArtworkIds(locale?: 'de' | 'en'): Promise<Set<number>> {
  const exhibitions = await loadGalleryExhibitions(locale)
  const ids = new Set<number>()
  for (const show of exhibitions) {
    for (const work of show.artworks ?? []) {
      const id = artworkId(work)
      if (id != null) ids.add(id)
    }
  }
  return ids
}

export function artworkFromDoc(doc: Artwork, inExhibition = false): ArtWork {
  const loc = doc.locationInBuilding
  const fallback = titleFallback(doc)
  const details =
    doc.detailImages
      ?.map((row) => mediaImage(row.image, row.alt || fallback))
      .filter((img): img is ArtImage => img != null) ?? []

  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title ?? '',
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
    image: firstGalleryImage(doc),
    contextImage: mediaImage(doc.contextImage, fallback),
    detailImages: details,
    pinned: Boolean(doc.pinned),
    order: doc._order ?? String(doc.id),
    inExhibition,
  }
}

/** Live works with an image. Pinned first (drag order), then newest. */
export async function getWorks(args: GetWorksArgs = {}): Promise<Artwork[]> {
  const payload = await getPayloadClient()
  const loc = args.locale
  const { docs } = await payload.find({
    collection: 'artworks',
    where: { visibility: { equals: 'live' } },
    limit: 500,
    depth: 2,
    sort: '-createdAt',
    ...(loc ? { locale: loc, fallbackLocale: loc === 'de' ? 'en' : 'de' } : {}),
  })

  let works = (docs as Artwork[]).filter(hasImage)

  if (args.floorGroup && args.floorGroup !== 'all' && args.floorGroup !== 'exhibition') {
    works = works.filter((work) =>
      matchesFloorFilter(
        (work.locationInBuilding?.floor as ArtFloor | null) ?? null,
        args.floorGroup!,
      ),
    )
  }

  if (args.artist) {
    works = works.filter((work) => {
      const artist = work.artist
      if (!isPopulated<Artist>(artist)) return false
      return artist.slug === args.artist
    })
  }

  if (args.exhibition) {
    const exhibitions = await loadGalleryExhibitions(loc)
    const show = exhibitions.find((ex) => ex.slug === args.exhibition)
    const ids = new Set(
      (show?.artworks ?? []).map(artworkId).filter((id): id is number => id != null),
    )
    works = works.filter((work) => ids.has(work.id))
  }

  works.sort(sortWorks)
  if (args.limit != null) return works.slice(0, args.limit)
  return works
}

export type ArtistWithCount = {
  artist: Artist
  workCount: number
}

export async function getArtists(locale?: 'de' | 'en'): Promise<ArtistWithCount[]> {
  const works = await getWorks({ locale })
  const counts = new Map<number, { artist: Artist; workCount: number }>()

  for (const work of works) {
    if (!isPopulated<Artist>(work.artist)) continue
    const existing = counts.get(work.artist.id)
    if (existing) existing.workCount += 1
    else counts.set(work.artist.id, { artist: work.artist, workCount: 1 })
  }

  return [...counts.values()].sort((a, b) =>
    a.artist.name.localeCompare(b.artist.name, locale === 'de' ? 'de' : 'en'),
  )
}

export async function getWorkSlugs(): Promise<string[]> {
  const works = await getWorks()
  return works.map((work) => work.slug)
}

/** Live work with an image, or null (→ 404). */
export async function getWorkBySlug(
  slug: string,
  locale: 'de' | 'en',
): Promise<ArtWork | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'artworks',
    where: {
      and: [{ slug: { equals: slug } }, { visibility: { equals: 'live' } }],
    },
    limit: 1,
    depth: 2,
    locale,
    fallbackLocale: locale === 'de' ? 'en' : 'de',
  })
  const doc = docs[0] as Artwork | undefined
  if (!doc || !hasImage(doc)) return null
  const inShow = (await exhibitionArtworkIds(locale)).has(doc.id)
  return artworkFromDoc(doc, inShow)
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

function formatMonthYear(endDate: string | null | undefined, locale: string): string | null {
  if (!endDate) return null
  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

function exhibitionTile(
  exhibition: Exhibition & { runType?: 'dated' | 'permanent' },
  locale: string,
  copy: { nowUntil: (date: string) => string; nowChip: string; permanentChip: string },
): ArtExhibitionTile {
  const venue = isPopulated<Venue>(exhibition.venue) ? exhibition.venue : null
  const until = formatUntil(exhibition.endDate, locale)
  const runType = exhibition.runType === 'permanent' ? 'permanent' : 'dated'
  const chip =
    runType === 'permanent'
      ? copy.permanentChip
      : until
        ? copy.nowUntil(until)
        : copy.nowChip
  const src =
    mediaUrl(exhibition.heroImage, 'card') || (venue ? mediaUrl(venue.heroImage, 'card') : null)
  return {
    slug: exhibition.slug,
    title: exhibition.title,
    href: '/here/art',
    chip,
    venueName: venue?.name?.trim() || null,
    runType,
    image: src
      ? {
          src,
          alt: mediaAlt(
            (exhibition.heroImage as Media | null) ?? (venue?.heroImage as Media | null),
            exhibition.title,
          ),
        }
      : null,
  }
}

export async function getArtPageData(
  locale: string,
  copy: { nowUntil: (date: string) => string; nowChip: string; permanentChip: string },
): Promise<ArtPageData> {
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()

  const [docs, current, inShowIds, artists] = await Promise.all([
    getWorks({ locale: loc }).catch(() => [] as Artwork[]),
    getCurrentExhibitions(now, loc).catch(() => []),
    exhibitionArtworkIds(loc).catch(() => new Set<number>()),
    getArtists(loc).catch(() => []),
  ])

  return {
    works: docs.map((doc) => artworkFromDoc(doc, inShowIds.has(doc.id))),
    exhibitions: current.map((ex) => exhibitionTile(ex, loc, copy)),
    artists: artists.map(({ artist, workCount }) => {
      const person = isPopulated<Person>(artist.person) ? artist.person : null
      return {
        name: artist.name,
        slug: artist.slug,
        workCount,
        personHref:
          person?.status === 'published' && person.slug
            ? `/you-me-berlin/${person.slug}`
            : null,
      } satisfies ArtArtistListItem
    }),
  }
}

/** Most relevant exhibition that lists this work — current preferred, else most recent past. */
export async function getExhibitionBandForWork(
  workId: number,
  locale: 'de' | 'en',
  copy: {
    partOfUntil: (title: string, date: string) => string
    partOfPermanent: (title: string) => string
    wasPartOf: (title: string, monthYear: string) => string
  },
): Promise<ArtWorkExhibitionBand | null> {
  const now = getBerlinNow()
  const exhibitions = await loadGalleryExhibitions(locale)
  const containing = exhibitions.filter((ex) =>
    (ex.artworks ?? []).some((work) => artworkId(work) === workId),
  )
  if (containing.length === 0) return null

  const ranked = containing
    .map((ex) => {
      const runType = (ex as Exhibition & { runType?: string }).runType === 'permanent' ? 'permanent' : 'dated'
      const status = getExhibitionStatus(
        { runType, startDate: ex.startDate, endDate: ex.endDate },
        now,
      )
      return { ex, runType, status }
    })
    .sort((a, b) => {
      const rank = (s: string) => (s === 'current' ? 0 : s === 'past' ? 1 : 2)
      const d = rank(a.status) - rank(b.status)
      if (d !== 0) return d
      const aEnd = a.ex.endDate ? new Date(a.ex.endDate).getTime() : 0
      const bEnd = b.ex.endDate ? new Date(b.ex.endDate).getTime() : 0
      return bEnd - aEnd
    })

  const pick = ranked[0]
  if (!pick) return null
  const { ex, runType, status } = pick
  const until = formatUntil(ex.endDate, locale)
  const monthYear = formatMonthYear(ex.endDate, locale)
  let line: string
  if (status === 'current') {
    line =
      runType === 'permanent'
        ? copy.partOfPermanent(ex.title)
        : until
          ? copy.partOfUntil(ex.title, until)
          : copy.partOfPermanent(ex.title)
  } else {
    line = copy.wasPartOf(ex.title, monthYear || '')
  }

  return {
    slug: ex.slug,
    title: ex.title,
    href: '/here/art',
    current: status === 'current',
    line,
  }
}

export async function getMoreByArtist(
  artistSlug: string,
  excludeSlug: string,
  locale: 'de' | 'en',
  limit = 3,
): Promise<ArtWork[]> {
  const works = await getWorks({ locale, artist: artistSlug })
  const mapped = works
    .filter((doc) => doc.slug !== excludeSlug)
    .map((doc) => artworkFromDoc(doc, false))
  if (mapped.length < limit) return []
  return mapped.slice(0, limit)
}

export async function getMoreOnFloor(
  floor: ArtFloor | null,
  excludeSlug: string,
  locale: 'de' | 'en',
  limit = 3,
): Promise<ArtWork[]> {
  const all = await getWorks({ locale })
  const mapped = all.map((doc) => artworkFromDoc(doc, false)).filter((w) => w.slug !== excludeSlug)
  const group = floorGroupOf(floor)
  const sameGroup = group
    ? mapped.filter((w) => floorGroupOf(w.floor) === group)
    : []
  const pool = sameGroup.length >= limit ? sameGroup : mapped
  if (pool.length < limit) return []
  return pool.slice(0, limit)
}

export function workPlainDescription(work: ArtWork): string | undefined {
  return lexicalToPlain(work.description) || undefined
}
