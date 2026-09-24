/**
 * Entity-page computed values: trips, stations, pick order, static map.
 * Server-only — do not import from client components.
 */

export { getTrip, FAR_THRESHOLD_MINUTES, tripMode } from './getTrip'
export { orderPicks } from './orderPicks'
export {
  nearestStation,
  formatStationValue,
  NEAREST_STATION_MAX_M,
  STATIONS,
  STATIONS_SOURCE,
} from './nearestStation'
export {
  formatDistance,
  formatMinutes,
  tripChipCopy,
  tripMetaLine,
  tripLegCopy,
  stationRowLabel,
} from './formatTrip'
export {
  haversineMeters,
  estimateWalkMeters,
  estimateWalkMinutes,
  roundCoord,
} from './haversine'
export {
  projectToPixel,
  projectLine,
  fitBounds,
  routeForZoom,
  boundsFromPoints,
  type MapViewport,
  type Bounds,
} from './mercator'
export {
  fetchEntityStaticMap,
  getEntityMapServerToken,
  entityMapAvailable,
  getResolvedStaticStyle,
  buildStaticImageUrl,
} from './staticMap'
export type {
  LngLat,
  Trip,
  TripMode,
  TripSource,
  Station,
  NearestStation,
  TripPick,
  OrderedStop,
  OrderedPicks,
} from './types'
