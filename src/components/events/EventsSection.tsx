import { getLocale, getTranslations } from 'next-intl/server'

import { SweepCta } from '@/components/primitives/SweepCta'
import { getHomepageSpotlightCards } from '@/lib/data/homepageSpotlight'
import { spotlightTeasers } from '@/lib/data/spotlightTeasers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

import { EventsRow } from './EventsRow'

function fillHomepageRow(
  live: SpotlightCardProps[],
  fallback: SpotlightCardProps[],
  count = 4,
): SpotlightCardProps[] {
  if (live.length >= count) return live.slice(0, count)
  if (live.length === 0) return fallback.slice(0, count)
  const used = new Set(live.map((card) => card.title.toLowerCase()))
  const extra = fallback.filter((card) => !used.has(card.title.toLowerCase()))
  return [...live, ...extra].slice(0, count)
}

/** Matches RoomsTeaser section title scale (Laica). */
const HEADING_CLASS =
  'text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]'

/**
 * Homepage Happenings — one responsive row of SpotlightCards + link to all events.
 * Prefers live Payload cards; falls back to static teasers if nothing resolves.
 */
export async function EventsSection() {
  const t = await getTranslations('events')
  const locale = await getLocale()

  const live = await getHomepageSpotlightCards(locale).catch((error) => {
    console.error('[EventsSection] Failed to load spotlight cards:', error)
    return [] as Awaited<ReturnType<typeof getHomepageSpotlightCards>>
  })
  const items = fillHomepageRow(live, spotlightTeasers)

  return (
    <section
      aria-labelledby="events-heading"
      className="bg-hbb-page px-section-sm py-section-y md:px-section-x"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 id="events-heading" className={HEADING_CLASS}>
          {t('label')}
        </h2>
        <SweepCta href="/happenings" color="ink" edge="right" className="shrink-0">
          {t('viewAll')}
        </SweepCta>
      </div>
      <EventsRow items={items} ariaLabel={t('rowAria')} />
    </section>
  )
}
