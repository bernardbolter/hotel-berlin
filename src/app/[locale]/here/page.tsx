import { getTranslations } from 'next-intl/server'

import { SectionDivider } from '@/components/here/SectionDivider'
import { StayInfoCard } from '@/components/here/StayInfoCard'
import { TonightSection } from '@/components/here/TonightSection'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { NeighbourhoodMapSection } from '@/components/map/NeighbourhoodMapSection'
import { getGuestStayInfo } from '@/lib/payload/hotel'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('heroSubline'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/hier' : 'en/here'}`,
      languages: {
        de: 'https://hotel-berlin.de/de/hier',
        en: 'https://hotel-berlin.de/en/here',
        'x-default': 'https://hotel-berlin.de/de/hier',
      },
    },
  }
}

export default async function HerePage({ params, searchParams }: Props) {
  const { locale } = await params
  const query = await searchParams
  const context = first(query.context)
  const eventSlug = first(query.event)

  const t = await getTranslations('here')
  const stay = await getGuestStayInfo()

  const hideStay = context === 'dining' || context === 'gallery'

  return (
    <>
      <SiteNavWithData context="inside" />
      <main id="main-content">
        <div className="site-shell py-6 md:py-10">
          <header className="mb-6 px-3 md:px-0">
            <h1 className="font-ui text-ui-xl font-medium text-hbb-black md:font-serif md:text-serif-xl">
              {t('heroHeadline')}
            </h1>
            <p className="mt-2 max-w-xl font-serif text-serif-sm text-gray-600">
              {t('heroSubline')}
            </p>
          </header>

          <div className="here-grid">
            {!hideStay ? (
              <>
                <SectionDivider label={t('duringYourStay')} />
                <StayInfoCard
                  className="card-full col-span-2"
                  stay={stay}
                  labels={{
                    checkout: t('stay.checkout'),
                    breakfast: t('stay.breakfast'),
                    wifi: t('stay.wifi'),
                    parking: t('stay.parking'),
                    luggage: t('stay.luggage'),
                    faqsCta: t('stay.faqsCta'),
                  }}
                  eventRow={
                    eventSlug
                      ? {
                          label: t('stay.eventLabel'),
                          value: eventSlug,
                        }
                      : null
                  }
                />
              </>
            ) : null}

            <TonightSection locale={locale} sectionLabel={t('tonight')} />
          </div>
        </div>

        <NeighbourhoodMapSection context="here" />
      </main>
      <SiteFooter />
    </>
  )
}
