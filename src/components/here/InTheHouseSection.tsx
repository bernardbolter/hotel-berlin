import { getTranslations } from 'next-intl/server'

import { AmenityCard } from '@/components/here/AmenityCard'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { getInHouseAmenities } from '@/lib/here/getInHouseAmenities'

type Props = {
  locale: string
}

export async function InTheHouseSection({ locale }: Props) {
  const t = await getTranslations('here.inHouse')
  const cards = await getInHouseAmenities(locale, {
    specWhen: t('specWhen'),
    specPrice: t('specPrice'),
    specWhat: t('specWhat'),
    hoursToConfirm: t('hoursToConfirm'),
    askReception: t('askReception'),
    locationTbc: t('locationTbc'),
    items: {
      kttk: {
        eyebrow: t('kttk.eyebrow'),
        title: t('kttk.title'),
        when: t('kttk.when'),
        price: t('kttk.price'),
        sub: t('kttk.sub'),
      },
      wallride: {
        eyebrow: t('wallride.eyebrow'),
        title: t('wallride.title'),
        what: t('wallride.what'),
        sub: t('wallride.sub'),
      },
      fingerboard: {
        eyebrow: t('fingerboard.eyebrow'),
        title: t('fingerboard.title'),
        sub: t('fingerboard.sub'),
      },
      gym: {
        eyebrow: t('gym.eyebrow'),
        title: t('gym.title'),
        when: t('gym.when'),
        sub: t('gym.sub'),
      },
      sauna: {
        eyebrow: t('sauna.eyebrow'),
        title: t('sauna.title'),
        sub: t('sauna.sub'),
      },
      bettAndBike: {
        eyebrow: t('bettAndBike.eyebrow'),
        title: t('bettAndBike.title'),
        sub: t('bettAndBike.sub'),
      },
      businessCenter: {
        eyebrow: t('businessCenter.eyebrow'),
        title: t('businessCenter.title'),
        sub: t('businessCenter.sub'),
      },
      eLaden: {
        eyebrow: t('eLaden.eyebrow'),
        title: t('eLaden.title'),
        what: t('eLaden.what'),
        sub: t('eLaden.sub'),
      },
    },
  })

  return (
    <section aria-labelledby="here-in-house-heading">
      <HubSerifHeading id="here-in-house-heading" title={t('title')} />
      <ul role="list" aria-label={t('rowAria')} className="hub-row">
        {cards.map((card) => {
          const { key, ...props } = card
          return (
            <li key={key} className="min-w-0">
              <AmenityCard {...props} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
