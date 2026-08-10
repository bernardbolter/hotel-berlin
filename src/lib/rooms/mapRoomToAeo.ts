import type { HotelRoom } from '@/lib/aeo-schema/src/types'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'
import type { Media, Room, Tag } from '@/payload-types'

function mediaUrl(image: number | Media | null | undefined): string | null {
  if (!image || typeof image === 'number') return null
  return image.url ?? null
}

/** Map a Payload Room doc to the AEO HotelRoom contract. */
export function mapRoomToAeo(room: Room): HotelRoom {
  const images =
    room.images
      ?.map((entry) => {
        const url = mediaUrl(entry.image)
        if (!url) return null
        return { url, altText: entry.alt || room.name }
      })
      .filter((img): img is { url: string; altText: string } => img !== null) ?? []

  const amenities =
    room.amenities
      ?.map((entry) => {
        if (!entry || typeof entry === 'number') return null
        const tag = entry as Tag
        return { name: tag.name }
      })
      .filter((a): a is { name: string } => a !== null) ?? []

  return {
    id: String(room.id),
    slug: room.slug,
    name: room.name,
    description: lexicalToPlain(room.description) || room.shortDescription || undefined,
    fromPrice: room.fromPrice ?? undefined,
    currency: room.currency ?? 'EUR',
    bookingUrl: room.bookingUrl ?? undefined,
    floorSizeM2: room.floorSizeM2 ?? undefined,
    occupancyMax: room.occupancy?.maxTotal ?? room.occupancy?.maxAdults ?? undefined,
    bedType: room.bedConfiguration?.type ?? undefined,
    numberOfBeds: 1,
    images,
    amenities,
  }
}
