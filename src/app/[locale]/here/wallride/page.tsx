import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { LineCta } from '@/components/primitives/LineCta'
import { herePageMetadata } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/wallride',
    locale,
    t('pages.wallride.title'),
    t('pages.wallride.intro'),
  )
}

export default async function HereWallridePage() {
  const t = await getTranslations('here')

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.wallride.title')}
      intro={t('pages.wallride.intro')}
      backLabel={t('backToHub')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <HereFactGroup
          title={t('pages.wallride.aboutTitle')}
          items={[
            { body: t('pages.wallride.aboutBody') },
            { label: t('pages.wallride.curator'), body: t('pages.wallride.curatorBody') },
            { label: t('pages.wallride.theme'), body: t('pages.wallride.themeBody') },
          ]}
        />
        <HereFactGroup
          title={t('pages.wallride.visitTitle')}
          items={[
            { label: t('pages.wallride.where'), body: t('pages.wallride.whereBody') },
            { label: t('pages.wallride.access'), body: t('pages.wallride.accessBody') },
            { body: t('pages.wallride.sissi') },
          ]}
        />
      </div>
      <div className="mt-6">
        <LineCta href="/here/events" className="text-ui-sm">
          {t('pages.wallride.kttkCta')}
        </LineCta>
      </div>
    </HereSubpage>
  )
}
