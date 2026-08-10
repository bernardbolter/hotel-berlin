import type { MeetingRoom, JsonLdNode, SiteConfig } from '../types'
import {
  hotelNodeId,
  meetingRoomNodeId,
  meetingRoomUrl,
  meetingsListUrl,
} from '../lib/ids'
import { prune } from '../lib/prune'

export function buildMeetingRoomRef(room: MeetingRoom, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': 'MeetingRoom',
    '@id': meetingRoomNodeId(room.slug, config),
    name: room.name,
  })
}

/**
 * Full MeetingRoom node — declared only on the detail page.
 * No Offer — meeting rates are quote-based via the inquiry form.
 */
export function buildMeetingRoomNode(room: MeetingRoom, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': 'MeetingRoom',
    '@id': meetingRoomNodeId(room.slug, config),
    name: room.name,
    description: room.description,
    url: meetingRoomUrl(room.slug, config),
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
            maxValue: room.occupancyMax,
          }
        : undefined,
    amenityFeature: room.amenities?.map((tag) => ({
      '@type': 'LocationFeatureSpecification',
      name: tag.name,
      value: true,
    })),
  })
}

/** BreadcrumbList: Home → Meet & Work → [room name] */
export function buildMeetingRoomBreadcrumbList(
  room: MeetingRoom,
  config: SiteConfig,
  labels: { home: string; meetings: string },
): JsonLdNode {
  return prune({
    '@type': 'BreadcrumbList',
    '@id': `${meetingRoomUrl(room.slug, config)}#breadcrumb`,
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
        name: labels.meetings,
        item: meetingsListUrl(config),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: room.name,
        item: meetingRoomUrl(room.slug, config),
      },
    ],
  })
}
