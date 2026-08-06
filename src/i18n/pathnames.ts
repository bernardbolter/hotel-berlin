import type { Pathnames } from 'next-intl/routing'

/**
 * Canonical pathname keys used by next-intl `Link` / `redirect` / `usePathname`.
 * Localized URL segments live here only — never hardcode `/de/...` or `/en/...` in components.
 */
export const pathnames = {
  '/': '/',
  '/here': { en: '/here', de: '/hier' },
  '/here/events': { en: '/here/events', de: '/hier/events' },
  '/here/getting-around': { en: '/here/getting-around', de: '/hier/getting-around' },
  '/here/explore': { en: '/here/explore', de: '/hier/explore' },
  '/here/gallery': { en: '/here/gallery', de: '/hier/gallery' },
  '/here/dining': { en: '/here/dining', de: '/hier/dining' },
  '/here/faq': { en: '/here/faq', de: '/hier/faq' },
  '/here/art': { en: '/here/art', de: '/hier/art' },
  '/here/wallride': { en: '/here/wallride', de: '/hier/wallride' },
  '/neighbourhood': { en: '/neighbourhood', de: '/nachbarschaft' },
  '/neighbourhood/[slug]': {
    en: '/neighbourhood/[slug]',
    de: '/nachbarschaft/[slug]',
  },
  '/map-styles': { en: '/map-styles', de: '/map-styles' },
  '/you-me-berlin': { en: '/you-me-and-berlin', de: '/you-me-and-berlin' },
  '/you-me-berlin/[slug]': {
    en: '/you-me-and-berlin/[slug]',
    de: '/you-me-and-berlin/[slug]',
  },
  // Placeholder — NOT final, do not let these reach production before sign-off:
  '/rooms': { en: '/rooms', de: '/rooms' },
  '/restaurant': { en: '/restaurant', de: '/restaurant' },
  '/meetings': { en: '/meetings', de: '/meetings' },
  '/happenings': { en: '/happenings', de: '/happenings' },
  '/offers': { en: '/offers', de: '/offers' },
  '/faq': { en: '/faq', de: '/faq' }, // PLACEHOLDER — German slug not yet confirmed
  '/faqs': { en: '/faqs', de: '/faqs' }, // legacy alias — prefer /faq
  '/imprint': { en: '/imprint', de: '/imprint' },
  '/privacy': { en: '/privacy', de: '/privacy' },
  '/terms': { en: '/terms', de: '/terms' },
  '/cookies': { en: '/cookies', de: '/cookies' },
  '/accessibility': { en: '/accessibility', de: '/accessibility' },
} as const satisfies Pathnames<readonly ['de', 'en']>

export type AppPathnames = typeof pathnames
