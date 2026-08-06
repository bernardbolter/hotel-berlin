'use client'

import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import { Home, type LucideIcon } from 'lucide-react'

import { MapPin } from '@/components/map/MapPin'
import { CATEGORY_LUCIDE_ICON } from '@/lib/neighbourhood/categoryIcons'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type MountedPinHandle = {
  element: HTMLElement
  root: Root
  update: (next: MountCategoryPinOptions | MountHotelPinOptions) => void
  unmount: () => void
}

type MountHotelPinOptions = {
  variant: 'hotel'
  label: string
  ariaLabel: string
  isActive?: boolean
  onSelect?: () => void
}

type MountCategoryPinOptions = {
  variant: 'category'
  category: PlaceCategory
  label: string
  ariaLabel: string
  isActive: boolean
  labelVisible: boolean
  onSelect: () => void
  icon?: LucideIcon
}

function renderPin(root: Root, options: MountCategoryPinOptions | MountHotelPinOptions) {
  if (options.variant === 'hotel') {
    root.render(
      createElement(MapPin, {
        variant: 'hotel',
        icon: Home,
        label: options.label,
        ariaLabel: options.ariaLabel,
        isActive: options.isActive ?? false,
        labelVisible: true,
        onSelect: options.onSelect ?? (() => undefined),
      }),
    )
    return
  }

  const Icon = options.icon ?? CATEGORY_LUCIDE_ICON[options.category]
  root.render(
    createElement(MapPin, {
      variant: 'category',
      category: options.category,
      icon: Icon,
      label: options.label,
      ariaLabel: options.ariaLabel,
      isActive: options.isActive,
      labelVisible: options.labelVisible,
      onSelect: options.onSelect,
    }),
  )
}

/** Host element + React root for a Mapbox marker. */
export function mountMapPin(
  options: MountCategoryPinOptions | MountHotelPinOptions,
): MountedPinHandle {
  const element = document.createElement('div')
  element.className = 'hbb-map-pin-host'
  const root = createRoot(element)
  renderPin(root, options)

  return {
    element,
    root,
    update: (next) => renderPin(root, next),
    unmount: () => {
      // Defer unmount to avoid sync unmount during React render cycles
      queueMicrotask(() => root.unmount())
    },
  }
}
