import { SweepCta } from '@/components/primitives/SweepCta'
import type { EatAndDrinkCopy } from '@/lib/payload/homepage'

/** Warm food accent — nav amber / gold. */
const ACCENT = '#B87A2E'

const HEADING_CLASS =
  'text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12]'

type Props = {
  copy: EatAndDrinkCopy
}

/**
 * Homepage Eat & Drink / Lütze teaser — Rooms pattern mirrored:
 * text left, arch-top photo right, single Sweep CTA. No peach panel, no hours, no button pair.
 */
export function LutzeTeaser({ copy }: Props) {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr] lg:gap-12">
      {/* 1) Copy + CTA — left (mirrors Rooms text-on-right) */}
      <div className="flex w-full min-w-0 flex-col items-start order-2 lg:order-1">
        {copy.kicker ? (
          <p
            className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: ACCENT }}
          >
            {copy.kicker}
          </p>
        ) : null}

        <h2
          id="lutze-heading"
          className={`${HEADING_CLASS} ${copy.kicker ? 'mt-3' : ''}`}
          style={{ color: ACCENT }}
        >
          {copy.heading}
        </h2>

        <p className="mt-6 text-left font-serif text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.7] text-[#3a3a3a]">
          {copy.body}
        </p>

        <SweepCta href="/restaurant" color="nav-amber" className="mt-10">
          {copy.ctaLabel}
        </SweepCta>
      </div>

      {/* 2) Photo — right, arch-top (wireframe + opposite side from Rooms) */}
      <figure className="relative min-w-0 w-full order-1 lg:order-2">
        <div className="flex w-full items-stretch gap-[2px]">
          <span
            aria-hidden="true"
            className="hidden w-[2px] shrink-0 self-stretch lg:block"
            style={{ backgroundColor: ACCENT }}
          />
          <div className="lutze-photo-mask relative aspect-[3/2] min-w-0 flex-1 overflow-hidden bg-hbb-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={copy.image.src}
              alt={copy.image.alt}
              className="hero-photo-img absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </figure>
    </div>
  )
}
