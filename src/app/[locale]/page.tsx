import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import type { SectionBackground } from '@/components/layout/SectionShell'
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

/**
 * Thematic light-section rhythm — see doc/sectionRythm build brief.
 * Dark bands listed for audit; they stay on their own components.
 */
const HOME_SECTION_BG = {
  hero: 'dark-hero',
  rooms: 'neutral-light',
  meetings: 'dark-accent',
  events: 'coral-light',
  dining: 'gold-light',
  neighbourhood: 'green-light',
  faq: 'amber-light',
  footer: 'dark-footer',
} as const satisfies Record<string, SectionBackground>

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
        <RoomsHero background={HOME_SECTION_BG.rooms} />
        <MeetingsSection />
        <EventsSection background={HOME_SECTION_BG.events} />
        <LutzeSection background={HOME_SECTION_BG.dining} />
        <NeighbourhoodMapSection background={HOME_SECTION_BG.neighbourhood} />
        <FAQSection
          context="prospect"
          category="general"
          background={HOME_SECTION_BG.faq}
        />
      </main>
      <SiteFooter />
    </>
  )
}
