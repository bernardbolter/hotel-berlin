import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { PlacesMapView } from '@/components/map/PlacesMapView'
import { VideoEmbed } from '@/components/media/VideoEmbed'
import { PlaceCard } from '@/components/neighbourhood/PlaceCard'
import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { LineCta } from '@/components/primitives/LineCta'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { Link } from '@/i18n/routing'
import { getResolvedPerson } from '@/lib/aeo/resolve'
import {
  buildPersonPageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getMapSettings } from '@/lib/map/settings'
import {
  mapPlaceLabels,
  mediaFileAlt,
  mediaFileUrl,
  personFromEndorsement,
  toMapViewPlace,
} from '@/lib/map/toMapPlace'
import { lexicalToParagraphs } from '@/lib/richText/lexicalToPlain'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'
import type { NeighbourhoodPlace } from '@/payload-types'

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
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function PersonPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('youMeBerlin')
  const tPlaces = await getTranslations('neighbourhood')
  const [resolved, mapSettings] = await Promise.all([
    getResolvedPerson(slug, locale),
    getMapSettings(),
  ])

  if (!resolved) notFound()

  const { payload: person, aeo, picks } = resolved
  const graph = buildPersonPageGraph(aeo, picks, defaultConfig)

  const portraitUrl = mediaFileUrl(person.portrait)
  const portraitAlt = mediaFileAlt(person.portrait, person.name)
  const bioParagraphs = lexicalToParagraphs(person.bio)
  const hasBio = bioParagraphs.length > 0
  const quote = person.quote?.trim()
  const videoUrl = person.video?.trim()

  const payloadPicks = (person.picks?.docs ?? []).filter(
    (doc): doc is NeighbourhoodPlace =>
      typeof doc === 'object' && doc != null && doc.status === 'active',
  )

  const labelFn = {
    category: (category: string) => tPlaces(`categories.${category}`),
    walking: (minutes: number) => tPlaces('walkingMinutes', { minutes }),
    transit: (args: { minutes: number; line: string; station: string }) =>
      tPlaces('transitLine', args),
  }

  const mapPlaces = payloadPicks
    .map((doc) =>
      toMapViewPlace(doc as unknown as NeighbourhoodPlaceDoc, mapPlaceLabels(doc as unknown as NeighbourhoodPlaceDoc, labelFn), {
        leadPersonSlug: typeof person.slug === 'string' ? person.slug : null,
      }),
    )
    .filter((p): p is NonNullable<typeof p> => p != null)

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="px-section-sm py-section-y md:px-section-x">
          <p className="font-ui text-label uppercase tracking-ui-label text-hbb-green">
            <Link href="/you-me-berlin" className="hover:underline">
              {t('label')}
            </Link>
          </p>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <div className="relative aspect-3/4 w-full max-w-xs overflow-hidden bg-gray-100 md:w-64 md:max-w-none">
              {portraitUrl ? (
                <Image
                  src={portraitUrl}
                  alt={portraitAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <InitialsAvatar name={person.name} size="xl" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-ui text-ui-2xl font-medium text-hbb-black md:text-[2rem]">
                {person.name}
              </h1>
              {person.jobTitle ? (
                <p className="mt-2 font-ui text-ui-sm text-gray-500">{person.jobTitle}</p>
              ) : null}
              {person.basedIn ? (
                <p className="mt-1 font-ui text-ui-xs text-gray-400">{person.basedIn}</p>
              ) : null}
              {person.roomNumber ? (
                <p className="mt-1 font-ui text-ui-xs uppercase tracking-ui-label text-gray-400">
                  {t('room')} {person.roomNumber}
                </p>
              ) : null}

              {quote ? (
                <blockquote className="mt-8 max-w-2xl border-l-2 border-hbb-green pl-4 font-ui text-ui-lg text-gray-700">
                  “{quote}”
                </blockquote>
              ) : null}

              {hasBio ? (
                <RichTextParagraphs
                  value={person.bio}
                  className="mt-8 max-w-2xl"
                  paragraphClassName="font-ui text-ui-md text-gray-700"
                />
              ) : person.shortBio ? (
                <p className="mt-8 max-w-2xl font-ui text-ui-md text-gray-700">{person.shortBio}</p>
              ) : null}

              {videoUrl ? (
                <VideoEmbed
                  url={videoUrl}
                  title={t('videoTitle', { name: person.name })}
                  className="mt-10 max-w-2xl"
                />
              ) : null}
            </div>
          </div>

          {payloadPicks.length > 0 ? (
            <section className="mt-16" aria-labelledby="picks-heading">
              <h2 id="picks-heading" className="font-ui text-ui-xl font-medium text-hbb-black">
                {t('picksHeading', { name: person.name })}
              </h2>

              {mapSettings.accessToken && mapPlaces.length > 0 ? (
                <div className="mt-8 overflow-hidden border border-gray-200">
                  <PlacesMapView
                    accessToken={mapSettings.accessToken}
                    bounds={mapSettings.bounds}
                    center={mapSettings.center}
                    places={mapPlaces}
                    hotelName={mapSettings.hotelName}
                    ariaLabel={t('mapAria')}
                    noscriptHtml={t.raw('mapNoscript') as string}
                    pinVariant="person"
                    cardEmphasis="person"
                    compact
                    autoSelectFirst
                  />
                </div>
              ) : null}

              <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {payloadPicks.map((place) => {
                  const endorsements =
                    place.endorsements
                      ?.map((entry) => personFromEndorsement(entry.person))
                      .filter((p): p is NonNullable<typeof p> => p != null)
                      .map((p) => ({ personSlug: p.slug, personName: p.name })) ?? []

                  return (
                    <li key={place.id}>
                      <PlaceCard
                        name={place.name}
                        slug={place.slug}
                        category={place.category}
                        categoryLabel={tPlaces(`categories.${place.category}`)}
                        walkingMinutes={place.walkingMinutes}
                        walkingLabel={
                          place.walkingMinutes != null
                            ? tPlaces('walkingMinutes', { minutes: place.walkingMinutes })
                            : undefined
                        }
                        description={place.description}
                        imageUrl={mediaFileUrl(place.image)}
                        imageAlt={mediaFileAlt(place.image)}
                        endorsements={endorsements}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : (
            <p className="mt-16 font-ui text-ui-sm text-gray-500">
              {t('picksComingSoon', { name: person.name })}
            </p>
          )}

          <LineCta href="/you-me-berlin" className="mt-12 font-ui text-xs uppercase tracking-widest">
            {t('backToList')}
          </LineCta>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
