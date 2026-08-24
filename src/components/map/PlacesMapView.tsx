'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  NeighbourhoodGuideMap,
  type GuideMapPlace,
} from '@/components/map/NeighbourhoodGuideMap'
import {
  PlaceInfoCard,
  type PlaceInfoCardEmphasis,
  type PlaceInfoCardEndorsement,
  type PlaceInfoCardImageCredit,
  type PlaceInfoCardLeadPerson,
  type PlaceInfoCardTransit,
} from '@/components/map/PlaceInfoCard'
import type { MapPinVariant } from '@/components/map/MapPin'
import type { MapBounds } from '@/lib/map/config'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type MapViewPlace = {
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
  leadPerson?: PlaceInfoCardLeadPerson | null
  latitude: number
  longitude: number
}

type Props = {
  accessToken: string
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: MapViewPlace[]
  hotelName: string
  hotelAriaLabel?: string
  ariaLabel: string
  noscriptHtml: string
  pinVariant?: Exclude<MapPinVariant, 'hotel'>
  cardEmphasis?: PlaceInfoCardEmphasis
  /** When false, pins still select/label; no floating card. */
  showCard?: boolean
  compact?: boolean
  /** Select the first pin on load (person/place detail embeds). */
  autoSelectFirst?: boolean
  className?: string
}

/**
 * Shared destinations / recommendations map chrome.
 * Pin skin and card field-order are props — not a second Mapbox implementation.
 */
export function PlacesMapView({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  hotelAriaLabel,
  ariaLabel,
  noscriptHtml,
  pinVariant = 'category',
  cardEmphasis = 'place',
  showCard = true,
  compact = false,
  autoSelectFirst = false,
  className = '',
}: Props) {
  const t = useTranslations('heroMap')
  const [selectedId, setSelectedId] = useState<string | null>(
    autoSelectFirst ? (places[0]?.id ?? null) : null,
  )

  const placeIdsKey = places.map((p) => p.id).join('\0')

  useEffect(() => {
    if (!placeIdsKey) {
      setSelectedId(null)
      return
    }
    if (autoSelectFirst) {
      setSelectedId(placeIdsKey.split('\0')[0] ?? null)
      return
    }
    // Filter/unfilter rebuilds the visible set. Close the card even if the
    // previously selected place is still in the new list (Everyone after ?person=).
    setSelectedId(null)
  }, [placeIdsKey, autoSelectFirst])

  const selected = places.find((p) => p.id === selectedId) ?? null

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
        personPin: p.leadPerson
          ? {
              name: p.leadPerson.name,
              initials: p.leadPerson.initials,
              portraitUrl: p.leadPerson.portraitUrl,
            }
          : undefined,
        endorserCount: p.endorsements.length,
      })),
    [places],
  )

  const card =
    showCard && selected ? (
      <PlaceInfoCard
        emphasis={cardEmphasis}
        leadPerson={selected.leadPerson}
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
        onClose={compact ? undefined : () => setSelectedId(null)}
        closeLabel={t('closeCard')}
        className="w-full md:w-[268px]"
      />
    ) : null

  const mapHeight = compact
    ? 'h-[240px] min-h-[240px] md:h-[280px]'
    : 'min-h-105'

  return (
    <div className={`relative w-full ${className}`}>
      <div className={`relative w-full ${mapHeight}`}>
        <NeighbourhoodGuideMap
          accessToken={accessToken}
          bounds={bounds}
          center={center}
          places={guidePlaces}
          hotelName={hotelName}
          hotelAriaLabel={hotelAriaLabel}
          selectedId={selectedId}
          onSelect={setSelectedId}
          pinVariant={pinVariant}
          hideNavigation={compact}
          fitPadding={compact ? 40 : 48}
          ariaLabel={ariaLabel}
          noscriptHtml={noscriptHtml}
          className={compact ? 'h-full! min-h-[240px]!' : 'min-h-105!'}
        />

        {card ? (
          <div className="pointer-events-none absolute right-4 top-4 z-10 hidden md:block">
            <div className="pointer-events-auto">{card}</div>
          </div>
        ) : null}
      </div>

      {card ? (
        <div className="border-t border-black/5 bg-hbb-page p-3 md:hidden">{card}</div>
      ) : null}
    </div>
  )
}
