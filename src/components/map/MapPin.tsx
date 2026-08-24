'use client'

import { type LucideIcon } from 'lucide-react'

import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { HOTEL_PIN_COLOR, pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type MapPinVariant = 'hotel' | 'category' | 'person'

export type MapPinProps = {
  /**
   * `hotel` — 42px ink house, always-labeled.
   * `category` — 32px addendum-v2 category fill + glyph (destinations map).
   * `person` — 32px portrait / initials-on-ink at the pick's existing lat/long
   * (recommendations map). Same a11y contract as category; different skin.
   */
  variant: MapPinVariant
  /** Required when variant is `category`. */
  category?: PlaceCategory
  /** Required when variant is `hotel` or `category`. */
  icon?: LucideIcon
  /** Person pin portrait. Initials fallback when missing. */
  portraitUrl?: string | null
  initials?: string
  /** Person display name for the avatar (hover `label` is the place, not the person). */
  personName?: string
  label: string
  /** Accessible name — e.g. "{place}, {category}" or "{place}, {person}". */
  ariaLabel: string
  isActive: boolean
  /**
   * Category/person pins: hover/focus/touch-reveal. Hotel pin labels are always shown
   * regardless of this prop.
   */
  labelVisible?: boolean
  onSelect: () => void
  className?: string
  /**
   * Extra endorsers beyond the one shown on the pin (`endorsements.length - 1`).
   * Renders a "+N" badge when ≥ 1. Category and person variants both use this;
   * hotel does not.
   */
  extraEndorserCount?: number
}

/**
 * Map marker button. Variants share focus-visible label reveal, aria-label, and
 * the parent canvas's touch first-tap-reveals / second-tap-opens — do not fork
 * that logic per variant.
 */
export function MapPin({
  variant,
  category,
  icon: Icon,
  portraitUrl,
  initials,
  personName,
  label,
  ariaLabel,
  isActive,
  labelVisible = false,
  onSelect,
  className = '',
  extraEndorserCount = 0,
}: MapPinProps) {
  const isHotel = variant === 'hotel'
  const isPerson = variant === 'person'
  const showLabel = isHotel || labelVisible || isActive
  const fill = isHotel || isPerson
    ? HOTEL_PIN_COLOR
    : category
      ? pinColorForCategory(category)
      : HOTEL_PIN_COLOR

  const size = isHotel ? 'h-[42px] w-[42px]' : isActive ? 'h-9 w-9' : 'h-8 w-8'
  const iconSize = isHotel ? 20 : isActive ? 16 : 14
  const showExtra = !isHotel && extraEndorserCount > 0

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <span
        className={`pointer-events-none mb-1 max-w-40 truncate rounded-sm bg-white/95 px-1.5 py-0.5 font-ui text-[11px] font-medium leading-tight text-hbb-black shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-opacity duration-150 ${
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
        className={`pointer-events-auto relative flex ${size} shrink-0 items-center justify-center overflow-visible rounded-full shadow-md ring-2 ring-white transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-hbb-forest ${
          isActive ? 'scale-110 ring-[3px] shadow-lg' : ''
        }`}
        style={{ backgroundColor: fill }}
      >
        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          {isPerson ? (
            <InitialsAvatar
              name={personName ?? label}
              initials={initials}
              portraitUrl={portraitUrl}
              portraitAlt=""
              size={isActive ? 'pinActive' : 'pin'}
            />
          ) : Icon ? (
            <Icon aria-hidden="true" size={iconSize} strokeWidth={1.75} className="text-white" />
          ) : null}
        </span>
        {showExtra ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 font-ui text-[9px] font-semibold leading-none text-hbb-black shadow-sm ring-1 ring-black/10"
            aria-hidden="true"
          >
            +{extraEndorserCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}
