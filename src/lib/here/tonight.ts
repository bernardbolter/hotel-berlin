import {
  dayOfWeekMatches,
  deriveOpenClosed,
  getBerlinNow,
  getBerlinParts,
  parseTimeToMinutes,
  type OpeningHoursEntry,
} from '@/lib/venue-time'
import { getCurrentExhibitionForVenue } from '@/lib/venue-time/queries'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getVenueBySlug } from '@/lib/payload/venues'
import type { Venue } from '@/payload-types'

export type TonightHeroData = {
  title: string
  meta: string
  statusLabel: string
  image: { src: string; alt: string } | null
  href: string
}

export type TonightVenueCardData = {
  title: string
  badge: string
  badgeVariant: 'schedule' | 'liveStatus' | 'static'
  liveOpen?: boolean
  lines: string[]
  href: string
  categoryToken: 'amber' | 'gold' | 'neutral'
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
): Promise<TonightHeroData | null> {
  const fkkb = await getVenueBySlug('fkkb').catch(() => null)
  if (!fkkb) return null

  const exhibition = await getCurrentExhibitionForVenue(fkkb.id, now)
  if (!exhibition) return null

  // Slim type from selector — re-fetch isn't needed if we use venue image as fallback
  const title = exhibition.title
  const imageSrc = mediaUrl(fkkb.heroImage)
  const location =
    fkkb.spotlightLocation || fkkb.location || (locale === 'de' ? 'Erdgeschoss' : 'ground floor')

  return {
    title,
    meta: `FKKB gallery · ${location}`,
    statusLabel: locale === 'de' ? 'Jetzt geöffnet · freier Eintritt' : 'Open now · free entry',
    image: imageSrc
      ? { src: imageSrc, alt: mediaAlt(fkkb.heroImage, title) }
      : null,
    href: '/here/art',
  }
}

export async function resolveTonightVenueCards(
  locale: string,
  now: Date = getBerlinNow(),
): Promise<TonightVenueCardData[]> {
  const [kttk, lutze] = await Promise.all([
    getVenueBySlug('kttk').catch(() => null),
    getVenueBySlug('lutze').catch(() => null),
  ])

  const cards: TonightVenueCardData[] = []

  if (kttk) {
    const parts = getBerlinParts(now)
    // Next Thursday tournament badge — simplified: show weekday + typical start from hours
    const thuHours = (kttk.openingHours ?? []).find((h) =>
      /thu|thursday/i.test(h.dayOfWeek ?? ''),
    )
    const start = thuHours?.opens || '19:00'
    const weekdayShort = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
      weekday: 'short',
      timeZone: 'Europe/Berlin',
    }).format(now)
    // If today is Thursday use today; else show "Thu 19:00" as standing label from brief
    const badge =
      parts.weekday === 4
        ? `${weekdayShort} ${start}`
        : locale === 'de'
          ? `Do ${start}`
          : `Thu ${start}`

    cards.push({
      title: 'KTTK',
      badge,
      badgeVariant: 'schedule',
      lines: [
        locale === 'de'
          ? `Turnierabend · €5 · ${kttk.spotlightLocation || kttk.location || 'B2'}`
          : `Tournament night · €5 · ${kttk.spotlightLocation || kttk.location || 'B2'}`,
      ],
      href: '/here/events',
      categoryToken: 'amber',
    })
  }

  if (lutze) {
    const kitchen = pickKitchenOrPrimarySegment(lutze.openingHours, now)
    const closes = activeSegmentClosesAt(lutze.openingHours, 'Kitchen', now)
    const open = kitchen?.status === 'Open'
    const until =
      closes != null
        ? locale === 'de'
          ? `Bis ${closes}`
          : `Until ${closes}`
        : open
          ? locale === 'de'
            ? 'Geöffnet'
            : 'Open'
          : kitchen?.note || (locale === 'de' ? 'Geschlossen' : 'Closed')

    cards.push({
      title: 'Lütze',
      badge: open
        ? locale === 'de'
          ? 'Küche geöffnet'
          : 'Kitchen open'
        : locale === 'de'
          ? 'Küche geschlossen'
          : 'Kitchen closed',
      badgeVariant: 'liveStatus',
      liveOpen: open,
      lines: [`${until} · ${locale === 'de' ? 'reservieren →' : 'reserve →'}`],
      href: '/here/dining',
      categoryToken: 'gold',
    })
  }

  return cards
}
