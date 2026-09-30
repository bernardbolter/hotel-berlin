import { getTranslations } from 'next-intl/server'

import { EventsRow } from '@/components/events/EventsRow'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { getHubStripCards } from '@/lib/here/getHubStripCards'

type Props = {
  locale: string
  background: LightSectionBackground
}

export async function HereHubStrip({ locale, background }: Props) {
  const t = await getTranslations('here')
  const cards = await getHubStripCards({ locale, framing: 'guest' }).catch((error) => {
    console.error('[HereHubStrip] failed:', error)
    return []
  })

  if (cards.length === 0) return null

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="here-hub-strip-heading"
    >
      <div className="site-shell px-section-sm py-section-y md:px-section-x">
        <HubSerifHeading
          id="here-hub-strip-heading"
          title={t('hubStrip.title')}
          href="/here/events"
          cta={t('hubStrip.cta')}
          className="hub-serif-heading--strip"
        />
        <EventsRow items={cards} ariaLabel={t('hubStrip.rowAria')} />
      </div>
    </SectionShell>
  )
}
