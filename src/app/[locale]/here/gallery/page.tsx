import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { LineCta } from '@/components/primitives/LineCta'
import { herePageMetadata } from '@/lib/here/canonical'
import { resolveTonightHero } from '@/lib/here/tonight'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/gallery',
    locale,
    t('pages.gallery.title'),
    t('pages.gallery.intro'),
  )
}

export default async function HereGalleryPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('here')
  const show = await resolveTonightHero(locale)

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.gallery.title')}
      intro={t('pages.gallery.intro')}
      backLabel={t('backToHub')}
    >
      <HereFactGroup
        title={t('pages.gallery.nowTitle')}
        items={[
          {
            label: t('pages.gallery.current'),
            body: show?.title ?? t('art.fallbackTitle'),
          },
          { label: t('pages.gallery.where'), body: t('pages.gallery.whereBody') },
          { label: t('pages.gallery.entry'), body: t('pages.gallery.entryBody') },
          { body: t('pages.gallery.editions') },
        ]}
      />
      <div className="mt-6">
        <LineCta href="/here/art" className="text-ui-sm">
          {t('pages.gallery.artCta')}
        </LineCta>
      </div>
    </HereSubpage>
  )
}
