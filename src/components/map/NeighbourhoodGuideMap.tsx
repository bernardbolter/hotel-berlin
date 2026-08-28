'use client'

import mapboxgl from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { mountMapPin, type MountedPinHandle, type MountPinOptions } from '@/components/map/mountMapPin'
import type { MapPinVariant } from '@/components/map/MapPin'
import type { MapBounds } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import { STANDARD_SOFT_FADED_CONFIG } from '@/lib/map/styles'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type GuideMapPersonPin = {
  name: string
  initials: string
  portraitUrl?: string | null
}

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
  /** Used when `pinVariant="person"` — avatar/initials at this place's coordinates. */
  personPin?: GuideMapPersonPin
  /** Total endorsers represented on this pin (filtered list). Badge shows count − 1. */
  endorserCount?: number
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
  /**
   * `category` (default) — destinations map.
   * `person` — recommendations map; each place must carry `personPin`.
   * Accessibility (aria-label, focus-visible label, touch two-tap) is the same either way.
   */
  pinVariant?: Exclude<MapPinVariant, 'hotel'>
  /** @deprecated Pins always use addendum-v2 category tokens. Kept for call-site compat. */
  pinColorMode?: 'single' | 'category'
  /**
   * `geographic` (default) — west→east then north→south, for the full destinations map.
   * `source` — mount order matches `places` (homepage teaser legend / list / tab order).
   */
  pinTabOrder?: 'geographic' | 'source'
  /** @deprecated Hotel pin is amber fill + ink Home glyph. */
  hotelMarkerVariant?: 'disc' | 'hbb'
  styleId?: string
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

function extraEndorserCount(place: GuideMapPlace): number {
  const total = place.endorserCount ?? 0
  return total > 1 ? total - 1 : 0
}

/** West → east, then north → south, so Tab order roughly matches the visual layout. */
function placesInTabOrder(places: GuideMapPlace[]): GuideMapPlace[] {
  return [...places].sort((a, b) => a.longitude - b.longitude || b.latitude - a.latitude)
}

/**
 * Mapbox's canvas is a tab stop (`tabindex=0`) so it can receive arrow-key pan.
 * Pan/zoom already has dedicated control buttons; leaving the canvas in the
 * sequence swallows Tab before marker buttons. Keep those controls, drop the canvas stop.
 */
function demoteMapboxCanvasTabStop(map: mapboxgl.Map) {
  const canvas = map.getCanvas()
  canvas.tabIndex = -1
  canvas.setAttribute('aria-hidden', 'true')
  const container = map.getCanvasContainer()
  if (container.tabIndex >= 0) container.tabIndex = -1
  for (const btn of container.querySelectorAll<HTMLButtonElement>('.hbb-map-pin-host button')) {
    btn.tabIndex = 0
  }
}

function pinMountOptions(
  place: GuideMapPlace,
  pinVariant: 'category' | 'person',
  opts: { isActive: boolean; labelVisible: boolean; onSelect: () => void },
  copy: { visibleLabel: string; ariaLabel: string },
): MountPinOptions {
  const extra = extraEndorserCount(place)
  if (pinVariant === 'person' && place.personPin) {
    return {
      variant: 'person',
      label: copy.visibleLabel,
      ariaLabel: copy.ariaLabel,
      initials: place.personPin.initials,
      personName: place.personPin.name,
      portraitUrl: place.personPin.portraitUrl,
      extraEndorserCount: extra,
      ...opts,
    }
  }
  return {
    variant: 'category',
    category: place.category,
    label: copy.visibleLabel,
    ariaLabel: copy.ariaLabel,
    extraEndorserCount: extra,
    ...opts,
  }
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
  pinVariant = 'category',
  pinTabOrder = 'geographic',
  styleId,
}: Props) {
  const t = useTranslations('heroMap')
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

  const copyForPlace = useCallback(
    (place: GuideMapPlace) => {
      const count = place.endorserCount ?? 0
      const countLabel = count > 1 ? t('endorserCountLabel', { count }) : null
      const baseAria =
        pinVariant === 'person' && place.personPin
          ? `${place.name}, ${place.personPin.name}`
          : `${place.name}, ${place.categoryLabel ?? place.category}`
      return {
        visibleLabel: countLabel ? `${place.name} — ${countLabel}` : place.name,
        ariaLabel: countLabel ? `${baseAria}, ${countLabel}` : baseAria,
      }
    },
    [t, pinVariant],
  )

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapboxStyleUrl(resolvedStyleId),
      center: [center.lng, center.lat],
      zoom: 13.5,
      attributionControl: true,
      // ctrl/cmd+scroll to zoom; page scroll passes through. Pinch-zoom is
      // TouchZoomRotateHandler — cooperativeGestures does not disable it.
      cooperativeGestures: true,
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

    const demoteCanvas = () => demoteMapboxCanvasTabStop(map)
    map.on('load', demoteCanvas)
    map.on('style.load', demoteCanvas)
    map.on('idle', demoteCanvas)
    if (map.loaded()) demoteCanvas()
    // Arrow-key pan is bound to canvas focus. Canvas is no longer a tab stop;
    // zoom buttons remain. Disabling this handler so it cannot eat Tab.
    map.keyboard.disable()

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
    const hotelBtn = hotelHandle.element.querySelector('button')
    if (hotelBtn instanceof HTMLButtonElement) hotelBtn.tabIndex = 0

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

    const ordered = pinTabOrder === 'source' ? places : placesInTabOrder(places)
    for (const place of ordered) {
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

      const handle = mountMapPin(
        pinMountOptions(
          place,
          pinVariant,
          {
            isActive: selectedIdRef.current === place.id,
            labelVisible:
              revealedIdRef.current === place.id || selectedIdRef.current === place.id,
            onSelect: onPinSelect,
          },
          copyForPlace(place),
        ),
      )

      const host = handle.element
      const pinButton = host.querySelector('button')
      if (pinButton instanceof HTMLButtonElement) pinButton.tabIndex = 0
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
  }, [places, selectionMode, mapEpoch, pinVariant, pinTabOrder, copyForPlace])

  // Update pin visuals without remounting
  useEffect(() => {
    for (const pin of pinsRef.current) {
      const isActive = selectionMode && selectedId === pin.place.id
      const labelVisible = revealedId === pin.place.id || Boolean(isActive)
      pin.handle.update(
        pinMountOptions(
          pin.place,
          pinVariant,
          {
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
          },
          copyForPlace(pin.place),
        ),
      )
    }
  }, [selectedId, revealedId, selectionMode, pinVariant, copyForPlace])

  useEffect(() => {
    if (selectedId == null) setRevealedId(null)
  }, [selectedId])

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
      {/*
        role=region, not application: application treats Tab as a widget key and
        was stopping keyboard users from ever reaching pin buttons. Pan/zoom is
        the NavigationControl; pins are the marker buttons.
      */}
      <div
        ref={containerRef}
        data-hbb-guide-map=""
        role="region"
        tabIndex={0}
        aria-label={ariaLabel}
        className={`min-h-105 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest ${className}`}
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
