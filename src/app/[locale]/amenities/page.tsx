import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { AmenitiesPageView } from '@/components/amenities/AmenitiesPageView'
import { scaffoldPageMetadata } from '@/lib/scaffolds/canonical'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'scaffolds' })
  return scaffoldPageMetadata(
    'amenities',
    locale,
    t('pages.amenities.title'),
    t('pages.amenities.intro'),
  )
}

export default async function AmenitiesPage({ params }: Props) {
  const { locale } = await params
  return <AmenitiesPageView locale={locale} />
}
