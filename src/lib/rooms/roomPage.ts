import type { Tag } from '@/payload-types'
import { formatRoomPrice, mapRoomToHeroItem } from '@/lib/rooms/roomHero'
import { getBathroomLabel } from '@/lib/rooms/bathroomLabels'
import type { Room } from '@/payload-types'

export function resolveLocale(locale: string): 'de' | 'en' {
  return locale === 'en' ? 'en' : 'de'
}

export function roomCanonicalPath(locale: 'de' | 'en', slug?: string): string {
  const base = locale === 'de' ? '/de/zimmer' : '/en/rooms'
  return slug ? `${base}/${slug}` : base
}

/** Bed / bathroom / size-style tags already covered by the detail spec strip — omit from amenity grid. */
const SPEC_STRIP_AMENITY_SLUGS = new Set([
  'king-bed',
  'king-bed-freestanding',
  'queen-bed',
  'twin-beds',
  'double-bed',
  'bunk-beds',
  'shower',
  'rain-shower',
  'bath-shower',
  'spa-bathroom',
  'separate-wc',
  'hair-dryer',
])

export type RoomAmenityForGrid = {
  id: number
  name: string
  description: string | null
  iconName: string | null
}

export function roomAmenities(room: Room): RoomAmenityForGrid[] {
  return (
    room.amenities
      ?.map((entry) => {
        if (!entry || typeof entry === 'number') return null
        const tag = entry as Tag
        if (SPEC_STRIP_AMENITY_SLUGS.has(tag.slug)) return null
        return {
          id: tag.id,
          name: tag.name,
          description: tag.description ?? null,
          iconName: tag.lucideIcon ?? null,
        }
      })
      .filter((a): a is RoomAmenityForGrid => a !== null) ?? []
  )
}

export function roomSpecChips(
  room: Room,
  locale: 'de' | 'en',
  labels: { size: string; bed: string; sleeps: string },
): { icon: string; label: string }[] {
  const chips: { icon: string; label: string }[] = []

  if (room.floorSizeM2 != null) {
    chips.push({ icon: 'Ruler', label: `${room.floorSizeM2} m²` })
  }

  const bed =
    room.bedConfiguration?.details?.trim() ||
    room.bedConfiguration?.type ||
    null
  if (bed) chips.push({ icon: 'BedDouble', label: bed })

  const sleeps = room.occupancy?.maxTotal ?? room.occupancy?.maxAdults
  if (sleeps != null) {
    chips.push({
      icon: 'Users',
      label: locale === 'de' ? `${sleeps} Gäste` : `${sleeps} guests`,
    })
  }

  // Prefer bathroom over a 4th chip if we somehow have more than 3
  if (chips.length < 3) {
    const bathroom = getBathroomLabel(room.bathroomLabel, locale)
    if (bathroom) chips.push({ icon: 'ShowerHead', label: bathroom })
  }

  void labels
  return chips.slice(0, 3)
}

export function roomHeroFields(room: Room, locale: 'de' | 'en', fromLabel: string) {
  return mapRoomToHeroItem(room, locale, fromLabel)
}

export { formatRoomPrice }
