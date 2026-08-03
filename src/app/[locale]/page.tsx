import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { EventsSection } from '@/components/events/EventsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { HomeHero } from '@/components/home/HomeHero'
import { LutzeSection } from '@/components/sections/LutzeSection'
import { MeetingsSection } from '@/components/sections/MeetingsSection'
import { NeighbourhoodMapSection } from '@/components/map/NeighbourhoodMapSection'
import { RoomsHero } from '@/components/home/RoomsHero'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return {
    title: 'Hotel Berlin, Berlin',
    description: t('heroSubline'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}`,
      languages: {
        de: 'https://hotel-berlin.de/de',
        en: 'https://hotel-berlin.de/en',
        'x-default': 'https://hotel-berlin.de/de',
      },
    },
  }
}

export default function HomePage() {
  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content">
        <div className="site-shell">
          <HomeHero />
        </div>
        <RoomsHero />
        <div className="site-shell">
          <MeetingsSection />
          <EventsSection />
          <LutzeSection />
        </div>
        <NeighbourhoodMapSection />
        <div className="site-shell">
          <FAQSection pageContext="homepage" />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
