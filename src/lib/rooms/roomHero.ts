import type { Media, Room, Tag } from '@/payload-types'

import roomsFallback from '@/lib/data/rooms.json'

type RoomWithHeroFields = Room & {
  bathroomLabel?: 'shower' | 'rain-shower' | 'bath-shower' | 'spa-bathroom' | null
}

const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'

const fallbackBySlug = new Map(
  (roomsFallback as { id: string; images: { src: string; altKey: string }[] }[]).map(
    (room) => [room.id, room.images],
  ),
)

export type RoomTeaserAmenity = {
  id: number
  name: string
  iconName: string | null
}

export type RoomHeroItem = {
  id: number
  slug: string
  name: string
  shortDescription: string | null
  priceLabel: string
  fromPriceLabel: string
  sizeLabel: string
  bedLabel: string
  bathroomLabel: string | null
  sleepsLabel: string
  locale: 'en' | 'de'
  bookingUrl: string | null
  /** First gallery image (homepage D-shape rotator) */
  teaserImage: { src: string; alt: string }
  images: { src: string; alt: string }[]
  amenities: RoomTeaserAmenity[]
}

function resolveMediaUrl(image: number | Media | undefined | null): string | null {
  if (!image || typeof image === 'number') return null
  return image.url ?? null
}

/** Homepage teaser always uses the room gallery’s first image (source of truth). */
function pickTeaserImage(
  room: Room,
  images: { src: string; alt: string }[],
): { src: string; alt: string } {
  const first = images[0]
  if (first) {
    return { src: first.src, alt: first.alt || room.name }
  }

  return { src: DEFAULT_ROOM_IMAGE, alt: room.name }
}

type ResolvedRoomImage = { src: string; alt: string }

function resolveRoomImages(room: Room): ResolvedRoomImage[] {
  const cmsImages =
    room.images
      ?.map((entry): ResolvedRoomImage | null => {
        const src = resolveMediaUrl(entry.image)
        if (!src) return null
        return {
          src,
          alt: entry.alt,
        }
      })
      .filter((img): img is ResolvedRoomImage => img !== null) ?? []

  if (cmsImages.length > 0) return cmsImages

  const fallback = fallbackBySlug.get(room.slug)
  if (fallback?.length) {
    return fallback.map((img) => ({
      src: img.src,
      alt: room.name,
    }))
  }

  return [{ src: DEFAULT_ROOM_IMAGE, alt: room.name }]
}

export function formatRoomPrice(
  fromPrice: number | null | undefined,
  locale: 'en' | 'de',
): string {
  if (fromPrice == null) return '–'

  const formatted = fromPrice.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return locale === 'de' ? `${formatted}€` : `€${formatted}`
}

function resolveTeaserAmenities(
  room: Room,
  locale: 'en' | 'de',
): RoomTeaserAmenity[] {
  const featured = room.homepageTeaser?.featuredAmenities
  const source =
    featured && featured.length > 0 ? featured : (room.amenities ?? []).slice(0, 4)

  return source
    .map((entry) => {
      if (!entry || typeof entry === 'number') return null
      const tag = entry as Tag
      return {
        id: tag.id,
        name: tag.name,
        iconName: tag.lucideIcon ?? null,
      } satisfies RoomTeaserAmenity
    })
    .filter((item): item is RoomTeaserAmenity => item !== null)
}

export function mapRoomToHeroItem(
  room: RoomWithHeroFields,
  locale: 'en' | 'de',
  fromLabel: string,
): RoomHeroItem {
  const floorSizeM2 = room.floorSizeM2
  const images = resolveRoomImages(room)
  const teaserImage = pickTeaserImage(room, images)
  const priceLabel = formatRoomPrice(room.fromPrice, locale)

  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    shortDescription: room.shortDescription ?? null,
    priceLabel,
    fromPriceLabel: `${fromLabel} ${priceLabel}`,
    sizeLabel: floorSizeM2 != null ? `${floorSizeM2} m²` : '–',
    bedLabel: room.bedConfiguration?.details?.trim() || '–',
    bathroomLabel: room.bathroomLabel ?? null,
    sleepsLabel: String(room.occupancy?.maxTotal ?? room.occupancy?.maxAdults ?? '–'),
    locale,
    bookingUrl: room.bookingUrl ?? null,
    teaserImage,
    images: images.map(({ src, alt }) => ({ src, alt })),
    amenities: resolveTeaserAmenities(room, locale),
  }
}
