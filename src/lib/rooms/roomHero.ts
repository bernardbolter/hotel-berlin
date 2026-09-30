import type { Media, Room, Tag } from '@/payload-types'

type RoomWithHeroFields = Room & {
  bathroomLabel?: 'shower' | 'rain-shower' | 'bath-shower' | 'spa-bathroom' | null
}

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
  /** First gallery image, or null when empty (F5 — no stock stand-in). */
  teaserImage: { src: string; alt: string } | null
  images: { src: string; alt: string }[]
  amenities: RoomTeaserAmenity[]
}

function resolveMediaUrl(image: number | Media | undefined | null): string | null {
  if (!image || typeof image === 'number') return null
  return image.url ?? null
}

type ResolvedRoomImage = { src: string; alt: string }

function resolveRoomImages(room: Room): ResolvedRoomImage[] {
  return (
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
  )
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
  _locale: 'en' | 'de',
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
  const teaserImage = images[0]
    ? { src: images[0].src, alt: images[0].alt || room.name }
    : null
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
