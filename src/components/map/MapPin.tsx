'use client'

import { type LucideIcon } from 'lucide-react'

import { HOTEL_PIN_COLOR, pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type MapPinProps = {
  variant: 'hotel' | 'category'
  /** Required when variant is `category`. */
  category?: PlaceCategory
  icon: LucideIcon
  label: string
  /** Accessible name — e.g. "{place}, {category}" or hotel full name. */
  ariaLabel: string
  isActive: boolean
  /**
   * Category pins: hover/focus/touch-reveal. Hotel pin labels are always shown
   * regardless of this prop.
   */
  labelVisible?: boolean
  onSelect: () => void
  className?: string
}

/**
 * Map marker button — hotel (42px, ink, always-labeled) or category (32px, muted fill).
 * Mounted into Mapbox marker hosts via createRoot.
 */
export function MapPin({
  variant,
  category,
  icon: Icon,
  label,
  ariaLabel,
  isActive,
  labelVisible = false,
  onSelect,
  className = '',
}: MapPinProps) {
  const isHotel = variant === 'hotel'
  const showLabel = isHotel || labelVisible || isActive
  const fill = isHotel
    ? HOTEL_PIN_COLOR
    : category
      ? pinColorForCategory(category)
      : HOTEL_PIN_COLOR

  const size = isHotel ? 'h-[42px] w-[42px]' : isActive ? 'h-9 w-9' : 'h-8 w-8'
  const iconSize = isHotel ? 20 : isActive ? 16 : 14

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <span
        className={`pointer-events-none mb-1 max-w-36 truncate rounded-sm bg-white/95 px-1.5 py-0.5 font-ui text-[11px] font-medium leading-tight text-hbb-black shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-opacity duration-150 ${
          showLabel ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!showLabel}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isActive}
        onClick={onSelect}
        className={`pointer-events-auto flex ${size} shrink-0 items-center justify-center rounded-full shadow-md ring-2 ring-white transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-hbb-forest ${
          isActive ? 'scale-110 ring-[3px] shadow-lg' : ''
        }`}
        style={{ backgroundColor: fill }}
      >
        <Icon aria-hidden="true" size={iconSize} strokeWidth={1.75} className="text-white" />
      </button>
    </div>
  )
}
