import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { Link } from '@/i18n/routing'
import { getResolvedPerson } from '@/lib/aeo/resolve'
import {
  buildPersonPageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const resolved = await getResolvedPerson(slug, locale)
  if (!resolved) return { title: 'Not found' }

  const isDraft = resolved.payload.status !== 'published'

  return {
    title: `${resolved.payload.name} | You, Me & Berlin | Hotel Berlin, Berlin`,
    description: resolved.payload.shortBio ?? undefined,
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}/you-me-and-berlin/${slug}`,
    },
    // Draft is a content-workflow state, not a crawl gate by itself — noindex
    // until Section 1 flags are confirmed and status flips to published.
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function PersonPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('youMeBerlin')
  const resolved = await getResolvedPerson(slug, locale)

  if (!resolved) notFound()

  const { payload: person, aeo, picks } = resolved
  const graph = buildPersonPageGraph(aeo, picks, defaultConfig)

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page px-section-sm py-section-y md:px-section-x">
        {/* Stub layout — polished design TBC. */}
        <p className="font-ui text-label uppercase tracking-ui-label text-hbb-green">
          <Link href="/you-me-berlin" className="hover:underline">
            {t('label')}
          </Link>
        </p>
        <h1 className="mt-3 font-ui text-ui-2xl font-medium text-hbb-black">{person.name}</h1>
        {person.jobTitle ? (
          <p className="mt-2 font-ui text-ui-sm text-gray-500">{person.jobTitle}</p>
        ) : null}
        {person.roomNumber ? (
          <p className="mt-1 font-ui text-ui-xs uppercase tracking-ui-label text-gray-400">
            {t('room')} {person.roomNumber}
          </p>
        ) : null}
        {person.basedIn ? (
          <p className="mt-1 font-ui text-ui-xs text-gray-400">{person.basedIn}</p>
        ) : null}
        {person.quote ? (
          <blockquote className="mt-8 max-w-2xl border-l-2 border-hbb-green pl-4 font-ui text-ui-lg text-gray-700">
            “{person.quote}”
          </blockquote>
        ) : null}
        {person.shortBio ? (
          <p className="mt-6 max-w-2xl font-ui text-ui-md text-gray-700">{person.shortBio}</p>
        ) : null}

        {picks.length > 0 ? (
          <ul className="mt-10 max-w-2xl space-y-4">
            {picks.map(({ place, quote }) => (
              <li key={place.slug} className="border-l-2 border-gray-200 pl-4">
                <Link
                  href={{
                    pathname: '/neighbourhood/[slug]',
                    params: { slug: place.slug },
                  }}
                  className="font-ui text-ui-md font-medium text-hbb-green hover:underline"
                >
                  {place.name}
                </Link>
                <p className="mt-1 font-ui text-ui-sm text-gray-600">“{quote}”</p>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
