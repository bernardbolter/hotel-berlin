import { SweepCta } from '@/components/primitives/SweepCta'
import type { EatAndDrinkCopy } from '@/lib/payload/homepage'

/** Eat & Drink accent — espresso (map-palette gap, not amber). */
const ACCENT = '#5C4033'

const HEADING_CLASS =
  'text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12]'

type Props = {
  copy: EatAndDrinkCopy
}

/**
 * Homepage Eat & Drink / Lütze teaser — Rooms layout mirrored:
 * text left (2fr), photo right (3fr), D-curve on the right edge, accent bar between.
 */
export function LutzeTeaser({ copy }: Props) {
  const src = copy.image.src

  return (
    <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[2fr_3fr] lg:gap-10">
      {/* 1) Copy + CTA — left (Rooms puts this on the right) */}
      <div className="order-2 flex w-full min-w-0 flex-col items-start lg:order-1">
        <h2
          id="lutze-heading"
          className={HEADING_CLASS}
          style={{ color: ACCENT }}
        >
          {copy.heading}
        </h2>

        <p className="mt-6 text-left font-serif text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.7] text-[#3a3a3a]">
          {copy.body}
        </p>

        <SweepCta href="/restaurant" color="espresso" className="mt-10">
          {copy.ctaLabel}
        </SweepCta>
      </div>

      {/* 2) Photo — right, 3∶2, curve on the RIGHT (mirror of Rooms’ left D-shape) */}
      <figure className="relative order-1 min-w-0 w-full lg:order-2">
        <div className="flex w-full items-stretch gap-[2px]">
          <span
            aria-hidden="true"
            className="w-[2px] shrink-0 self-stretch"
            style={{ backgroundColor: ACCENT }}
          />
          <div className="lutze-photo-mask relative aspect-[3/2] min-w-0 flex-1 overflow-hidden bg-hbb-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={copy.image.alt}
              className="hero-photo-img absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </figure>
    </div>
  )
}
