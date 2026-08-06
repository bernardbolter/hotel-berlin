'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

import { useTypewriter } from '@/hooks/useTypewriter'

import { HeroPhotoSlider } from './HeroPhotoSlider'
import { type HeroSlide } from './heroSlides'

export type HomeHeroCopy = {
  headingLine1: string
  headingLine2: string
  body: string
  galleryAria: string
}

type Props = {
  slides: HeroSlide[]
  copy: HomeHeroCopy
  map: ReactNode
}

/**
 * Hero layout (Outside_short.pdf):
 * - <768 (mobile): full-bleed photo on top, typewriter caption below, then green copy + map
 * - ≥768: green + copy + map left, square photo right (forest underlap)
 */
export function HomeHeroLayout({ slides, copy, map }: Props) {
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
    <section aria-label="Hero" className="home-hero relative bg-hbb-page">
      <div
        aria-hidden="true"
        className="home-hero__forest pointer-events-none absolute left-0 z-0 hidden bg-hbb-forest md:block"
      />

      {/* Mobile: flex-col-reverse → photo on top. ≥md: side-by-side */}
      <div className="home-hero__row relative z-10 flex flex-col-reverse md:flex-row md:items-stretch">
        <div className="home-hero__copy relative flex w-full flex-col bg-hbb-forest px-8 py-12 text-white md:bg-hbb-forest md:px-0 md:py-[var(--hero-pad)] md:pl-8 md:pr-4 lg:pl-14 lg:pr-6">
          <div className="home-hero__copy-text mt-5 ml-0 w-full max-w-none self-stretch pr-0 min-[1301px]:max-w-[26rem] min-[1301px]:self-start md:mt-2 md:ml-2 md:pr-4 lg:ml-5 lg:pr-6">
            <h1 className="font-serif text-[clamp(1.75rem,5vw,3.15rem)] font-normal leading-[1.18] tracking-[-0.01em] text-white">
              {copy.headingLine1}
              <br />
              {copy.headingLine2}
            </h1>
            <p className="mt-5 max-w-none font-serif text-[clamp(0.95rem,2.5vw,1.125rem)] leading-[1.65] text-white/95 min-[1301px]:max-w-[26rem]">
              {copy.body}
            </p>
          </div>

          <div className="home-hero__map mt-10 flex w-full justify-center md:mt-auto md:w-auto md:justify-end md:pt-4">
            {map}
          </div>
        </div>

        <div className="home-hero__photo-col relative w-full pb-6 md:ml-auto md:w-auto md:shrink-0 md:pb-0">
          <div className="home-hero__photo relative aspect-square w-full overflow-hidden bg-hbb-warm">
            <HeroPhotoSlider
              slides={slides}
              ariaLabel={copy.galleryAria}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          <p
            className="home-hero__caption relative mt-3 px-8 font-ui text-[11px] font-semibold tracking-[0.14em] text-hbb-forest md:mt-0 md:px-0 md:tracking-[0.1em]"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Reserve full width so typewriter doesn’t shift layout */}
            <span className="invisible whitespace-pre-wrap md:whitespace-nowrap" aria-hidden="true">
              {caption}
            </span>
            <span className="absolute top-0 right-8 left-8 whitespace-pre-wrap md:inset-0 md:right-auto md:left-auto md:whitespace-nowrap">
              {typedCaption}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
