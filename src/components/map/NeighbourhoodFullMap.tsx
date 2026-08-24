'use client'

import {
  PlacesMapView,
  type MapViewPlace,
} from '@/components/map/PlacesMapView'
import type { MapBounds } from '@/lib/map/config'

/** @deprecated Use MapViewPlace — kept so existing call sites type-check. */
export type FullMapPlace = MapViewPlace

type Props = {
  accessToken: string
  bounds: MapBounds
  center: { lat: number; lng: number }
  places: MapViewPlace[]
  hotelName: string
  hotelAriaLabel?: string
  ariaLabel: string
  noscriptHtml: string
}

/**
 * Full `/nachbarschaft` map — category pins + place-leading card.
 * Shared chrome lives in PlacesMapView (also used by the people/recommendations view).
 */
export function NeighbourhoodFullMap(props: Props) {
  return <PlacesMapView {...props} pinVariant="category" cardEmphasis="place" />
}
