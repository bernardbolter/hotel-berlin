import type { SiteConfig } from '../types';

// Single source of truth for base URL + canonical locale + translated path
// segments. Update this file, not the builders, when slugs change post
// sign-off — this is the file referenced in the URL-naming conversation.
export const defaultConfig: SiteConfig = {
  baseUrl: 'https://hotel-berlin.de',
  canonicalLocale: 'de',
  paths: {
    neighbourhood: {
      de: '/de/nachbarschaft',
      en: '/en/neighbourhood',
    },
    peopleHub: {
      de: '/de/you-me-and-berlin',
      en: '/en/you-me-and-berlin',
    },
  },
};
