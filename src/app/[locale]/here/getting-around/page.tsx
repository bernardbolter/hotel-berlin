import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { herePageMetadata } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/getting-around',
    locale,
    t('pages.gettingAround.title'),
    t('pages.gettingAround.intro'),
  )
}

export default async function HereGettingAroundPage() {
  const t = await getTranslations('here')

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.gettingAround.title')}
      intro={t('pages.gettingAround.intro')}
      backLabel={t('backToHub')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <HereFactGroup
          title={t('pages.gettingAround.transitTitle')}
          items={[
            { label: t('pages.gettingAround.ubahn'), body: t('pages.gettingAround.ubahnBody') },
            { label: t('pages.gettingAround.bus'), body: t('pages.gettingAround.busBody') },
            { label: t('pages.gettingAround.address'), body: t('pages.gettingAround.addressBody') },
          ]}
        />
        <HereFactGroup
          title={t('pages.gettingAround.airportTitle')}
          items={[
            { body: t('pages.gettingAround.airportBody') },
            { label: t('pages.gettingAround.taxi'), body: t('pages.gettingAround.taxiBody') },
          ]}
        />
        <HereFactGroup
          title={t('pages.gettingAround.parkingTitle')}
          items={[
            { body: t('pages.gettingAround.parkingBody') },
            { label: t('pages.gettingAround.ev'), body: t('pages.gettingAround.evBody') },
          ]}
        />
        <HereFactGroup
          title={t('pages.gettingAround.jogTitle')}
          items={[{ body: t('pages.gettingAround.jogBody') }]}
        />
      </div>
    </HereSubpage>
  )
}
