import { getTranslations } from 'next-intl/server'

import { ArtInBuildingSection } from '@/components/here/ArtInBuildingSection'
import { BasementSection } from '@/components/here/BasementSection'
import { GoodToKnowCard } from '@/components/here/GoodToKnowCard'
import { HereFaqSection } from '@/components/here/HereFaqSection'
import { HereHero } from '@/components/here/HereHero'
import { SectionDivider } from '@/components/here/SectionDivider'
import { StayInfoCard } from '@/components/here/StayInfoCard'
import { TonightSection } from '@/components/here/TonightSection'
import { NeighbourhoodMapSection } from '@/components/map/NeighbourhoodMapSection'
import { hereAlternates } from '@/lib/here/canonical'
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
    alternates: hereAlternates('/here', locale),
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
    <main id="main-content" className="bg-[#EDEDED]">
      <div className="mx-auto max-w-7xl bg-hbb-page">
      <HereHero locale={locale} eventSlug={eventSlug} />

      <div className="here-grid">
        {!hideStay ? (
          <>
            <SectionDivider label={t('duringYourStay')} />
            <StayInfoCard
              className="here-stay"
              stay={stay}
              labels={{
                title: t('stay.title'),
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

        <TonightSection locale={locale} besideStay={!hideStay} />

        <SectionDivider label={t('goodToKnow.section')} />
        <GoodToKnowCard
          className="here-full"
          title={t('goodToKnow.title')}
          gettingAroundCta={t('goodToKnow.gettingAroundCta')}
          columns={[
            {
              title: t('goodToKnow.settled.title'),
              items: [
                t('goodToKnow.settled.checkin'),
                t('goodToKnow.settled.luggage'),
                t('goodToKnow.settled.safes'),
              ],
            },
            {
              title: t('goodToKnow.money.title'),
              items: [
                t('goodToKnow.money.cards'),
                t('goodToKnow.money.wifi'),
                t('goodToKnow.money.atm'),
              ],
            },
            {
              title: t('goodToKnow.health.title'),
              items: [
                t('goodToKnow.health.pets'),
                t('goodToKnow.health.nonsmoking'),
                t('goodToKnow.health.gym'),
              ],
            },
            {
              title: t('goodToKnow.around.title'),
              items: [
                t('goodToKnow.around.taxi'),
                t('goodToKnow.around.ev'),
                t('goodToKnow.around.guide'),
              ],
            },
          ]}
        />

        <ArtInBuildingSection locale={locale} />

        <SectionDivider label={t('exploreSection')} />
        <NeighbourhoodMapSection
          context="here"
          layout="card"
          ctaHref="/here/explore"
          ctaLabel={t('openFullMap')}
        />

        <BasementSection />
        <SectionDivider label={t('needHelp')} />
        <HereFaqSection
          className="here-full"
          heading={t('faqsHeading')}
          ctaLabel={t('allGuestFaqs')}
        />
      </div>
      </div>
    </main>
  )
}
