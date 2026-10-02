import type { Media, Room, Tag } from '@/payload-types'

import { focalToObjectPosition } from '@/lib/media/focal'
import { mediaSizedUrl, mediaUrl } from '@/lib/media/url'
import { roomTeaserDescription } from '@/lib/rooms/roomDescription'

type RoomWithHeroFields = Room & {
  bathroomLabel?: 'shower' | 'rain-shower' | 'bath-shower' | 'spa-bathroom' | null
}

export type RoomTeaserAmenity = {
  id: number
  name: string
  iconName: string | null
}

export type RoomResolvedImage = {
  src: string
  alt: string
  srcSet?: string
  sizes: string
  objectPosition: string
  width?: number
  height?: number
  caption?: string | null
}

export type RoomTeaserImage = RoomResolvedImage

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
  teaserImage: RoomTeaserImage | null
  /** Card-sized gallery for index / homepage lists. */
  images: RoomResolvedImage[]
  /** Hero → card → original for detail gallery. */
  detailImages: RoomResolvedImage[]
  amenities: RoomTeaserAmenity[]
}

/** Homepage Sleep & Relax photo — ~2/3 desktop column, full width below lg. */
const TEASER_SIZES = '(max-width: 1023px) 100vw, 67vw'
const INDEX_SIZES = '(max-width: 768px) 100vw, 50vw'
const DETAIL_SIZES = '(max-width: 768px) 88vw, 72vw'

function asMedia(image: number | Media | null | undefined): Media | null {
  if (!image || typeof image === 'number') return null
  return image
}

function cardSrcSet(media: Media, cardUrl: string, originalUrl: string): string | undefined {
  if (cardUrl === originalUrl) return undefined
  const cardWidth = media.sizes?.card?.width ?? 864
  const originalWidth = media.width ?? Math.max(cardWidth * 2, 1920)
  return `${cardUrl} ${cardWidth}w, ${originalUrl} ${originalWidth}w`
}

function resolveCardImage(
  entry: NonNullable<Room['images']>[number],
  sizesAttr: string,
): RoomResolvedImage | null {
  const media = asMedia(entry.image)
  if (!media) return null
  const original = mediaUrl(media)
  if (!original) return null
  const card = mediaSizedUrl(media, 'card') ?? original
  return {
    src: card,
    alt: entry.alt || '',
    srcSet: cardSrcSet(media, card, original),
    sizes: sizesAttr,
    objectPosition: focalToObjectPosition(media.focalX, media.focalY),
    width: media.sizes?.card?.width ?? media.width ?? undefined,
    height: media.sizes?.card?.height ?? media.height ?? undefined,
    caption: entry.caption ?? null,
  }
}

function resolveDetailImage(
  entry: NonNullable<Room['images']>[number],
): RoomResolvedImage | null {
  const media = asMedia(entry.image)
  if (!media) return null
  const original = mediaUrl(media)
  if (!original) return null

  const hero = media.sizes?.hero?.url || null
  const card = media.sizes?.card?.url || null
  const src = hero || card || original

  let width = media.width ?? undefined
  let height = media.height ?? undefined
  if (hero && media.sizes?.hero?.width) {
    width = media.sizes.hero.width ?? undefined
    height = media.sizes.hero.height ?? undefined
  } else if (!hero && card && media.sizes?.card?.width) {
    width = media.sizes.card.width ?? undefined
    height = media.sizes.card.height ?? undefined
  }

  const srcSetParts: string[] = []
  if (hero) srcSetParts.push(`${hero} ${media.sizes?.hero?.width ?? 2880}w`)
  if (card && card !== hero) srcSetParts.push(`${card} ${media.sizes?.card?.width ?? 864}w`)
  if (original !== hero && original !== card) {
    srcSetParts.push(`${original} ${media.width ?? 1920}w`)
  }

  return {
    src,
    alt: entry.alt || '',
    srcSet: srcSetParts.length > 1 ? srcSetParts.join(', ') : undefined,
    sizes: DETAIL_SIZES,
    objectPosition: focalToObjectPosition(media.focalX, media.focalY),
    width,
    height,
    caption: entry.caption ?? null,
  }
}

function resolveTeaserImage(
  entry: NonNullable<Room['images']>[number] | undefined,
): RoomTeaserImage | null {
  if (!entry) return null
  return resolveCardImage(entry, TEASER_SIZES)
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
  const images =
    room.images
      ?.map((entry) => resolveCardImage(entry, INDEX_SIZES))
      .filter((img): img is RoomResolvedImage => img !== null) ?? []
  const detailImages =
    room.images
      ?.map((entry) => resolveDetailImage(entry))
      .filter((img): img is RoomResolvedImage => img !== null) ?? []
  const firstEntry = room.images?.[0]
  const teaserImage = resolveTeaserImage(firstEntry)
  const withAlt =
    teaserImage && !teaserImage.alt
      ? { ...teaserImage, alt: room.name }
      : teaserImage
  const priceLabel = formatRoomPrice(room.fromPrice, locale)

  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    shortDescription: roomTeaserDescription(room) || null,
    priceLabel,
    fromPriceLabel: `${fromLabel} ${priceLabel}`,
    sizeLabel: floorSizeM2 != null ? `${floorSizeM2} m²` : '–',
    bedLabel: room.bedConfiguration?.details?.trim() || '–',
    bathroomLabel: room.bathroomLabel ?? null,
    sleepsLabel: String(room.occupancy?.maxTotal ?? room.occupancy?.maxAdults ?? '–'),
    locale,
    bookingUrl: room.bookingUrl ?? null,
    teaserImage: withAlt,
    images: images.map((img) =>
      img.alt ? img : { ...img, alt: room.name },
    ),
    detailImages: detailImages.map((img) =>
      img.alt ? img : { ...img, alt: room.name },
    ),
    amenities: resolveTeaserAmenities(room, locale),
  }
}
