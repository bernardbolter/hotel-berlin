import type { HotelRoom, JsonLdNode, SiteConfig } from '../types'
import {
  hotelNodeId,
  roomNodeId,
  roomOfferNodeId,
  roomsListUrl,
  roomUrl,
} from '../lib/ids'
import { prune } from '../lib/prune'

export function buildHotelRoomRef(room: HotelRoom, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': 'HotelRoom',
    '@id': roomNodeId(room.slug, config),
    name: room.name,
  })
}

/**
 * Full HotelRoom node — declared only on the room detail page.
 * Listing pages must use buildHotelRoomRef / ItemList urls instead.
 */
export function buildHotelRoomNode(room: HotelRoom, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': 'HotelRoom',
    '@id': roomNodeId(room.slug, config),
    name: room.name,
    description: room.description,
    url: roomUrl(room.slug, config),
    identifier: room.slug,
    containedInPlace: { '@id': hotelNodeId(config) },
    image: room.images?.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      description: img.altText,
    })),
    floorSize:
      room.floorSizeM2 != null
        ? {
            '@type': 'QuantitativeValue',
            value: room.floorSizeM2,
            unitCode: 'MTK',
          }
        : undefined,
    occupancy:
      room.occupancyMax != null
        ? {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: room.occupancyMax,
          }
        : undefined,
    bed: room.bedType
      ? {
          '@type': 'BedDetails',
          typeOfBed: room.bedType,
          numberOfBeds: room.numberOfBeds ?? 1,
        }
      : undefined,
    amenityFeature: room.amenities?.map((tag) => ({
      '@type': 'LocationFeatureSpecification',
      name: tag.name,
      value: true,
    })),
  })
}

export function buildOfferNode(room: HotelRoom, config: SiteConfig): JsonLdNode | null {
  if (room.fromPrice == null) return null

  return prune({
    '@type': 'Offer',
    '@id': roomOfferNodeId(room.slug, config),
    itemOffered: { '@id': roomNodeId(room.slug, config) },
    price: room.fromPrice,
    priceCurrency: room.currency ?? 'EUR',
    availability: 'https://schema.org/InStock',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      unitCode: 'DAY',
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
      },
    },
    url: room.bookingUrl,
  })
}

/** BreadcrumbList: Home → Rooms → [room name] */
export function buildRoomBreadcrumbList(
  room: HotelRoom,
  config: SiteConfig,
  labels: { home: string; rooms: string },
): JsonLdNode {
  return prune({
    '@type': 'BreadcrumbList',
    '@id': `${roomUrl(room.slug, config)}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: labels.home,
        item: config.baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: labels.rooms,
        item: roomsListUrl(config),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: room.name,
        item: roomUrl(room.slug, config),
      },
    ],
  })
}
