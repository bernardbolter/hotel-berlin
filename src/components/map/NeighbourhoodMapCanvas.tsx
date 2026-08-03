'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import { STANDARD_SOFT_FADED_CONFIG } from '@/lib/map/styles'

type Props = {
  accessToken: string
  hotelName?: string
  className?: string
  /** CSS height — default fills section scaffold */
  heightClassName?: string
  zoom?: number
}

function createHotelPin(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'pointer-events-auto'
  el.innerHTML =
    '<div class="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E1530] shadow-md ring-2 ring-white"><span class="h-2.5 w-2.5 rounded-full bg-[#F79B2E]"></span></div>'
  return el
}

function applyBasemapConfig(map: mapboxgl.Map) {
  for (const [key, value] of Object.entries(STANDARD_SOFT_FADED_CONFIG)) {
    try {
      map.setConfigProperty('basemap', key, value)
    } catch {
      // Classic / unsupported keys — ignore
    }
  }
}

/**
 * Reusable Mapbox canvas for neighbourhood maps (homepage teaser + full map pages).
 * Soft Faded Standard style, hotel-centered, no POI/transit/shield clutter.
 */
export function NeighbourhoodMapCanvas({
  accessToken,
  hotelName = 'Hotel Berlin, Berlin',
  className = '',
  heightClassName = 'h-[min(70vh,640px)] min-h-100',
  zoom = 13.8,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapboxStyleUrl('mapbox/standard'),
      center: [DEFAULT_HOTEL_COORDS.lng, DEFAULT_HOTEL_COORDS.lat],
      zoom,
      attributionControl: true,
      cooperativeGestures: true,
      config: { basemap: STANDARD_SOFT_FADED_CONFIG },
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    const marker = new mapboxgl.Marker({ element: createHotelPin(), anchor: 'center' })
      .setLngLat([DEFAULT_HOTEL_COORDS.lng, DEFAULT_HOTEL_COORDS.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 18, closeButton: false, className: 'hbb-map-popup' }).setHTML(
          `<div class="font-ui text-ui-sm"><strong class="text-hbb-black">${hotelName}</strong><p class="mt-1 text-gray-500">Lützowplatz 17</p></div>`,
        ),
      )
      .addTo(map)

    map.on('style.load', () => applyBasemapConfig(map))

    return () => {
      marker.remove()
      map.remove()
    }
  }, [accessToken, hotelName, zoom])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={`${hotelName} neighbourhood map`}
      className={`w-full ${heightClassName} ${className}`}
    />
  )
}
