export type HeroSlide = {
  src: string
  altEN: string
  altDE: string
  captionEN: string
  captionDE: string
  credit?: string
  /** CSS object-position from media focal point */
  objectPosition?: string
  descriptionEN?: string
  descriptionDE?: string
  keywordsEN?: string
  keywordsDE?: string
  venueSlug?: string | null
}

/** No hardcoded hero slides. Empty CMS → grey ground (F5). */
export const fallbackHeroSlides: HeroSlide[] = []
export const heroSlides = fallbackHeroSlides
