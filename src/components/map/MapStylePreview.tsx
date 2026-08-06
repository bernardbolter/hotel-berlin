'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import {
  DEFAULT_PREVIEW_STYLE_ID,
  getMapStyleOption,
  LIGHT_MAP_STYLES,
  type MapStyleOption,
} from '@/lib/map/styles'

type Props = {
  accessToken: string
  hotelName?: string
  className?: string
}

function createHotelPin(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'pointer-events-auto'
  el.innerHTML =
    '<div class="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E1530] shadow-md ring-2 ring-white"><span class="h-2.5 w-2.5 rounded-full bg-[#F79B2E]"></span></div>'
  return el
}

function applyBasemapConfig(map: mapboxgl.Map, style: MapStyleOption) {
  if (!style.basemapConfig) return

  // Apply non-color props first, then color* — theme LUTs can wash colors if set after.
  const entries = Object.entries(style.basemapConfig)
  const nonColor = entries.filter(([key]) => !key.startsWith('color'))
  const colors = entries.filter(([key]) => key.startsWith('color'))

  for (const [key, value] of [...nonColor, ...colors]) {
    try {
      map.setConfigProperty('basemap', key, value)
    } catch (err) {
      console.warn(`[map] setConfigProperty basemap.${key} failed`, err)
    }
  }
}

export function MapStylePreview({
  accessToken,
  hotelName = 'Hotel Berlin, Berlin',
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const skipFirstStyleChange = useRef(true)
  const [selectedId, setSelectedId] = useState(DEFAULT_PREVIEW_STYLE_ID)

  const selected = useMemo(() => getMapStyleOption(selectedId), [selectedId])
  const classic = LIGHT_MAP_STYLES.filter((s) => s.group === 'classic')
  const standard = LIGHT_MAP_STYLES.filter((s) => s.group === 'standard')

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = accessToken
    const initial = getMapStyleOption(DEFAULT_PREVIEW_STYLE_ID)

    if (containerRef.current) {
      containerRef.current.dataset.styleId = initial.id
      containerRef.current.dataset.loadedStyleId = initial.styleId
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapboxStyleUrl(initial.styleId),
      center: [DEFAULT_HOTEL_COORDS.lng, DEFAULT_HOTEL_COORDS.lat],
      zoom: 14.2,
      attributionControl: true,
      cooperativeGestures: true,
      config: initial.basemapConfig ? { basemap: initial.basemapConfig } : undefined,
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

    map.on('style.load', () => {
      const activeId = containerRef.current?.dataset.styleId ?? DEFAULT_PREVIEW_STYLE_ID
      applyBasemapConfig(map, getMapStyleOption(activeId))
    })

    mapRef.current = map

    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
    }
  }, [accessToken, hotelName])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dataset.styleId = selectedId
    }

    const map = mapRef.current
    if (!map) return

    if (skipFirstStyleChange.current) {
      skipFirstStyleChange.current = false
      return
    }

    const next = getMapStyleOption(selectedId)
    const styleUrl = buildMapboxStyleUrl(next.styleId)
    const styleOptions = next.basemapConfig
      ? { config: { basemap: next.basemapConfig } }
      : { config: { basemap: {} } }

    // Always setStyle so Soft ↔ Faded (same URL) get a clean config, not leftover colors.
    containerRef.current!.dataset.loadedStyleId = next.styleId
    // Mapbox typings mark font fields required on SetStyleOptions; runtime accepts config-only.
    map.setStyle(styleUrl, styleOptions as unknown as Parameters<mapboxgl.Map['setStyle']>[1])
  }, [selectedId])

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        data-style-id={selectedId}
        role="application"
        aria-label={`Map style preview: ${selected.label}`}
        className="h-[min(85vh,900px)] w-full min-h-120"
      />

      <aside className="absolute bottom-4 left-4 right-4 z-10 max-h-[45vh] overflow-y-auto rounded-sm border border-hbb-forest/15 bg-hbb-page/95 p-4 shadow-lg backdrop-blur-sm md:bottom-6 md:left-6 md:right-auto md:w-[min(100%,22rem)]">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-hbb-forest">
          Map style preview
        </p>
        <h1 className="mt-1 font-display text-xl text-hbb-black">{hotelName}</h1>
        <p className="mt-1 font-ui text-ui-sm text-gray-600">
          Centered on Lützowplatz 17. Pick a light Mapbox style to compare.
        </p>

        <div className="mt-4">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Classic
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {classic.map((style) => (
              <StyleButton
                key={style.id}
                style={style}
                active={style.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Standard (current Mapbox default)
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {standard.map((style) => (
              <StyleButton
                key={style.id}
                style={style}
                active={style.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 border-t border-gray-200 pt-3 font-ui text-[11px] leading-relaxed text-gray-500">
          Active: <span className="text-hbb-forest">{selected.label}</span>
          <br />
          <code className="text-[10px] text-gray-400">{selected.styleId}</code>
          {selected.basemapConfig ? (
            <>
              <br />
              <code className="text-[10px] text-gray-400">
                {JSON.stringify(selected.basemapConfig)}
              </code>
            </>
          ) : null}
        </p>
      </aside>
    </div>
  )
}

function StyleButton({
  style,
  active,
  onSelect,
}: {
  style: MapStyleOption
  active: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(style.id)}
      aria-pressed={active}
      className={[
        'rounded-sm border px-3 py-2 text-left transition-colors',
        active
          ? 'border-hbb-forest bg-hbb-forest text-white'
          : 'border-gray-200 bg-white text-hbb-black hover:border-hbb-forest/40',
      ].join(' ')}
    >
      <span className="block font-ui text-ui-sm font-semibold">{style.label}</span>
      <span
        className={`mt-0.5 block font-ui text-[11px] leading-snug ${active ? 'text-white/80' : 'text-gray-500'}`}
      >
        {style.description}
      </span>
    </button>
  )
}
