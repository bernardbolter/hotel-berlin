'use client'

import { BedDouble, Ruler, ShowerHead, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { LineCta } from '@/components/primitives/LineCta'
import { SlideDotsNav } from '@/components/primitives/SlideDotsNav'
import type { RoomHeroItem } from '@/lib/rooms/roomHero'

type Props = {
  rooms: RoomHeroItem[]
  autoplayInterval?: number
}

const BATHROOM_LABELS: Record<string, { en: string; de: string }> = {
  shower: { en: 'Shower', de: 'Dusche' },
  'rain-shower': { en: 'Rain shower', de: 'Regendusche' },
  'bath-shower': { en: 'Bath & shower', de: 'Bad & Dusche' },
  'spa-bathroom': { en: 'Spa bathroom', de: 'Spa-Bad' },
}

export function RoomSlider({ rooms, autoplayInterval = 5000 }: Props) {
  const t = useTranslations('rooms')
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeRoom = rooms[current]

  const advance = useCallback(
    () => setCurrent((prev) => (prev + 1) % rooms.length),
    [rooms.length],
  )

  const prev = useCallback(
    () => setCurrent((prev) => (prev - 1 + rooms.length) % rooms.length),
    [rooms.length],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || isPaused || rooms.length <= 1) return

    timerRef.current = setInterval(advance, autoplayInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [advance, autoplayInterval, isPaused, prefersReducedMotion, rooms.length])

  const goTo = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrent(index)
    if (!prefersReducedMotion && !isPaused && rooms.length > 1) {
      timerRef.current = setInterval(advance, autoplayInterval)
    }
  }

  const roomImages = useMemo(() => activeRoom?.images ?? [], [activeRoom])

  if (!activeRoom || rooms.length === 0) return null

  return (
    <div onPointerEnter={() => setIsPaused(true)} onPointerLeave={() => setIsPaused(false)}>
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
        <div className="relative min-h-70 md:min-h-115">
          <KenBurnsSlider
            key={activeRoom.id}
            images={roomImages}
            aria-label={t('galleryAria')}
            interval={4500}
            showDots={false}
            sizes="(max-width: 768px) 100vw, 55vw"
            className="h-full min-h-70 md:min-h-115"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: 'rgba(208, 146, 70, 0.05)' }}
          />
        </div>

        <div className="flex flex-col border-t border-hbb-coral/30 md:border-l md:border-t-0">
          <div className="px-7 pb-5 pt-7">
            <p className="mb-3 font-serif text-xl font-normal leading-snug text-hbb-black">
              {t('byline')}
            </p>
            <p className="font-serif text-sm leading-relaxed text-gray-500">{t('body')}</p>
          </div>

          <hr className="mx-7 border-hbb-coral/25" />

          <div className="relative flex-1 px-7 pb-5 pt-5" aria-live="polite" aria-atomic="true">
            {rooms.map((room, i) => {
              const locale = room.locale
              const bathroomDisplay = room.bathroomLabel
                ? (BATHROOM_LABELS[room.bathroomLabel]?.[locale] ?? room.bathroomLabel)
                : null

              return (
                <div
                  key={room.id}
                  aria-hidden={i !== current}
                  className={[
                    'transition-opacity',
                    prefersReducedMotion ? '' : 'duration-200',
                    i === current ? 'opacity-100' : 'absolute inset-0 px-7 pt-5 opacity-0',
                  ].join(' ')}
                >
                  <h3 className="mb-4 font-ui text-lg font-medium leading-tight text-hbb-coral">
                    {room.name}
                  </h3>

                  <div className="mb-4 flex">
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-ui text-[10px] uppercase tracking-widest text-gray-400">
                        {t('specSize')}
                      </span>
                      <span className="flex items-center gap-1.5 font-ui text-base font-medium text-hbb-black">
                        <Ruler size={14} aria-hidden="true" className="text-hbb-coral" />
                        {room.sizeLabel ?? '–'}
                      </span>
                    </div>
                    <div className="mx-4 w-px self-stretch bg-hbb-coral/20" />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-ui text-[10px] uppercase tracking-widest text-gray-400">
                        {t('specSleeps')}
                      </span>
                      <span className="flex items-center gap-1.5 font-ui text-base font-medium text-hbb-black">
                        <Users size={14} aria-hidden="true" className="text-hbb-coral" />
                        {room.sleepsLabel ?? '–'}
                      </span>
                    </div>
                  </div>

                  <ul role="list" className="flex flex-col gap-2.5">
                    <li className="flex items-center gap-2.5 font-ui text-sm text-gray-500">
                      <BedDouble size={14} aria-hidden="true" className="shrink-0 text-hbb-coral" />
                      {room.bedLabel ?? '–'}
                    </li>
                    {bathroomDisplay && (
                      <li className="flex items-center gap-2.5 font-ui text-sm text-gray-500">
                        <ShowerHead
                          size={14}
                          aria-hidden="true"
                          className="shrink-0 text-hbb-coral"
                        />
                        {bathroomDisplay}
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>

          <hr className="mx-7 border-hbb-coral/25" />

          <div className="flex items-baseline justify-between px-7 py-4">
            <span className="font-ui text-[11px] uppercase tracking-wider text-gray-400">
              {t('from')}
            </span>
            <span className="font-ui text-base font-medium text-hbb-black">
              <span className="sr-only">{t('priceScreenReader')} </span>
              {activeRoom.priceLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 px-7 pb-6 pt-5">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {t('nowShowing', { name: activeRoom.name, price: activeRoom.priceLabel })}
        </div>

        <SlideDotsNav
          count={rooms.length}
          current={current}
          labels={rooms.map((r) => r.name)}
          onSelect={goTo}
          onPrev={prev}
          onNext={advance}
          variant="coral"
          showChevrons
          ariaLabel={t('dotNavAria')}
          prevLabel={t('prevRoom')}
          nextLabel={t('nextRoom')}
        />

        <LineCta href="/rooms" className="font-ui text-xs uppercase tracking-widest">
          {t('cta')}
          <span className="sr-only"> {t('ctaSrSuffix')}</span>
        </LineCta>
      </div>
    </div>
  )
}
