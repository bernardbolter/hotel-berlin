import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { HereSubpage } from '@/components/here/HereSubpage'
import { TipCard } from '@/components/here/TipCard'
import { NeighbourhoodFullMap } from '@/components/map/NeighbourhoodFullMap'
import { FilterChipBar } from '@/components/neighbourhood/FilterChipBar'
import { ToggleFilterGroup } from '@/components/neighbourhood/ToggleFilterGroup'
import { herePageMetadata } from '@/lib/here/canonical'
import { getExploreTips } from '@/lib/here/getHubTips'
import { getMapSettings } from '@/lib/map/settings'
import { mapPlaceLabels, toMapViewPlace } from '@/lib/map/toMapPlace'
import {
  PLACE_CATEGORIES,
  TARGET_AUDIENCES,
  type IndoorOutdoor,
  type PlaceCategory,
  type TargetAudience,
} from '@/lib/neighbourhood/constants'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function isPlaceCategory(value: string | undefined): value is PlaceCategory {
  return PLACE_CATEGORIES.includes(value as PlaceCategory)
}

function isIndoorOutdoor(value: string | undefined): value is IndoorOutdoor {
  return value === 'indoor' || value === 'outdoor' || value === 'both'
}

function isTargetAudience(value: string | undefined): value is TargetAudience {
  return TARGET_AUDIENCES.includes(value as TargetAudience)
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/explore',
    locale,
    t('pages.explore.title'),
    t('pages.explore.intro'),
  )
}

export default async function HereExplorePage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('here')
  const tExplore = await getTranslations('here.pages.explore')
  const tRow = await getTranslations('here.peopleRow')
  const tCat = await getTranslations('neighbourhood.categories')
  const tNb = await getTranslations('neighbourhood')

  const categoryRaw = first(sp.category)
  const category = isPlaceCategory(categoryRaw) ? categoryRaw : null
  const indoorRaw = first(sp.indoor)
  const indoorOutdoor = isIndoorOutdoor(indoorRaw) ? indoorRaw : null
  const audienceRaw = first(sp.audience)
  const audience = isTargetAudience(audienceRaw) ? audienceRaw : null

  const copy = {
    walk: (minutes: number) => tRow('walk', { minutes }),
    room: (n: string) => tRow('room', { n }),
    placeholder: tRow('placeholder'),
    noEndorser: tRow('noEndorser'),
    roleFallback: tRow('roleFallback'),
    categoryLabel: (value: PlaceCategory) => tCat(value),
    roles: {
      'iris-berndt': tRow('roles.iris-berndt'),
      'christiane-fritsch-weith': tRow('roles.christiane-fritsch-weith'),
      'jennifer-oeser': tRow('roles.jennifer-oeser'),
      'kristiane-kegelmann': tRow('roles.kristiane-kegelmann'),
      'gita-kurdpoor': tRow('roles.gita-kurdpoor'),
      'gita-kudpoor': tRow('roles.gita-kurdpoor'),
      'katja-morkel': tRow('roles.katja-morkel'),
    },
  }

  const [mapSettings, { places, cards }] = await Promise.all([
    getMapSettings(),
    getExploreTips(locale, copy, { category, indoorOutdoor, audience }),
  ])

  const mapPlaces = places
    .map((place) =>
      toMapViewPlace(
        place as NeighbourhoodPlaceDoc,
        mapPlaceLabels(place as NeighbourhoodPlaceDoc, {
          category: (value) => tCat(value as PlaceCategory),
          walking: (minutes) => tNb('walkingMinutes', { minutes }),
          transit: (args) => tNb('transitLine', args),
        }),
      ),
    )
    .filter((p): p is NonNullable<typeof p> => p != null)

  const countLabel =
    cards.length === 1
      ? tExplore('countOne')
      : tExplore('count', { count: cards.length })

  const categoryOptions = PLACE_CATEGORIES.map((value) => ({
    value,
    label: tCat(value),
  }))

  const audienceOptions = TARGET_AUDIENCES.map((value) => ({
    value,
    label: tExplore(`audiences.${value}`),
  }))

  return (
    <HereSubpage
      title={tExplore('title')}
      intro={tExplore('intro')}
      backLabel={t('backToHub')}
      footer={
        <>
          <div className="border-y border-gray-200">
            {mapSettings.accessToken ? (
              <NeighbourhoodFullMap
                accessToken={mapSettings.accessToken}
                bounds={mapSettings.bounds}
                center={mapSettings.center}
                places={mapPlaces}
                hotelName={mapSettings.hotelName}
                ariaLabel={tExplore('mapAria')}
                noscriptHtml={tExplore.raw('mapNoscript') as string}
              />
            ) : (
              <div className="flex min-h-105 items-center justify-center bg-gray-100 px-6 text-center font-ui text-ui-sm text-gray-500">
                {tExplore('mapUnavailable')}
              </div>
            )}
          </div>
          <div className="site-shell px-section-sm py-section-y md:px-section-x">
            {cards.length === 0 ? (
              <p className="font-ui text-ui-sm text-gray-500">{tExplore('empty')}</p>
            ) : (
              <ul role="list" aria-label={tExplore('listAria')} className="hub-row">
                {cards.map((tip) => (
                  <li key={tip.slug} className="min-w-0">
                    <TipCard {...tip} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      }
    >
      <Suspense fallback={<div className="h-24 animate-pulse bg-gray-100" aria-hidden="true" />}>
        <div className="flex flex-col gap-6">
          <FilterChipBar
            pathname="/here/explore"
            options={categoryOptions}
            param="category"
            activeValue={category}
            ariaLabel={tExplore('categoryFilterAria')}
            allLabel={tExplore('allCategories')}
          />
          <ToggleFilterGroup
            pathname="/here/explore"
            param="indoor"
            activeValue={indoorOutdoor}
            ariaLabel={tExplore('indoorFilterAria')}
            options={[
              { value: 'indoor', label: tExplore('indoor') },
              { value: 'outdoor', label: tExplore('outdoor') },
              { value: 'both', label: tExplore('indoorOutdoorBoth') },
            ]}
          />
          <FilterChipBar
            pathname="/here/explore"
            options={audienceOptions}
            param="audience"
            activeValue={audience}
            ariaLabel={tExplore('audienceFilterAria')}
            allLabel={tExplore('allAudiences')}
            uppercase={false}
          />
        </div>
      </Suspense>
      <p className="mt-6 font-ui text-ui-sm text-gray-600" data-explore-count={cards.length}>
        {countLabel}
      </p>
    </HereSubpage>
  )
}
