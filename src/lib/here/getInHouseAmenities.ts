import {
  Bike,
  Briefcase,
  Dumbbell,
  Flame,
  LayoutGrid,
  Plug,
  Table2,
  Waves,
  type LucideIcon,
} from 'lucide-react'

import type { AmenityCardImage, AmenityCardProps } from '@/components/here/AmenityCard'
import {
  assignAmenityStandIns,
  type AmenityStandInPhoto,
} from '@/lib/here/assignAmenityStandIns'
import { HERE_IMAGES } from '@/lib/here/images'
import { getPayloadClient } from '@/lib/payload/client'
import { getVenueBySlug } from '@/lib/payload/venues'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { localizeInBuildingLocation } from '@/lib/venues/localizeCopy'
import type { Media } from '@/payload-types'

export type InHouseAmenity = Omit<AmenityCardProps, 'icon'> & {
  key: string
  icon: LucideIcon
}

type Copy = {
  specWhen: string
  specPrice: string
  specWhat: string
  hoursToConfirm: string
  askReception: string
  locationTbc: string
  items: Record<
    string,
    {
      eyebrow: string
      title: string
      when?: string
      price?: string
      what?: string
      sub?: string
    }
  >
}

const SLUGS = {
  kttk: 'kttk',
  wallride: 'wallride',
  gym: 'gym',
  sauna: 'sauna',
  bettAndBike: 'bett-and-bike',
  businessCenter: 'business-center',
  eLaden: 'e-laden',
} as const

const ICONS: Record<string, LucideIcon> = {
  kttk: Table2,
  wallride: Waves,
  fingerboard: LayoutGrid,
  gym: Dumbbell,
  sauna: Flame,
  bettAndBike: Bike,
  businessCenter: Briefcase,
  eLaden: Plug,
}

const SKIP_FILENAME =
  /monogram|award|breeam|green-key|cvent|logo|favicon|\.svg$|\.pdf$/i

const HINT_FILENAMES = [
  'kttk',
  'suite-45',
  'meet-01',
  'saal-berlin',
  'standard-01',
  'junior-01',
  'food-drink',
  'vinyl',
  'cosy-small',
  'individual-room',
  'premium-01',
  'family-01',
]

function photoFromMedia(
  image: number | Media | null | undefined,
  fallbackAlt: string,
): AmenityCardImage | null {
  const src = mediaUrl(image)
  if (!src || typeof image !== 'object' || !image) return null
  return {
    src,
    alt: mediaAlt(image, fallbackAlt),
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }
}

function venueImage(
  venue: Awaited<ReturnType<typeof getVenueBySlug>>,
  fallback: AmenityCardImage | null,
): AmenityCardImage | null {
  if (venue) {
    const fromHero = photoFromMedia(venue.heroImage, venue.name)
    if (fromHero) return fromHero
  }
  return fallback
}

/**
 * Temporary fill from CMS media until each amenity has its own photograph.
 * Hinted filenames first so rooms/KTTK/sauna beat a pile of meeting-room heroes.
 */
async function getAmenityPhotoPool(): Promise<AmenityStandInPhoto[]> {
  const payload = await getPayloadClient()
  const seen = new Set<string>()
  const pool: AmenityStandInPhoto[] = []

  const pushDocs = (docs: Media[]) => {
    for (const doc of docs) {
      const src = mediaUrl(doc)
      const filename = doc.filename || ''
      if (!src || seen.has(src)) continue
      if (SKIP_FILENAME.test(filename)) continue
      if (doc.width && doc.width < 400) continue
      if (!doc.mimeType?.startsWith('image/') || doc.mimeType.includes('svg')) continue
      seen.add(src)
      pool.push({
        src,
        alt: doc.alt || filename,
        filename,
        width: doc.width ?? undefined,
        height: doc.height ?? undefined,
      })
    }
  }

  const batches = await Promise.all(
    HINT_FILENAMES.map((needle) =>
      payload
        .find({
          collection: 'media',
          limit: 3,
          depth: 0,
          where: { filename: { contains: needle } },
        })
        .catch(() => ({ docs: [] as Media[] })),
    ),
  )
  for (const batch of batches) pushDocs(batch.docs as Media[])

  if (pool.length < 12) {
    const extra = await payload
      .find({
        collection: 'media',
        limit: 40,
        depth: 0,
        sort: '-filesize',
        where: {
          or: [
            { mimeType: { equals: 'image/jpeg' } },
            { mimeType: { equals: 'image/webp' } },
          ],
        },
      })
      .catch(() => ({ docs: [] as Media[] }))
    pushDocs(extra.docs as Media[])
  }

  return pool
}

/**
 * Eight Im Haus cards. Venue rows fill hours/location/photo when present;
 * otherwise CMS media is used as a temporary stand-in. Fingerboard stays pending.
 * Sauna hours are never chosen from the two contradictory A–Z schedules.
 */
