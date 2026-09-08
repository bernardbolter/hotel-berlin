import { getBerlinNow } from '@/lib/venue-time'
import { getCurrentOrNextEventToday } from '@/lib/venue-time/getCurrentOrNextEventToday'
import type { EventWithRelativeTime, RelativeTimeState } from '@/lib/venue-time/types'

export type HeroSublineResult =
  | { type: 'live-event'; line1: string; line2: string | null }
  | { type: 'manual'; line1: string; line2: string | null }
  | { type: 'none' }

export type ManualHeroSubline = {
  line1: string
  line2?: string | null
}

export function venueSubline(
  venue: { name?: string | null; spotlightLocation?: string | null } | null | undefined,
): string | null {
  if (!venue) return null
  const name = venue.name?.split(/[—–]/)[0]?.trim() || venue.name?.trim()
  const loc = venue.spotlightLocation?.trim()
  const parts = [name, loc].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

export function formatLiveEventSubline(
  event: EventWithRelativeTime,
  when: string,
): Extract<HeroSublineResult, { type: 'live-event' }> {
  const venue =
    event.venue && typeof event.venue === 'object' ? event.venue : null
  return {
    type: 'live-event',
    line1: `${event.name} ${when}`.trim(),
    line2: venueSubline(venue),
  }
}

/**
 * Live/next event today, else the manual day-slot subline.
 * `hereHero` global is not in the schema yet — pass i18n/CMS copy as `manual`.
 */
export async function getHeroSubline(options: {
  now?: Date
  locale: 'de' | 'en'
  translateRelative: (state: RelativeTimeState) => string
  manual?: ManualHeroSubline | null
  skipLive?: boolean
}): Promise<HeroSublineResult> {
  const now = options.now ?? getBerlinNow()

  if (!options.skipLive) {
    const liveEvent = await getCurrentOrNextEventToday(now, options.locale).catch(
      () => null,
    )
    if (liveEvent) {
      return formatLiveEventSubline(
        liveEvent,
        options.translateRelative(liveEvent.relativeTime),
      )
    }
  }

  const line1 = options.manual?.line1?.trim()
  if (line1) {
    return {
      type: 'manual',
      line1,
      line2: options.manual?.line2?.trim() || null,
    }
  }

  return { type: 'none' }
}
