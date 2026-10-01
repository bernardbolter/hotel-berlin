import type { HeroSlide } from '@/components/home/heroSlides'
import {
  buildHeroWebPageGraph,
  defaultConfig,
  type SchemaHeroSlide,
} from '@/lib/aeo-schema/src/index'

function absoluteUrl(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  const base = defaultConfig.baseUrl.replace(/\/$/, '')
  return `${base}${src.startsWith('/') ? src : `/${src}`}`
}

export function heroSlidesToSchema(
  slides: HeroSlide[],
  locale: 'de' | 'en',
): SchemaHeroSlide[] {
  return slides.map((slide) => ({
    contentUrl: absoluteUrl(slide.src),
    name: locale === 'de' ? slide.captionDE || slide.altDE : slide.captionEN || slide.altEN,
    description: locale === 'de' ? slide.descriptionDE : slide.descriptionEN,
    altText: locale === 'de' ? slide.altDE : slide.altEN,
    keywords: locale === 'de' ? slide.keywordsDE : slide.keywordsEN,
    creditText: slide.credit,
    inLanguage: locale,
    venueSlug: slide.venueSlug ?? null,
  }))
}

export function buildHomeHeroJsonLd(
  slides: HeroSlide[],
  locale: 'de' | 'en',
  copy: { name: string; description?: string },
) {
  const path = locale === 'de' ? '/de' : '/en'
  return buildHeroWebPageGraph(
    {
      url: `${defaultConfig.baseUrl}${path}`,
      name: copy.name,
      description: copy.description,
      inLanguage: locale,
    },
    heroSlidesToSchema(slides, locale),
    defaultConfig,
  )
}

export function buildHereHeroJsonLd(
  slides: HeroSlide[],
  locale: 'de' | 'en',
  copy: { name: string; description?: string },
) {
  const path = locale === 'de' ? '/de/hier' : '/en/here'
  return buildHeroWebPageGraph(
    {
      url: `${defaultConfig.baseUrl}${path}`,
      name: copy.name,
      description: copy.description,
      inLanguage: locale,
    },
    heroSlidesToSchema(slides, locale),
    defaultConfig,
  )
}
