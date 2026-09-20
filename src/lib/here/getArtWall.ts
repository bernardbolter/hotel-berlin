import type { ArtWallTile } from '@/components/here/ArtWall'
import { firstHereImage, HERE_IMAGES } from '@/lib/here/images'
import { getPayloadClient } from '@/lib/payload/client'
import { getVenueBySlug } from '@/lib/payload/venues'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getBerlinNow } from '@/lib/venue-time'
import { getCurrentExhibitionForVenue } from '@/lib/venue-time/queries'

const MURALS = ['somari', 'deerbln', 'pisa73'] as const

const MURAL_SPANS: Array<{ cols: 1 | 2 | 3; rows: 1 | 2 }> = [
  { cols: 2, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 2, rows: 1 },
]

const MURAL_IMAGES = {
  somari: HERE_IMAGES.muralSomari,
  deerbln: HERE_IMAGES.muralDeer,
  pisa73: HERE_IMAGES.muralPisa,
} as const

type FloorCopy = {
  floor: string
  title: string
}

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

/**
 * Exhibition from CMS + three known floor murals. Artwork count is queried.
 * `locationInBuilding` is used when present; otherwise existing floor copy.
 */
export async function getArtWallData(
  locale: string,
  copy: {
    nowUntil: (date: string) => string
    nowChip: string
    locationTbc: string
    moreWithCount: (count: number) => string
    moreWithoutCount: string
    floors: Record<(typeof MURALS)[number], FloorCopy>
  },
): Promise<ArtWallData> {
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()
  const payload = await getPayloadClient()

  const [fkkb, artworkCount] = await Promise.all([
    getVenueBySlug('fkkb', loc).catch(() => null),
    payload
      .find({ collection: 'artworks', limit: 1, depth: 0 })
      .then((result) => result.totalDocs)
      .catch(() => 0),
  ])

  const exhibition = fkkb
    ? await getCurrentExhibitionForVenue(fkkb.id, now).catch(() => null)
    : null

  const until = formatUntil(exhibition?.endDate, loc)
  const exhibitionWhere = until ? copy.nowUntil(until) : copy.nowChip
  const exhibitionTitle = exhibition?.title || 'Magwie × CokyOne'
  const exhibitionSrc = exhibition ? mediaUrl(exhibition.heroImage) : null
  const venueSrc = fkkb ? mediaUrl(fkkb.heroImage) : null

  const tiles: ArtWallTile[] = [
    {
      kind: 'exhibition',
      href: '/here/art',
      who: exhibitionTitle,
      where: exhibitionWhere,
      image: firstHereImage(
        exhibitionSrc
          ? { src: exhibitionSrc, alt: mediaAlt(exhibition?.heroImage, exhibitionTitle) }
          : null,
        venueSrc ? { src: venueSrc, alt: mediaAlt(fkkb?.heroImage, exhibitionTitle) } : null,
        HERE_IMAGES.fkkb,
      ),
      span: { cols: 3, rows: 2 },
    },
    ...MURALS.map((key, index) => ({
      kind: 'mural' as const,
      href: `/here/art#werk-${key}`,
      who: copy.floors[key].title,
      where: copy.floors[key].floor || copy.locationTbc,
      image: MURAL_IMAGES[key],
      span: MURAL_SPANS[index]!,
    })),
    {
      kind: 'more',
      href: '/here/art',
      who: artworkCount > 0 ? copy.moreWithCount(artworkCount) : copy.moreWithoutCount,
      where: '',
      span: { cols: 1, rows: 1 },
    },
  ]

  return { tiles, artworkCount }
}
