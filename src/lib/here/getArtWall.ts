import type { ArtWallTile } from '@/components/here/ArtWall'
import { getCurrentExhibitions, getUpcomingExhibitions } from '@/lib/art/exhibitions'
import { floorLabel, isArtFloor } from '@/lib/art/floors'
import { getWorks } from '@/lib/art/works'
import {
  buildArtWallMosaic,
  type ExhibitionMosaicInput,
  type WorkMosaicInput,
} from '@/lib/here/artWallMosaic'
import { firstHereImage } from '@/lib/here/images'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow } from '@/lib/venue-time'
import type { Artist, Exhibition, Media, Venue } from '@/payload-types'

export type ArtWallData = {
  tiles: ArtWallTile[]
  columns: 3 | 4
  artworkCount: number
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

function formatFrom(startDate: string | null | undefined, locale: string): string | null {
  if (!startDate) return null
  const date = new Date(startDate)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

function isVenue(value: unknown): value is Venue {
  return typeof value === 'object' && value != null && 'id' in value
}

function isArtist(value: unknown): value is Artist {
  return typeof value === 'object' && value != null && 'name' in value
}

function exhibitionImage(exhibition: Exhibition, venue: Venue | null) {
  const exhibitionSrc = mediaUrl(exhibition.heroImage, 'card')
  const venueSrc = venue ? mediaUrl(venue.heroImage, 'card') : null
  return firstHereImage(
    exhibitionSrc
      ? { src: exhibitionSrc, alt: mediaAlt(exhibition.heroImage, exhibition.title) }
      : null,
    venueSrc && venue
      ? { src: venueSrc, alt: mediaAlt(venue.heroImage, exhibition.title) }
      : null,
  )
}

function artistLine(exhibition: Exhibition): string {
  const names =
    exhibition.artists
      ?.map((a) => (isArtist(a) ? a.name : null))
      .filter((n): n is string => Boolean(n)) ?? []
  return names.join(' · ')
}

function toExhibitionInput(
  exhibition: Exhibition & { runType: 'dated' | 'permanent' },
  copy: {
    nowUntil: (date: string) => string
    nowChip: string
    permanentChip: string
    fromDate: (date: string) => string
  },
  locale: string,
  chipKind: 'current' | 'upcoming',
): ExhibitionMosaicInput {
  const venue = isVenue(exhibition.venue) ? exhibition.venue : null
  const until = formatUntil(exhibition.endDate, locale)
  const from = formatFrom(exhibition.startDate, locale)

  let chip: string
  let chipVariant: ExhibitionMosaicInput['chipVariant']
  if (chipKind === 'upcoming') {
    chip = from ? copy.fromDate(from) : copy.nowChip
    chipVariant = 'soon'
  } else if (exhibition.runType === 'permanent') {
    chip = copy.permanentChip
    chipVariant = 'permanent'
  } else {
    chip = until ? copy.nowUntil(until) : copy.nowChip
    chipVariant = 'now'
  }

  return {
    id: exhibition.id,
    title: exhibition.title,
    slug: exhibition.slug,
    href: '/here/art',
    runType: exhibition.runType,
    chip,
    chipVariant,
    galleryName: venue?.name?.trim() || null,
    subtitle: artistLine(exhibition),
    image: exhibitionImage(exhibition, venue),
  }
}

/**
 * Live mosaic for `/hier`. States A–G from the ArtSection States comp.
 * No imaged works and no shows → null (section omitted).
 */
export async function getArtWallData(
  locale: string,
  copy: {
    nowUntil: (date: string) => string
    nowChip: string
    permanentChip: string
    fromDate: (date: string) => string
    moreWithCount: (count: number) => string
    moreWithoutCount: string
    locationTbc: string
  },
  now: Date = getBerlinNow(),
): Promise<ArtWallData | null> {
  const loc = locale === 'de' ? 'de' : 'en'

  const [currentDocs, upcomingDocs, workDocs] = await Promise.all([
    getCurrentExhibitions(now, loc).catch(() => []),
    getUpcomingExhibitions(30, now, loc).catch(() => []),
    getWorks({ locale: loc }).catch(() => []),
  ])

  const current = currentDocs.map((ex) => toExhibitionInput(ex, copy, loc, 'current'))
  const upcoming = upcomingDocs.map((ex) => toExhibitionInput(ex, copy, loc, 'upcoming'))

  const works: WorkMosaicInput[] = workDocs.map((work) => {
    const image = work.images?.[0]
    const media = image && typeof image.image === 'object' ? (image.image as Media) : null
    const src = media ? mediaUrl(media, 'card') : null
    const artistName =
      typeof work.artist === 'object' && work.artist
        ? work.artist.name
        : work.title?.trim() || work.slug
    const floor = work.locationInBuilding?.floor
    const spot = work.locationInBuilding?.spot
    const floorText = isArtFloor(floor) ? floorLabel(floor, loc) : null
    const where =
      floorText && spot ? `${floorText} · ${spot}` : floorText || spot || copy.locationTbc

    return {
      id: work.id,
      slug: work.slug,
      href: `/here/art/${work.slug}`,
      title: artistName,
      where,
      floor: isArtFloor(floor) ? floor : null,
      image:
        src && media
          ? { src, alt: image?.alt || mediaAlt(media, work.title?.trim() || artistName) }
          : null,
    }
  })

  const mosaic = buildArtWallMosaic({
    current,
    upcoming,
    works,
    moreLabel: copy.moreWithoutCount,
  })

  if (!mosaic) return null

  return {
    tiles: mosaic.tiles.map(
      (tile): ArtWallTile => ({
        kind: tile.kind === 'work' ? 'mural' : tile.kind,
        href: tile.href,
        who: tile.title,
        where: tile.chip,
        subtitle: tile.subtitle,
        chipVariant: tile.chipVariant,
        galleryChip: tile.galleryChip,
        image: tile.image,
        span: tile.span,
      }),
    ),
    columns: mosaic.columns,
    artworkCount: works.length,
  }
}
