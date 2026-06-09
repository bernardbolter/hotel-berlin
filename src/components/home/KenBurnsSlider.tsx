'use client'

import { useLocale } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { heroSlides, kbOriginClass, type HeroSlide } from './heroSlides'

const SLIDE_INTERVAL = 7000
const CROSSFADE_MS = 1500

type Props = {
  ariaLabel: string
  activeIndex: number
  onIndexChange: (index: number) => void
  className?: string
}

export function KenBurnsSlider({ ariaLabel, activeIndex, onIndexChange, className = '' }: Props) {
  const locale = useLocale()
  const [reduceMotion, setReduceMotion] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % heroSlides.length) + heroSlides.length) % heroSlides.length
      onIndexChange(next)
    },
    [onIndexChange],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reduceMotion || heroSlides.length <= 1) return

    const timer = window.setInterval(() => {
      goTo(activeIndex + 1)
    }, SLIDE_INTERVAL)

    return () => window.clearInterval(timer)
  }, [activeIndex, goTo, reduceMotion])

  const captionFor = (slide: HeroSlide) => (locale === 'de' ? slide.captionDE : slide.captionEN)

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      aria-live="off"
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      {heroSlides.map((slide, index) => {
        const isActive = index === activeIndex
        const kbClass = isActive && !reduceMotion ? kbOriginClass[slide.kbOrigin] : ''

        return (
          <figure
            key={slide.src}
            className={`absolute inset-0 transition-opacity ease-in-out ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{
              transitionDuration: reduceMotion ? '0ms' : `${CROSSFADE_MS}ms`,
            }}
            aria-hidden={!isActive}
          >
            <div className="hero-kb-pan absolute inset-0 overflow-hidden">
              <div
                className={`hero-kb-pan-inner absolute -top-[7.5%] -left-[7.5%] h-[115%] w-[115%] ${kbClass}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <figcaption className="sr-only">{captionFor(slide)}</figcaption>
          </figure>
        )
      })}

      <div
        className="absolute right-0 bottom-0 z-10 flex gap-1.5 pr-1 pb-1"
        role="group"
        aria-label="Slide navigation"
      >
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => goTo(index)}
            className={`h-2 w-2 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-nav-amber ${
              index === activeIndex
                ? 'border-hbb-nav-amber bg-hbb-nav-amber'
                : 'border-white/40 bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
