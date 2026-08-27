import { ArrowRight } from 'lucide-react'

const MAP_FALLBACK = '/images/hero_map.png'

/** Circular map diameter */
export const HERO_MAP_BADGE_PX = 200

/** Hero forest panel green — `#56674F` / `hbb-forest` */
const PIN_COLOR = '#56674F'

type Props = {
  imageSrc?: string
  directionsUrl: string
  directionsLabel: string
  hotelName: string
  shortAddress: string
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

/**
 * Circular map teaser — original V2 style (white ring, pin, name, directions strip, address).
 * Parent positions the circle center on the forest/photo corner.
 */
export function HeroMapTeaser({
  imageSrc = MAP_FALLBACK,
  directionsUrl,
  directionsLabel,
  hotelName,
  shortAddress,
  linkLabel,
}: Props) {
  return (
    <a
      href={directionsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={linkLabel}
      className="hero-map-badge group relative block"
      style={{ width: HERO_MAP_BADGE_PX, height: HERO_MAP_BADGE_PX }}
    >
      {/* ≤550: address + CTA to the left of the circle */}
      <span className="hero-map-teaser__aside" aria-hidden="true">
        <span className="hero-map-teaser__aside-address">{shortAddress}</span>
        <span className="book-now-btn book-now-btn--on-forest inline-flex">
          <span className="book-now-btn__text">{directionsLabel}</span>
          <span className="book-now-btn__line" />
        </span>
      </span>

      <span className="hero-map-circle relative block h-full w-full overflow-hidden rounded-full bg-hbb-forest">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          width={HERO_MAP_BADGE_PX}
          height={HERO_MAP_BADGE_PX}
          className="hero-map-circle__img h-full w-full object-cover"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[calc(46%+10px)] left-[calc(50%-4px)] z-10 -translate-x-1/2 -translate-y-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]"
        >
          <HotelMapPin />
        </span>

        <span
          aria-hidden="true"
          className="hero-map-circle__name pointer-events-none absolute top-[calc(49%+10px)] left-1/2 z-10 max-w-[92%] -translate-x-1/2 text-center"
        >
          <span className="inline-block whitespace-nowrap rounded-sm bg-white/92 px-2 py-1 font-ui text-[11px] leading-none font-semibold tracking-[0.02em] text-hbb-forest shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
            {hotelName}
          </span>
        </span>

        <span aria-hidden="true" className="hero-map-directions text-[11px] leading-none">
          <span className="hero-map-directions__label text-[11px] leading-none">
            <span className="text-[11px] leading-none">{directionsLabel}</span>
            <ArrowRight size={11} strokeWidth={2.5} className="shrink-0" />
          </span>
        </span>
      </span>

      <span
        className="hero-map-teaser__address"
        aria-hidden="true"
        style={{
          background: 'rgba(86, 103, 79, 0.85)',
          fontFamily: 'var(--font-archivo), sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          padding: '0.25rem 0.55rem',
          color: '#fff',
        }}
      >
        {shortAddress}
      </span>
    </a>
  )
}
