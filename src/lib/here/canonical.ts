const ORIGIN = 'https://hotel-berlin.de'

/** Canonical pathname keys → localized URL paths (localePrefix: always). */
const HERE_PATHS = {
  '/here': { en: '/en/here', de: '/de/hier' },
  '/here/events': { en: '/en/here/events', de: '/de/hier/events' },
  '/here/art': { en: '/en/here/art', de: '/de/hier/art' },
  '/here/dining': { en: '/en/here/dining', de: '/de/hier/dining' },
  '/here/explore': { en: '/en/here/explore', de: '/de/hier/explore' },
  '/here/faq': { en: '/en/here/faq', de: '/de/hier/faq' },
  '/here/getting-around': { en: '/en/here/getting-around', de: '/de/hier/getting-around' },
  '/here/gallery': { en: '/en/here/gallery', de: '/de/hier/gallery' },
  '/here/wallride': { en: '/en/here/wallride', de: '/de/hier/wallride' },
} as const

export type HerePathname = keyof typeof HERE_PATHS

export function hereAlternates(pathname: HerePathname, locale: string) {
  const paths = HERE_PATHS[pathname]
  const canonicalPath = locale === 'de' ? paths.de : paths.en

  return {
    canonical: `${ORIGIN}${canonicalPath}`,
    languages: {
      de: `${ORIGIN}${paths.de}`,
      en: `${ORIGIN}${paths.en}`,
      'x-default': `${ORIGIN}${paths.de}`,
    },
  }
}

export function herePageMetadata(
  pathname: HerePathname,
  locale: string,
  title: string,
  description: string,
) {
  return {
    title: `${title} | Hotel Berlin, Berlin`,
    description,
    alternates: hereAlternates(pathname, locale),
  }
}
