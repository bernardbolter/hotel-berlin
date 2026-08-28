import { Clock, MapPin, Utensils, Wine } from 'lucide-react'

import { SweepCta } from '@/components/primitives/SweepCta'
import type { EatAndDrinkCopy } from '@/lib/payload/homepage'

/** Eat & Drink accent — espresso (map-palette gap, not amber). */
const ACCENT = '#5C4033'
const LUTZE_SITE = 'https://www.luetze-berlin.de/'

export type LutzeFact = {
  icon: 'kitchen' | 'bar' | 'cuisine' | 'location'
  label: string
  value: string
}

type Props = {
  copy: EatAndDrinkCopy
  facts?: LutzeFact[]
  restaurantUrl?: string
  visitAria?: string
}

const FACT_ICONS = {
  kitchen: Clock,
  bar: Wine,
  cuisine: Utensils,
  location: MapPin,
} as const

/**
 * Homepage Eat & Drink / Lütze teaser — Rooms layout mirrored:
 * text left (1/3), photo right (2/3); stacked below lg like rooms.
 */
export function LutzeTeaser({
  copy,
  facts = [],
  restaurantUrl = LUTZE_SITE,
  visitAria = 'Visit Lütze website (opens in new tab)',
}: Props) {
  const src = copy.image.src
  const visibleFacts = facts.filter((fact) => fact.value.trim())
  const href = restaurantUrl.trim() || LUTZE_SITE

  return (
    <div className="grid w-full grid-cols-1 items-start gap-10 max-lg:grid-cols-[auto_minmax(0,1fr)] max-lg:gap-x-3 max-lg:gap-y-0.5 lg:grid-cols-[1fr_2fr] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0">
      {/* Photo — 2/3 + accent bar on the left (rooms, mirrored) */}
      <figure className="relative min-w-0 w-full max-lg:col-span-2 max-lg:row-start-2 lg:col-start-2 lg:row-start-1">
        <div className="flex w-full items-stretch gap-[2px] max-lg:w-[calc(100%+1.25rem-5px)] max-lg:-ml-[15px] max-lg:gap-px md:max-lg:w-[calc(100%+2.5rem-5px)] md:max-lg:-ml-[35px]">
          <span
            aria-hidden="true"
            className="w-[2px] shrink-0 self-stretch bg-hbb-espresso max-lg:w-[15px] md:max-lg:w-[35px]"
          />
          <div className="lutze-photo-mask relative min-w-0 flex-1 overflow-hidden bg-hbb-warm max-[550px]:aspect-[1/0.75] min-[551px]:aspect-[3/2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={copy.image.alt}
              className="hero-photo-img absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </figure>

      {/* Desktop: chips + logo stacked, right-aligned. Below lg: chips left, logo right of photo. */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={visitAria}
        className="group mt-[2px] flex w-fit max-w-full flex-col items-start gap-1.5 max-lg:col-span-2 max-lg:row-start-3 max-lg:mt-0 max-lg:w-[calc(100%+1.25rem-5px)] max-lg:max-w-none max-lg:-ml-[15px] max-lg:flex-row max-lg:items-start max-lg:justify-between max-lg:gap-3 max-lg:pl-4 md:max-lg:w-[calc(100%+2.5rem-5px)] md:max-lg:-ml-[35px] md:max-lg:pl-9 lg:col-start-2 lg:row-start-2 lg:ml-auto lg:items-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-espresso"
      >
        {visibleFacts.length > 0 ? (
          <ul role="list" className="flex w-fit min-w-0 flex-wrap justify-start gap-1 max-lg:flex-1 lg:justify-end">
            {visibleFacts.map((fact) => {
              const Icon = FACT_ICONS[fact.icon]
              return (
                <li
                  key={`${fact.icon}-${fact.label}`}
                  className="flex flex-row items-center justify-center gap-2 border border-hbb-espresso/30 px-3 py-2 transition-colors group-hover:border-hbb-espresso"
                >
                  <Icon aria-hidden="true" size={14} className="shrink-0 text-hbb-espresso" />
                  <span className="font-ui text-[0.78rem] leading-snug text-[#5a5a5a]">
                    <span className="sr-only">{fact.label}: </span>
                    {fact.value}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : null}
        <span className="relative aspect-[383/145] h-[calc(1rem+14px)] w-[calc((1rem+14px)*383/145)] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lutze-logo.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-right"
          />
        </span>
      </a>

      {/* Copy + CTA — 1/3 left. Below lg: children join the parent grid. */}
      <div className="flex w-full min-w-0 flex-col items-start max-lg:contents lg:col-start-1 lg:row-start-1 lg:row-span-2">
        <h2
          id="lutze-heading"
          className="text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] max-lg:col-span-2 max-lg:row-start-1 max-lg:mb-3 max-lg:w-full"
          style={{ color: ACCENT }}
        >
          {copy.heading}
        </h2>

        <p className="mt-6 text-left font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a] max-lg:col-span-2 max-lg:mt-8 max-lg:max-w-[550px] max-lg:text-[clamp(1.1rem,1.4vw,1.25rem)]">
          {copy.body}
        </p>

        <SweepCta
          href="/restaurant"
          color="espresso"
          className="mt-10 ml-auto max-lg:col-span-2 max-lg:mt-8 max-lg:ml-0 max-lg:w-fit max-lg:justify-self-start"
        >
          {copy.ctaLabel}
        </SweepCta>
      </div>
    </div>
  )
}
