'use client'

import { BedDouble, Pause, Play, Ruler, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AmenityIcon } from '@/components/home/AmenityIcon'
import { Link } from '@/i18n/routing'
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
    <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[3fr_2fr] lg:gap-10">
      {/* 1) Photo — 60% + accent bar */}
      <figure className="relative min-w-0 w-full">
        <div className="flex w-full items-stretch gap-[2px]">
          <div className="rooms-photo-mask relative aspect-[3/2] min-w-0 flex-1 overflow-hidden rounded-l-full bg-hbb-warm">
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
            className="w-[2px] shrink-0 self-stretch bg-[#C16157]"
          />
        </div>
        <figcaption className="sr-only">{t('galleryAria')}</figcaption>
      </figure>

      {/* 2) Copy + CTA — 40% */}
      <div className="flex w-full min-w-0 flex-col items-start">
        <h2
          id="rooms-heading"
          className="text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#C16157]"
        >
          {copy.heading}
        </h2>

        <p className="mt-6 text-left font-serif text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.7] text-[#3a3a3a]">
          {copy.body}
        </p>

        <div className="mt-9 min-h-16 text-left" aria-live="polite" aria-atomic="true">
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

          {/* Size / bed / guests — same idea as the old rooms section */}
          <ul
            role="list"
            className={`mt-5 grid grid-cols-3 border border-[#C16157]/30 transition-opacity duration-300 ${
              priceVisible ? 'opacity-100' : 'opacity-0'
            } motion-reduce:opacity-100`}
          >
            <li className="flex flex-col items-center gap-1.5 border-r border-[#C16157]/30 px-2 py-3">
              <Ruler aria-hidden="true" size={15} className="text-[#C16157]" />
              <span className="text-center font-ui text-[0.8rem] leading-snug text-[#5a5a5a]">
                <span className="sr-only">{t('specSize')}: </span>
                {active.sizeLabel}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1.5 border-r border-[#C16157]/30 px-2 py-3">
              <BedDouble aria-hidden="true" size={15} className="text-[#C16157]" />
              <span className="text-center font-ui text-[0.8rem] leading-snug text-[#5a5a5a]">
                <span className="sr-only">{t('specBed')}: </span>
                {active.bedLabel}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1.5 px-2 py-3">
              <Users aria-hidden="true" size={15} className="text-[#C16157]" />
              <span className="text-center font-ui text-[0.8rem] leading-snug text-[#5a5a5a]">
                <span className="sr-only">{t('specSleeps')}: </span>
                {active.sleepsLabel === '–'
                  ? '–'
                  : t('sleepsCount', { count: active.sleepsLabel })}
              </span>
            </li>
          </ul>

          {active.amenities.length > 0 ? (
            <ul
              role="list"
              className={`mt-4 flex flex-wrap gap-x-5 gap-y-2.5 transition-opacity duration-300 ${
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
                    className="shrink-0 text-[#C16157]"
                  />
                  {amenity.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Link
          href="/rooms"
          className="rooms-discover-cta mt-10 font-ui text-[clamp(1.15rem,1.5vw,1.35rem)] font-semibold"
        >
          <span className="rooms-discover-cta__label">
            {copy.ctaLabel}
            <span className="sr-only"> {t('ctaSrSuffix')}</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
