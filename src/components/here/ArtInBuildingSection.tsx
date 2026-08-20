import { getTranslations } from 'next-intl/server'

import { SectionDivider } from '@/components/here/SectionDivider'
import { SpotlightCard } from '@/components/spotlight/SpotlightCard'
import { HERE_IMAGES } from '@/lib/here/images'
import { resolveTonightHero } from '@/lib/here/tonight'
import { getVenueBySlug } from '@/lib/payload/venues'
import { resolveVenueSpotlight } from '@/lib/spotlight/resolvers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

type Props = {
  locale: string
}

const FLOORS = [
  { key: 'somari', href: '/here/art', image: HERE_IMAGES.muralSomari, token: 'art' },
  { key: 'deerbln', href: '/here/art', image: HERE_IMAGES.muralDeer, token: 'art' },
  { key: 'pisa73', href: '/here/art', image: HERE_IMAGES.muralPisa, token: 'art' },
] as const

export async function ArtInBuildingSection({ locale }: Props) {
  const t = await getTranslations('here')
  const show = await resolveTonightHero(locale)

  let liveShow: SpotlightCardProps | null = null
  try {
    const fkkb = await getVenueBySlug('fkkb', locale === 'de' ? 'de' : 'en')
    if (fkkb) {
      liveShow = await resolveVenueSpotlight(fkkb, { locale })
    }
  } catch (error) {
    console.error('[ArtInBuildingSection] FKKB spotlight skipped:', error)
  }

  const currentCard: SpotlightCardProps = liveShow
    ? {
        ...liveShow,
        image: liveShow.image?.src ? liveShow.image : show.image,
        cta: { ...liveShow.cta, href: '/here/art', external: false },
      }
    : {
        image: show.image,
        badge: { label: t('art.currentBadge'), categoryToken: 'art' },
        title: show.title,
        venueLabel: 'FKKB',
        primaryMeta: show.statusLabel,
        description: t('art.currentDescription'),
        secondaryMeta: {
          left: locale === 'de' ? 'Erdgeschoss' : 'Ground floor',
          right: locale === 'de' ? 'Freier Eintritt' : 'Free entry',
        },
        cta: {
          label: t('art.currentCta'),
          href: '/here/art',
          categoryToken: 'art',
        },
      }

  const floorCards: SpotlightCardProps[] = FLOORS.map((floor) => ({
    image: { src: floor.image.src, alt: floor.image.alt },
    badge: { label: t('art.wallsBadge'), categoryToken: floor.token },
    title: t(`art.floors.${floor.key}.title`),
    primaryMeta: t(`art.floors.${floor.key}.floor`),
    description: t(`art.floors.${floor.key}.body`),
    cta: {
      label: t(`art.floors.${floor.key}.cta`),
      href: floor.href,
      categoryToken: floor.token,
    },
  }))

  const cards = [currentCard, ...floorCards]

  return (
    <>
      <SectionDivider label={t('artInBuilding')} />
      <ul
        role="list"
        aria-label={t('art.rowAria')}
        className="here-floors grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {cards.map((card, index) => (
          <li key={`${card.title}-${index}`} className="min-w-0">
            <SpotlightCard {...card} className="h-full w-full min-w-0!" />
          </li>
        ))}
      </ul>
    </>
  )
}
