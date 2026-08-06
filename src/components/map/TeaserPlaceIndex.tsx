'use client'

import Image from 'next/image'

import { HOTEL_PIN_COLOR, pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type TeaserLegendCategory = {
  key: string
  label: string
  color: string
}

type LegendProps = {
  categories: TeaserLegendCategory[]
  ariaLabel: string
  className?: string
}

/** Compact color-key — only categories present in the current teaser set (+ hotel). */
export function TeaserCategoryLegend({ categories, ariaLabel, className = '' }: LegendProps) {
  if (categories.length === 0) return null

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
    >
      {categories.map((cat) => (
        <li key={cat.key} className="inline-flex items-center gap-1.5 font-ui text-[12px] text-hbb-black">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: cat.color }}
            aria-hidden="true"
          />
          <span>{cat.label}</span>
        </li>
      ))}
    </ul>
  )
}

export type TeaserPlaceListItem = {
  id: string
  name: string
  category: PlaceCategory
  imageSrc: string
  imageAlt: string
  recommenderName?: string
  walkingLabel?: string
}

type ListProps = {
  places: TeaserPlaceListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  ariaLabel: string
  className?: string
}

/**
 * Scannable index under the legend — tap target larger than a 32px pin.
 * Selecting a row pans/opens the same place as clicking its map pin.
 */
export function TeaserPlaceList({
  places,
  selectedId,
  onSelect,
  ariaLabel,
  className = '',
}: ListProps) {
  if (places.length === 0) return null

  return (
    <ul role="list" aria-label={ariaLabel} className={`divide-y divide-black/8 ${className}`}>
      {places.map((place) => {
        const selected = place.id === selectedId
        const color = pinColorForCategory(place.category)

        return (
          <li key={place.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(place.id)}
              className={`flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest ${
                selected ? 'bg-black/4' : 'hover:bg-black/3'
              }`}
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                <Image
                  src={place.imageSrc}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-ui text-[13px] font-medium text-hbb-black">
                    {place.name}
                  </span>
                </span>
                {(place.recommenderName || place.walkingLabel) && (
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 font-ui text-[11px] text-gray-500">
                    {place.recommenderName ? <span>{place.recommenderName}</span> : null}
                    {place.recommenderName && place.walkingLabel ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    {place.walkingLabel ? <span>{place.walkingLabel}</span> : null}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Build scoped legend entries from teaser places + hotel. */
export function buildTeaserLegendCategories(
  places: { category: PlaceCategory; categoryLabel: string }[],
  hotelLabel: string,
): TeaserLegendCategory[] {
  const seen = new Set<PlaceCategory>()
  const categories: TeaserLegendCategory[] = [
    { key: 'hotel', label: hotelLabel, color: HOTEL_PIN_COLOR },
  ]

  for (const place of places) {
    if (seen.has(place.category)) continue
    seen.add(place.category)
    categories.push({
      key: place.category,
      label: place.categoryLabel,
      color: pinColorForCategory(place.category),
    })
  }

  return categories
}
