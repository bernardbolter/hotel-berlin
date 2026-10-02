import { getTranslations } from 'next-intl/server'

import { EventsRow } from '@/components/events/EventsRow'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { getHubStripCards } from '@/lib/here/getHubStripCards'
import type { SpotlightFraming } from '@/lib/spotlight/eventMeta'

type Props = {
  locale: string
  background: LightSectionBackground
  /** Guest hub vs public homepage card meta / links. Default: guest. */
  framing?: SpotlightFraming
  /** Override heading copy + CTA (homepage Happenings). Defaults to /here hub strip. */
  heading?: {
    id?: string
    title: string
    cta: string
    href: string
    rowAria: string
  }
}

/**
 * Shared Happenings strip — /here and homepage.
 * Same layout (HubSerifHeading + EventsRow); data via getHubStripCards.
 */
export async function HereHubStrip({
  locale,
  background,
  framing = 'guest',
  heading,
}: Props) {
  const t = await getTranslations('here')
  const cards = await getHubStripCards({ locale, framing }).catch((error) => {
    console.error('[HereHubStrip] failed:', error)
    return []
  })

  if (cards.length === 0) return null

  const title = heading?.title ?? t('hubStrip.title')
  const cta = heading?.cta ?? t('hubStrip.cta')
  const href = heading?.href ?? '/here/events'
  const rowAria = heading?.rowAria ?? t('hubStrip.rowAria')
  const headingId = heading?.id ?? 'here-hub-strip-heading'

  return (
    <SectionShell as="section" background={background} aria-labelledby={headingId}>
      <div className="site-shell px-section-sm py-section-y md:px-section-x">
        <HubSerifHeading
          id={headingId}
          title={title}
          href={href}
          cta={cta}
          className="hub-serif-heading--strip"
        />
        <EventsRow items={cards} ariaLabel={rowAria} />
      </div>
    </SectionShell>
  )
}
