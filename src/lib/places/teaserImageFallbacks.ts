/**
 * Temporary place photos for map cards until CMS media is uploaded.
 * Prefer Wikimedia (credited) over Unsplash stand-ins.
 */

export type PlaceImageFallbackAsset = {
  src: string
  creditText: string
  creditUrl: string
}

export const PLACE_IMAGE_FALLBACKS: Record<string, PlaceImageFallbackAsset> = {
  'neue-nationalgalerie': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Neue_Nationalgalerie_Berlin.jpg/960px-Neue_Nationalgalerie_Berlin.jpg',
    creditText: 'Manfred Brückels, CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Neue_Nationalgalerie_Berlin.jpg',
  },
  'kaethe-kollwitz-museum': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Berlin-fasanenstra%C3%9Fe-24-k%C3%A4the-kollwitz-museum-berlin.JPG/960px-Berlin-fasanenstra%C3%9Fe-24-k%C3%A4the-kollwitz-museum-berlin.JPG',
    creditText: 'Roland.h.bueb, CC BY 3.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:Berlin-fasanenstra%C3%9Fe-24-k%C3%A4the-kollwitz-museum-berlin.JPG',
  },
  'hamburger-bahnhof': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Hamburger_Bahnhof_Berlin.jpg/960px-Hamburger_Bahnhof_Berlin.jpg',
    creditText: 'Lukas Icking, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Hamburger_Bahnhof_Berlin.jpg',
  },
  'koenig-galerie': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg/960px-St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg',
    creditText: 'Gunnar Klack, CC BY-SA 4.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg',
  },
  '893-ryotei-bar': {
    src: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=960&q=80',
    creditText: 'Unsplash (temporary)',
    creditUrl: 'https://unsplash.com',
  },
  'schloss-charlottenburg': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Charlottenburg_Palace.jpg/960px-Charlottenburg_Palace.jpg',
    creditText: 'Leonhard Lenz, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Charlottenburg_Palace.jpg',
  },
  anjoy: {
    src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=960&q=80',
    creditText: 'Unsplash (temporary)',
    creditUrl: 'https://unsplash.com',
  },
}

type ImageRef = { src: string; alt: string } | null
type CreditRef = { creditText: string; creditUrl?: string | null } | null

/** Use CMS media when present; otherwise a credited temporary photo if we have one. */
export function withPlaceImageFallback(
  slug: string,
  image: ImageRef,
  imageCredit: CreditRef,
  alt: string,
): { image: ImageRef; imageCredit: CreditRef } {
  if (image?.src) return { image, imageCredit }

  const fallback = PLACE_IMAGE_FALLBACKS[slug]
  if (!fallback) return { image: null, imageCredit }

  return {
    image: { src: fallback.src, alt },
    imageCredit: {
      creditText: fallback.creditText,
      creditUrl: fallback.creditUrl,
    },
  }
}
