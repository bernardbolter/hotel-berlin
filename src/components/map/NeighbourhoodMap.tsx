'use client'

import mapboxgl from 'mapbox-gl'
import { useLocale } from 'next-intl'
import { useEffect, useRef } from 'react'

import type { MapBounds } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import type { Place } from '@/lib/queries/places'

type Props = {
  accessToken: string
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: Place[]
  ariaLabel: string
  className?: string
}

function createMarkerElement(variant: 'hotel' | 'default' | 'featured' | 'concierge'): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'pointer-events-auto'

  if (variant === 'hotel') {
    el.innerHTML =
      '<div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E1530] shadow-md ring-2 ring-white"><span class="h-2 w-2 rounded-full bg-[#F79B2E]"></span></div>'
    return el
  }

  const colors: Record<string, string> = {
    default: 'bg-[#2C6B7A]',
    featured: 'bg-[#F79B2E]',
    concierge: 'bg-[#6A5870]',
  }

  el.innerHTML = `<span class="block h-2.5 w-2.5 rounded-full ring-2 ring-white ${colors[variant]}"></span>`
  return el
}

function pinVariantForPlace(place: Place): 'default' | 'featured' | 'concierge' {
  if (place.type === 'concierge') return 'concierge'
  if (place.featured) return 'featured'
  return 'default'
}

export function NeighbourhoodMap({
  accessToken,
  bounds,
  center,
  places,
  ariaLabel,
  className = '',
}: Props) {
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapboxStyleUrl(),
      center: [center.lng, center.lat],
      zoom: 13.5,
      attributionControl: true,
      cooperativeGestures: true,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: 48, duration: 0 },
    )

    for (const place of places) {
      const isHotel = place.slug === 'hotel-berlin-berlin'
      const markerEl = createMarkerElement(isHotel ? 'hotel' : pinVariantForPlace(place))

      const description =
        locale === 'de' && place.shortDescriptionDE
          ? place.shortDescriptionDE
          : place.shortDescription

      const walkLabel =
        place.walkingMinutes != null
          ? locale === 'de'
            ? `${place.walkingMinutes} Min. zu Fuß`
            : `${place.walkingMinutes} min walk`
          : ''

      const popup = new mapboxgl.Popup({
        offset: 16,
        closeButton: false,
        className: 'hbb-map-popup',
      }).setHTML(
        `<div class="font-ui text-ui-sm"><strong class="text-hbb-black">${place.name}</strong><p class="mt-1 text-gray-600">${description}</p>${
          walkLabel ? `<p class="mt-1 text-ui-xs text-gray-400">${walkLabel}</p>` : ''
        }</div>`,
      )

      new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(popup)
        .addTo(map)
    }

    return () => {
      map.remove()
    }
  }, [accessToken, bounds.east, bounds.north, bounds.south, bounds.west, center.lat, center.lng, locale, places])

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={`min-h-105 w-full ${className}`}
    />
  )
}
