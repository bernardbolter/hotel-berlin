'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type RoomsNavRailRoom = {
  slug: string
  name: string
}

type Props = {
  rooms: RoomsNavRailRoom[]
  ariaLabel: string
  className?: string
  /** Content column used to detect when the side rail would overlap body copy. */
  contentSelector?: string
  inlineMountId?: string
}

/** Side rail width (max-w-44) + inset from the viewport edge. */
const RAIL_SPACE_PX = 192
const RAIL_GUTTER_PX = 16

/**
 * Room nav: vertical sticky rail when there is enough right margin; otherwise a
 * wrapping inline strip under the breadcrumbs with text links.
 */
export function RoomsNavRail({
  rooms,
  ariaLabel,
  className = '',
  contentSelector = '[data-rooms-page-content]',
  inlineMountId = 'rooms-nav-inline',
}: Props) {
  const [activeSlug, setActiveSlug] = useState(rooms[0]?.slug ?? '')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [useRail, setUseRail] = useState(false)
  const [inlineMount, setInlineMount] = useState<HTMLElement | null>(null)
  const ratiosRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    setInlineMount(document.getElementById(inlineMountId))
  }, [inlineMountId])

  const measureRailFit = useCallback(() => {
    const content = document.querySelector(contentSelector)
    if (!content) {
      setUseRail(false)
      return
    }

    const rect = content.getBoundingClientRect()
    const gutter = window.innerWidth - rect.right
    setUseRail(gutter >= RAIL_SPACE_PX + RAIL_GUTTER_PX)
  }, [contentSelector])

  useLayoutEffect(() => {
    measureRailFit()
  }, [measureRailFit])

  useEffect(() => {
    const content = document.querySelector(contentSelector)
    const observer =
      typeof ResizeObserver !== 'undefined' && content
        ? new ResizeObserver(() => measureRailFit())
        : null

    if (observer && content) {
      observer.observe(content)
    }
    window.addEventListener('resize', measureRailFit)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measureRailFit)
    }
  }, [contentSelector, measureRailFit])

  useEffect(() => {
    if (rooms.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.id.replace(/^room-/, '')
          ratiosRef.current.set(slug, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let bestSlug = activeSlug
        let bestRatio = -1
        for (const room of rooms) {
          const ratio = ratiosRef.current.get(room.slug) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestSlug = room.slug
          }
        }
        if (bestRatio > 0) setActiveSlug(bestSlug)
      },
      {
        root: null,
        rootMargin: '-20% 0px -45% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const room of rooms) {
      const el = document.getElementById(`room-${room.slug}`)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeSlug only used as fallback seed
  }, [rooms])

  const scrollTo = useCallback(
    (slug: string) => {
      const el = document.getElementById(`room-${slug}`)
      if (!el) return
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
      setActiveSlug(slug)
    },
    [prefersReducedMotion],
  )

  if (rooms.length === 0) return null

  const activeRoom = rooms.find((r) => r.slug === activeSlug) ?? rooms[0]

  const inlineNav = (
    <nav aria-label={ariaLabel} className="mt-4">
      <ul role="list" className="flex flex-wrap items-center gap-y-2">
        {rooms.map((room, index) => {
          const isActive = room.slug === activeSlug
          return (
            <li key={room.slug} className="flex items-center">
              {index > 0 ? (
                <span
                  className="mx-2.5 shrink-0 font-ui text-ui-md leading-none text-hbb-rooms-highlight/35 select-none"
                  aria-hidden="true"
                >
                  |
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => scrollTo(room.slug)}
                className={[
                  'rooms-nav-link',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight',
                  isActive ? 'rooms-nav-link--active' : '',
                ].join(' ')}
                aria-current={isActive ? 'true' : undefined}
              >
                {room.name}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeRoom?.name}
      </p>
    </nav>
  )

  return (
    <>
      {!useRail && inlineMount ? createPortal(inlineNav, inlineMount) : null}

      {useRail ? (
        <nav
          aria-label={ariaLabel}
          className={`pointer-events-none absolute top-0 right-2 bottom-0 z-30 w-0 xl:right-3 ${className}`}
        >
          <div className="pointer-events-auto sticky top-[28vh] flex flex-col items-end">
            <ul role="list" className="flex flex-col items-end gap-2">
              {rooms.map((room) => {
                const isActive = room.slug === activeSlug
                return (
                  <li key={room.slug}>
                    <button
                      type="button"
                      onClick={() => scrollTo(room.slug)}
                      className={[
                        'max-w-44 truncate text-right font-ui font-medium leading-tight',
                        'transition-[background-color,color,opacity,font-size,padding] duration-300 ease-out',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight',
                        'motion-reduce:transition-none',
                        isActive
                          ? 'bg-hbb-rooms-highlight px-2.5 py-1.5 text-[12px] text-white opacity-100'
                          : 'bg-white/50 px-2 py-1 text-[10px] text-hbb-black opacity-80 hover:bg-white/80 hover:opacity-100',
                      ].join(' ')}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {room.name}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {activeRoom?.name ?? ''}
            </p>
          </div>
        </nav>
      ) : null}
    </>
  )
}
