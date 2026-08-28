'use client'

import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type TeaserPlaceListItem = {
  id: string
  name: string
  category: PlaceCategory
}

type ListProps = {
  places: TeaserPlaceListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  ariaLabel: string
  className?: string
}

/**
 * Compact place nav — category color dot + name. Selecting a row pans/opens the same place as its pin.
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
    <ul role="list" aria-label={ariaLabel} className={className}>
      {places.map((place) => {
        const selected = place.id === selectedId

        return (
          <li key={place.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(place.id)}
              className={`flex w-full items-center gap-2 px-2.5 py-1 text-left font-ui text-[12px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest ${
                selected
                  ? 'font-medium text-hbb-black'
                  : 'text-[#1F1F1F]/70 hover:text-hbb-black'
              }`}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: pinColorForCategory(place.category) }}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate">{place.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

