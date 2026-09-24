import { DEFAULT_MAPBOX_STYLE } from '@/lib/map/config'

import type { LngLat } from './types'
import { fitBounds, type MapViewport } from './mercator'

const REVALIDATE_30_DAYS = 2_592_000

/** Styles to try for Static Images (R6). First success wins. */
const STATIC_STYLE_CANDIDATES = [
  'mapbox/standard',
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID?.trim(),
  DEFAULT_MAPBOX_STYLE,
].filter((s): s is string => Boolean(s))

let resolvedStaticStyle: string | null = null
const rejectedStyles = new Set<string>()

export function getEntityMapServerToken(): string | null {
  return (
    process.env.MAPBOX_SERVER_TOKEN?.trim() ||
    process.env.MAPBOX_ACCESS_TOKEN?.trim() ||
    null
  )
}

/**
 * Server-side gate for the place-page map card.
 * When false, render the flat #E9EBE7 SVG card — never emit an <img>
 * that can 204 because no token is configured.
 * Keep route 204 for Mapbox failures at request time when a token exists.
 */
export function entityMapAvailable(): boolean {
  return getEntityMapServerToken() != null
}

export function getResolvedStaticStyle(): string | null {
  return resolvedStaticStyle
}

function encodeStyleId(styleId: string): string {
  return styleId.includes('/') ? styleId : `mapbox/${styleId}`
}

export function buildStaticImageUrl(args: {
  styleId: string
  viewport: MapViewport
  token: string
  retina?: boolean
}): string {
  const style = encodeStyleId(args.styleId)
  const { width, height, center, zoom } = args.viewport
  const size = `${Math.round(width)}x${Math.round(height)}${args.retina === false ? '' : '@2x'}`
  const position = `${center.lng},${center.lat},${zoom},0,0`
  const params = new URLSearchParams({
    access_token: args.token,
    attribution: 'false',
    logo: 'false',
  })
  return `https://api.mapbox.com/styles/v1/${style}/static/${position}/${size}?${params}`
}

export type StaticMapResult = {
  bytes: ArrayBuffer
  contentType: string
  viewport: MapViewport
  styleId: string
}

/**
 * Fetch a Mapbox Static Images basemap (no overlays — we draw pins in SVG).
 * Tries mapbox/standard first; falls back per R6.
 * Probe (Sep 2026): mapbox/standard → HTTP 400 on Static Images; light-v11 works.
 */
export async function fetchEntityStaticMap(args: {
  points: readonly LngLat[]
  width?: number
  height?: number
  token?: string | null
}): Promise<StaticMapResult | null> {
  const token = args.token ?? getEntityMapServerToken()
  if (!token) return null

  const width = args.width ?? 640
  const height = args.height ?? 480
  const viewport = fitBounds(args.points, { width, height, padding: 0.12, minZoom: 10, maxZoom: 16 })

  const styles = resolvedStaticStyle
    ? [resolvedStaticStyle]
    : [...new Set(STATIC_STYLE_CANDIDATES)].filter((s) => !rejectedStyles.has(s))

  for (const styleId of styles) {
    const url = buildStaticImageUrl({ styleId, viewport, token })
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE_30_DAYS } })
      if (!res.ok) {
        rejectedStyles.add(styleId)
        continue
      }
      const contentType = res.headers.get('content-type') ?? 'image/png'
      if (!contentType.startsWith('image/')) {
        rejectedStyles.add(styleId)
        continue
      }
      const bytes = await res.arrayBuffer()
      if (bytes.byteLength < 100) {
        rejectedStyles.add(styleId)
        continue
      }
      resolvedStaticStyle = styleId
      return { bytes, contentType, viewport, styleId }
    } catch {
      rejectedStyles.add(styleId)
      continue
    }
  }

  return null
}
