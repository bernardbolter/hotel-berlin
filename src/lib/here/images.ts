export type HereImage = { src: string; alt: string }

/** Local + Unsplash stand-ins when Payload media is missing. */
export const HERE_IMAGES = {
  hero: {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    alt: 'Sunlit courtyard at Hotel Berlin, Berlin',
  },
  fkkb: {
    src: '/images/here/fkkb-current.webp',
    alt: 'Magwie × CokyOne at FKKB gallery',
  },
  kttk: {
    src: '/images/here/kttk.jpg',
    alt: 'Table tennis at KTTK in the basement',
  },
  lutze: {
    src: '/images/here/lutze.jpg',
    alt: 'Lütze restaurant and bar',
  },
  lutzeInterior: {
    src: '/images/food-interior.jpg',
    alt: 'Lütze dining room',
  },
  wallride: {
    src: 'https://images.unsplash.com/photo-1502161254066-6c74afbfbda1?w=900&q=80',
    alt: 'Skate ramp in an indoor hall',
  },
  muralSomari: {
    src: '/images/here/magwie.jpg',
    alt: 'Artwork on the walls at Hotel Berlin, Berlin',
  },
  muralDeer: {
    src: '/images/here/deerbln.jpg',
    alt: 'Temporary stand-in mural for deerBLN',
  },
  muralPisa: {
    src: '/images/here/cokyone.jpg',
    alt: 'Graffiti and mural work in the hotel',
  },
} as const satisfies Record<string, HereImage>

export function firstHereImage(
  ...candidates: Array<HereImage | null | undefined>
): HereImage {
  for (const candidate of candidates) {
    if (candidate?.src) return candidate
  }
  return HERE_IMAGES.hero
}
