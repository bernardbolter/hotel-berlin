'use client'

import { useMemo, useState } from 'react'
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
import type { MapBounds } from '@/lib/map/config'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type FullMapPlace = {
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

type Props = {
  accessToken: string
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: FullMapPlace[]
  hotelName: string
  hotelAriaLabel?: string
  ariaLabel: string
  noscriptHtml: string
}

/**
 * Full `/nachbarschaft` map — same MapPin + PlaceInfoCard treatment as the teaser,
 * with filters/pagination owned by the page above.
 */
export function NeighbourhoodFullMap({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  hotelAriaLabel,
  ariaLabel,
  noscriptHtml,
}: Props) {
  const t = useTranslations('heroMap')
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
      })),
    [places],
  )

  const card = selected ? (
    <PlaceInfoCard
      image={selected.image}
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
      onClose={() => setSelectedId(null)}
      closeLabel={t('closeCard')}
      className="w-full md:w-[268px]"
    />
  ) : null

  return (
    <div className="relative w-full">
      <div className="relative min-h-105 w-full">
        <NeighbourhoodGuideMap
          accessToken={accessToken}
          bounds={bounds}
          center={center}
          places={guidePlaces}
          hotelName={hotelName}
          hotelAriaLabel={hotelAriaLabel}
          selectedId={selectedId}
          onSelect={setSelectedId}
          ariaLabel={ariaLabel}
          noscriptHtml={noscriptHtml}
          pinColorMode="category"
          className="min-h-105!"
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
