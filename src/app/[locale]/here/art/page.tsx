import { getTranslations } from 'next-intl/server'

import { ArtPageView } from '@/components/art/ArtPageView'
import { herePageMetadata } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata('/here/art', locale, t('pages.art.title'), t('pages.art.intro'))
}

export default async function HereArtPage({ params }: Props) {
  const { locale } = await params
  return <ArtPageView locale={locale} />
}
