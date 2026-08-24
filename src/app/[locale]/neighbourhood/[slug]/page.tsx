import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { EndorsementChipList } from '@/components/map/PlaceInfoCard'
import { PlacesMapView } from '@/components/map/PlacesMapView'
import { PlaceImageFallback } from '@/components/neighbourhood/PlaceImageFallback'
import { LineCta } from '@/components/primitives/LineCta'
import { Link } from '@/i18n/routing'
import { getResolvedPlace } from '@/lib/aeo/resolve'
import {
  buildPlacePageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getMapSettings } from '@/lib/map/settings'
import { mapPlaceLabels, mediaFileAlt, mediaFileUrl, toMapViewPlace } from '@/lib/map/toMapPlace'
import { personInitials } from '@/lib/people/initials'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import type { NeighbourhoodPlace } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function formatAddress(place: NeighbourhoodPlace): string | null {
  const street = place.address?.streetAddress?.trim()
  const postal = place.address?.postalCode?.trim()
  const city = place.address?.addressLocality?.trim()
  const parts = [street, [postal, city].filter(Boolean).join(' ')].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
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
  const tMap = await getTranslations('heroMap')
  const [resolved, mapSettings] = await Promise.all([
    getResolvedPlace(slug, locale),
    getMapSettings(),
  ])

  if (!resolved) notFound()

  const { payload: place, aeo } = resolved
  const graph = buildPlacePageGraph(aeo, defaultConfig)
  const imageSrc = mediaFileUrl(place.image)
  const imageAlt = mediaFileAlt(place.image, place.name)
  const address = formatAddress(place)
  const category = place.category as PlaceCategory
  const walkingLabel =
    place.walkingMinutes != null
      ? t('walkingMinutes', { minutes: place.walkingMinutes })
      : null
  const transit = place.transit
  const transitLabel =
    transit?.minutes != null && transit.station && transit.line
      ? t('transitLine', {
          minutes: transit.minutes,
          line: transit.line,
          station: transit.station,
        })
      : null

  const endorsements =
    place.endorsements
      ?.map((entry) => {
        const person = entry.person
        if (!person || typeof person !== 'object' || typeof person.slug !== 'string') {
          return null
        }
        return {
          person: {
            name: person.name,
            slug: person.slug,
            initials: personInitials(person.name),
          },
        }
      })
      .filter((e): e is NonNullable<typeof e> => e != null) ?? []

  const mapPlace = toMapViewPlace(
    place as unknown as NeighbourhoodPlaceDoc,
    mapPlaceLabels(place as unknown as NeighbourhoodPlaceDoc, {
      category: (value) => t(`categories.${value}`),
      walking: (minutes) => t('walkingMinutes', { minutes }),
      transit: (args) => t('transitLine', args),
    }),
  )

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="px-section-sm pt-section-y md:px-section-x">
          <p className="font-ui text-label uppercase tracking-ui-label text-hbb-green">
            <Link href="/neighbourhood" className="hover:underline">
              {t('label')}
            </Link>
          </p>
        </div>

        <div className="relative mt-6 aspect-4/3 w-full overflow-hidden bg-gray-100 md:aspect-[21/9]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <PlaceImageFallback category={category} className="h-full w-full" />
          )}
        </div>

        <div className="px-section-sm py-section-y md:px-section-x">
          <p className="font-ui text-label uppercase tracking-ui-label text-hbb-green">
            {t(`categories.${category}`)}
          </p>
          <h1 className="mt-3 font-ui text-ui-2xl font-medium text-hbb-black md:text-[2rem]">
            {place.name}
          </h1>

          {place.description ? (
            <p className="mt-6 max-w-2xl font-ui text-ui-md text-gray-700">{place.description}</p>
          ) : null}

          {address || walkingLabel || transitLabel ? (
            <dl className="mt-8 max-w-2xl space-y-2 font-ui text-ui-sm text-gray-600">
              {address ? (
                <div>
                  <dt className="sr-only">{t('addressLabel')}</dt>
                  <dd>{address}</dd>
                </div>
              ) : null}
              {walkingLabel ? (
                <div>
                  <dt className="sr-only">{t('walkingLabel')}</dt>
                  <dd>{walkingLabel}</dd>
                </div>
              ) : null}
              {transitLabel ? (
                <div>
                  <dt className="sr-only">{t('transitLabel')}</dt>
                  <dd>{transitLabel}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {endorsements.length > 0 ? (
            <div className="mt-8 max-w-2xl">
              <EndorsementChipList
                endorsements={endorsements}
                recommendedByLabel={tMap('recommendedBy')}
              />
            </div>
          ) : null}

          {mapSettings.accessToken && mapPlace ? (
            <div className="mt-12 overflow-hidden border border-gray-200">
              <PlacesMapView
                accessToken={mapSettings.accessToken}
                bounds={mapSettings.bounds}
                center={{ lat: mapPlace.latitude, lng: mapPlace.longitude }}
                places={[mapPlace]}
                hotelName={mapSettings.hotelName}
                ariaLabel={t('mapAria')}
                noscriptHtml={t.raw('mapNoscript') as string}
                pinVariant="category"
                cardEmphasis="place"
                showCard={false}
                compact
                autoSelectFirst
              />
            </div>
          ) : null}

          <LineCta href="/neighbourhood" className="mt-12 font-ui text-xs uppercase tracking-widest">
            {t('backToList')}
          </LineCta>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
