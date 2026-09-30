import { getPayloadClient } from '@/lib/payload/client'
import { getCurrentExhibitions } from '@/lib/art/exhibitions'
import {
  resolveEventSpotlight,
  resolveVenueSpotlight,
} from '@/lib/spotlight/resolvers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'
import { getBerlinNow } from '@/lib/venue-time'
import type { Event, Venue } from '@/payload-types'

const HOMEPAGE_CARD_LIMIT = 4

/**
 * Featured event slugs for the homepage row (excludes always-on Open Play).
 * Order = display preference after any current gallery exhibition card.
 */
const FEATURED_EVENT_SLUGS = [
  'vinyl-nights',
  'kttk-tournament-night',
  'zeichenstammtisch',
] as const

/**
 * Homepage Happenings cards from live Payload:
 * current gallery exhibition (if any) + featured events that resolve with a hero image.
 */
export async function getHomepageSpotlightCards(
  locale: string = 'en',
  now: Date = getBerlinNow(),
): Promise<SpotlightCardProps[]> {
  const payload = await getPayloadClient()
  const cards: SpotlightCardProps[] = []
  const loc = locale === 'de' ? 'de' : 'en'

  // Lead gallery show must not block featured event cards.
  try {
    const [lead] = await getCurrentExhibitions(now, loc)
    const venue =
      lead && typeof lead.venue === 'object' && lead.venue ? (lead.venue as Venue) : null
    if (venue) {
      const venueCard = await resolveVenueSpotlight(venue, { locale, now })
      if (venueCard) {
        cards.push({
          ...venueCard,
          framing: 'prospect',
          cta: { ...venueCard.cta, href: '/happenings' },
        })
      }
    }
  } catch (error) {
    console.error('[getHomepageSpotlightCards] gallery exhibition card skipped:', error)
  }

  if (cards.length >= HOMEPAGE_CARD_LIMIT) return cards.slice(0, HOMEPAGE_CARD_LIMIT)

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      slug: { in: [...FEATURED_EVENT_SLUGS] },
    },
    limit: 20,
    // depth 2 so venue.venueMonogram is a Media object, not a bare id
    depth: 2,
    locale: loc,
    fallbackLocale: 'en',
  })

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc as Event]))

  for (const slug of FEATURED_EVENT_SLUGS) {
    if (cards.length >= HOMEPAGE_CARD_LIMIT) break
    const doc = bySlug.get(slug)
    if (!doc) continue
    const card = await resolveEventSpotlight(doc, { locale, now, framing: 'prospect' })
    if (!card) continue
    cards.push({
      ...card,
      title: card.title || doc.name || slug,
    })
  }

  return cards
}
