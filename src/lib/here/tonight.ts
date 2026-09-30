import {
  dayOfWeekMatches,
  deriveOpenClosed,
  getBerlinNow,
  getBerlinParts,
  parseTimeToMinutes,
  type OpeningHoursEntry,
} from '@/lib/venue-time'
import { getCurrentExhibitions } from '@/lib/art/exhibitions'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { firstHereImage, type HereImage } from '@/lib/here/images'
import type { Venue } from '@/payload-types'

export type TonightHeroData = {
  title: string
  meta: string
  statusLabel: string
  image: HereImage | null
  href: string
}

/** Prefer Kitchen segment for VenueCompactCard (Tonight Lütze) — not bar. */
export function pickKitchenOrPrimarySegment(
  openingHours: Venue['openingHours'],
  now: Date = getBerlinNow(),
) {
  const segments = deriveOpenClosed(openingHours as OpeningHoursEntry[] | null, now)
  if (segments.length === 0) return null
  const kitchen = segments.find((s) => s.label.toLowerCase() === 'kitchen')
  return kitchen ?? segments[0]!
}

/** Active window close time for a segment, e.g. "22:30". */
export function activeSegmentClosesAt(
  openingHours: Venue['openingHours'],
  segmentName: string,
  now: Date = getBerlinNow(),
): string | null {
  if (!openingHours?.length) return null
  const { weekday, hour, minute } = getBerlinParts(now)
  const minutesNow = hour * 60 + minute
  const name = segmentName.toLowerCase()

  for (const entry of openingHours) {
    const key = (entry.segment ?? '').trim().toLowerCase()
    if (key !== name) continue
    if (!dayOfWeekMatches(entry.dayOfWeek, weekday)) continue
    const opens = entry.opens ? parseTimeToMinutes(entry.opens) : null
    const closes = entry.closes ? parseTimeToMinutes(entry.closes) : null
    if (opens == null || closes == null) continue
    const open =
      closes > opens
        ? minutesNow >= opens && minutesNow < closes
        : minutesNow >= opens || minutesNow < closes
    if (open && entry.closes) {
      if (entry.isOpenEnded) return null
      const raw = entry.closes.trim().toLowerCase()
      if (raw.includes('open')) return null
      return entry.closes.trim()
    }
  }
  return null
}

export async function resolveTonightHero(
  locale: string,
  now: Date = getBerlinNow(),
): Promise<TonightHeroData> {
  const de = locale === 'de'
  const [exhibition] = await getCurrentExhibitions(now, de ? 'de' : 'en').catch(() => [])
  const venue =
    exhibition && typeof exhibition.venue === 'object' && exhibition.venue
      ? (exhibition.venue as Venue)
      : null

  const title = exhibition?.title || (de ? 'Kunst im Haus' : 'Art in the building')
  const location =
    venue?.spotlightLocation ||
    venue?.location ||
    (de ? 'Erdgeschoss' : 'ground floor')
  const venueName = venue?.name || (de ? 'Galerie' : 'Gallery')

  const exhibitionSrc = exhibition ? mediaUrl(exhibition.heroImage, 'card') : null
  const venueSrc = venue ? mediaUrl(venue.heroImage, 'card') : null

  return {
    title,
    meta: `${venueName} · ${location}`,
    statusLabel: de ? 'Jetzt geöffnet · freier Eintritt' : 'Open now · free entry',
    image: firstHereImage(
      exhibitionSrc
        ? { src: exhibitionSrc, alt: mediaAlt(exhibition?.heroImage, title) }
        : null,
      venueSrc ? { src: venueSrc, alt: mediaAlt(venue?.heroImage, title) } : null,
    ),
    href: '/here/art',
  }
}
