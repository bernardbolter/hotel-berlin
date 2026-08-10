import type { Media, MeetingRoom } from '@/payload-types'

export type MeetingLocale = 'de' | 'en'

export function resolveLocale(locale: string): MeetingLocale {
  return locale === 'en' ? 'en' : 'de'
}

export function meetingCanonicalPath(locale: MeetingLocale, slug?: string): string {
  if (locale === 'de') {
    return slug ? `/de/tagungen/${slug}` : '/de/tagungen'
  }
  return slug ? `/en/meetings/${slug}` : '/en/meetings'
}

/** Stable hash target for the inquiry form on every meetings page. */
export const MEETING_INQUIRY_ANCHOR = 'anfrage'

/**
 * Path to the inquiry form. Prefers in-page `#anfrage` on overview / room detail.
 * Standalone `/request` is kept for SEO and redirects/bookmarks.
 */
export function meetingRequestPath(locale: MeetingLocale, roomSlug?: string): string {
  const hash = `#${MEETING_INQUIRY_ANCHOR}`
  if (roomSlug) {
    return `${meetingCanonicalPath(locale, roomSlug)}${hash}`
  }
  return `${meetingCanonicalPath(locale)}${hash}`
}

/** Legacy standalone inquiry URL (indexed / bookmarked). */
export function meetingRequestStandalonePath(locale: MeetingLocale): string {
  return locale === 'de' ? '/de/tagungen/anfrage' : '/en/meetings/request'
}

export const AREA_LABELS: Record<
  NonNullable<MeetingRoom['area']>,
  { en: string; de: string }
> = {
  saal: { en: 'Berlin Ballroom', de: 'Berlin Ballroom' },
  'bereich-a': { en: 'Area A', de: 'Bereich A' },
  'bereich-b': { en: 'Area B', de: 'Bereich B' },
  'bereich-c': { en: 'Area C', de: 'Bereich C' },
  sonderflaeche: { en: 'Meeting Island', de: 'Meeting Island' },
}

export function areaLabel(
  area: MeetingRoom['area'] | null | undefined,
  locale: MeetingLocale,
): string {
  if (!area) return ''
  return AREA_LABELS[area][locale]
}

export type GalleryImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

export function meetingGalleryImages(room: MeetingRoom): GalleryImage[] {
  const images: GalleryImage[] = []
  for (const entry of room.images ?? []) {
    const media = entry.image
    if (!media || typeof media === 'number' || !media.url) continue
    images.push({
      src: media.url,
      alt: entry.alt || media.alt || room.name,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
    })
  }
  return images
}

export function meetingTeaserImage(room: MeetingRoom): GalleryImage | null {
  const teaser = room.teaserImage
  if (teaser && typeof teaser === 'object' && teaser.url) {
    return {
      src: teaser.url,
      alt: teaser.alt || room.name,
      width: teaser.width ?? undefined,
      height: teaser.height ?? undefined,
    }
  }
  return meetingGalleryImages(room)[0] ?? null
}

export function combinableRoomNames(
  room: MeetingRoom,
  locale: MeetingLocale,
): { slug: string; name: string }[] {
  return (
    room.combinableWith
      ?.map((entry) => {
        if (!entry || typeof entry === 'number') return null
        const name =
          entry.name?.trim() ||
          entry.slug
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
        return { slug: entry.slug, name }
      })
      .filter((r): r is { slug: string; name: string } => r !== null) ?? []
  )
}

export function maxCapacity(room: MeetingRoom): number | null {
  const c = room.capacity
  if (!c) return null
  const values = [
    c.theater,
    c.classroom,
    c.banquet,
    c.uShape,
    c.cabaret,
    c.reception,
    c.block,
  ].filter((n): n is number => typeof n === 'number' && n > 0)
  return values.length ? Math.max(...values) : null
}

/** Top capacity figures for finder cards — theater → banquet → classroom → rest. */
export function topCapacities(
  room: MeetingRoom,
  limit = 3,
): { key: keyof NonNullable<MeetingRoom['capacity']>; value: number }[] {
  const c = room.capacity
  if (!c) return []
  const priority: (keyof NonNullable<MeetingRoom['capacity']>)[] = [
    'theater',
    'banquet',
    'classroom',
    'uShape',
    'cabaret',
    'reception',
    'block',
  ]
  const out: { key: keyof NonNullable<MeetingRoom['capacity']>; value: number }[] = []
  for (const key of priority) {
    const value = c[key]
    if (typeof value === 'number' && value > 0) {
      out.push({ key, value })
      if (out.length >= limit) break
    }
  }
  return out
}

export function mediaFileUrl(file: number | Media | null | undefined): string | null {
  if (!file || typeof file === 'number') return null
  return file.url ?? null
}
