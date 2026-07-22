import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { NeighbourhoodMap } from '@/components/map/NeighbourhoodMap'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { getMapSettings } from '@/lib/map/settings'
import { getPlacesForContext } from '@/lib/queries/places'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'neighbourhood' })

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('subtitle'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}/neighbourhood`,
      languages: {
        de: 'https://hotel-berlin.de/de/neighbourhood',
        en: 'https://hotel-berlin.de/en/neighbourhood',
        'x-default': 'https://hotel-berlin.de/de/neighbourhood',
      },
    },
  }
}

export default async function NeighbourhoodPage() {
  const t = await getTranslations('neighbourhood')
  const mapSettings = await getMapSettings()
  const places = getPlacesForContext('outside')

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="px-section-sm pb-section-y pt-10 md:px-section-x">
          <SectionHeading
            label={t('label')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
        </div>

        <div className="border-y border-gray-200">
          {mapSettings.accessToken ? (
            <NeighbourhoodMap
              accessToken={mapSettings.accessToken}
              bounds={mapSettings.bounds}
              center={mapSettings.center}
              places={places}
              ariaLabel={t('mapAria')}
            />
          ) : (
            <div className="flex min-h-105 items-center justify-center bg-gray-100 px-6 text-center font-ui text-ui-sm text-gray-500">
              {t('mapUnavailable')}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
