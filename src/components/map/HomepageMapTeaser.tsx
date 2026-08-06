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
  readMapConsent,
  writeMapConsent,
  type MapConsentStatus,
} from '@/lib/consent/mapConsent'
import type { MapBounds } from '@/lib/map/config'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

const FALLBACK_IMAGE = '/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg'

/** Layout-test placeholder — replace with real/Commons photos before launch. */
function placeholderImageSrc(slug: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/536/335`
}

export type MapTeaserPlace = {
  id: string
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel: string
  description?: string | null
  walkingMinutes?: number | null
  walkingLabel?: string
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
  /** Accent for consent CTA — forest (outside) or teal (inside /here). */
  accent?: 'forest' | 'teal'
}

export function HomepageMapTeaser({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  hotelAriaLabel,
  shortAddress,
  fallbackImageSrc = FALLBACK_IMAGE,
  accent = 'forest',
}: Props) {
  const t = useTranslations('heroMap')
  const [consent, setConsent] = useState<MapConsentStatus>('pending')
  const [hydrated, setHydrated] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(places[0]?.id ?? null)

  useEffect(() => {
    setConsent(readMapConsent())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (places.length === 0) {
      setSelectedId(null)
      return
    }
    if (!places.some((p) => p.id === selectedId)) {
      setSelectedId(places[0].id)
    }
  }, [places, selectedId])

  const selected = places.find((p) => p.id === selectedId) ?? places[0] ?? null
  const effectiveSelectedId = selected?.id ?? null

  const guidePlaces: GuideMapPlace[] = useMemo(
    () =>
      places.map((p) => ({
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
      })),
    [places],
  )

  function grantConsent() {
    writeMapConsent('granted')
    setConsent('granted')
  }

  function declineConsent() {
    writeMapConsent('declined')
    setConsent('declined')
  }

  if (!hydrated) {
    return (
      <div
        className="homepage-map-teaser h-[min(70vh,640px)] min-h-100 w-full animate-pulse bg-gray-100"
        aria-hidden="true"
      />
    )
  }

  if (consent === 'declined' || (!accessToken && consent === 'granted')) {
    return (
      <div className="homepage-map-teaser relative h-[min(70vh,640px)] min-h-100 w-full overflow-hidden bg-hbb-page">
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

  if (consent === 'pending' || !accessToken) {
    return (
      <div className="homepage-map-teaser flex h-[min(70vh,640px)] min-h-100 w-full flex-col items-center justify-center gap-3 bg-gray-100 px-4 text-center">
        <p className="max-w-sm font-ui text-ui-md text-gray-600">{t('cookiesRequired')}</p>
        <button
          type="button"
          onClick={grantConsent}
          className="rounded-sm px-5 py-2.5 font-ui text-ui-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest"
          style={{ backgroundColor: accent === 'teal' ? '#2C6B7A' : '#56674F' }}
        >
          {t('enableMap')}
        </button>
        <button
          type="button"
          onClick={declineConsent}
          className="font-ui text-ui-xs text-gray-500 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest"
        >
          {t('declineMap')}
        </button>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="homepage-map-teaser flex h-[min(70vh,640px)] min-h-100 w-full items-center justify-center bg-gray-100 px-4 text-center">
        <p className="font-ui text-ui-sm text-gray-500">{t('empty')}</p>
      </div>
    )
  }

  const cardImage = selected
    ? selected.image?.src
      ? selected.image
      : { src: placeholderImageSrc(selected.slug), alt: selected.name }
    : null

  const card = selected ? (
    <PlaceInfoCard
      image={cardImage}
      imageCredit={selected.imageCredit}
      category={{
        label: selected.categoryLabel,
        token: pinColorForCategory(selected.category),
      }}
      name={selected.name}
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

  return (
    <div className="homepage-map-teaser relative w-full text-hbb-black">
      <div className="relative h-[min(70vh,640px)] min-h-100 w-full">
        <NeighbourhoodGuideMap
          accessToken={accessToken}
          bounds={bounds}
          center={center}
          places={guidePlaces}
          hotelName={hotelName}
          hotelAriaLabel={hotelAriaLabel}
          hideNavigation={false}
          cooperativeGestures={false}
          styleId="mapbox/standard"
          fitPadding={64}
          pinColorMode="category"
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          ariaLabel={t('mapAria')}
          noscriptHtml={t.raw('noscript') as string}
          className="h-full! min-h-100!"
        />

        {/* Floating card — desktop only; mobile renders below */}
        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden md:block">
          <div className="pointer-events-auto">{card}</div>
        </div>
      </div>

      {/* Mobile: card in document flow under the map */}
      <div className="border-t border-black/5 bg-hbb-page p-3 md:hidden">{card}</div>
    </div>
  )
}
