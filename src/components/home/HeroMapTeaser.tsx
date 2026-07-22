import { ArrowRight } from 'lucide-react'

const MAP_FALLBACK = '/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg'

/** Circle diameter — sized for forest panel per Outside_short.pdf */
export const HERO_MAP_SIZE_PX = 248

type Props = {
  imageSrc?: string
  directionsUrl: string
  directionsLabel: string
  hotelName: string
  shortAddress: string
  mapAlt: string
  linkLabel: string
}

export function HeroMapTeaser({
  imageSrc = MAP_FALLBACK,
  directionsUrl,
  directionsLabel,
  hotelName,
  shortAddress,
  mapAlt,
  linkLabel,
}: Props) {
  return (
    <figure className="w-fit">
      {/* Whole circle (+ address) is one directions hit target — no nested links */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={linkLabel}
        className="hero-map-teaser group flex flex-col items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <div
          className="hero-map-circle relative shrink-0 overflow-hidden rounded-full bg-hbb-forest"
          style={{ width: HERO_MAP_SIZE_PX, height: HERO_MAP_SIZE_PX }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={mapAlt}
            width={HERO_MAP_SIZE_PX}
            height={HERO_MAP_SIZE_PX}
            className="hero-map-circle__img h-full w-full object-cover"
          />

          {/* Hotel name — just below the pin tip */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[52%] left-1/2 z-10 max-w-[78%] -translate-x-1/2 text-center"
          >
            <span className="inline-block rounded-sm bg-white/92 px-2 py-1 font-ui text-[11px] leading-tight font-semibold tracking-[0.02em] text-hbb-forest shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              {hotelName}
            </span>
          </div>

          <span aria-hidden="true" className="hero-map-directions" style={{ top: '72%' }}>
            <span className="hero-map-directions__label">
              <span>{directionsLabel}</span>
              <ArrowRight size={14} strokeWidth={2.5} className="shrink-0" />
            </span>
          </span>
        </div>

        <figcaption className="text-center font-serif text-[15px] leading-snug text-white/95 transition-opacity group-hover:opacity-80">
          {shortAddress}
        </figcaption>
      </a>
    </figure>
  )
}
