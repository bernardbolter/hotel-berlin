import type { Metadata } from 'next'

import { getPathname } from '@/i18n/routing'
import { SCAFFOLD_PATHNAME, type ScaffoldId } from '@/lib/scaffolds/catalog'

const ORIGIN = 'https://hotel-berlin.de'

export function scaffoldHref(id: ScaffoldId, locale: string): string {
  return getPathname({
    locale: locale === 'de' ? 'de' : 'en',
    href: SCAFFOLD_PATHNAME[id],
  })
}

export function scaffoldPageMetadata(
  id: ScaffoldId,
  locale: string,
  title: string,
  description: string,
): Metadata {
  const loc = locale === 'de' ? 'de' : 'en'
  return {
    title: `${title} | Hotel Berlin, Berlin`,
    description,
    alternates: {
      canonical: `${ORIGIN}${scaffoldHref(id, loc)}`,
      languages: {
        de: `${ORIGIN}${scaffoldHref(id, 'de')}`,
        en: `${ORIGIN}${scaffoldHref(id, 'en')}`,
        'x-default': `${ORIGIN}${scaffoldHref(id, 'de')}`,
      },
    },
  }
}
