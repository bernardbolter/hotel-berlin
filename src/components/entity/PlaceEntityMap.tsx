import { HOTEL_PIN_FILL } from '@/lib/neighbourhood/categories'
import type { LngLat, Trip } from '@/lib/entity/computed/types'
import {
  fitBounds,
  projectLine,
  projectToPixel,
  routeForZoom,
} from '@/lib/entity/computed/mercator'
import { tripChipCopy } from '@/lib/entity/computed/formatTrip'
import type { NearestStation } from '@/lib/entity/computed/types'

const MAP_W = 640
const MAP_H = 480

type Props = {
  slug: string
  placeName: string
  hotel: LngLat
  place: LngLat
  trip: Trip
  placePinColor: string
  station: NearestStation | null
  locale: 'de' | 'en'
  /** When true, show tiles from /api/entity-map; otherwise flat #E9EBE7 */
  showBasemap: boolean
  alt: string
  /** Optional place photo above the map (C5) */
  imageUrl?: string | null
  imageAlt?: string
}

/**
 * Static place map: basemap from our API (no browser→Mapbox), pins + route as SVG.
 */
export function PlaceEntityMap({
  slug,
  placeName,
  hotel,
  place,
  trip,
  placePinColor,
  station,
  locale,
  showBasemap,
  alt,
  imageUrl,
  imageAlt,
}: Props) {
  const viewport = fitBounds([hotel, place, ...(trip.geometry ?? [])], {
    width: MAP_W,
    height: MAP_H,
    padding: 0.12,
    minZoom: 10,
    maxZoom: 16,
  })
  const routePts = routeForZoom(trip.geometry, hotel, place, viewport.zoom)
  const routePath = projectLine(routePts, viewport)
  const hotelPx = projectToPixel(hotel, viewport)
  const placePx = projectToPixel(place, viewport)
  const chip = tripChipCopy(trip, { locale, station, placeName })

  const mapCorner = imageUrl ? undefined : 'place-entity-map__frame--corner'
  const mapRatio = imageUrl ? 'place-entity-map__frame--wide' : 'place-entity-map__frame--square'

  return (
    <div className="place-entity-map">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageAlt || placeName}
          className="place-entity-map__photo"
        />
      ) : null}

      <div className={`place-entity-map__frame ${mapRatio} ${mapCorner ?? ''}`}>
        {showBasemap ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/entity-map/${encodeURIComponent(slug)}`}
            alt={alt}
            width={MAP_W}
            height={MAP_H}
            className="place-entity-map__tiles"
          />
        ) : (
          <div className="place-entity-map__fallback" aria-hidden="true" />
        )}

        <svg
          className="place-entity-map__overlay"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden={showBasemap ? true : undefined}
          role={showBasemap ? undefined : 'img'}
          aria-label={showBasemap ? undefined : alt}
        >
          {routePath ? (
            <path
              d={routePath}
              fill="none"
              stroke="#141414"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="1.5 5"
            />
          ) : null}
          <MapPin x={hotelPx.x} y={hotelPx.y} fill={HOTEL_PIN_FILL} size={22} />
          <MapPin x={placePx.x} y={placePx.y} fill={placePinColor} size={30} />
        </svg>

        <div className="place-entity-map__chip">
          <p className="place-entity-map__chip-primary">{chip.primary}</p>
          {chip.secondary ? (
            <p className="place-entity-map__chip-secondary">{chip.secondary}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function MapPin({
  x,
  y,
  fill,
  size,
}: {
  x: number
  y: number
  fill: string
  size: number
}) {
  // Site pin: teardrop with tip at (x,y) — three rounded corners, one square tip.
  const s = size
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M0,0
            C0,0 ${-s * 0.55},${-s * 0.35} ${-s * 0.55},${-s * 0.72}
            A ${s * 0.55} ${s * 0.55} 0 1 1 ${s * 0.55},${-s * 0.72}
            C ${s * 0.55},${-s * 0.35} 0,0 0,0
            Z`}
        fill={fill}
      />
    </g>
  )
}
