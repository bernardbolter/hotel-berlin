'use client'

import { Pause, Play } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { type HeroSlide } from './heroSlides'

const SLIDE_INTERVAL = 8000
const CROSSFADE_MS = 1200

type Props = {
  slides: HeroSlide[]
  ariaLabel: string
  activeIndex: number
  onIndexChange: (index: number) => void
  className?: string
}

export function HeroPhotoSlider({
  slides,
  ariaLabel,
  activeIndex,
  onIndexChange,
  className = '',
}: Props) {
  const locale = useLocale()
  const tc = useTranslations('common')
  const [reduceMotion, setReduceMotion] = useState(false)
  const [paused, setPaused] = useState(false)
  const preloaded = useRef(new Set<string>())

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % slides.length) + slides.length) % slides.length
      onIndexChange(next)
    },
    [onIndexChange, slides.length],
  )

  const preloadSrc = useCallback((src: string) => {
    if (preloaded.current.has(src) || typeof window === 'undefined') return
    preloaded.current.add(src)
    const img = new window.Image()
    img.src = src
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const current = slides[activeIndex]
    const next = slides[(activeIndex + 1) % slides.length]
    if (current) preloadSrc(current.src)
    if (next) preloadSrc(next.src)
  }, [activeIndex, preloadSrc, slides])

  useEffect(() => {
    if (reduceMotion || paused || slides.length <= 1) return

    const timer = window.setInterval(() => {
      goTo(activeIndex + 1)
    }, SLIDE_INTERVAL)

    return () => window.clearInterval(timer)
  }, [activeIndex, goTo, paused, reduceMotion, slides.length])

  const captionFor = (slide: HeroSlide) => (locale === 'de' ? slide.captionDE : slide.captionEN)

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex

        return (
          <figure
            key={`${slide.src}-${index}`}
            className={`absolute inset-0 transition-opacity ease-in-out ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{
              transitionDuration: reduceMotion ? '0ms' : `${CROSSFADE_MS}ms`,
            }}
            aria-hidden={!isActive}
          >
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="hero-photo-img absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption className="sr-only">{captionFor(slide)}</figcaption>
          </figure>
        )
      })}

      {slides.length > 1 ? (
        <button
          type="button"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center bg-black/25 text-white/90 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={paused || reduceMotion ? tc('playSlideshow') : tc('pauseSlideshow')}
          aria-pressed={paused || reduceMotion}
          onClick={() => setPaused((value) => !value)}
          disabled={reduceMotion}
        >
          {paused || reduceMotion ? (
            <Play aria-hidden="true" size={12} fill="currentColor" />
          ) : (
            <Pause aria-hidden="true" size={12} fill="currentColor" />
          )}
        </button>
      ) : null}
    </div>
  )
}
