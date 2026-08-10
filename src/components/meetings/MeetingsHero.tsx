'use client'

import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SweepCta } from '@/components/primitives/SweepCta'

const SLIDE_INTERVAL = 7000
const CROSSFADE_MS = 1000

export type MeetingsHeroSlide = {
  src: string
  alt: string
}

type Props = {
  kicker?: string | null
  headline: string
  intro: string
  contactLabel?: string | null
  contactPhone: string
  contactEmail: string
  ctaLabel: string
  images: MeetingsHeroSlide[]
  galleryAriaLabel: string
}

export function MeetingsHero({
  kicker,
  headline,
  intro,
  contactLabel,
  contactPhone,
  contactEmail,
  ctaLabel,
  images,
  galleryAriaLabel,
}: Props) {
  const tc = useTranslations('common')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const preloaded = useRef(new Set<string>())

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return
      setCurrent(((index % images.length) + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (images.length === 0) return
    for (const slide of [images[current], images[(current + 1) % images.length]]) {
      if (!slide || preloaded.current.has(slide.src)) continue
      preloaded.current.add(slide.src)
      const img = new window.Image()
      img.src = slide.src
    }
  }, [current, images])

  useEffect(() => {
    if (reduceMotion || paused || images.length <= 1) return
    const timer = window.setInterval(() => goTo(current + 1), SLIDE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [current, goTo, images.length, paused, reduceMotion])

  return (
    <section className="relative min-h-[70vh] bg-hbb-page">
      {/*
        Desktop: photo aligns to max-w-6xl (72rem) left edge, bleeds to the
        right viewport edge, bottom-left radius 40px. Mobile: full-bleed.
      */}
      <div
        role="region"
        aria-label={galleryAriaLabel}
        className="absolute inset-0 overflow-hidden rounded-bl-[40px] md:left-[max(0px,calc((100%-72rem)/2))]"
      >
        {images.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={`${slide.src}-${index}`}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              style={{
                transitionDuration: reduceMotion ? '0ms' : `${CROSSFADE_MS}ms`,
              }}
              aria-hidden={!isActive}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={isActive ? slide.alt : ''}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
      </div>

      {images.length > 1 ? (
        <button
          type="button"
          className="absolute top-24 right-4 z-10 flex h-8 w-8 items-center justify-center bg-black/25 text-white/90 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-28 md:right-8"
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

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-end px-section-sm pb-12 pt-32 md:px-section-x">
        <div className="max-w-2xl bg-hbb-teal p-6 text-white md:p-8">
          {kicker ? (
            <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/80">
              {kicker}
            </p>
          ) : null}
          <h1
            className={`font-ui text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight ${kicker ? 'mt-2' : ''}`}
          >
            {headline}
          </h1>
          <p className="mt-4 font-serif text-serif-md text-white/90">{intro}</p>
          <div className="mt-5 font-ui text-ui-sm">
            {contactLabel ? (
              <p className="mb-1 text-white/75">{contactLabel}</p>
            ) : null}
            <p>
              <a
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="underline-offset-2 hover:underline"
              >
                {contactPhone}
              </a>
              {' · '}
              <a href={`mailto:${contactEmail}`} className="underline-offset-2 hover:underline">
                {contactEmail}
              </a>
            </p>
          </div>
          <SweepCta href="#anfrage" unlocalized color="meet-work" invert className="mt-6">
            {ctaLabel}
          </SweepCta>
        </div>
      </div>
    </section>
  )
}
