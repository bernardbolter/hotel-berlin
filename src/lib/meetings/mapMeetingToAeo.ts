import type { MeetingRoom as AeoMeetingRoom } from '@/lib/aeo-schema/src/types'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'
import type { Media, MeetingRoom } from '@/payload-types'

function mediaUrl(image: number | Media | null | undefined): string | null {
  if (!image || typeof image === 'number') return null
  return image.url ?? null
}

/** Map a Payload MeetingRoom doc to the AEO MeetingRoom contract. */
export function mapMeetingRoomToAeo(room: MeetingRoom): AeoMeetingRoom {
  const images =
    room.images
      ?.map((entry) => {
        const url = mediaUrl(entry.image)
        if (!url) return null
        return { url, altText: entry.alt || room.name }
      })
      .filter((img): img is { url: string; altText: string } => img !== null) ?? []

  const capacities = room.capacity ?? {}
  const occupancyValues = [
    capacities.theater,
    capacities.classroom,
    capacities.banquet,
    capacities.uShape,
    capacities.cabaret,
    capacities.reception,
    capacities.block,
  ].filter((n): n is number => typeof n === 'number' && n > 0)

  const amenities: { name: string }[] = []
  if (room.hasDaylight) amenities.push({ name: 'Daylight' })
  if (room.hasScreen) amenities.push({ name: 'Screen' })
  if (room.hasProjector) amenities.push({ name: 'Projector' })
  if (room.isDivisible) amenities.push({ name: 'Divisible' })

  return {
    id: String(room.id),
    slug: room.slug,
    name: room.name,
    description: lexicalToPlain(room.description) || room.shortDescription || undefined,
    floorSizeM2: room.floorSizeM2,
    occupancyMax: occupancyValues.length ? Math.max(...occupancyValues) : undefined,
    images,
    amenities,
  }
}