export async function getInHouseAmenities(
  locale: string,
  copy: Copy,
): Promise<InHouseAmenity[]> {
  const loc = locale === 'de' ? 'de' : 'en'
  const [kttk, wallride, gym, sauna, bike, business, ev, pool] = await Promise.all([
    getVenueBySlug(SLUGS.kttk, loc).catch(() => null),
    getVenueBySlug(SLUGS.wallride, loc).catch(() => null),
    getVenueBySlug(SLUGS.gym, loc).catch(() => null),
    getVenueBySlug(SLUGS.sauna, loc).catch(() => null),
    getVenueBySlug(SLUGS.bettAndBike, loc).catch(() => null),
    getVenueBySlug(SLUGS.businessCenter, loc).catch(() => null),
    getVenueBySlug(SLUGS.eLaden, loc).catch(() => null),
    getAmenityPhotoPool(),
  ])

  const locOf = (venue: typeof kttk, fallback: string) =>
    localizeInBuildingLocation(venue?.spotlightLocation || venue?.location, loc) || fallback

  const kttkCopy = copy.items.kttk
  const wallCopy = copy.items.wallride
  const fingerCopy = copy.items.fingerboard
  const gymCopy = copy.items.gym
  const saunaCopy = copy.items.sauna
  const bikeCopy = copy.items.bettAndBike
  const bizCopy = copy.items.businessCenter
  const evCopy = copy.items.eLaden

  const cards: InHouseAmenity[] = [
    {
      key: 'kttk',
      icon: ICONS.kttk,
      eyebrow: locOf(kttk, kttkCopy.eyebrow),
      title: kttk?.name?.replace(/^KTTK.*/, 'KTTK') || kttkCopy.title,
      specs: [
        { label: copy.specWhen, value: kttkCopy.when ?? '' },
        { label: copy.specPrice, value: kttkCopy.price ?? '' },
      ].filter((s) => s.value),
      subline: kttkCopy.sub,
      image: venueImage(kttk, null),
      href: null,
    },
    {
      key: 'wallride',
      icon: ICONS.wallride,
      eyebrow: locOf(wallride, wallCopy.eyebrow),
      title: wallride?.name || wallCopy.title,
      specs: wallCopy.what
        ? [{ label: copy.specWhat, value: wallCopy.what }]
        : [],
      subline: wallCopy.sub,
      image: venueImage(wallride, null),
      href: '/here/wallride',
    },
    {
      key: 'fingerboard',
      icon: ICONS.fingerboard,
      eyebrow: fingerCopy.eyebrow,
      title: fingerCopy.title,
      specs: [],
      subline: fingerCopy.sub,
      image: null,
      href: null,
      pending: true,
    },
    {
      key: 'gym',
      icon: ICONS.gym,
      eyebrow: locOf(gym, gymCopy.eyebrow),
      title: gym?.name || gymCopy.title,
      specs: gymCopy.when ? [{ label: copy.specWhen, value: gymCopy.when }] : [],
      subline: gymCopy.sub,
      image: venueImage(gym, null),
      href: null,
    },
    {
      key: 'sauna',
      icon: ICONS.sauna,
      eyebrow: locOf(sauna, saunaCopy.eyebrow),
      title: sauna?.name || saunaCopy.title,
      specs: [{ label: copy.specWhen, value: copy.hoursToConfirm }],
      subline: saunaCopy.sub,
      image: venueImage(sauna, null),
      href: null,
    },
    {
      key: 'bettAndBike',
      icon: ICONS.bettAndBike,
      eyebrow: locOf(bike, bikeCopy.eyebrow),
      title: bike?.name || bikeCopy.title,
      specs: [],
      subline: bikeCopy.sub || copy.askReception,
      image: venueImage(bike, null),
      href: null,
    },
    {
      key: 'businessCenter',
      icon: ICONS.businessCenter,
      eyebrow: locOf(business, bizCopy.eyebrow),
      title: business?.name || bizCopy.title,
      specs: [],
      subline: bizCopy.sub,
      image: venueImage(business, null),
      href: null,
    },
    {
      key: 'eLaden',
      icon: ICONS.eLaden,
      eyebrow: locOf(ev, evCopy.eyebrow),
      title: ev?.name || evCopy.title,
      specs: evCopy.what ? [{ label: copy.specWhat, value: evCopy.what }] : [],
      subline: evCopy.sub,
      image: venueImage(ev, null),
      href: null,
    },
  ]

  const occupied = cards.flatMap((card) => (card.image?.src ? [card.image.src] : []))
  const missing = cards.filter((card) => !card.image).map((card) => card.key)
  const standIns = assignAmenityStandIns(missing, occupied, pool)

  const withPhotos = cards.map((card) => {
    if (card.image) return card
    const standIn = standIns[card.key]
    if (standIn) {
      return {
        ...card,
        image: {
          src: standIn.src,
          alt: standIn.alt || card.title,
          width: standIn.width,
          height: standIn.height,
        },
      }
    }
    if (card.key === 'kttk') return { ...card, image: HERE_IMAGES.kttk }
    if (card.key === 'wallride') return { ...card, image: HERE_IMAGES.wallride }
    return card
  })

  return withPhotos.map((card) => ({
    ...card,
    eyebrow: card.eyebrow || copy.locationTbc,
  }))
}
