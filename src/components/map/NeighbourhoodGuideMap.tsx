'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react'

import { mountMapPin, type MountedPinHandle } from '@/components/map/mountMapPin'
import type { MapBounds } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import { STANDARD_SOFT_FADED_CONFIG } from '@/lib/map/styles'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type GuideMapPlace = {
  id: string
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel?: string
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
  hotelAriaLabel?: string
  ariaLabel: string
  noscriptHtml: string
  className?: string
  selectedId?: string | null
  onSelect?: (placeId: string) => void
  hideNavigation?: boolean
  fitPadding?: number
  /** @deprecated Pins always use muted category tokens. Kept for call-site compat. */
  pinColorMode?: 'single' | 'category'
  /** @deprecated Hotel pin is always the ink house marker. */
  hotelMarkerVariant?: 'disc' | 'hbb'
  styleId?: string
  cooperativeGestures?: boolean
}

type PinRuntime = {
  place: GuideMapPlace
  handle: MountedPinHandle
  marker: mapboxgl.Marker
  popup?: mapboxgl.Popup
}

function canHover(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function NeighbourhoodGuideMap({
  accessToken,
  bounds,
  center,
  places,
  hotelName,
  hotelAriaLabel,
  ariaLabel,
  noscriptHtml,
  className = '',
  selectedId = null,
  onSelect,
  hideNavigation = false,
  fitPadding = 48,
  styleId,
  cooperativeGestures = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const pinsRef = useRef<PinRuntime[]>([])
  const hotelHandleRef = useRef<MountedPinHandle | null>(null)
  const hotelMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const revealedIdRef = useRef<string | null>(null)
  const [mapEpoch, setMapEpoch] = useState(0)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  revealedIdRef.current = revealedId

  const selectionMode = typeof onSelect === 'function'
  const resolvedStyleId = styleId ?? undefined
  const useSoftFaded = resolvedStyleId === 'mapbox/standard'

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapboxStyleUrl(resolvedStyleId),
      center: [center.lng, center.lat],
      zoom: 13.5,
      attributionControl: true,
      cooperativeGestures,
      ...(useSoftFaded ? { config: { basemap: STANDARD_SOFT_FADED_CONFIG } } : {}),
    })

    if (!hideNavigation) {
      // Keep top-right free for PlaceInfoCard
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left')
    }

    map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: fitPadding, duration: 0 },
    )

    if (useSoftFaded) {
      const applyBasemap = () => {
        for (const [key, value] of Object.entries(STANDARD_SOFT_FADED_CONFIG)) {
          try {
            map.setConfigProperty('basemap', key, value)
          } catch {
            // Classic / unsupported keys — ignore
          }
        }
      }
      map.on('style.load', applyBasemap)
      if (map.isStyleLoaded()) applyBasemap()
    }

    const hotelHandle = mountMapPin({
      variant: 'hotel',
      label: hotelName,
      ariaLabel: hotelAriaLabel ?? hotelName,
    })
    hotelHandleRef.current = hotelHandle

    const hotelMarker = new mapboxgl.Marker({
      element: hotelHandle.element,
      anchor: 'bottom',
    })
      .setLngLat([center.lng, center.lat])
      .addTo(map)

    mapRef.current = map
    hotelMarkerRef.current = hotelMarker
    setMapEpoch((n) => n + 1)

    return () => {
      for (const pin of pinsRef.current) {
        pin.handle.unmount()
        pin.marker.remove()
      }
      pinsRef.current = []
      hotelHandle.unmount()
      hotelHandleRef.current = null
      hotelMarker.remove()
      hotelMarkerRef.current = null
      map.remove()
      mapRef.current = null
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
    hotelAriaLabel,
    hideNavigation,
    fitPadding,
    resolvedStyleId,
    useSoftFaded,
    cooperativeGestures,
  ])

  // Build markers when place set changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || mapEpoch === 0) return

    for (const pin of pinsRef.current) {
      pin.handle.unmount()
      pin.marker.remove()
    }
    pinsRef.current = []

    for (const place of places) {
      const categoryLabel = place.categoryLabel ?? place.category
      const ariaLabel = `${place.name}, ${categoryLabel}`

      const activate = () => {
        if (selectionMode) {
          onSelectRef.current?.(place.id)
          return
        }
        const runtime = pinsRef.current.find((p) => p.place.id === place.id)
        runtime?.popup?.addTo(map)
      }

      const onPinSelect = () => {
        if (!canHover()) {
          if (revealedIdRef.current !== place.id) {
            setRevealedId(place.id)
            return
          }
        }
        setRevealedId(place.id)
        activate()
      }

      const handle = mountMapPin({
        variant: 'category',
        category: place.category,
        label: place.name,
        ariaLabel,
        isActive: selectedIdRef.current === place.id,
        labelVisible:
          revealedIdRef.current === place.id || selectedIdRef.current === place.id,
        onSelect: onPinSelect,
      })

      const host = handle.element
      host.addEventListener('pointerenter', () => {
        if (canHover()) setRevealedId(place.id)
      })
      host.addEventListener('pointerleave', () => {
        if (canHover() && selectedIdRef.current !== place.id) {
          setRevealedId((current) => (current === place.id ? null : current))
        }
      })
      host.addEventListener('focusin', () => setRevealedId(place.id))

      const marker = new mapboxgl.Marker({ element: host, anchor: 'bottom' })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map)

      let popup: mapboxgl.Popup | undefined
      if (!selectionMode) {
        popup = new mapboxgl.Popup({
          offset: 28,
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
        marker.setPopup(popup)
      }

      pinsRef.current.push({ place, handle, marker, popup })
    }
  }, [places, selectionMode, mapEpoch])

  // Update pin visuals without remounting
  useEffect(() => {
    for (const pin of pinsRef.current) {
      const isActive = selectionMode && selectedId === pin.place.id
      const labelVisible = revealedId === pin.place.id || Boolean(isActive)
      const categoryLabel = pin.place.categoryLabel ?? pin.place.category
      pin.handle.update({
        variant: 'category',
        category: pin.place.category,
        label: pin.place.name,
        ariaLabel: `${pin.place.name}, ${categoryLabel}`,
        isActive: Boolean(isActive),
        labelVisible,
        onSelect: () => {
          if (!canHover()) {
            if (revealedIdRef.current !== pin.place.id) {
              setRevealedId(pin.place.id)
              return
            }
          }
          setRevealedId(pin.place.id)
          if (selectionMode) {
            onSelectRef.current?.(pin.place.id)
          } else {
            pin.popup?.addTo(mapRef.current!)
          }
        },
      })
    }
  }, [selectedId, revealedId, selectionMode])

  // Ease to selected pin
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectionMode || !selectedId) return
    const selected = places.find((p) => p.id === selectedId)
    if (!selected) return
    map.easeTo({
      center: [selected.longitude, selected.latitude],
      duration: 450,
      padding: fitPadding,
    })
  }, [selectedId, selectionMode, places, fitPadding])

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
