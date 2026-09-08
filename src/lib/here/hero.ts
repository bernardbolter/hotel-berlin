import { getPayloadClient } from '@/lib/payload/client'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import type { Event, Media, Venue } from '@/payload-types'

export type HereHeroEventOverride = {
  slug: string
  name: string
  location: string | null
  image: { src: string; alt: string } | null
}

function venueLocation(
  venue: { name?: string | null; spotlightLocation?: string | null; location?: string | null } | null,
): string | null {
  if (!venue) return null
  const name = venue.name?.split(/[—–]/)[0]?.trim() || venue.name?.trim()
  const loc = venue.spotlightLocation?.trim() || venue.location?.trim()
  const parts = [name, loc].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Conference-QR override (`?event=slug`).
 *
 * Events have no `heroActive` field in the live schema (flagged — original
 * `/here` brief specced one; it was never added). Any matching slug still
 * fully replaces the gallery hero, same as the previous implementation's
 * lookup, but now as a HereHeroLayout variant (image + greeting)
 * rather than a line on top of the rotating gallery.
 */
export async function resolveEventHeroOverride(
  eventSlug: string | undefined,
): Promise<HereHeroEventOverride | null> {
  if (!eventSlug) return null

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'events',
      where: { slug: { equals: eventSlug } },
      limit: 1,
      depth: 2,
    })
    const event = docs[0] as Event | undefined
    if (!event) {
      return { slug: eventSlug, name: eventSlug, location: null, image: null }
    }

    const venue =
      event.venue && typeof event.venue === 'object' ? (event.venue as Venue) : null
    const src = mediaUrl(event.heroImage as number | Media | null)

    return {
      slug: event.slug,
      name: event.name,
      location: venueLocation(venue),
      image: src
        ? { src, alt: mediaAlt(event.heroImage as number | Media | null, event.name) }
        : null,
    }
  } catch (error) {
    console.error('[resolveEventHeroOverride] lookup failed:', error)
    return { slug: eventSlug, name: eventSlug, location: null, image: null }
  }
}
