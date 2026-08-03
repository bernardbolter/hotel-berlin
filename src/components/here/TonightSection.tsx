import { SectionDivider } from '@/components/here/SectionDivider'
import { TonightHeroCard, VenueCard } from '@/components/here/VenueCard'
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
        <VenueCard
          key={card.title}
          className="card-half col-span-2 xs:col-span-1"
          title={card.title}
          badge={card.badge}
          meta={card.meta}
          href={card.href}
          tone={card.tone}
          live={card.live}
        />
      ))}
    </>
  )
}
