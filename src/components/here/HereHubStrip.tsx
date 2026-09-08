import { getTranslations } from 'next-intl/server'

import { EventsRow } from '@/components/events/EventsRow'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { getHubStripCards } from '@/lib/here/getHubStripCards'

type Props = {
  locale: string
}

export async function HereHubStrip({ locale }: Props) {
  const t = await getTranslations('here')
  const cards = await getHubStripCards({ locale, framing: 'guest' }).catch((error) => {
    console.error('[HereHubStrip] failed:', error)
    return []
  })

  if (cards.length === 0) return null

  return (
    <section aria-labelledby="here-hub-strip-heading">
      <HubSerifHeading
        id="here-hub-strip-heading"
        title={t('hubStrip.title')}
        href="/here/events"
        cta={t('hubStrip.cta')}
      />
      <EventsRow items={cards} ariaLabel={t('hubStrip.rowAria')} />
    </section>
  )
}
