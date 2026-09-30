import { getTranslations } from 'next-intl/server'

import { ArtWallSection } from '@/components/here/ArtWallSection'
import { HereDiningSection } from '@/components/here/HereDiningSection'
import { HereHelpSection } from '@/components/here/HereHelpSection'
import { HereHero } from '@/components/here/HereHero'
import { HereHubStrip } from '@/components/here/HereHubStrip'
import { HereTipsSection } from '@/components/here/HereTipsSection'
import { InTheHouseSection } from '@/components/here/InTheHouseSection'
import type { SectionBackground } from '@/components/layout/SectionShell'
import { hereAlternates } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * Canonical guest-hub section order. Render in this sequence.
 */
export const HUB_SECTIONS = [
  'hero',
  'events',
  'dining',
  'inTheHouse',
  'art',
  'people',
  'neighbourhood',
  'help',
] as const

/**
 * Thematic light-section rhythm — brief §3 plus real hub bands not in the
 * simplified comp (events strip → coral). Art wall uses neutral so FAQ can
 * keep teal as the /here closing accent without adjacent-token collisions
 * if the tips row is empty.
 */
const HERE_SECTION_BG = {
  hero: 'here-tan',
  events: 'coral-light',
  dining: 'gold-light',
  inTheHouse: 'amber-light',
  art: 'neutral-light',
  neighbourhood: 'green-light',
  help: 'teal-light',
  footer: 'dark-footer',
} as const satisfies Record<string, SectionBackground>

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('heroSubline'),
    alternates: hereAlternates('/here', locale),
  }
}

export default async function HerePage({ params, searchParams }: Props) {
  const { locale } = await params
  const query = await searchParams
  const eventSlug = first(query.event)

  return (
    <main id="main-content">
      <HereHero locale={locale} eventSlug={eventSlug} />

      <HereHubStrip locale={locale} background={HERE_SECTION_BG.events} />

      <HereDiningSection locale={locale} background={HERE_SECTION_BG.dining} />

      <InTheHouseSection
        locale={locale}
        background={HERE_SECTION_BG.inTheHouse}
      />

      <ArtWallSection locale={locale} background={HERE_SECTION_BG.art} />

      <HereTipsSection
        locale={locale}
        background={HERE_SECTION_BG.neighbourhood}
      />

      <HereHelpSection background={HERE_SECTION_BG.help} />
    </main>
  )
}
