import {
  categoryTokenForEventCategory,
  categoryTokenForPersonType,
  categoryTokenForVenueType,
  resolveCategoryToken,
} from '@/lib/spotlight/categoryTokens'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import type { SpotlightCardProps } from '@/lib/spotlight/types'
import {
  deriveOpenClosed,
  formatBerlinTime,
  formatOpenSegmentLine,
  formatRelativeTime,
  getBerlinNow,
  resolveOccurrence,
  type OpeningHoursEntry,
  type RelativeTimeState,
  type VenueTimeEvent,
} from '@/lib/venue-time'
import {
  getCurrentExhibitionForVenue,
  getNextEventForVenue,
} from '@/lib/venue-time/queries'
import type { Event, Exhibition, Person, Venue } from '@/payload-types'

function venueMonogram(venue: Venue): SpotlightCardProps['identityMark'] {
  const src = mediaUrl(venue.venueMonogram)
  if (!src) return undefined
  return { src, alt: venue.name }
}

/** Pull plain text from a Lexical richText doc (exhibition description, etc.). */
function lexicalToPlain(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value !== 'object') return ''
  const node = value as { text?: string; children?: unknown[]; root?: unknown }
  if (typeof node.text === 'string') return node.text
  if (node.root) return lexicalToPlain(node.root).trim()
  if (Array.isArray(node.children)) {
    return node.children.map(lexicalToPlain).join('').replace(/\s+/g, ' ').trim()
  }
  return ''
}

function formatExhibitionEnd(endDate: string | null | undefined, locale: string): string {
  if (!endDate) return ''
  const d = new Date(endDate)
  if (Number.isNaN(d.getTime())) return ''
  const formatted = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(d)
  return locale === 'de' ? `Bis ${formatted}` : `Until ${formatted}`
}

