import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { NeighbourhoodFullMap } from '@/components/map/NeighbourhoodFullMap'
import { FilterChipBar } from '@/components/neighbourhood/FilterChipBar'
import { FurtherOutToggle } from '@/components/neighbourhood/FurtherOutToggle'
import { PaginationNav } from '@/components/neighbourhood/PaginationNav'
import { PlaceCard } from '@/components/neighbourhood/PlaceCard'
import { SearchFilter } from '@/components/neighbourhood/SearchFilter'
import { ToggleFilterGroup } from '@/components/neighbourhood/ToggleFilterGroup'
import { LineCta } from '@/components/primitives/LineCta'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { getAllPlacesForSchema } from '@/lib/aeo/resolve'
import {
  buildNeighbourhoodListGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getMapSettings } from '@/lib/map/settings'
import { personInitials } from '@/lib/people/initials'
import {
  getNeighbourhoodPlaces,
  PLACE_CATEGORIES,
  type DistanceTier,
  type IndoorOutdoor,
  type NeighbourhoodPlaceDoc,
  type PlaceCategory,
} from '@/lib/queries/neighbourhoodPlaces'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function mediaUrl(image: NeighbourhoodPlaceDoc['image']): string | null {
  return typeof image === 'object' && image && image.url ? image.url : null
}

function mediaAlt(image: NeighbourhoodPlaceDoc['image']): string {
  return typeof image === 'object' && image && image.alt ? image.alt : ''
}

function personFromEndorsement(
  person: NonNullable<NeighbourhoodPlaceDoc['endorsements']>[number]['person'],
): { slug: string; name: string } | null {
  if (!person || typeof person !== 'object') return null
  if (typeof person.slug !== 'string') return null
  return { slug: person.slug, name: person.name }
}

function isPlaceCategory(value: string | undefined): value is PlaceCategory {
  return PLACE_CATEGORIES.includes(value as PlaceCategory)
}

function isDistanceTier(value: string | undefined): value is DistanceTier {
  return value === 'walkable' || value === 'short-transit' || value === 'further-out'
}

function isIndoorOutdoor(value: string | undefined): value is IndoorOutdoor {
  return value === 'indoor' || value === 'outdoor' || value === 'both'
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'neighbourhood' })

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('subtitle'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/nachbarschaft' : 'en/neighbourhood'}`,
      languages: {
        de: 'https://hotel-berlin.de/de/nachbarschaft',
        en: 'https://hotel-berlin.de/en/neighbourhood',
        'x-default': 'https://hotel-berlin.de/de/nachbarschaft',
      },
    },
  }
}

