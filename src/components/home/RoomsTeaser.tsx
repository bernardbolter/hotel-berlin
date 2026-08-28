'use client'

import { Pause, Play, Ruler, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AmenityIcon } from '@/components/home/AmenityIcon'
import { SweepCta } from '@/components/primitives/SweepCta'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { RoomHeroItem } from '@/lib/rooms/roomHero'

const SLIDE_INTERVAL = 7000
const CROSSFADE_MS = 900

export type RoomsTeaserCopyProps = {
  heading: string
  body: string
  ctaLabel: string
}

type Props = {
  rooms: RoomHeroItem[]
  copy: RoomsTeaserCopyProps
}

export function RoomsTeaser({ rooms, copy }: Props) {
  const t = useTranslations('rooms')
  const tc = useTranslations('common')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [priceVisible, setPriceVisible] = useState(true)
  const preloaded = useRef(new Set<string>())

  const active = rooms[current]
  const typedName = useTypewriter(active?.name ?? '', !reduceMotion)

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % rooms.length) + rooms.length) % rooms.length
      setCurrent(next)
    },
    [rooms.length],
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
    if (rooms.length === 0) return
    const currentRoom = rooms[current]
    const nextRoom = rooms[(current + 1) % rooms.length]
    if (currentRoom) preloadSrc(currentRoom.teaserImage.src)
    if (nextRoom) preloadSrc(nextRoom.teaserImage.src)
  }, [current, preloadSrc, rooms])

  useEffect(() => {
    if (reduceMotion || paused || rooms.length <= 1) return
    const timer = window.setInterval(() => goTo(current + 1), SLIDE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [current, goTo, paused, reduceMotion, rooms.length])

  useEffect(() => {
    if (reduceMotion) {
      setPriceVisible(true)
      return
    }
    setPriceVisible(false)
    const timer = window.setTimeout(() => setPriceVisible(true), 180)
    return () => window.clearTimeout(timer)
  }, [current, reduceMotion])

  if (!active || rooms.length === 0) return null

  return (
    <div className="grid w-full grid-cols-1 items-start gap-10 max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:gap-x-3 max-lg:gap-y-0.5 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0">
      {/* 1) Photo — 2/3 + accent bar */}
      <figure className="relative min-w-0 w-full max-lg:col-span-2 max-lg:row-start-2 lg:col-start-1 lg:row-start-1">
        <div className="flex w-full items-stretch gap-[2px] max-lg:w-[calc(100%+1.25rem-5px)] max-lg:-mr-[15px] max-lg:gap-px md:max-lg:w-[calc(100%+2.5rem-5px)] md:max-lg:-mr-[35px]">
          <div
            className="rooms-photo-mask relative min-w-0 flex-1 overflow-hidden bg-hbb-warm max-[550px]:aspect-[1/0.75] min-[551px]:aspect-[3/2]"
          >
            {rooms.map((room, index) => {
              const isActive = index === current
              return (
                <div
                  key={room.id}
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
                    src={room.teaserImage.src}
                    alt={room.teaserImage.alt}
                    className="hero-photo-img absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )
            })}

            {rooms.length > 1 ? (
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center bg-black/25 text-white/90 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          <span
            aria-hidden="true"
            className="w-[2px] shrink-0 self-stretch bg-hbb-rooms-highlight max-lg:w-[15px] md:max-lg:w-[35px]"
          />
        </div>

        <figcaption className="sr-only">{t('galleryAria')}</figcaption>
      </figure>

      {/* Specs — under photo on desktop; same row as room name below lg */}
      <ul
        role="list"
        className={`mt-[2px] ml-auto flex w-fit border border-hbb-rooms-highlight/30 transition-opacity duration-300 max-lg:col-start-2 max-lg:row-start-3 max-lg:mt-0 max-lg:mr-[calc(5px-1.25rem)] max-[500px]:flex-col md:max-lg:mr-[calc(5px-2.5rem)] lg:col-start-1 lg:row-start-2 ${
          priceVisible ? 'opacity-100' : 'opacity-0'
        } motion-reduce:opacity-100`}
      >
          <li className="flex flex-row items-center justify-center gap-2 border-r border-hbb-rooms-highlight/30 px-3 py-2 max-[500px]:border-r-0 max-[500px]:border-b">
            <Ruler aria-hidden="true" size={14} className="shrink-0 text-hbb-rooms-highlight" />
            <span className="font-ui text-[0.78rem] leading-snug text-[#5a5a5a]">
              <span className="sr-only">{t('specSize')}: </span>
              {active.sizeLabel}
            </span>
          </li>
          <li className="flex flex-row items-center justify-center gap-2 px-3 py-2">
            <Users aria-hidden="true" size={14} className="shrink-0 text-hbb-rooms-highlight" />
            <span className="font-ui text-[0.78rem] leading-snug text-[#5a5a5a]">
              <span className="sr-only">{t('specSleeps')}: </span>
              {active.sleepsLabel === '–'
                ? '–'
                : t('sleepsCount', { count: active.sleepsLabel })}
            </span>
          </li>
        </ul>

      {/* 2) Copy + CTA — 1/3. Below lg: children join the parent grid so
          room name sits beside the spec boxes, tight under the photo. */}
      <div className="flex w-full min-w-0 flex-col items-start max-lg:contents lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <h2
          id="rooms-heading"
          className="text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-hbb-rooms-highlight max-lg:col-span-2 max-lg:row-start-1 max-lg:mb-3 max-lg:w-full max-lg:pr-px max-lg:text-right"
        >
          {copy.heading}
        </h2>

        <p className="mt-6 text-left font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a] max-lg:col-span-2 max-lg:mt-4 max-lg:max-w-[550px]">
          {copy.body}
        </p>

        <div className="mt-9 min-h-16 text-left max-lg:col-start-1 max-lg:row-start-3 max-lg:mt-0 max-lg:min-h-0 max-lg:pr-2 max-[500px]:contents">
          <div
            className="max-[500px]:col-start-1 max-[500px]:row-start-3 max-[500px]:pr-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="font-serif text-[clamp(1.45rem,1.8vw,1.7rem)] font-medium leading-snug text-hbb-black">
              <span className="sr-only">{active.name}</span>
              <span aria-hidden="true">{typedName}</span>
              <span
                aria-hidden="true"
                className={`ml-px inline-block w-px bg-hbb-black align-[-0.1em] ${
                  reduceMotion || typedName.length >= (active.name?.length ?? 0)
                    ? 'opacity-0'
                    : 'h-[1.05em] animate-pulse'
                }`}
              />
            </p>

            <p
              className={`mt-2 font-serif text-[clamp(1.1rem,1.3vw,1.2rem)] text-[#4a4a4a] transition-all duration-300 ease-out ${
                priceVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              } motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100`}
            >
              <span className="sr-only">{t('priceScreenReader')} </span>
              {active.fromPriceLabel}
            </p>
          </div>

          {active.amenities.length > 0 ? (
            <ul
              role="list"
              className={`mt-4 flex flex-wrap gap-x-5 gap-y-2.5 transition-opacity duration-300 max-[500px]:col-span-2 max-[500px]:row-start-4 max-[500px]:mt-3 max-[500px]:w-full max-[500px]:justify-between ${
                priceVisible ? 'opacity-100' : 'opacity-0'
              } motion-reduce:opacity-100`}
            >
              {active.amenities.map((amenity) => (
                <li
                  key={amenity.id}
                  className="flex items-center gap-1.5 font-ui text-[0.9rem] text-[#5a5a5a]"
                >
                  <AmenityIcon
                    iconName={amenity.iconName}
                    size={14}
                    className="shrink-0 text-hbb-rooms-highlight"
                  />
                  {amenity.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <SweepCta href="/rooms" className="mt-10 max-lg:col-span-2 max-lg:mt-8 max-lg:w-fit max-lg:justify-self-start">
          {copy.ctaLabel}
          <span className="sr-only"> {t('ctaSrSuffix')}</span>
        </SweepCta>
      </div>
    </div>
  )
}
