'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

import type { MapBounds } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import { NEIGHBOURHOOD_PIN_COLOR } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/queries/neighbourhoodPlaces'

export type GuideMapPlace = {
  id: string
  slug: string
  name: string
  category: PlaceCategory
  description?: string | null
  walkingMinutes?: number | null
  walkingLabel?: string
  latitude: number
  longitude: number
}

type Props = {
  accessToken: string
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: GuideMapPlace[]
  hotelName: string
  ariaLabel: string
  noscriptHtml: string
  className?: string
}

/** Simple category glyph drawn inside the pin (SVG path snippets). */
const CATEGORY_GLYPH: Record<PlaceCategory, string> = {
  Art: 'M8 3v10M5 6h6M5 13c0 1.5 1.5 3 3 3s3-1.5 3-3',
  Bar: 'M5 3h6l-1 5H6L5 3zm1 5v5h4V8M6 15h4',
  Kids: 'M8 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5 14c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5',
  Museum: 'M3 14h10M4 14V7l4-3 4 3v7M8 7v7',
  'Parks and Nature': 'M8 14V8M5 10c0-2 1.5-4 3-5 1.5 1 3 3 3 5M4 14h8',
  Party: 'M6 13V7l5-2v8M6 10h5',
  Restaurant: 'M5 3v10M5 7h3M11 3v10M10 3h2',
  Shopping: 'M4 6h8l-1 8H5L4 6zm2 0V5a2 2 0 014 0v1',
  Sightseeing: 'M8 4v2M5 8h6M8 6a3 3 0 013 3c0 2-3 5-3 5s-3-3-3-5a3 3 0 013-3z',
}

function createCategoryPin(category: PlaceCategory): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4A7A68]'
  el.style.backgroundColor = NEIGHBOURHOOD_PIN_COLOR
  el.tabIndex = 0
  el.setAttribute('aria-label', category)

  const glyph = CATEGORY_GLYPH[category] ?? CATEGORY_GLYPH.Sightseeing
  el.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="${glyph}" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`

  return el
}

function createHotelPin(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'pointer-events-auto'
  el.innerHTML =
    '<div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E1530] shadow-md ring-2 ring-white"><span class="h-2 w-2 rounded-full bg-[#F79B2E]"></span></div>'
  return el
}

export function NeighbourhoodGuideMap({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  ariaLabel,
  noscriptHtml,
  className = '',
}: Props) {
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

    const hotelMarker = new mapboxgl.Marker({ element: createHotelPin(), anchor: 'center' })
      .setLngLat([center.lng, center.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 16, closeButton: false, className: 'hbb-map-popup' }).setHTML(
          `<div class="font-ui text-ui-sm"><strong class="text-hbb-black">${hotelName}</strong></div>`,
        ),
      )
      .addTo(map)

    const markers: mapboxgl.Marker[] = [hotelMarker]

    for (const place of places) {
      const markerEl = createCategoryPin(place.category)

      const popup = new mapboxgl.Popup({
        offset: 16,
        closeButton: false,
        className: 'hbb-map-popup',
      }).setHTML(
        `<div class="font-ui text-ui-sm"><strong class="text-hbb-black">${place.name}</strong>${
          place.description
            ? `<p class="mt-1 text-gray-600">${place.description}</p>`
            : ''
        }${
          place.walkingLabel
            ? `<p class="mt-1 text-ui-xs text-gray-400">${place.walkingLabel}</p>`
            : ''
        }</div>`,
      )

      const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map)

      markerEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          marker.togglePopup()
        }
      })

      markers.push(marker)
    }

    return () => {
      for (const marker of markers) marker.remove()
      map.remove()
    }
  }, [
    accessToken,
    bounds.east,
    bounds.north,
    bounds.south,
    bounds.west,
    center.lat,
    center.lng,
    hotelName,
    places,
  ])

  return (
    <>
      <div
        ref={containerRef}
        role="application"
        aria-label={ariaLabel}
        className={`min-h-105 w-full ${className}`}
      />
      <noscript>
        <div
          className="border-t border-gray-200 bg-gray-50 px-6 py-8 font-ui text-ui-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: noscriptHtml }}
        />
      </noscript>
    </>
  )
}
