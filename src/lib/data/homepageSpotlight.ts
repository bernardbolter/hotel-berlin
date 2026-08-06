import { getPayloadClient } from '@/lib/payload/client'
import { getVenueBySlug } from '@/lib/payload/venues'
import {
  resolveEventSpotlight,
  resolveVenueSpotlight,
} from '@/lib/spotlight/resolvers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'
import { getBerlinNow } from '@/lib/venue-time'
import type { Event } from '@/payload-types'

const HOMEPAGE_CARD_LIMIT = 4

/**
 * Featured event slugs for the homepage row (excludes always-on Open Play).
 * Order = display preference after any FKKB exhibition card.
 */
const FEATURED_EVENT_SLUGS = [
  'vinyl-nights',
  'kttk-tournament-night',
  'zeichenstammtisch',
] as const

/**
 * Homepage Happenings cards from live Payload:
 * FKKB exhibition (if current) + featured events that resolve with a hero image.
 */
export async function getHomepageSpotlightCards(
  locale: string = 'en',
  now: Date = getBerlinNow(),
): Promise<SpotlightCardProps[]> {
  const payload = await getPayloadClient()
  const cards: SpotlightCardProps[] = []

  // FKKB exhibition lookup must not block featured event cards (schema/enum drift, empty data).
  try {
    const fkkb = await getVenueBySlug('fkkb', locale === 'de' ? 'de' : 'en')
    if (fkkb) {
      const venueCard = await resolveVenueSpotlight(fkkb, { locale, now })
      if (venueCard) {
        cards.push({
          ...venueCard,
          cta: { ...venueCard.cta, href: '/here/art' },
        })
      }
    }
  } catch (error) {
    console.error('[getHomepageSpotlightCards] FKKB card skipped:', error)
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
    locale: locale === 'de' ? 'de' : 'en',
    fallbackLocale: 'en',
  })

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc as Event]))

  for (const slug of FEATURED_EVENT_SLUGS) {
    if (cards.length >= HOMEPAGE_CARD_LIMIT) break
    const doc = bySlug.get(slug)
    if (!doc) continue
    const card = await resolveEventSpotlight(doc, { locale, now })
    if (!card) continue
    // Event detail routes aren't built yet — send CTAs to the events hub
    cards.push({
      ...card,
      title: card.title || doc.name || slug,
      cta: { ...card.cta, href: '/here/events', external: false },
    })
  }

  return cards
}
