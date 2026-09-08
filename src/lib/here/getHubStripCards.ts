import { getBerlinNow } from '@/lib/venue-time/berlin'
import { getCurrentExhibitionForVenue } from '@/lib/venue-time/queries'
import { getEventOccurrences } from '@/lib/payload/getEventOccurrences'
import { getVenueBySlug } from '@/lib/payload/venues'
import { pickHubStrip } from '@/lib/here/pickHubStrip'
import {
  formatPracticalLine,
  joinMeta,
  venueFloor,
  type SpotlightFraming,
} from '@/lib/spotlight/eventMeta'
import {
  buildVenueSpotlightFromParts,
  resolveEventSpotlight,
} from '@/lib/spotlight/resolvers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'
import type { Exhibition, Venue } from '@/payload-types'

const HUB_DAYS = 7
const HUB_LIMIT = 4

function weekEnd(now: Date): Date {
  return new Date(now.getTime() + HUB_DAYS * 24 * 60 * 60 * 1000)
}

export async function getHubStripCards(options: {
  locale: string
  now?: Date
  framing?: SpotlightFraming
}): Promise<SpotlightCardProps[]> {
  const now = options.now ?? getBerlinNow()
  const locale = options.locale === 'de' ? 'de' : 'en'
  const framing = options.framing ?? 'guest'

  const fkkb = await getVenueBySlug('fkkb', locale).catch(() => null)
  const exhibition = fkkb
    ? await getCurrentExhibitionForVenue(fkkb.id, now).catch(() => null)
    : null

  const occurrences = await getEventOccurrences({
    from: now,
    to: weekEnd(now),
    locale,
    includeAlwaysOn: true,
  })

  const slots = pickHubStrip(occurrences, Boolean(exhibition && fkkb), now, HUB_LIMIT)
  const cards: SpotlightCardProps[] = []

  for (const slot of slots) {
    if (slot.kind === 'exhibition') {
      if (!fkkb || !exhibition) continue
      const card = exhibitionAlwaysOnCard({
        venue: fkkb,
        exhibition: exhibition as Exhibition,
        locale,
        framing,
      })
      if (card) cards.push(card)
      continue
    }

    const card = await resolveEventSpotlight(slot.occurrence.event, {
      locale,
      now,
      framing,
      occurrence: { start: slot.occurrence.start, end: slot.occurrence.end },
      alwaysOn: slot.occurrence.alwaysOn,
    })
    if (card) cards.push(card)
  }

  return cards
}

function exhibitionAlwaysOnCard(args: {
  venue: Venue
  exhibition: Exhibition
  locale: string
  framing: SpotlightFraming
}): SpotlightCardProps | null {
  const { venue, exhibition, locale, framing } = args
  const base = buildVenueSpotlightFromParts({
    venue,
    exhibition,
    locale,
  })
  if (!base) return null

  const de = locale === 'de'
  const always = de ? 'Immer' : 'Always'
  const floor = venueFloor(venue, locale)
  const until = exhibition.endDate
    ? formatExhibitionUntil(exhibition.endDate, locale)
    : ''
  const practical = joinMeta(
    formatPracticalLine({ isFree: true, price: null, bookingNote: until }, locale),
  )
  const href = framing === 'guest' ? '/here/art' : '/happenings'

  return {
    ...base,
    framing,
    locationLabel: framing === 'guest' ? floor || undefined : base.locationLabel,
    primaryMeta: always,
    description: framing === 'guest' ? practical : base.description,
    cta: {
      ...base.cta,
      href,
    },
  }
}

function formatExhibitionUntil(endDate: string, locale: string): string {
  const d = new Date(endDate)
  if (Number.isNaN(d.getTime())) return ''
  const formatted = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(d)
  return locale === 'de' ? `Bis ${formatted}` : `Until ${formatted}`
}
