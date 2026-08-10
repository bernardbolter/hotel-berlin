'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'

const SLIDE_MS = 350

export type RoomIndexCardImage = {
  src: string
  alt: string
}

export type RoomIndexCardProps = {
  slug: string
  name: string
  fromPriceLabel: string
  fromLabel: string
  shortDescription: string
  images: RoomIndexCardImage[]
  bookingUrl?: string | null
  /** When false, media sits on the right (alternating rows). */
  mediaOnLeft?: boolean
  readMoreLabel: string
  bookLabel: string
  galleryAria: string
  prevImageLabel: string
  nextImageLabel: string
  className?: string
}

/**
 * Live-site-style index row: image gallery + copy/CTAs, alternating sides.
 * Uses rooms detail SweepCta styling (terracotta / ink).
 */
export function RoomIndexCard({
  slug,
  name,
  fromPriceLabel,
  fromLabel,
  shortDescription,
  images,
  bookingUrl,
  mediaOnLeft = true,
  readMoreLabel,
  bookLabel,
  galleryAria,
  prevImageLabel,
  nextImageLabel,
  className = '',
}: RoomIndexCardProps) {
  const detailHref = { pathname: '/rooms/[slug]' as const, params: { slug } }
  const slides = images.length > 0 ? images : []
  const [index, setIndex] = useState(0)
  const [fromIndex, setFromIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [phase, setPhase] = useState<'idle' | 'start' | 'end'>('idle')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    setIndex(0)
    setFromIndex(null)
    setPhase('idle')
  }, [slug])

  const total = slides.length
  const active = slides[index] ?? slides[0]

  const navigate = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (total <= 1 || nextIndex === index || phase !== 'idle') return

      if (prefersReducedMotion) {
        setIndex(nextIndex)
        return
      }

      setDirection(dir)
      setFromIndex(index)
      setIndex(nextIndex)
      setPhase('start')
    },
    [index, phase, prefersReducedMotion, total],
  )

  useLayoutEffect(() => {
    if (phase !== 'start') return
    const frame = requestAnimationFrame(() => setPhase('end'))
    return () => cancelAnimationFrame(frame)
  }, [phase, index])

  useEffect(() => {
    if (phase !== 'end') return
    const timer = window.setTimeout(() => {
      setPhase('idle')
      setFromIndex(null)
    }, SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [phase, index])

  const prev = useCallback(() => {
    navigate((index - 1 + total) % total, -1)
  }, [index, navigate, total])

  const next = useCallback(() => {
    navigate((index + 1) % total, 1)
  }, [index, navigate, total])

  const getSlideTransform = useCallback(
    (slideIndex: number): string => {
      const isActive = slideIndex === index
      const isFrom = fromIndex !== null && slideIndex === fromIndex

      if (prefersReducedMotion) {
        return 'translateX(0)'
      }

      if (phase === 'idle') {
        return isActive ? 'translateX(0)' : 'translateX(100%)'
      }

      if (direction === 1) {
        if (phase === 'start') {
          if (isFrom) return 'translateX(0)'
          if (isActive) return 'translateX(100%)'
        } else {
          if (isFrom) return 'translateX(-100%)'
          if (isActive) return 'translateX(0)'
        }
      } else {
        if (phase === 'start') {
          if (isFrom) return 'translateX(0)'
          if (isActive) return 'translateX(-100%)'
        } else {
          if (isFrom) return 'translateX(100%)'
          if (isActive) return 'translateX(0)'
        }
      }

      return 'translateX(100%)'
    },
    [direction, fromIndex, index, phase, prefersReducedMotion],
  )

  if (!active) return null

  const mediaOrder = mediaOnLeft ? 'md:order-1' : 'md:order-2'
  const copyOrder = mediaOnLeft ? 'md:order-2' : 'md:order-1'

  return (
    <article
      id={`room-${slug}`}
      className={`scroll-mt-28 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14 ${className}`}
    >
      <div
        className={[
          'order-1 flex flex-col',
          mediaOrder,
          mediaOnLeft ? 'items-start' : 'items-end',
        ].join(' ')}
      >
        <div
          className="relative aspect-4/3 w-full overflow-hidden rounded-sm bg-gray-100"
          role="region"
          aria-roledescription="carousel"
          aria-label={galleryAria}
        >
          {slides.map((image, i) => {
            const isActive = i === index
            const isFrom = fromIndex === i
            const isVisible =
              prefersReducedMotion ? isActive : isActive || isFrom || phase === 'idle'

            return (
              <div
                key={`${image.src}-${i}`}
                className={[
                  'absolute inset-0',
                  isVisible ? '' : 'pointer-events-none',
                  !prefersReducedMotion && phase !== 'idle'
                    ? 'transition-transform ease-out'
                    : prefersReducedMotion
                      ? 'transition-opacity duration-300'
                      : '',
                ].join(' ')}
                style={{
                  transform: getSlideTransform(i),
                  transitionDuration:
                    !prefersReducedMotion && phase !== 'idle' ? `${SLIDE_MS}ms` : undefined,
                  opacity: prefersReducedMotion ? (isActive ? 1 : 0) : undefined,
                  zIndex: isActive ? 2 : isFrom ? 1 : 0,
                }}
                aria-hidden={!isActive}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            )
          })}

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-hbb-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight md:left-3"
                aria-label={prevImageLabel}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-hbb-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight md:right-3"
                aria-label={nextImageLabel}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>

              <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(i, i > index ? 1 : -1)}
                    className={[
                      'h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight',
                      i === index
                        ? 'w-6 bg-hbb-rooms-highlight'
                        : 'w-1.5 bg-gray-300 hover:bg-gray-400',
                    ].join(' ')}
                    aria-label={`${i + 1} / ${total}`}
                    aria-current={i === index ? 'true' : undefined}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {bookingUrl ? (
          <SweepCta
            href={bookingUrl}
            external
            color="ink"
            edge={mediaOnLeft ? 'left' : 'right'}
            className={mediaOnLeft ? 'mt-5 self-start' : 'mt-5 self-end'}
          >
            {bookLabel}
          </SweepCta>
        ) : null}
      </div>

      <div className={`order-2 flex flex-col items-start ${copyOrder}`}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-ui text-[clamp(1.5rem,2.8vw,2.15rem)] font-medium leading-[1.15] text-hbb-rooms-highlight">
            {name}
          </h2>
          <p className="font-ui text-ui-lg font-medium text-hbb-rooms-highlight">
            <span className="text-ui-sm font-normal uppercase tracking-wider text-gray-400">
              {fromLabel}{' '}
            </span>
            {fromPriceLabel}
          </p>
        </div>

        {shortDescription ? (
          <p className="mt-4 max-w-xl font-serif text-serif-md text-gray-700">{shortDescription}</p>
        ) : null}

        <Link href={detailHref} className="sweep-cta sweep-cta--terracotta mt-8">
          <span className="sweep-cta__label">{readMoreLabel}</span>
        </Link>
      </div>
    </article>
  )
}
