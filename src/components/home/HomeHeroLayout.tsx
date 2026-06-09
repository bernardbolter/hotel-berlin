'use client'

import { useLocale } from 'next-intl'
import { type ReactNode, useState } from 'react'

import { KenBurnsSlider } from './KenBurnsSlider'
import { heroSlides } from './heroSlides'
import { HERO_LEFT_COL_PX } from './heroLayout'

export type HomeHeroCopy = {
  headingLine1: string
  headingLine2: string
  galleryAria: string
}

type Props = {
  copy: HomeHeroCopy
  satellite: ReactNode
}

export function HomeHeroLayout({ copy, satellite }: Props) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)

  const activeSlide = heroSlides[activeIndex]
  const caption =
    locale === 'de' ? activeSlide.captionDE : activeSlide.captionEN

  return (
    <section
      aria-label="Hero"
      className="relative min-w-[900px] bg-hbb-teal pt-6 pb-12"
    >
      {/* Photo — left edge flush with satellite column */}
      <div
        className="absolute top-6 bottom-12 right-0 z-1"
        style={{ left: `calc(2rem + ${HERO_LEFT_COL_PX}px + 1px)` }}
      >
        <KenBurnsSlider
          ariaLabel={copy.galleryAria}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          className="h-full"
        />
      </div>

      {/* Amber frame + caption below */}
      <div className="relative z-2 mb-20 ml-8 mr-[10%] mt-6">
        <div className="border border-hbb-nav-amber bg-hbb-page/10">
          <div className="flex items-stretch">
            {/* Left — headline in flow, satellite pinned to amber bottom-left */}
            <div
              className="flex shrink-0 flex-col justify-between self-stretch"
              style={{ width: HERO_LEFT_COL_PX }}
            >
              <div
                className="relative z-10 bg-hbb-teal px-[78px] py-16"
                style={{ width: `calc(${HERO_LEFT_COL_PX}px + 10rem)` }}
              >
                <h1 className="font-serif text-serif-3xl font-medium leading-[1.15] text-white">
                  {copy.headingLine1}
                  <br />
                  {copy.headingLine2}
                </h1>
              </div>

              <div className="w-full shrink-0 self-start leading-0">
                {satellite}
              </div>
            </div>

            {/* Right — photo shows through amber tint; min-height keeps row tall enough */}
            <div className="relative min-h-[420px] flex-1" />
          </div>
        </div>

        <p
          className="mt-0.5 text-right font-ui text-[11px] font-semibold tracking-widest text-white/85"
          style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)' }}
          aria-live="off"
        >
          {caption}
        </p>
      </div>
    </section>
  )
}
