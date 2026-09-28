import type { Metadata } from 'next'

import { getPathname } from '@/i18n/routing'
import { firstParagraphText, getLegalPage } from '@/lib/legal/documents'
import type { LegalSlug } from '@/lib/legal/types'

const ORIGIN = 'https://hotel-berlin.de'

const PATHNAME_BY_SLUG = {
  imprint: '/imprint',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  disclaimer: '/disclaimer',
} as const

export function legalPathname(slug: LegalSlug) {
  return PATHNAME_BY_SLUG[slug]
}

export function legalHref(slug: LegalSlug, locale: string): string {
  return getPathname({
    locale: locale === 'de' ? 'de' : 'en',
    href: PATHNAME_BY_SLUG[slug],
  })
}

export async function legalPageMetadata(
  slug: LegalSlug,
  locale: string,
  descriptionFallback: string,
): Promise<Metadata> {
  const loc = locale === 'de' ? 'de' : 'en'
  const doc = await getLegalPage(slug, loc)
  const description = firstParagraphText(doc) || descriptionFallback
  const canonical = `${ORIGIN}${legalHref(slug, loc)}`

  return {
    title: `${doc.title} | Hotel Berlin, Berlin`,
    description,
    alternates: {
      canonical,
      languages: {
        de: `${ORIGIN}${legalHref(slug, 'de')}`,
        en: `${ORIGIN}${legalHref(slug, 'en')}`,
        'x-default': `${ORIGIN}${legalHref(slug, 'de')}`,
      },
    },
  }
}
