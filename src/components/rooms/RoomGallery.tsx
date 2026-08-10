'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export type RoomGalleryImage = {
  src: string
  alt: string
  caption?: string | null
  /** Intrinsic width — used so we never upscale past the real asset. */
  width?: number
  height?: number
}

type Props = {
  images: RoomGalleryImage[]
  ariaLabel: string
  prevLabel: string
  nextLabel: string
  /** Template with `{current}` and `{total}` placeholders, e.g. "{current} / {total}" */
  counterTemplate: string
  className?: string
}

/**
 * Infinite peek carousel: active image at native size (never upscaled),
 * neighbours visible as edge peeks. Loops both directions — on first view
 * the last image peeks to the left of the first.
 *
 * Desktop (md+): full-bleed across the viewport.
 * Below 768px: contained within page gutters (brief §3.3).
 */
function formatCounter(template: string, current: number, total: number): string {
  return template
    .replaceAll('{current}', String(current))
    .replaceAll('{total}', String(total))
}

const DEFAULT_W = 650
const DEFAULT_H = 488
const GAP_PX = 16
/** How many full copies of the set sit in the track for seamless looping. */
const LOOP_COPIES = 5
const MD_BREAKPOINT = 768

export function RoomGallery({
  images,
  ariaLabel,
  prevLabel,
  nextLabel,
  counterTemplate,
  className = '',
}: Props) {
  const total = images.length
  const maxNativeW = Math.max(...images.map((img) => img.width ?? DEFAULT_W), DEFAULT_W)

  // Middle copy so we start with last image peeking left of first
  const middleStart = total * Math.floor(LOOP_COPIES / 2)

  const viewportRef = useRef<HTMLDivElement>(null)
  const [trackIndex, setTrackIndex] = useState(middleStart)
  const [animate, setAnimate] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [viewportW, setViewportW] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  const looped = useMemo(() => {
    if (total === 0) return []
    return Array.from({ length: LOOP_COPIES }, () => images).flat()
  }, [images, total])

  const logicalIndex = total > 0 ? ((trackIndex % total) + total) % total : 0
  const active = images[logicalIndex]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const update = () => setViewportW(el.clientWidth)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // After a transition that lands near a track edge, snap to the middle copy (no animation)
  useLayoutEffect(() => {
    if (total <= 1) return
    const minSafe = total
    const maxSafe = total * (LOOP_COPIES - 1) - 1
    if (trackIndex < minSafe || trackIndex > maxSafe) {
      const normalized = middleStart + logicalIndex
      setAnimate(false)
      setTrackIndex(normalized)
    }
  }, [trackIndex, total, middleStart, logicalIndex])

  useEffect(() => {
    if (!animate) {
      // Re-enable transitions on next frame after the snap
      const id = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  const goToTrack = useCallback(
    (next: number) => {
      if (total <= 1) return
      setAnimate(true)
      setTrackIndex(next)
    },
    [total],
  )

  const prev = useCallback(() => goToTrack(trackIndex - 1), [goToTrack, trackIndex])
  const next = useCallback(() => goToTrack(trackIndex + 1), [goToTrack, trackIndex])

  const goToLogical = useCallback(
    (logical: number) => {
      if (total <= 1) return
      // Prefer stepping via nearest neighbour on the track so direction feels right
      const delta = ((logical - logicalIndex + total) % total)
      const back = ((logicalIndex - logical + total) % total)
      if (delta <= back) goToTrack(trackIndex + delta)
      else goToTrack(trackIndex - back)
    },
    [goToTrack, logicalIndex, total, trackIndex],
  )

  useEffect(() => {
    if (total <= 1) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, total])

  if (!active || total === 0) return null

  // Desktop: ~72% of viewport for peek. Mobile contained: wider slides, still peek neighbours.
  const slideWidth =
    viewportW > 0
      ? Math.max(
          240,
          Math.min(Math.round(viewportW * (isDesktop ? 0.72 : 0.88)), maxNativeW),
        )
      : Math.min(DEFAULT_W, maxNativeW)

  const activeH = active.height ?? DEFAULT_H
  const activeW = active.width ?? DEFAULT_W
  const slideHeight = Math.round((slideWidth * activeH) / activeW)

  const trackOffset =
    viewportW > 0
      ? viewportW / 2 - trackIndex * (slideWidth + GAP_PX) - slideWidth / 2
      : 0

  const shouldAnimate = animate && !prefersReducedMotion && viewportW > 0

  return (
    <figure
      className={[
        'relative w-full',
        // Contained gutters below md; full-bleed on desktop
        'mx-auto max-w-5xl px-section-sm md:max-w-none md:px-0',
        className,
      ].join(' ')}
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden bg-hbb-page"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        style={{ minHeight: slideHeight }}
      >
        <div
          className={[
            'flex items-center will-change-transform',
            shouldAnimate ? 'transition-transform duration-300 ease-out' : '',
          ].join(' ')}
          style={{
            gap: GAP_PX,
            transform: `translateX(${trackOffset}px)`,
          }}
        >
          {looped.map((image, index) => {
            const w = image.width ?? DEFAULT_W
            const h = image.height ?? DEFAULT_H
            const isActive = index === trackIndex
            return (
              <button
                key={`${image.src}-loop-${index}`}
                type="button"
                onClick={() => {
                  if (!isActive) goToTrack(index)
                }}
                className={[
                  'relative shrink-0 overflow-hidden rounded-sm bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight',
                  isActive ? 'cursor-default' : 'cursor-pointer opacity-70 hover:opacity-90',
                ].join(' ')}
                style={{ width: slideWidth, height: slideHeight }}
                aria-label={image.alt}
                aria-current={isActive ? 'true' : undefined}
                tabIndex={isActive ? -1 : 0}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={w}
                  height={h}
                  sizes={`${slideWidth}px`}
                  className="h-full w-full object-contain"
                  priority={index >= middleStart && index < middleStart + total}
                  draggable={false}
                />
              </button>
            )
          })}
        </div>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-hbb-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight md:left-4"
              aria-label={prevLabel}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-hbb-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight md:right-4"
              aria-label={nextLabel}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <div
              className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 bg-white/90 px-3 py-1.5 font-ui text-ui-xs font-medium text-hbb-black"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatCounter(counterTemplate, logicalIndex + 1, total)}
            </div>

            <div className="absolute bottom-3 right-3 z-10 flex gap-1.5 md:right-5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToLogical(index)}
                  className={[
                    'h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight',
                    index === logicalIndex
                      ? 'w-6 bg-hbb-rooms-highlight'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400',
                  ].join(' ')}
                  aria-label={`${index + 1} / ${total}`}
                  aria-current={index === logicalIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {active.caption ? (
        <figcaption className="mt-3 font-ui text-ui-sm text-gray-500 md:mx-auto md:max-w-5xl md:px-section-x">
          {active.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
