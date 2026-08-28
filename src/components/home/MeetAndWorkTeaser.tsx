'use client'

import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SweepCta } from '@/components/primitives/SweepCta'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { MeetAndWorkCopy } from '@/lib/payload/homepage'

const SLIDE_INTERVAL = 7000
const CROSSFADE_MS = 900
const PANEL = '#1E4B5D'

/** Same scale as the rooms section heading */
const TITLE_CLASS =
  'font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12]'

function TwoLineKicker({ kicker }: { kicker: string }) {
  const amp = kicker.lastIndexOf(' & ')
  if (amp === -1) return kicker
  return (
    <>
      {kicker.slice(0, amp + 2)}
      <br />
      {kicker.slice(amp + 3)}
    </>
  )
}

type Props = {
  copy: MeetAndWorkCopy
}

function TypewriterCaption({
  caption,
  typed,
  reduceMotion,
  className = '',
  color = PANEL,
}: {
  caption: string
  typed: string
  reduceMotion: boolean
  className?: string
  color?: string
}) {
  if (!caption) return null
  return (
    <p
      className={`min-h-[1.5em] text-left font-ui text-[clamp(0.675rem,0.9vw,0.825rem)] font-bold leading-snug ${className}`}
      style={{ color }}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{caption}</span>
      <span aria-hidden="true">{typed}</span>
      <span
        aria-hidden="true"
        className={`ml-px inline-block w-px align-[-0.1em] ${
          reduceMotion || typed.length >= caption.length
            ? 'opacity-0'
            : 'h-[1.05em] animate-pulse'
        }`}
        style={{ backgroundColor: color }}
      />
    </p>
  )
}

/**
 * Homepage Meet & Work teaser — 30% text / 70% photo, panel underlaps 15%
 * and hangs 50px below; rotating photos + typewriter caption.
 */
