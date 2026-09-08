import Image from 'next/image'
import { Clock, MapPin, ShoppingBag, Sun, Utensils, Wine } from 'lucide-react'

import { OpenStatusBadge } from '@/components/primitives/OpenStatusBadge'
import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import type { DiningBandFact, DiningServiceCard, DiningServiceKind } from '@/lib/here/getDiningBand'
import type { HereImage } from '@/lib/here/images'
import type { OpeningHoursEntry } from '@/lib/venue-time'

const FACT_ICONS = {
  bar: Wine,
  cuisine: Utensils,
  location: MapPin,
} as const

const CARD_ICONS = {
  breakfast: Clock,
  wundermart: ShoppingBag,
  garden: Sun,
} as const

export type HereDiningBandCopy = {
  body: string
  restaurantCta: string
  chipsAria: string
  cardsAria: string
  cardKickers: Record<DiningServiceKind, string>
}

type Props = {
  heading: string
  image: HereImage
  hours: OpeningHoursEntry[]
  facts: DiningBandFact[]
  roomServiceNote: string
  cardOnlyNote: string
  cards: DiningServiceCard[]
  copy: HereDiningBandCopy
}

/**
 * Guest-hub dining band — Sleep & Relax geometry, mirrored from home Lütze:
 * photo left 2/3 (`rooms-photo-mask`), text right 1/3, chips hugging the
 * photo's outer (left) edge. Forest, not espresso.
 */
export function HereDiningBand({
  heading,
  image,
  hours,
  facts,
  roomServiceNote,
  cardOnlyNote,
  cards,
  copy,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid w-full grid-cols-1 items-start gap-10 max-lg:grid-cols-[auto_minmax(0,1fr)] max-lg:gap-x-3 max-lg:gap-y-0.5 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0">
        <figure className="relative min-w-0 w-full max-lg:col-span-2 max-lg:row-start-2 lg:col-start-1 lg:row-start-1">
          <div className="rooms-photo-mask relative min-w-0 overflow-hidden bg-hbb-warm max-[550px]:aspect-[1/0.75] min-[551px]:aspect-[3/2]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 67vw"
              className="hero-photo-img object-cover"
            />
          </div>
        </figure>

        <ul
          role="list"
          aria-label={copy.chipsAria}
          className="mt-[2px] flex w-fit min-w-0 flex-wrap justify-start gap-1 max-lg:col-span-2 max-lg:row-start-3 max-lg:mt-0 lg:col-start-1 lg:row-start-2"
        >
          {hours.length > 0 ? (
            <li className="min-w-0">
              <OpenStatusBadge variant="guest" appearance="chip" openingHours={hours} />
            </li>
          ) : null}
          {facts.map((fact) => {
            const Icon = FACT_ICONS[fact.icon]
            return (
              <li
                key={`${fact.icon}-${fact.value}`}
                className="flex flex-row items-center justify-center gap-2 border border-hbb-deep-forest/30 px-3 py-2"
              >
                <Icon aria-hidden="true" size={14} className="shrink-0 text-hbb-deep-forest" />
                <span className="font-ui text-[0.78rem] leading-snug text-[#141414]">
                  <span className="sr-only">{fact.label}: </span>
                  {fact.value}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="flex w-full min-w-0 flex-col items-start max-lg:contents lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <h3
            className="text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-hbb-deep-forest max-lg:col-span-2 max-lg:row-start-1 max-lg:mb-3 max-lg:w-full"
          >
            {heading}
          </h3>

          <p className="mt-3.5 text-left font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a] max-lg:col-span-2 max-lg:mt-8 max-lg:max-w-[550px]">
            {copy.body}
          </p>

          {roomServiceNote || cardOnlyNote ? (
            <div className="mt-4 flex flex-col gap-1 font-ui text-[12.5px] leading-[18px] text-[#5a5a5a] max-lg:col-span-2">
              {roomServiceNote ? <p>{roomServiceNote}</p> : null}
              {cardOnlyNote ? <p>{cardOnlyNote}</p> : null}
            </div>
          ) : null}

          <SweepCta
            href="/restaurant"
            color="forest"
            className="mt-6 w-fit max-lg:col-span-2 max-lg:mt-8"
          >
            {copy.restaurantCta}
          </SweepCta>
        </div>
      </div>

      {cards.length > 0 ? (
        <ul
          role="list"
          aria-label={copy.cardsAria}
          className={`grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-2 ${
            cards.length >= 3 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {cards.map((card) => {
            const Icon = CARD_ICONS[card.kind]
            return (
              <li key={card.href + card.title} className="min-w-0">
                <Link
                  href={toAppHref(card.href)}
                  className="flex h-full flex-col gap-1.5 rounded-tl-[28px] border border-hbb-deep-forest/30 bg-white px-4 py-3.5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-deep-forest"
                >
                  <p className="flex items-center gap-2 font-ui text-[9.5px] font-bold uppercase tracking-[0.13em] text-hbb-deep-forest">
                    <Icon aria-hidden="true" size={14} className="shrink-0" />
                    <span>{copy.cardKickers[card.kind]}</span>
                  </p>
                  <p className="font-serif text-[21px] leading-[1.15] text-[#141414]">{card.title}</p>
                  <p className="font-ui text-[13px] font-medium leading-[18px] text-[#141414]">
                    {card.value}
                  </p>
                  {card.sub ? (
                    <p className="font-ui text-[11.5px] leading-[15.5px] text-[#5a5a5a]">{card.sub}</p>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
