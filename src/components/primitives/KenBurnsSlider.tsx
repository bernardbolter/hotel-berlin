'use client'

import { Pause, Play } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

export interface KenBurnsSliderProps {
  images: { src: string; alt: string }[]
  interval?: number
  className?: string
  'aria-label'?: string
  /** Hint for next/image — match the rendered width, not full viewport */
  sizes?: string
  children?: React.ReactNode
  currentIndex?: number
  onIndexChange?: (index: number) => void
  showDots?: boolean
  showPauseButton?: boolean
}

export function KenBurnsSlider({
  images,
  interval = 5000,
  className = '',
  'aria-label': ariaLabel,
  sizes = '(max-width: 768px) 100vw, 55vw',
  children,
  currentIndex: controlledIndex,
  onIndexChange,
  showDots = true,
  showPauseButton = true,
}: KenBurnsSliderProps) {
  const tc = useTranslations('common')
  const [internalIndex, setInternalIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const isControlled = controlledIndex !== undefined
  const currentIndex = isControlled ? controlledIndex : internalIndex

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return
      const next = ((index % images.length) + images.length) % images.length
      if (onIndexChange) {
        onIndexChange(next)
      } else {
        setInternalIndex(next)
      }
    },
    [images.length, onIndexChange],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)

    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setPaused(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (paused || images.length <= 1) return

    const timer = window.setInterval(() => {
      goTo(currentIndex + 1)
    }, interval)

    return () => window.clearInterval(timer)
  }, [paused, interval, images.length, currentIndex, goTo])

  if (images.length === 0) {
    return null
  }

  const resolvedAriaLabel = ariaLabel ?? tc('gallerySlides')

  return (
    <div
      role="region"
      aria-label={resolvedAriaLabel}
      aria-roledescription="carousel"
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {tc('slideAnnouncement', { current: currentIndex + 1, total: images.length })}
        {images[currentIndex]?.alt ? `: ${images[currentIndex].alt}` : ''}
      </div>

      <div aria-hidden="true" className="relative h-full w-full overflow-hidden">
        {images.map((img, i) => {
          const isActive = i === currentIndex
          return (
            <div
              key={img.src}
              className={`ken-burns-img absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-0'} ${
                isActive && !reduceMotion ? 'scale-100' : 'scale-[1.04]'
              }`}
              style={{
                transition: reduceMotion
                  ? 'opacity 0.5s ease'
                  : 'opacity 1s ease, transform 7s ease',
              }}
            >
              <Image src={img.src} alt={img.alt || ''} fill sizes={sizes} style={{ objectFit: 'cover' }} />
            </div>
          )
        })}
      </div>

      {children}

      {showPauseButton && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <button
            type="button"
            aria-label={paused ? tc('playSlideshow') : tc('pauseSlideshow')}
            onClick={() => setPaused((p) => !p)}
            className="flex h-8 w-8 items-center justify-center bg-hbb-dark/60 text-white"
          >
            {paused ? (
              <Play aria-hidden="true" size={14} />
            ) : (
              <Pause aria-hidden="true" size={14} />
            )}
          </button>
        </div>
      )}

      {showDots && images.length > 1 && (
        <div
          role="tablist"
          aria-label={tc('gallerySlides')}
          className="absolute bottom-3 left-3 z-10 flex gap-1.5"
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={tc('slideAnnouncement', { current: i + 1, total: images.length })}
              onClick={() => {
                goTo(i)
                setPaused(false)
              }}
              className={`h-0.5 rounded-none transition-all ${
                i === currentIndex ? 'w-8 bg-hbb-amber' : 'w-4.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
