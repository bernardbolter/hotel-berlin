import { ArrowRight } from 'lucide-react'

const MAP_FALLBACK = '/images/hero_map.png'

/** Max circle diameter — scales down with viewport via CSS clamp */
export const HERO_MAP_SIZE_PX = 248

/** Hero forest panel green — `#56674F` / `hbb-forest` */
const PIN_COLOR = '#56674F'

type Props = {
  imageSrc?: string
  directionsUrl: string
  directionsLabel: string
  hotelName: string
  shortAddress: string
  mapAlt: string
  linkLabel: string
}

function HotelMapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="21"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17 0C7.611 0 0 7.477 0 16.7c0 11.55 14.1 24.35 15.9 25.95a1.6 1.6 0 0 0 2.2 0C19.9 41.05 34 28.25 34 16.7 34 7.477 26.389 0 17 0Z"
        fill={PIN_COLOR}
      />
      <circle cx="17" cy="16" r="6.5" fill="white" />
    </svg>
  )
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
    <figure className="hero-map-teaser w-fit">
      {/* One directions hit target — layout shifts at 1100px */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={linkLabel}
        className="group flex flex-col items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white max-[1099px]:flex-row max-[1099px]:items-center max-[1099px]:gap-5"
      >
        {/* Below 1100: address + CTA to the left of the circle */}
        <div
          aria-hidden="true"
          className="hidden max-[1099px]:flex max-[1099px]:flex-col max-[1099px]:items-end max-[1099px]:gap-3 max-[1099px]:text-right"
        >
          <p className="font-serif text-[15px] leading-snug text-white/95">{shortAddress}</p>
          <span className="inline-flex book-now-btn book-now-btn--on-forest">
            <span className="book-now-btn__text">{directionsLabel}</span>
            <span className="book-now-btn__line" />
          </span>
        </div>

        <div className="hero-map-circle relative shrink-0 overflow-hidden rounded-full bg-hbb-forest">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={mapAlt}
            width={HERO_MAP_SIZE_PX}
            height={HERO_MAP_SIZE_PX}
            className="hero-map-circle__img h-full w-full object-cover"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[calc(46%+10px)] left-[calc(50%-4px)] z-10 -translate-x-1/2 -translate-y-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]"
          >
            <HotelMapPin />
          </span>

          <div
            aria-hidden="true"
            className="hero-map-circle__name pointer-events-none absolute top-[calc(49%+10px)] left-1/2 z-10 max-w-[78%] -translate-x-1/2 text-center"
          >
            <span className="inline-block rounded-sm bg-white/92 px-2 py-1 font-ui text-[11px] leading-tight font-semibold tracking-[0.02em] text-hbb-forest shadow-[0_1px_2px_rgba(0,0,0,0.12)] min-[1100px]:max-[1300px]:px-1.5 min-[1100px]:max-[1300px]:py-0.5 min-[1100px]:max-[1300px]:text-[9px]">
              {hotelName}
            </span>
          </div>

          {/* ≥1100: CTA strip inside the circle */}
          <span
            aria-hidden="true"
            className="hero-map-directions hidden min-[1100px]:flex"
            style={{ top: '72%' }}
          >
            <span className="hero-map-directions__label">
              <span>{directionsLabel}</span>
              <ArrowRight size={14} strokeWidth={2.5} className="shrink-0" />
            </span>
          </span>
        </div>

        {/* ≥1100: address under the circle */}
        <figcaption className="hidden text-center font-serif text-[15px] leading-snug text-white/95 transition-opacity group-hover:opacity-80 min-[1100px]:block">
          {shortAddress}
        </figcaption>
      </a>
    </figure>
  )
}
