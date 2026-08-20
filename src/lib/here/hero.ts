import { getEventBySlug } from '@/lib/payload/events'
import {
  getBerlinNow,
  getBerlinParts,
  relativeTimeMessage,
  type RelativeTimeState,
} from '@/lib/venue-time'
import { getCurrentOrNextEventToday } from '@/lib/venue-time/queries'

export type HereHeroSubline =
  | {
      kind: 'live'
      line1: string
      line2: string | null
      relativeTime?: RelativeTimeState
    }
  | { kind: 'thursday' }

function venueLine(
  venue: { name?: string | null; spotlightLocation?: string | null } | null,
): string | null {
  if (!venue) return null
  const name = venue.name?.split(/[—–]/)[0]?.trim() || venue.name?.trim()
  const loc = venue.spotlightLocation?.trim()
  const parts = [name, loc].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Two-line live-event subline for the /here hero.
 * Prefers today's current/next event; Thursday falls back to KTTK tournament copy
 * (until the hereHero Payload global exists).
 */
export async function resolveHereHeroSubline(
  now: Date = getBerlinNow(),
): Promise<HereHeroSubline | null> {
  try {
    const live = await getCurrentOrNextEventToday(now)
    if (live) {
      const venue =
        live.venue && typeof live.venue === 'object' ? live.venue : null
      return {
        kind: 'live',
        line1: live.name,
        line2: venueLine(venue),
        relativeTime: live.relativeTime,
      }
    }
  } catch (error) {
    console.error('[resolveHereHeroSubline] live event lookup failed:', error)
  }

  const { weekday } = getBerlinParts(now)
  if (weekday === 4) return { kind: 'thursday' }

  return null
}

export function relativeTimeKey(state: RelativeTimeState) {
  return relativeTimeMessage(state)
}

export async function resolveEventHeroOverride(eventSlug: string | undefined) {
  if (!eventSlug) return null
  const event = await getEventBySlug(eventSlug).catch(() => null)
  if (!event) return { slug: eventSlug, name: eventSlug, shortDescription: null }
  return {
    slug: event.slug,
    name: event.name,
    shortDescription: event.shortDescription ?? null,
  }
}
