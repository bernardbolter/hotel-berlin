import { getLocale, getTranslations } from 'next-intl/server'

import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { SweepCta } from '@/components/primitives/SweepCta'
import { getHomepageSpotlightCards } from '@/lib/data/homepageSpotlight'

import { EventsRow } from './EventsRow'

/** Matches RoomsTeaser section title scale (Laica). */
const HEADING_CLASS =
  'text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]'

type Props = {
  /** Explicit section tint — required so rhythm stays intentional. */
  background: LightSectionBackground
}

/**
 * Homepage Happenings — live Payload cards only. No stock teaser fill (F5).
 */
export async function EventsSection({ background }: Props) {
  const t = await getTranslations('events')
  const locale = await getLocale()

  const items = await getHomepageSpotlightCards(locale).catch((error) => {
    console.error('[EventsSection] Failed to load spotlight cards:', error)
    return [] as Awaited<ReturnType<typeof getHomepageSpotlightCards>>
  })

  if (items.length === 0) return null

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="events-heading"
      className="px-section-sm py-section-y md:px-section-x"
    >
      <div className="site-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="events-heading" className={HEADING_CLASS}>
            {t('label')}
          </h2>
          <SweepCta href="/happenings" color="ink" edge="right" className="shrink-0">
            {t('viewAll')}
          </SweepCta>
        </div>
        <EventsRow items={items} ariaLabel={t('rowAria')} />
      </div>
    </SectionShell>
  )
}
