import { getTranslations } from 'next-intl/server'

import { ArtWallSection } from '@/components/here/ArtWallSection'
import { HereDiningSection } from '@/components/here/HereDiningSection'
import { HereHelpSection } from '@/components/here/HereHelpSection'
import { HereHero } from '@/components/here/HereHero'
import { HereHubStrip } from '@/components/here/HereHubStrip'
import { HereTipsSection } from '@/components/here/HereTipsSection'
import { InTheHouseSection } from '@/components/here/InTheHouseSection'
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
    <main id="main-content" className="bg-hbb-page">
      <HereHero locale={locale} eventSlug={eventSlug} />

      <div className="site-shell flex flex-col gap-12 px-section-sm py-section-y md:gap-16 md:px-section-x">
        <HereHubStrip locale={locale} />

        <HereDiningSection locale={locale} />

        <InTheHouseSection locale={locale} />
      </div>

      <ArtWallSection locale={locale} />

      <HereTipsSection locale={locale} />

      <HereHelpSection />
    </main>
  )
}
