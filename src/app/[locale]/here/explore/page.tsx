import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { NeighbourhoodMapSection } from '@/components/map/NeighbourhoodMapSection'
import { herePageMetadata } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/explore',
    locale,
    t('pages.explore.title'),
    t('pages.explore.intro'),
  )
}

export default async function HereExplorePage() {
  const t = await getTranslations('here')

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.explore.title')}
      intro={t('pages.explore.intro')}
      backLabel={t('backToHub')}
      footer={<NeighbourhoodMapSection context="here" />}
    >
      <HereFactGroup
        title={t('pages.explore.nearTitle')}
        items={[
          { body: t('pages.explore.tiergarten') },
          { body: t('pages.explore.canal') },
          { body: t('pages.explore.kudamm') },
        ]}
      />
    </HereSubpage>
  )
}
