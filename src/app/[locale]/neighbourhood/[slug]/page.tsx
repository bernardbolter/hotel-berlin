import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { Link } from '@/i18n/routing'
import { getResolvedPlace } from '@/lib/aeo/resolve'
import {
  buildPlacePageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const resolved = await getResolvedPlace(slug, locale)
  if (!resolved) return { title: 'Not found' }

  return {
    title: `${resolved.payload.name} | Hotel Berlin, Berlin`,
    description: resolved.payload.description ?? undefined,
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/nachbarschaft' : 'en/neighbourhood'}/${slug}`,
    },
  }
}

export default async function NeighbourhoodPlacePage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('neighbourhood')
  const resolved = await getResolvedPlace(slug, locale)

  if (!resolved) notFound()

  const { payload: place, aeo } = resolved
  const graph = buildPlacePageGraph(aeo, defaultConfig)
  const endorsements = place.endorsements ?? []

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page px-section-sm py-section-y md:px-section-x">
        {/* Stub layout — polished design TBC. */}
        <p className="font-ui text-label uppercase tracking-ui-label text-hbb-green">
          <Link href="/neighbourhood" className="hover:underline">
            {t('label')}
          </Link>
        </p>
        <h1 className="mt-3 font-ui text-ui-2xl font-medium text-hbb-black">{place.name}</h1>
        {place.category ? (
          <p className="mt-2 font-ui text-ui-sm text-gray-500">{place.category}</p>
        ) : null}
        {place.description ? (
          <p className="mt-6 max-w-2xl font-ui text-ui-md text-gray-700">{place.description}</p>
        ) : null}

        {endorsements.length > 0 ? (
          <ul className="mt-10 max-w-2xl space-y-6">
            {endorsements.map((entry, index) => {
              const person =
                entry.person && typeof entry.person === 'object' ? entry.person : null
              const personSlug = person && typeof person.slug === 'string' ? person.slug : null
              return (
                <li key={index} className="border-l-2 border-hbb-green pl-4">
                  <blockquote className="font-ui text-ui-md text-gray-700">
                    “{entry.quote}”
                  </blockquote>
                  {person && personSlug ? (
                    <p className="mt-2 font-ui text-ui-sm text-gray-500">
                      —{' '}
                      <Link
                        href={{
                          pathname: '/you-me-berlin/[slug]',
                          params: { slug: personSlug },
                        }}
                        className="text-hbb-green hover:underline"
                      >
                        {person.name}
                      </Link>
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
