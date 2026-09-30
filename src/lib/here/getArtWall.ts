import type { ArtWallTile } from '@/components/here/ArtWall'
import { getCurrentExhibitions, getUpcomingExhibitions } from '@/lib/art/exhibitions'
import { getWorks } from '@/lib/art/works'
import { firstHereImage } from '@/lib/here/images'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow } from '@/lib/venue-time'
import type { Media, Venue } from '@/payload-types'

export type ArtWallData = {
  tiles: ArtWallTile[]
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

/**
 * Live mosaic for `/hier`. Current gallery shows (soonest first, permanent last),
 * then one upcoming show within 30 days, then pinned/newest works, then Alle Werke.
 * A3 will refine the seven states; A1 only removes the hardcoded mural list.
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
): Promise<ArtWallData> {
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()

  const [current, upcoming, works] = await Promise.all([
    getCurrentExhibitions(now, loc).catch(() => []),
    getUpcomingExhibitions(30, now, loc).catch(() => []),
    getWorks({ locale: loc }).catch(() => []),
  ])

  const tiles: ArtWallTile[] = []

  for (const exhibition of current) {
    const until = formatUntil(exhibition.endDate, loc)
    const venue = isVenue(exhibition.venue) ? exhibition.venue : null
    const exhibitionSrc = mediaUrl(exhibition.heroImage, 'card')
    const venueSrc = venue ? mediaUrl(venue.heroImage, 'card') : null
    tiles.push({
      kind: 'exhibition',
      href: '/here/art',
      who: exhibition.title,
      where:
        exhibition.runType === 'permanent'
          ? copy.permanentChip
          : until
            ? copy.nowUntil(until)
            : copy.nowChip,
      image: firstHereImage(
        exhibitionSrc
          ? { src: exhibitionSrc, alt: mediaAlt(exhibition.heroImage, exhibition.title) }
          : null,
        venueSrc && venue
          ? { src: venueSrc, alt: mediaAlt(venue.heroImage, exhibition.title) }
          : null,
      ),
      span: { cols: current.length > 1 ? 3 : 3, rows: current.length > 1 ? 1 : 2 },
    })
  }

  if (current.length === 0 && upcoming[0]) {
    const show = upcoming[0]
    const from = formatFrom(show.startDate, loc)
    const venue = isVenue(show.venue) ? show.venue : null
    const exhibitionSrc = mediaUrl(show.heroImage, 'card')
    const venueSrc = venue ? mediaUrl(venue.heroImage, 'card') : null
    tiles.push({
      kind: 'exhibition',
      href: '/here/art',
      who: show.title,
      where: from ? copy.fromDate(from) : copy.nowChip,
      image: firstHereImage(
        exhibitionSrc ? { src: exhibitionSrc, alt: mediaAlt(show.heroImage, show.title) } : null,
        venueSrc && venue ? { src: venueSrc, alt: mediaAlt(venue.heroImage, show.title) } : null,
      ),
      span: { cols: 3, rows: 2 },
    })
  }

  const workSlots = Math.max(0, 5 - tiles.length)
  for (const work of works.slice(0, workSlots)) {
    const image = work.images?.[0]
    const media = image && typeof image.image === 'object' ? (image.image as Media) : null
    const src = media ? mediaUrl(media, 'card') : null
    const artistName =
      typeof work.artist === 'object' && work.artist
        ? work.artist.name
        : work.title?.trim() || work.slug
    const floor = work.locationInBuilding?.floor
    const spot = work.locationInBuilding?.spot
    const where =
      floor && spot ? `${floor} · ${spot}` : floor || spot || copy.locationTbc
    tiles.push({
      kind: 'mural',
      href: `/here/art/${work.slug}`,
      who: artistName,
      where,
      image:
        src && media
          ? { src, alt: image?.alt || mediaAlt(media, work.title?.trim() || artistName) }
          : null,
      span: { cols: 1, rows: 1 },
    })
  }

  if (works.length > 0) {
    tiles.push({
      kind: 'more',
      href: '/here/art',
      who: copy.moreWithCount(works.length),
      where: '',
      span: { cols: 1, rows: 1 },
    })
  }

  return { tiles, artworkCount: works.length }
}
