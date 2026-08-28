'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  NeighbourhoodGuideMap,
  type GuideMapPlace,
} from '@/components/map/NeighbourhoodGuideMap'
import {
  PlaceInfoCard,
  type PlaceInfoCardEndorsement,
  type PlaceInfoCardImageCredit,
  type PlaceInfoCardTransit,
} from '@/components/map/PlaceInfoCard'
import {
  TeaserPlaceList,
} from '@/components/map/TeaserPlaceIndex'
import type { MapBounds } from '@/lib/map/config'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import {
  HOMEPAGE_FEATURED_PAGE_SIZE,
  type PlaceCategory,
} from '@/lib/neighbourhood/constants'

const FALLBACK_IMAGE = '/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg'

export type MapTeaserPlace = {
  id: string
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel: string
  description?: string | null
  walkingMinutes?: number | null
  walkingLabel?: string
  priceRange?: string | null
  transit?: PlaceInfoCardTransit | null
  transitLabel?: string
  image?: { src: string; alt: string } | null
  imageCredit?: PlaceInfoCardImageCredit | null
  endorsements: PlaceInfoCardEndorsement[]
  latitude: number
  longitude: number
}

/** @deprecated Use MapTeaserPlace */
export type HomepageMapTeaserPlace = MapTeaserPlace

type Props = {
  accessToken: string | null
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: MapTeaserPlace[]
  hotelName: string
  hotelAriaLabel: string
  shortAddress: string
  fallbackImageSrc?: string
  /** Accent kept for API compatibility (consent CTA removed for now). */
  accent?: 'forest' | 'teal'
  /** Compact embed for the /here hub card (wireframe 160–280px). */
  variant?: 'full' | 'compact'
  /** Homepage: compact name list floating on the map. */
  showPlaceNav?: boolean
}

/**
 * Homepage /here map teaser — live Mapbox with curated pins.
 * Cookie consent gate temporarily skipped: map loads whenever a token is present.
 */
export function HomepageMapTeaser({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  hotelAriaLabel,
  shortAddress,
  fallbackImageSrc = FALLBACK_IMAGE,
  variant = 'full',
  showPlaceNav = false,
}: Props) {
  const t = useTranslations('heroMap')
  const compact = variant === 'compact'
  const showPanel = showPlaceNav && !compact
  /** Homepage: five places for now (pagination of 15 comes back later). */
  const visiblePlaces = showPanel
    ? places.slice(0, HOMEPAGE_FEATURED_PAGE_SIZE)
    : places
  const pagePlaces = visiblePlaces
  const [selectedId, setSelectedId] = useState<string | null>(pagePlaces[0]?.id ?? null)

  useEffect(() => {
    if (pagePlaces.length === 0) {
      setSelectedId(null)
      return
    }
    if (!pagePlaces.some((p) => p.id === selectedId)) {
      setSelectedId(pagePlaces[0].id)
    }
  }, [pagePlaces, selectedId])

  const selected = pagePlaces.find((p) => p.id === selectedId) ?? pagePlaces[0] ?? null
  const effectiveSelectedId = selected?.id ?? null

  const guidePlaces: GuideMapPlace[] = useMemo(
    () =>
      pagePlaces.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        categoryLabel: p.categoryLabel,
        description: p.description,
        walkingMinutes: p.walkingMinutes,
        walkingLabel: p.walkingLabel,
        latitude: p.latitude,
        longitude: p.longitude,
        endorserCount: p.endorsements.length,
      })),
    [pagePlaces],
  )

  const listItems = useMemo(
    () =>
      pagePlaces.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
      })),
    [pagePlaces],
  )

  const mapHeight = compact
    ? 'h-[160px] md:h-[220px] lg:h-[280px]'
    : showPanel
      ? 'h-[min(48vh,360px)] min-h-64 md:h-[min(70vh,640px)] md:min-h-100'
      : 'h-[min(70vh,640px)] min-h-100'

  if (!accessToken) {
    return (
      <div className={`homepage-map-teaser relative w-full overflow-hidden bg-hbb-page ${mapHeight}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackImageSrc}
          alt={t('fallbackAlt')}
          className="h-full w-full object-cover"
        />
        <p className="absolute bottom-0 left-0 right-0 bg-black/55 px-4 py-3 font-serif text-[15px] leading-snug text-white">
          {shortAddress}
        </p>
      </div>
    )
  }

  const card = selected ? (
    <PlaceInfoCard
      image={selected.image}
      imageCredit={selected.imageCredit}
      category={{
        label: selected.categoryLabel,
        token: pinColorForCategory(selected.category),
      }}
      categoryKey={selected.category}
      name={selected.name}
      placeSlug={selected.slug}
      description={selected.description}
      walkingMinutes={selected.walkingMinutes}
      walkingLabel={selected.walkingLabel}
      transit={selected.transit}
      transitLabel={selected.transitLabel}
      endorsements={selected.endorsements}
      recommendedByLabel={t('recommendedBy')}
      className="w-full md:w-[268px]"
    />
  ) : null

  const placeList =
    showPanel && listItems.length > 0 ? (
      <TeaserPlaceList
        places={listItems}
        selectedId={effectiveSelectedId}
        onSelect={setSelectedId}
        ariaLabel={t('placeListAria')}
      />
    ) : null

  return (
    <div className="homepage-map-teaser relative w-full text-hbb-black">
      <div className={`relative w-full ${mapHeight}`}>
        <NeighbourhoodGuideMap
          accessToken={accessToken}
          bounds={bounds}
          center={center}
          places={guidePlaces}
          hotelName={hotelName}
          hotelAriaLabel={hotelAriaLabel}
          hideNavigation={compact}
          styleId="mapbox/standard"
          fitPadding={compact ? 32 : 64}
          pinColorMode="category"
          pinTabOrder={showPanel ? 'source' : 'geographic'}
          selectedId={compact ? null : effectiveSelectedId}
          onSelect={!compact && visiblePlaces.length > 0 ? setSelectedId : undefined}
          ariaLabel={t('mapAria')}
          noscriptHtml={t.raw('noscript') as string}
          className={
            compact ? 'h-full!' : showPanel ? 'h-full! min-h-0! md:min-h-100!' : 'h-full! min-h-100!'
          }
        />

        {!compact && card ? (
          <div className="pointer-events-none absolute left-4 top-4 z-10 hidden md:left-14 md:block">
            <div className="pointer-events-auto">{card}</div>
          </div>
        ) : null}

        {placeList ? (
          <aside className="pointer-events-none absolute top-4 right-4 z-10 hidden w-[min(15rem,calc(100%-22rem))] md:block">
            <div className="pointer-events-auto bg-white/92 py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
              {placeList}
            </div>
          </aside>
        ) : null}
      </div>

      {!compact && (card || placeList) ? (
        <div className="flex items-stretch gap-3 border-t border-black/5 bg-hbb-page p-3 md:hidden">
          {card ? <div className="min-w-0 flex-1">{card}</div> : null}
          {placeList ? (
            <aside className="w-[min(12.5rem,42%)] shrink-0">
              <div className="h-full bg-white py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
                {placeList}
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