function shortVenueName(name: string | null | undefined): string {
  if (!name?.trim()) return ''
  return name.split(/[—–(-]/)[0]?.trim() || name
}

/** Prefer the long name after an em dash: "FKKB — Freiluft…" → "Freiluft…" */
function venueLabelFromName(name: string | null | undefined): string {
  if (!name?.trim()) return ''
  const parts = name.split(/[—–]/)
  if (parts.length > 1) return parts.slice(1).join('—').trim() || name
  return name.trim()
}

function venueImage(venue: Venue, fallbackAlt: string): SpotlightCardProps['image'] | null {
  const fromHero = mediaUrl(venue.heroImage)
  if (fromHero) {
    return { src: fromHero, alt: mediaAlt(venue.heroImage, fallbackAlt) }
  }
  const first = venue.images?.[0]
  if (first) {
    const src = mediaUrl(first.image)
    if (src) return { src, alt: first.alt || fallbackAlt }
  }
  return null
}

/** Compact card: bar status when multi-segment; otherwise the only / first segment. */
export function pickBarOrPrimarySegment(
  openingHours: Venue['openingHours'],
  now: Date,
) {
  const segments = deriveOpenClosed(openingHours as OpeningHoursEntry[] | null, now)
  if (segments.length === 0) return null
  const bar = segments.find((s) => s.label.toLowerCase() === 'bar')
  return bar ?? segments[0]!
}

function formatWeekdayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

function formatRelativeCopy(state: RelativeTimeState): string {
  switch (state.kind) {
    case 'now':
      return 'Happening now'
    case 'soon':
      return `Starts in ${state.minutesOrHours}`
    case 'scheduled':
      return `Starts at ${state.time}`
  }
}

function formatEventPrimaryMeta(
  occurrenceStart: Date,
  occurrenceEnd: Date | null,
  now: Date,
  locale: string,
): string {
  const relative = formatRelativeTime(occurrenceStart, now, occurrenceEnd)
  if (relative.kind === 'now') return formatRelativeCopy(relative)
  if (relative.kind === 'soon') {
    return `${formatWeekdayDate(occurrenceStart, locale)} · ${formatRelativeCopy(relative)}`
  }
  return `${formatWeekdayDate(occurrenceStart, locale)} · ${formatBerlinTime(occurrenceStart)}`
}

/**
 * Exhibition → next event → null (card absent from DOM).
 * Multi-segment open status: bar segment only on the compact card.
 */
export async function resolveVenueSpotlight(
  venue: Venue,
  options: { locale?: string; now?: Date } = {},
): Promise<SpotlightCardProps | null> {
  const now = options.now ?? getBerlinNow()
  const locale = options.locale ?? 'en'

  const exhibition = (await getCurrentExhibitionForVenue(venue.id, now)) as Exhibition | null
  if (exhibition) {
    return buildVenueSpotlightFromParts({
      venue,
      exhibition,
      nextEvent: null,
      now,
      locale,
    })
  }

  const next = await getNextEventForVenue(venue.id, now)
  if (next) {
    return buildVenueSpotlightFromParts({
      venue,
      exhibition: null,
      nextEvent: next,
      now,
      locale,
    })
  }

  return null
}

export async function resolveEventSpotlight(
  event: Event,
  options: { locale?: string; now?: Date } = {},
): Promise<SpotlightCardProps | null> {
  const now = options.now ?? getBerlinNow()
  const locale = options.locale ?? 'en'
  const venue = typeof event.venue === 'object' && event.venue ? event.venue : null
  const token = categoryTokenForEventCategory(event.category)
  const tokenStyle = resolveCategoryToken(token)

  const imageSrc = mediaUrl(event.heroImage)
  if (!imageSrc) return null

  const occ = resolveOccurrence(
    event.startDate,
    event.endDate,
    event.isRecurring,
    event.recurrenceRule,
    now,
  )
  if (!occ) return null

  const monogramSrc = venue ? mediaUrl(venue.venueMonogram) : null
  const left = venue?.name ? shortVenueName(venue.name) : ''
  const right = venue?.spotlightLocation || venue?.location || ''

  return {
    image: { src: imageSrc, alt: mediaAlt(event.heroImage, event.name || event.slug) },
    badge: { label: tokenStyle.label, categoryToken: token },
    identityMark: monogramSrc && venue ? { src: monogramSrc, alt: venue.name } : undefined,
    title: event.name || event.slug,
    venueLabel: venue ? venueLabelFromName(venue.name) : undefined,
    primaryMeta: formatEventPrimaryMeta(occ.start, occ.end, now, locale),
    description: event.shortDescription || '',
    secondaryMeta:
      left || right
        ? { left, right }
        : undefined,
    cta: {
      label: locale === 'de' ? 'Zum Event' : 'See event',
      href: event.ticketUrl || `/here/events/${event.slug}`,
      categoryToken: token,
      external: Boolean(event.ticketUrl),
    },
  }
}

export function resolvePersonSpotlight(person: Person): SpotlightCardProps | null {
  const token = categoryTokenForPersonType(person.type)
  const tokenStyle = resolveCategoryToken(token)
  const portraitSrc = mediaUrl(person.portrait)
  if (!portraitSrc) return null

  const room = person.roomNumber?.trim()

  return {
    image: { src: portraitSrc, alt: mediaAlt(person.portrait, person.name) },
    badge: { label: tokenStyle.label, categoryToken: token },
    identityMark: undefined,
    title: person.name,
    primaryMeta: person.jobTitle || tokenStyle.label,
    description: person.shortBio || '',
    // Collapse to a single left value when only room number exists
    secondaryMeta: room ? { left: `Room ${room}`, right: '' } : undefined,
    cta: {
      label: `Meet ${person.name}`,
      href: `/you-me-and-berlin/${person.slug}`,
      categoryToken: token,
    },
  }
}

/** Pure venue spotlight builder — used by the async resolver and unit tests. */
export function buildVenueSpotlightFromParts(args: {
  venue: Venue
  exhibition?: Exhibition | null
  nextEvent?: {
    event: VenueTimeEvent
    occurrenceStart: Date
    occurrenceEnd: Date | null
  } | null
  now?: Date
  locale?: string
}): SpotlightCardProps | null {
  const now = args.now ?? getBerlinNow()
  const locale = args.locale ?? 'en'
  const { venue } = args
  const token = categoryTokenForVenueType(venue.venueType)
  const tokenStyle = resolveCategoryToken(token)
  const monogram = venueMonogram(venue)

  if (args.exhibition) {
    const ex = args.exhibition
    const exImage = mediaUrl(ex.heroImage)
    const image = exImage
      ? { src: exImage, alt: mediaAlt(ex.heroImage, ex.title) }
      : venueImage(venue, venue.name)
    if (!image) return null

    const location = venue.spotlightLocation || venue.location || ''
    const until = formatExhibitionEnd(ex.endDate, locale)
    const body =
      lexicalToPlain(ex.description) ||
      ex.subtitle ||
      venue.shortDescription ||
      ex.title
    const shortName = shortVenueName(venue.name)

    return {
      image,
      badge: { label: tokenStyle.label, categoryToken: token },
      identityMark: monogram,
      title: ex.title,
      venueLabel: venueLabelFromName(venue.name),
      primaryMeta: locale === 'de' ? 'Jetzt · freier Eintritt' : 'On now · Free entry',
      description: body,
      secondaryMeta:
        location || until
          ? { left: location, right: until }
          : undefined,
      cta: {
        label:
          locale === 'de'
            ? `${shortName || venue.slug} entdecken`
            : `Explore ${shortName || venue.slug}`,
        href: `/here/${venue.slug}`,
        categoryToken: token,
      },
    }
  }

  if (args.nextEvent) {
    const image = venueImage(venue, venue.name)
    if (!image) return null
    const open = pickBarOrPrimarySegment(venue.openingHours, now)
    const primaryMeta = open
      ? formatOpenSegmentLine(open)
      : formatEventPrimaryMeta(
          args.nextEvent.occurrenceStart,
          args.nextEvent.occurrenceEnd,
          now,
          locale,
        )

    return {
      image,
      badge: { label: tokenStyle.label, categoryToken: token },
      identityMark: monogram,
      title: args.nextEvent.event.name,
      venueLabel: venueLabelFromName(venue.name),
      primaryMeta,
      description: venue.shortDescription || args.nextEvent.event.name,
      secondaryMeta: {
        left: venue.spotlightLocation || venue.location || '',
        right: formatBerlinTime(args.nextEvent.occurrenceStart),
      },
      cta: {
        label: `Explore ${shortVenueName(venue.name) || venue.slug}`,
        href: `/here/${venue.slug}`,
        categoryToken: token,
      },
    }
  }

  return null
}
