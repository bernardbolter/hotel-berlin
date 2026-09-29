export type HeroSlide = {
  src: string
  alt: string
  captionEN: string
  captionDE: string
  credit?: string
}

/** No hardcoded hero slides. Empty CMS → grey ground (F5). */
export const fallbackHeroSlides: HeroSlide[] = []
export const heroSlides = fallbackHeroSlides
