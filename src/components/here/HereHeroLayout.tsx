'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

import { useTypewriter } from '@/hooks/useTypewriter'

import { HeroClock } from '@/components/here/HeroClock'
import { HeroPhotoSlider } from '@/components/home/HeroPhotoSlider'
import { type HeroSlide } from '@/components/home/heroSlides'
import { SweepCta } from '@/components/primitives/SweepCta'
import type { GuestStayInfo } from '@/lib/payload/hotel'

export type HereHeroLayoutCopy = {
  dayLabel: string
  greeting: string
  subline1?: string | null
  subline2?: string | null
  wifiLabel: string
  checkoutLabel: string
  breakfastLabel: string
  parkingLabel: string
  luggageLabel: string
  stayCta: string
  clockAria: string
  galleryAria: string
  wifiPasswordAria: string
  guestCareKicker: string
  guestCareTitle: string
  guestCareBody: string
  guestCareExtension?: string | null
}

type Props = {
  slides: HeroSlide[]
  copy: HereHeroLayoutCopy
  stay: GuestStayInfo
}

function Fact({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="here-hero__fact">
      <dt className="here-hero__k">{label}</dt>
      <dd className="here-hero__v">
        <span>{value}</span>
        {note ? <span className="here-hero__fact-note">{note}</span> : null}
      </dd>
    </div>
  )
}

/**
 * /here hero — reuses `.home-hero` 1fr 2fr geometry.
 * Grey panel, amber marks, 160px seam badge. Clock is in the badge.
 *
 * Mobile clock-as-corner-overlay is still open (same as home). Do not guess.
 */
export function HereHeroLayout({ slides, copy, stay }: Props) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const activeSlide = slides[activeIndex] ?? slides[0]
  const caption =
    (locale === 'de' ? activeSlide?.captionDE : activeSlide?.captionEN) ?? ''
  const typedCaption = useTypewriter(caption, !reduceMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return (
    <section aria-label="Hero" className="home-hero home-hero--here relative bg-white">
      <div className="site-shell">
        <div className="home-hero__row relative z-10">
          <div className="home-hero__copy h-fit self-start rounded-bl-[25px]">
            <div className="home-hero__copy-text">
              <div className="here-hero__intro">
                <p className="here-hero__day">{copy.dayLabel}</p>
                <h1 className="home-hero__headline">{copy.greeting}</h1>
                {copy.subline1 ? (
                  <p className="here-hero__subline">{copy.subline1}</p>
                ) : null}
                {copy.subline2 ? (
                  <p className="here-hero__subline-2">{copy.subline2}</p>
                ) : null}
              </div>

              <hr className="here-hero__rule" />

              <dl className="here-hero__facts">
                <div className="here-hero__facts-wide">
                  <dt className="here-hero__k">{copy.wifiLabel}</dt>
                  <dd className="here-hero__v here-hero__wifi">
                    <span>{stay.wifiNetwork}</span>
                    <span className="here-hero__wifi-pill" aria-label={copy.wifiPasswordAria}>
                      {stay.wifiPassword}
                    </span>
                  </dd>
                </div>
                <div className="here-hero__facts-grid">
                  <Fact
                    label={copy.checkoutLabel}
                    value={stay.checkout.value}
                    note={stay.checkout.note}
                  />
                  <Fact
                    label={copy.breakfastLabel}
                    value={stay.breakfast.value}
                    note={stay.breakfast.note}
                  />
                  <Fact
                    label={copy.parkingLabel}
                    value={stay.parking.value}
                    note={stay.parking.note}
                  />
                  <Fact
                    label={copy.luggageLabel}
                    value={stay.luggage.value}
                    note={stay.luggage.note}
                  />
                </div>
                <div className="here-hero__facts-wide">
                  <dt className="here-hero__k">{copy.guestCareKicker}</dt>
                  <dd className="here-hero__v">
                    <span>{copy.guestCareTitle}</span>
                    {copy.guestCareExtension ? (
                      <span className="here-hero__fact-note">{copy.guestCareExtension}</span>
                    ) : null}
                    <span className="here-hero__fact-note">{copy.guestCareBody}</span>
                  </dd>
                </div>
              </dl>

              <hr className="here-hero__rule" />

              <SweepCta href="/here/faq" color="ctx" className="w-fit">
                {copy.stayCta}
              </SweepCta>
            </div>
            <div className="home-hero__badge">
              <div className="here-hero__clock">
                <HeroClock ariaLabel={copy.clockAria} weekday={copy.dayLabel} />
              </div>
            </div>
          </div>

          <div className="home-hero__photo-col">
            <div className="home-hero__photo relative overflow-hidden rounded-bl-[50px] max-[1099px]:rounded-none bg-hbb-warm max-[767px]:aspect-[1/0.75] min-[768px]:max-[1099px]:aspect-[2/1]">
              <HeroPhotoSlider
                slides={slides}
                ariaLabel={copy.galleryAria}
                activeIndex={activeIndex}
                onIndexChange={setActiveIndex}
                className="absolute inset-0 h-full w-full"
              />
              {caption ? (
                <p
                  className="home-hero__caption relative font-ui text-[11px] font-bold tracking-[0.14em] uppercase"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="invisible whitespace-pre-wrap" aria-hidden="true">
                    {caption}
                  </span>
                  <span className="home-hero__caption-text absolute top-1/2 left-[0.55rem] -translate-y-1/2 whitespace-pre-wrap">
                    {typedCaption}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
