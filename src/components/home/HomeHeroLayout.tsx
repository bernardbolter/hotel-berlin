'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

import { useTypewriter } from '@/hooks/useTypewriter'

import { HeroPhotoSlider } from './HeroPhotoSlider'
import { type HeroSlide } from './heroSlides'

export type HomeHeroCopy = {
  headingLine1: ReactNode
  headingLine2: ReactNode
  body: string
  galleryAria: string
}

type Props = {
  slides: HeroSlide[]
  copy: HomeHeroCopy
  map: ReactNode
}

/**
 * Hero layout (2:1 addendum):
 * - <550: stacked photo, then forest with headline/body above
 *   address + map circle
 * - 550–1099: stacked photo, then forest with text left / map right
 * - ≥1100: grid 1fr 2fr; forest is content-height; photo extends so the
 *   address under the map sits 50px above the photo’s bottom edge; badge
 *   stays centered on the forest/photo corner (corner dropped 20px)
 */
export function HomeHeroLayout({ slides, copy, map }: Props) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const activeSlide = slides[activeIndex] ?? slides[0]
  const caption =
    (locale === 'de' ? activeSlide?.captionDE : activeSlide?.captionEN) ?? ''
  const typedCaption = useTypewriter(caption, !reduceMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(media.matches)
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return (
    <section aria-label="Hero" className="home-hero relative bg-white">
      <div className="site-shell">
        <div className="home-hero__row relative z-10">
          <div className="home-hero__copy h-fit self-start rounded-bl-[25px]">
            <div className="home-hero__copy-text">
              <h1 className="home-hero__headline">
                {copy.headingLine1}
                <br />
                {copy.headingLine2}
              </h1>
              <p className="home-hero__body">{copy.body}</p>
            </div>
            <div className="home-hero__badge">{map}</div>
          </div>

          <div className="home-hero__photo-col">
            <div className="home-hero__photo relative overflow-hidden rounded-bl-[50px] max-[1099px]:rounded-none bg-hbb-warm max-[767px]:aspect-[1/0.75] min-[768px]:max-[1099px]:aspect-[2/1]">
              <HeroPhotoSlider
                slides={slides}
                ariaLabel={copy.galleryAria}
                activeIndex={activeIndex}
                onIndexChange={setActiveIndex}
                className="absolute inset-0 h-full w-full"
              />
              <p
                className="home-hero__caption relative font-ui text-[11px] font-semibold tracking-[0.14em]"
                aria-live="polite"
                aria-atomic="true"
                style={{
                  background: 'rgba(86, 103, 79, 0.6)',
                  padding: '0.3rem 0.55rem',
                  color: '#fff',
                }}
              >
                <span className="invisible whitespace-pre-wrap" aria-hidden="true">
                  {caption}
                </span>
                <span className="home-hero__caption-text absolute top-1/2 left-[0.55rem] -translate-y-1/2 whitespace-pre-wrap">
                  {typedCaption}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
