import type { Metadata } from 'next'

import { getPathname } from '@/i18n/routing'
import type { AppPathnames } from '@/i18n/pathnames'

export type EntityLocale = 'de' | 'en'

export function resolveLocale(locale: string): EntityLocale {
  return locale === 'en' ? 'en' : 'de'
}

const ORIGIN = 'https://hotel-berlin.de'

type SlugPath =
  | '/neighbourhood/[slug]'
  | '/you-me-berlin/[slug]'
  | '/happenings/[slug]'

function localizedUrl(locale: EntityLocale, pathname: SlugPath, slug: string): string {
  return `${ORIGIN}${getPathname({
    locale,
    href: { pathname, params: { slug } },
  })}`
}

export function entityAlternates(
  pathname: SlugPath,
  slug: string,
): NonNullable<Metadata['alternates']> {
  const de = localizedUrl('de', pathname, slug)
  const en = localizedUrl('en', pathname, slug)
  return {
    canonical: de.startsWith(ORIGIN) ? undefined : de,
    languages: {
      de,
      en,
      'x-default': de,
    },
  }
}

export function entityCanonicalUrl(locale: EntityLocale, pathname: SlugPath, slug: string): string {
  return localizedUrl(locale, pathname, slug)
}

export function entityMetadata(args: {
  locale: EntityLocale
  pathname: SlugPath
  slug: string
  title: string
  description?: string
  index?: boolean
}): Metadata {
  const canonical = entityCanonicalUrl(args.locale, args.pathname, args.slug)
  const de = entityCanonicalUrl('de', args.pathname, args.slug)
  const en = entityCanonicalUrl('en', args.pathname, args.slug)

  return {
    title: args.title,
    description: args.description,
    alternates: {
      canonical,
      languages: {
        de,
        en,
        'x-default': de,
      },
    },
    ...(args.index === false ? { robots: { index: false, follow: false } } : {}),
  }
}

export function venuePublicHref(slug: string | null | undefined): AppPathnames {
  if (slug === 'lutze') return '/restaurant'
  if (slug === 'fkkb') return '/here/art'
  if (slug === 'kttk') return '/here'
  return '/here'
}
