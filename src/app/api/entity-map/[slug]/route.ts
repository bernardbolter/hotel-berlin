import { NextResponse } from 'next/server'

import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { fetchEntityStaticMap } from '@/lib/entity/computed/staticMap'
import { getPayloadClient } from '@/lib/payload/client'

export const runtime = 'nodejs'

const CACHE_CONTROL =
  'public, s-maxage=2592000, stale-while-revalidate=86400'

type Params = { params: Promise<{ slug: string }> }

/**
 * Server-only Mapbox Static Images basemap for entity place pages.
 * Pins and route are drawn client/server as SVG overlays — this route
 * never exposes a Mapbox URL to the browser.
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  if (!slug || slug.length > 200) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'neighbourhood-places',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }],
      },
      depth: 0,
      limit: 1,
    })
    const place = docs[0]
    const lat = place?.geo?.latitude
    const lng = place?.geo?.longitude
    if (lat == null || lng == null) {
      return new NextResponse('No geo', { status: 404 })
    }

    const hotel = { lng: DEFAULT_HOTEL_COORDS.lng, lat: DEFAULT_HOTEL_COORDS.lat }
    const destination = { lng: Number(lng), lat: Number(lat) }

    const result = await fetchEntityStaticMap({
      points: [hotel, destination],
      width: 640,
      height: 480,
    })

    if (!result) {
      // Caller renders the SVG-only fallback on #E9EBE7.
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Cache-Control': CACHE_CONTROL,
          'X-Entity-Map': 'fallback',
        },
      })
    }

    return new NextResponse(result.bytes, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': CACHE_CONTROL,
        'X-Entity-Map-Style': result.styleId,
        'X-Entity-Map-Zoom': String(result.viewport.zoom),
        'X-Entity-Map-Center': `${result.viewport.center.lng},${result.viewport.center.lat}`,
      },
    })
  } catch {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
        'X-Entity-Map': 'error',
      },
    })
  }
}
