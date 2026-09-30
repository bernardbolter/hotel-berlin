import { getTranslations } from 'next-intl/server'

import { HereDiningBand } from '@/components/here/HereDiningBand'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { getDiningBandData } from '@/lib/here/getDiningBand'

type Props = {
  locale: string
  background: LightSectionBackground
}

export async function HereDiningSection({ locale, background }: Props) {
  const t = await getTranslations('here.diningBand')
  const tDining = await getTranslations('here.pages.dining')
  const data = await getDiningBandData(locale, tDining('openEnd')).catch((error) => {
    console.error('[HereDiningSection] failed:', error)
    return null
  })

  if (!data) return null

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="here-dining-heading"
    >
      <div className="site-shell px-section-sm py-section-y md:px-section-x">
        <HubSerifHeading
          id="here-dining-heading"
          title={t('heading')}
          href="/here/dining"
          cta={t('cta')}
          ctaColor="forest"
        />
        <HereDiningBand
          heading={data.heading}
          image={data.image}
          hours={data.hours}
          facts={data.facts}
          roomServiceNote={data.roomServiceNote}
          cardOnlyNote={t('cardOnly')}
          cards={data.cards}
          copy={{
            body: t('body'),
            restaurantCta: t('restaurantCta'),
            chipsAria: t('chipsAria'),
            cardsAria: t('rowAria'),
            cardKickers: {
              breakfast: t('kickerBreakfast'),
              wundermart: t('kickerWundermart'),
              garden: t('kickerGarden'),
            },
          }}
        />
      </div>
    </SectionShell>
  )
}
