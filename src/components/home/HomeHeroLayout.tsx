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
 * - Square photo with equal top/bottom margin (= --hero-pad)
 * - Forest underlaps photo; band height is locked to photo + pads
 * - Caption starts where the green ends (past the underlap, on the page ground)
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
        className="home-hero__forest pointer-events-none absolute left-0 z-0 hidden bg-hbb-forest lg:block"
      />

      <div className="home-hero__row relative z-10 flex flex-col lg:flex-row lg:items-stretch">
        <div className="home-hero__copy relative flex w-full flex-col bg-hbb-forest px-8 py-12 text-white md:px-12 lg:bg-transparent lg:py-[var(--hero-pad)] lg:pl-14 lg:pr-6">
          <div className="home-hero__copy-text max-w-[22rem] self-start md:max-w-[26rem]">
            <h1 className="font-serif text-[clamp(2rem,3.6vw,3.15rem)] font-normal leading-[1.18] tracking-[-0.01em] text-white">
              {copy.headingLine1}
              <br />
              {copy.headingLine2}
            </h1>
            <p className="mt-6 max-w-[22rem] font-serif text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.65] text-white/92">
              {copy.body}
            </p>
          </div>

          <div className="home-hero__map mt-8 flex w-full justify-center lg:justify-end">
            {map}
          </div>
        </div>

        <div className="home-hero__photo-col relative w-full px-8 pb-10 lg:ml-auto lg:w-auto lg:shrink-0 lg:px-0">
          <div className="home-hero__photo relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-hbb-warm lg:mx-0">
            <HeroPhotoSlider
              slides={slides}
              ariaLabel={copy.galleryAria}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          <p
            className="home-hero__caption relative mx-auto mt-2.5 w-full max-w-md font-ui text-[11px] font-semibold tracking-[0.14em] text-hbb-forest lg:mx-0 lg:mt-0"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Reserve full width so typewriter doesn’t shift layout */}
            <span className="invisible whitespace-pre-wrap" aria-hidden="true">
              {caption}
            </span>
            <span className="absolute inset-0 whitespace-pre-wrap">{typedCaption}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
