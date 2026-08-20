import { TonightHeroCard } from '@/components/here/VenueCard'
import { VenueCompactCard } from '@/components/cards/VenueCompactCard'
import {
  resolveTonightHero,
  resolveTonightVenueCards,
} from '@/lib/here/tonight'

type Props = {
  locale: string
  /** When stay info sits beside tonight on desktop */
  besideStay?: boolean
}

export async function TonightSection({ locale, besideStay = false }: Props) {
  const [hero, venues] = await Promise.all([
    resolveTonightHero(locale),
    resolveTonightVenueCards(locale),
  ])

  return (
    <>
      <TonightHeroCard
        className={besideStay ? 'here-tonight h-full' : 'here-full'}
        title={hero.title}
        meta={hero.meta}
        statusLabel={hero.statusLabel}
        image={hero.image}
        href={hero.href}
      />
      {venues.map((card) => (
        <VenueCompactCard
          key={card.title}
          className={`here-tap h-full border ${
            card.categoryToken === 'amber' ? 'border-[#B87A2E]' : 'border-[#A08C38]'
          }`}
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
