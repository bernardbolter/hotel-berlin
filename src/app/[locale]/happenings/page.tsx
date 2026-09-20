import { getTranslations } from 'next-intl/server'

import { EventsAgendaView, agendaCanonicalPath } from '@/components/events/EventsAgendaView'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ kategorie?: string; category?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'events.agenda' })
  const intro = await getTranslations({ locale, namespace: 'happenings' })
  const canonical = agendaCanonicalPath(locale === 'de' ? 'de' : 'en', '/happenings')

  return {
    title: `${t('pageTitle')} | Hotel Berlin, Berlin`,
    description: intro('intro'),
    alternates: {
      canonical,
      languages: {
        de: 'https://hotel-berlin.de/de/happenings',
        en: 'https://hotel-berlin.de/en/happenings',
        'x-default': 'https://hotel-berlin.de/de/happenings',
      },
    },
  }
}

export default async function HappeningsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const query = await searchParams
  const t = await getTranslations('events.agenda')
  const intro = await getTranslations('happenings')
  const loc = locale === 'de' ? 'de' : 'en'
  const filterRaw = loc === 'de' ? query.kategorie : query.category

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="site-shell px-section-sm py-section-y md:px-section-x">
          <header className="mb-10 max-w-2xl">
            <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
              {t('pageTitle')}
            </h1>
            <p className="mt-3 max-w-xl font-serif text-serif-sm text-gray-600">{intro('intro')}</p>
          </header>
          <EventsAgendaView
            locale={locale}
            framing="prospect"
            filterRaw={filterRaw}
            pathname="/happenings"
          />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
