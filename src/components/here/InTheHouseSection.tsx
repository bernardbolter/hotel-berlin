import { getTranslations } from 'next-intl/server'

import { AmenityCard } from '@/components/here/AmenityCard'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { CappedRow } from '@/components/primitives/CappedRow'
import { getInHouseAmenities } from '@/lib/here/getInHouseAmenities'
import type { AmenityHoursLabels } from '@/lib/amenities/types'

type Props = {
  locale: string
}

export async function InTheHouseSection({ locale }: Props) {
  const t = await getTranslations('here.inHouse')
  const tHub = await getTranslations('hub.inHouse')
  const loc = locale === 'de' ? 'de' : 'en'
  const cards = await getInHouseAmenities(loc, {
    specWhen: t('specWhen'),
    specPrice: t('specPrice'),
    specWhat: t('specWhat'),
    locationTbc: t('locationTbc'),
    labels: {
      closed: t('closed'),
      onRequest: t('onRequest'),
    } satisfies AmenityHoursLabels,
  })

  return (
    <section aria-labelledby="here-in-house-heading">
      <HubSerifHeading
        id="here-in-house-heading"
        title={t('title')}
        href="/amenities"
        cta={tHub('allLink')}
        ctaStyle="underline"
        underlineTone="ink"
      />
      <CappedRow ariaLabel={t('rowAria')} max={6} minCols={2}>
        {cards.map((card) => (
          <li key={card.key} className="min-w-0">
            <AmenityCard
              eyebrow={card.eyebrow}
              title={card.title}
              line={card.line}
              notice={card.notice}
              image={card.image}
              icon={card.icon}
              href={card.href}
              pending={card.pending}
            />
          </li>
        ))}
      </CappedRow>
    </section>
  )
}