export function MeetAndWorkTeaser({ copy }: Props) {
  const tc = useTranslations('common')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const preloaded = useRef(new Set<string>())

  const slides = copy.slides
  const active = slides[current]
  const typedCaption = useTypewriter(active?.caption ?? '', !reduceMotion)

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % slides.length) + slides.length) % slides.length
      setCurrent(next)
    },
    [slides.length],
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
    const currentSlide = slides[current]
    const nextSlide = slides[(current + 1) % slides.length]
    if (currentSlide) preloadSrc(currentSlide.src)
    if (nextSlide) preloadSrc(nextSlide.src)
  }, [current, preloadSrc, slides])

  useEffect(() => {
    if (reduceMotion || paused || slides.length <= 1) return
    const timer = window.setInterval(() => goTo(current + 1), SLIDE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [current, goTo, paused, reduceMotion, slides.length])

  if (!active || slides.length === 0) return null

  return (
    <div className="w-full">
      {/* Below lg (1024): stacked like rooms — title on one line, teal bar, 1/0.75 photo */}
      <div className="flex flex-col lg:hidden">
        <h2
          id="meetings-heading"
          className={`${TITLE_CLASS} mb-3 w-full pr-px text-right whitespace-nowrap`}
          style={{ color: PANEL }}
        >
          {copy.kicker}
        </h2>

        <figure className="relative min-w-0 w-full">
          <div className="flex w-[calc(100%+5px)] -ml-[5px] items-stretch gap-px">
            <span
              aria-hidden="true"
              className="w-[15px] shrink-0 self-stretch md:w-[35px]"
              style={{ backgroundColor: PANEL }}
            />
            <div className="relative aspect-[1/0.75] min-w-0 flex-1 overflow-hidden rounded-br-[clamp(2.25rem,8vw,5rem)] bg-hbb-warm min-[551px]:rounded-br-[clamp(4.5rem,16vw,10rem)]">
              {slides.map((slide, index) => {
                const isActive = index === current
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity ease-in-out ${
                      isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    style={{ transitionDuration: reduceMotion ? '0ms' : `${CROSSFADE_MS}ms` }}
                    aria-hidden={!isActive}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="h-full w-full object-cover object-left"
                    />
                  </div>
                )
              })}

              {slides.length > 1 ? (
                <button
                  type="button"
                  className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center bg-black/25 text-white/90 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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

              <div
                className="absolute bottom-[10px] left-[10px] z-10 w-fit px-3 py-2"
                style={{ backgroundColor: PANEL }}
              >
                <TypewriterCaption
                  caption={active.caption}
                  typed={typedCaption}
                  reduceMotion={reduceMotion}
                  color="#ffffff"
                />
              </div>
            </div>
          </div>
        </figure>

        <div className="mt-4">
          <p
            className="font-ui text-[clamp(1.15rem,1.55vw,1.45rem)] font-semibold leading-snug"
            style={{ color: PANEL }}
          >
            {copy.subhead}
          </p>
          <p
            className="mt-4 text-left font-serif text-[clamp(1.05rem,1.2vw,1.15rem)] leading-[1.65] text-[#3a3a3a] max-lg:max-w-[550px]"
            style={{ maxWidth: 550 }}
          >
            {copy.body}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3">
          <SweepCta href="/meetings" color="meet-work" className="w-fit" style={{ color: PANEL }}>
            {copy.ctaLabel}
          </SweepCta>
        </div>
      </div>

      {/* Desktop — 1024+ */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[30%_70%] items-stretch gap-0">
          <div className="relative z-0 flex min-h-0 flex-col">
            {/* Title near photo, with a little more right padding */}
            <div className="flex shrink-0 justify-end pb-4 pt-1 pr-5 lg:pr-6">
              <h2
                id="meetings-heading-desktop"
                className={`${TITLE_CLASS} text-left`}
                style={{ color: PANEL }}
              >
                <TwoLineKicker kicker={copy.kicker} />
              </h2>
            </div>

            <div
              className="relative z-0 flex min-h-0 w-[150%] flex-1 flex-col justify-start px-5 py-7 text-white lg:px-7 lg:py-8"
              style={{ backgroundColor: PANEL }}
            >
              <p className="max-w-[calc(100%/1.5)] font-ui text-[clamp(1.05rem,1.35vw,1.25rem)] font-semibold leading-snug">
                {copy.subhead}
              </p>
              <p className="mt-4 max-w-[calc(100%/1.5)] pr-4 font-serif text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.65] text-white/85">
                {copy.body}
              </p>
            </div>
          </div>

          <figure className="relative z-10 aspect-[1.65/1] overflow-hidden rounded-bl-[clamp(3rem,12vw,7rem)]">
            {slides.map((slide, index) => {
              const isActive = index === current
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity ease-in-out ${
                    isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                  style={{ transitionDuration: reduceMotion ? '0ms' : `${CROSSFADE_MS}ms` }}
                  aria-hidden={!isActive}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
                </div>
              )
            })}

            {slides.length > 1 ? (
              <button
                type="button"
                className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center bg-black/25 text-white/90 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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

            <div
              className="absolute right-[10px] bottom-[10px] z-10 w-fit px-3 py-2"
              style={{ backgroundColor: PANEL }}
            >
              <TypewriterCaption
                caption={active.caption}
                typed={typedCaption}
                reduceMotion={reduceMotion}
                color="#ffffff"
              />
            </div>
          </figure>
        </div>

        {/*
          Below photo:
          - 45% color hang (aligned with underlapping panel)
          - CTA sits where the photo title used to (beside the hang)
        */}
        <div className="relative">
          <div className="grid grid-cols-[45%_55%] items-start">
            <div aria-hidden="true" className="h-[50px]" style={{ backgroundColor: PANEL }} />
            <div className="min-w-0 pl-4 pt-2">
              <SweepCta href="/meetings" color="meet-work" style={{ color: PANEL }}>
                {copy.ctaLabel}
              </SweepCta>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
