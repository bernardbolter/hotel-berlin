import { heroImages } from '@/lib/data/homepageImages'

export type HeroSlide = {
  src: string
  alt: string
  captionEN: string
  captionDE: string
  credit?: string
}

/** Placeholder slides when CMS hero is empty or unavailable */
export const fallbackHeroSlides: HeroSlide[] = [
  {
    src: heroImages[0].src,
    alt: 'The inner courtyard of Hotel Berlin, Berlin — Lützowplatz 17, Tiergarten, with lush greenery and terrace seating',
    captionEN: 'COURTYARD · TIERGARTEN',
    captionDE: 'INNENHOF · TIERGARTEN',
  },
  {
    src: heroImages[1].src,
    alt: 'Lütze bar and restaurant at Hotel Berlin, Berlin — warm interior with terracotta seating',
    captionEN: 'LÜTZE · GROUND FLOOR',
    captionDE: 'LÜTZE · ERDGESCHOSS',
  },
  {
    src: heroImages[2].src,
    alt: 'A guest room at Hotel Berlin, Berlin — designed interior with artwork on the walls',
    captionEN: 'ROOMS · ON THE WALLS',
    captionDE: 'ZIMMER · ON THE WALLS',
  },
  {
    src: heroImages[3].src,
    alt: 'FKKB gallery at Hotel Berlin, Berlin — exhibition space with large-scale contemporary artworks',
    captionEN: 'FKKB · GALLERY',
    captionDE: 'FKKB · GALERIE',
  },
]

export const heroSlides = fallbackHeroSlides