export default async function NeighbourhoodPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('neighbourhood')

  const categoryRaw = first(sp.category)
  const category = isPlaceCategory(categoryRaw) ? categoryRaw : null
  const distanceRaw = first(sp.distance)
  const distanceTier = isDistanceTier(distanceRaw) ? distanceRaw : null
  const indoorRaw = first(sp.indoor)
  const indoorOutdoor = isIndoorOutdoor(indoorRaw) ? indoorRaw : null
  const search = first(sp.search) ?? null
  const page = Math.max(1, Number(first(sp.page) ?? '1') || 1)
  const showFurtherOut = first(sp.further) === '1'

  const [mapSettings, result, mapResult, schemaPlaces] = await Promise.all([
    getMapSettings(),
    getNeighbourhoodPlaces({
      locale,
      category,
      distanceTier,
      defaultWalkable: !showFurtherOut && !distanceTier,
      indoorOutdoor,
      search,
      page,
    }),
    getNeighbourhoodPlaces({
      locale,
      category,
      distanceTier,
      defaultWalkable: !showFurtherOut && !distanceTier,
      indoorOutdoor,
      search,
      unpaginated: true,
    }),
    // JSON-LD always describes the full active set, independent of filters/pagination.
    getAllPlacesForSchema(locale),
  ])

  const listGraph = buildNeighbourhoodListGraph(schemaPlaces, defaultConfig)

  const places = result.docs
  const totalPages = result.totalPages

  const preservedQuery = {
    category: category ?? undefined,
    distance: distanceTier ?? undefined,
    indoor: indoorOutdoor ?? undefined,
    search: search ?? undefined,
    further: showFurtherOut ? '1' : undefined,
  }

  const categoryOptions = PLACE_CATEGORIES.map((value) => ({
    value,
    label: t(`categories.${value}`),
  }))

  const mapPlaces = mapResult.docs
    .filter((place) => place.geo?.latitude != null && place.geo?.longitude != null)
    .map((place) => {
      const transitRaw = place.transit
      const transit =
        transitRaw?.minutes != null && transitRaw.station && transitRaw.line
          ? {
              minutes: transitRaw.minutes,
              station: transitRaw.station,
              line: transitRaw.line,
            }
          : null

      const imageSrc = mediaUrl(place.image)
      const creditText = place.imageCredit?.creditText?.trim()
      const imageCredit = creditText
        ? {
            creditText,
            creditUrl: place.imageCredit?.creditUrl?.trim() || null,
          }
        : null
      const endorsements =
        place.endorsements
          ?.map((entry) => personFromEndorsement(entry.person))
          .filter((p): p is { slug: string; name: string } => p != null)
          .map((p) => ({
            person: {
              name: p.name,
              slug: p.slug,
              initials: personInitials(p.name),
            },
          })) ?? []

      return {
        id: String(place.id),
        slug: place.slug,
        name: place.name,
        category: place.category,
        categoryLabel: t(`categories.${place.category}`),
        description: place.description,
        walkingMinutes: place.walkingMinutes,
        walkingLabel:
          place.walkingMinutes != null
            ? t('walkingMinutes', { minutes: place.walkingMinutes })
            : undefined,
        transit,
        transitLabel: transit
          ? t('transitLine', {
              minutes: transit.minutes,
              line: transit.line,
              station: transit.station,
            })
          : undefined,
        image: imageSrc
          ? { src: imageSrc, alt: mediaAlt(place.image) || place.name }
          : null,
        imageCredit,
        endorsements,
        latitude: place.geo!.latitude!,
        longitude: place.geo!.longitude!,
      }
    })

  return (
    <>
      <JsonLdScript graph={listGraph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="px-section-sm pb-8 pt-10 md:px-section-x">
          <SectionHeading
            label={t('label')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
        </div>

        <div className="border-y border-gray-200">
          {mapSettings.accessToken ? (
            <NeighbourhoodFullMap
              accessToken={mapSettings.accessToken}
              bounds={mapSettings.bounds}
              center={mapSettings.center}
              places={mapPlaces}
              hotelName={mapSettings.hotelName}
              ariaLabel={t('mapAria')}
              noscriptHtml={t.raw('mapNoscript') as string}
            />
          ) : (
            <div className="flex min-h-105 items-center justify-center bg-gray-100 px-6 text-center font-ui text-ui-sm text-gray-500">
              {t('mapUnavailable')}
            </div>
          )}
        </div>

        <div className="px-section-sm py-section-y md:px-section-x">
          <Suspense
            fallback={<div className="h-24 animate-pulse bg-gray-100" aria-hidden="true" />}
          >
            <div className="flex flex-col gap-6">
              <SearchFilter
                pathname="/neighbourhood"
                initialValue={search ?? ''}
                placeholder={t('searchPlaceholder')}
                submitLabel={t('searchSubmit')}
                clearLabel={t('searchClear')}
              />

              <FilterChipBar
                pathname="/neighbourhood"
                options={categoryOptions}
                param="category"
                activeValue={category}
                ariaLabel={t('categoryFilterAria')}
                allLabel={t('allCategories')}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <ToggleFilterGroup
                  pathname="/neighbourhood"
                  param="indoor"
                  activeValue={indoorOutdoor}
                  ariaLabel={t('indoorFilterAria')}
                  options={[
                    { value: 'indoor', label: t('indoor') },
                    { value: 'outdoor', label: t('outdoor') },
                  ]}
                />

                <FurtherOutToggle
                  showFurtherOut={showFurtherOut}
                  label={t('showFurtherOut')}
                  hideLabel={t('hideFurtherOut')}
                />
              </div>

              {showFurtherOut ? (
                <ToggleFilterGroup
                  pathname="/neighbourhood"
                  param="distance"
                  activeValue={distanceTier}
                  ariaLabel={t('distanceFilterAria')}
                  options={[
                    { value: 'walkable', label: t('distance.walkable') },
                    { value: 'short-transit', label: t('distance.short-transit') },
                    { value: 'further-out', label: t('distance.further-out') },
                  ]}
                />
              ) : null}
            </div>
          </Suspense>

          {places.length === 0 ? (
            <p className="mt-10 font-ui text-ui-sm text-gray-500">{t('empty')}</p>
          ) : (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => {
                const endorsements =
                  place.endorsements
                    ?.map((entry) => personFromEndorsement(entry.person))
                    .filter((p): p is { slug: string; name: string } => p != null)
                    .map((p) => ({ personSlug: p.slug, personName: p.name })) ?? []

                return (
                  <li key={place.id}>
                    <PlaceCard
                      name={place.name}
                      slug={place.slug}
                      category={place.category}
                      categoryLabel={t(`categories.${place.category}`)}
                      walkingMinutes={place.walkingMinutes}
                      walkingLabel={
                        place.walkingMinutes != null
                          ? t('walkingMinutes', { minutes: place.walkingMinutes })
                          : undefined
                      }
                      description={place.description}
                      imageUrl={mediaUrl(place.image)}
                      imageAlt={mediaAlt(place.image)}
                      endorsements={endorsements}
                    />
                  </li>
                )
              })}
            </ul>
          )}

          <PaginationNav
            pathname="/neighbourhood"
            currentPage={page}
            totalPages={totalPages}
            query={preservedQuery}
            ariaLabel={t('paginationAria')}
            previousLabel={t('previous')}
            nextLabel={t('next')}
          />

          <div className="mt-16 border-t border-gray-200 pt-10">
            <p className="font-ui text-ui-sm text-gray-600">{t('bridgeIntro')}</p>
            <LineCta href="/you-me-berlin" className="mt-4 font-ui text-xs uppercase tracking-widest">
              {t('bridgeCta')}
            </LineCta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
