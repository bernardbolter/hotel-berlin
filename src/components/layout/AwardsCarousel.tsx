'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { FooterAwardData } from '@/lib/payload/footerTypes'

type Props = {
  heading: string
  awards: FooterAwardData[]
  previousLabel: string
  nextLabel: string
}

/** Square / narrow badges sit taller; wide landscape badges sit shorter. */
const BADGE_HEIGHT_MAX = 72
const BADGE_HEIGHT_MIN = 34
/** Aspect ratio at/above which we use min height (very wide wordmarks). */
const ASPECT_WIDE = 4
const GAP_PX = 40
const ROW_HEIGHT = BADGE_HEIGHT_MAX

type BadgeSize = {
  width: number
  height: number
  aspect: number
}

function heightForAspect(aspect: number): number {
  const a = Math.min(Math.max(aspect, 1), ASPECT_WIDE)
  const t = (a - 1) / (ASPECT_WIDE - 1)
  return Math.round(BADGE_HEIGHT_MAX - t * (BADGE_HEIGHT_MAX - BADGE_HEIGHT_MIN))
}

function sizeFromNatural(naturalWidth: number, naturalHeight: number): BadgeSize {
  const aspect = naturalWidth / Math.max(naturalHeight, 1)
  const height = heightForAspect(aspect)
  const width = Math.round(height * aspect)
  return { width, height, aspect }
}

function AwardBadge({
  award,
  onMeasured,
}: {
  award: FooterAwardData
  onMeasured: (id: string, size: BadgeSize) => void
}) {
  const [size, setSize] = useState<BadgeSize | null>(null)

  const applySize = (naturalWidth: number, naturalHeight: number) => {
    const next = sizeFromNatural(naturalWidth, naturalHeight)
    setSize(next)
    onMeasured(award.id, next)
  }

  const badge = award.imageUrl ? (
    <Image
      src={award.imageUrl}
      alt={award.altText}
      width={size?.width ?? 160}
      height={size?.height ?? BADGE_HEIGHT_MAX}
      className="object-contain"
      style={{
        width: size ? size.width : 'auto',
        height: size ? size.height : 'auto',
        maxHeight: BADGE_HEIGHT_MAX,
      }}
      onLoad={(event) => {
        const img = event.currentTarget
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          applySize(img.naturalWidth, img.naturalHeight)
        }
      }}
    />
  ) : (
    <span className="font-ui text-ui-sm text-hbb-footer-muted whitespace-nowrap">{award.altText}</span>
  )

  if (award.linkUrl) {
    return (
      <a
        href={award.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber"
      >
        {badge}
      </a>
    )
  }

  return badge
}

/**
 * One-row awards strip.
 * Badge height scales inversely with aspect ratio (wide logos shorter, square logos taller).
 * When the row overflows, prev/next arrows scroll through — sizes stay fixed.
 */
export function AwardsCarousel({ heading, awards, previousLabel, nextLabel }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const sizesRef = useRef<Record<string, BadgeSize>>({})

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const updateScrollState = () => {
    const el = viewportRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const doesOverflow = maxScroll > 2
    setOverflows(doesOverflow)
    setCanPrev(el.scrollLeft > 2)
    setCanNext(el.scrollLeft < maxScroll - 2)
  }

  useEffect(() => {
    const el = viewportRef.current
    if (!el || awards.length === 0) return

    updateScrollState()
    const observer = new ResizeObserver(() => updateScrollState())
    observer.observe(el)
    el.addEventListener('scroll', updateScrollState, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', updateScrollState)
    }
  }, [awards.length])

  // Re-check overflow after badge images report natural sizes
  const handleMeasured = (id: string, size: BadgeSize) => {
    sizesRef.current[id] = size
    requestAnimationFrame(updateScrollState)
  }

  useEffect(() => {
    if (!overflows || paused || reduceMotion) return
    const el = viewportRef.current
    if (!el) return

    const timer = window.setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) return
      const step = Math.max(el.clientWidth * 0.65, 160)
      const next = el.scrollLeft + step
      if (next >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 4500)

    return () => window.clearInterval(timer)
  }, [overflows, paused, reduceMotion])

  if (awards.length === 0) return null

  const scrollByPage = (direction: -1 | 1) => {
    const el = viewportRef.current
    if (!el) return
    const step = Math.max(el.clientWidth * 0.75, 160)
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div
      className="border-t border-white/8 bg-hbb-footer-bg-dark [overflow-anchor:none]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      <div className="site-shell px-section-sm py-6 md:px-section-x md:py-8">
        <div className="relative mb-4 flex min-h-11 items-center md:mb-5">
          <p className="font-ui text-label font-medium uppercase tracking-ui-label text-hbb-footer-muted">
            {heading}
          </p>

          {overflows ? (
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                aria-label={previousLabel}
                disabled={!canPrev}
                className="inline-flex h-11 w-11 items-center justify-center text-hbb-footer-muted hover:text-hbb-footer-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                aria-label={nextLabel}
                disabled={!canNext}
                className="inline-flex h-11 w-11 items-center justify-center text-hbb-footer-muted hover:text-hbb-footer-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={viewportRef}
          className="min-w-0 w-full overflow-x-auto overscroll-x-contain scrollbar-none"
          style={{ height: ROW_HEIGHT }}
        >
          <ul
            role="list"
            className={
              overflows
                ? 'flex h-full w-max flex-nowrap items-center'
                : 'flex h-full w-full flex-nowrap items-center justify-between'
            }
            style={{ gap: GAP_PX }}
          >
            {awards.map((award) => (
              <li key={award.id} className="flex h-full shrink-0 items-center">
                <AwardBadge award={award} onMeasured={handleMeasured} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
