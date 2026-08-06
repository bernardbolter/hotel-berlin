import { SectionDivider } from '@/components/here/SectionDivider'
import { TonightHeroCard } from '@/components/here/VenueCard'
import { VenueCompactCard } from '@/components/cards/VenueCompactCard'
import {
  resolveTonightHero,
  resolveTonightVenueCards,
} from '@/lib/here/tonight'

type Props = {
  locale: string
  sectionLabel: string
}

export async function TonightSection({ locale, sectionLabel }: Props) {
  const [hero, venues] = await Promise.all([
    resolveTonightHero(locale),
    resolveTonightVenueCards(locale),
  ])

  if (!hero && venues.length === 0) return null

  return (
    <>
      <SectionDivider label={sectionLabel} />
      {hero ? (
        <TonightHeroCard
          className="card-full col-span-2"
          title={hero.title}
          meta={hero.meta}
          statusLabel={hero.statusLabel}
          image={hero.image}
          href={hero.href}
        />
      ) : null}
      {venues.map((card) => (
        <VenueCompactCard
          key={card.title}
          className="card-half col-span-2 xs:col-span-1"
          density="compact"
          badge={card.badge}
          badgeVariant={card.badgeVariant}
          liveOpen={card.liveOpen}
          title={card.title}
          lines={card.lines}
          href={card.href}
          categoryToken={card.categoryToken}
        />
      ))}
    </>
  )
}
