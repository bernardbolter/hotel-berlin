import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { CultureSection } from '@/components/sections/CultureSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { HomeHero } from '@/components/home/HomeHero'
import { LutzeSection } from '@/components/sections/LutzeSection'
import { MapTeaser } from '@/components/sections/MapTeaser'
import { MeetingsSection } from '@/components/sections/MeetingsSection'
import { RoomsSection } from '@/components/sections/RoomsSection'

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
        <HomeHero />
        <RoomsSection />
        <MeetingsSection />
        <CultureSection />
        <LutzeSection />
        <MapTeaser />
        <FAQSection pageContext="homepage" />
      </main>
      <SiteFooter />
    </>
  )
}
