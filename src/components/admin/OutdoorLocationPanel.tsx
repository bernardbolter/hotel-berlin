'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { DEFAULT_HOTEL_COORDS, getMapboxAccessToken, getMapboxStyleId } from '@/lib/map/config'
import { buildMapboxStyleUrl } from '@/lib/map/mapbox'
import type { ExifGps } from '@/lib/media/exifGps'

export type GeoPoint = {
  latitude: number
  longitude: number
}

type Copy = {
  exifOffer: (lat: string, lng: string) => string
  exifAccept: string
  exifDismiss: string
  captureNow: string
  captureTooInaccurate: string
  captureDenied: string
  mapHint: string
  clear: string
}

type Props = {
  floor: string
  value: GeoPoint | null
  pendingExif: ExifGps | null
  onChange: (geo: GeoPoint | null) => void
  onDismissExif: () => void
  copy: Copy
  disabled?: boolean
}

const MAX_ACCURACY_M = 50

function fmt(n: number) {
  return n.toFixed(4).replace('.', ',')
}

/**
 * Outdoor location: EXIF offer → browser geolocation → Mapbox pin.
 * Shown only when level is outside (caller gates visibility).
 */
export function OutdoorLocationPanel({
  floor,
  value,
  pendingExif,
  onChange,
  onDismissExif,
  copy,
  disabled,
}: Props) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const token = getMapboxAccessToken()

  const show = floor === 'outside' || (!floor && pendingExif != null)

  useEffect(() => {
    if (!show || !mapEl.current || !token || disabled) return
    if (mapRef.current) return

    mapboxgl.accessToken = token
    const center: [number, number] = value
      ? [value.longitude, value.latitude]
      : [DEFAULT_HOTEL_COORDS.lng, DEFAULT_HOTEL_COORDS.lat]

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: buildMapboxStyleUrl(getMapboxStyleId()),
      center,
      zoom: 16,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    const marker = new mapboxgl.Marker({ draggable: true, color: '#1a7f4b' })
      .setLngLat(center)
      .addTo(map)

    marker.on('dragend', () => {
      const { lng, lat } = marker.getLngLat()
      onChange({ latitude: lat, longitude: lng })
    })

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng })
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Only boot once when the panel becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, token, disabled])

  useEffect(() => {
    if (!value || !markerRef.current || !mapRef.current) return
    markerRef.current.setLngLat([value.longitude, value.latitude])
    mapRef.current.easeTo({ center: [value.longitude, value.latitude], duration: 400 })
  }, [value])

  if (!show) return null

  const captureNow = () => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError(copy.captureDenied)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos.coords.accuracy > MAX_ACCURACY_M) {
          setGeoError(copy.captureTooInaccurate)
          return
        }
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      },
      () => setGeoError(copy.captureDenied),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <div style={{ marginTop: 12, fontSize: 13 }}>
      {pendingExif && (floor === 'outside' || !floor) ? (
        <div
          style={{
            marginBottom: 10,
            padding: '10px 12px',
            borderRadius: 4,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-50)',
          }}
        >
          <p style={{ margin: '0 0 8px' }}>
            {copy.exifOffer(fmt(pendingExif.latitude), fmt(pendingExif.longitude))}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              disabled={disabled}
              onClick={() => {
                onChange({
                  latitude: pendingExif.latitude,
                  longitude: pendingExif.longitude,
                })
                onDismissExif()
              }}
            >
              {copy.exifAccept}
            </button>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={disabled}
              onClick={onDismissExif}
            >
              {copy.exifDismiss}
            </button>
          </div>
        </div>
      ) : null}

      {floor === 'outside' ? (
        <>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            disabled={disabled}
            onClick={captureNow}
            style={{ marginBottom: 8 }}
          >
            {copy.captureNow}
          </button>
          {geoError ? (
            <p style={{ margin: '0 0 8px', color: '#b42318' }}>{geoError}</p>
          ) : null}
          <p style={{ margin: '0 0 6px', color: 'var(--theme-elevation-800)' }}>{copy.mapHint}</p>
          {token ? (
            <div
              ref={mapEl}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid var(--theme-elevation-150)',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
              }}
            />
          ) : (
            <p style={{ color: 'var(--theme-elevation-800)' }}>Mapbox token missing.</p>
          )}
          {value ? (
            <p style={{ margin: '8px 0 0' }}>
              {fmt(value.latitude)} · {fmt(value.longitude)}{' '}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                style={{
                  marginLeft: 8,
                  background: 'none',
                  border: 0,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {copy.clear}
              </button>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
