# Hotel Berlin, Berlin — Amenities Step 0

*Report only. Written 20 September 2026. Nothing in the repo was changed except this file.*

Dev database: `postgresql://bescohome@localhost:5432/hotelberlin`.  
Fresh server: `PORT=3010 npm run dev` (Next.js 16.2.6). The long-running `:3000` process (PID 30366) was stopped because Next refused a second compile (`Another next dev server is already running`).  
Branch worktree as of this pass. Locale layout JSON-LD does not include `containsPlace`.

Named briefs that this pass was asked to check:

| Path | Status |
|---|---|
| `claude/HotelBerlin_HubCards_BuildBrief.md` | **does not exist** (same finding as 16 Sept audit §19 / §65) |
| `claude/HotelBerlin_HerePage_IA_Wireframe.html` | **does not exist** |

Closest on-disk substitutes, used only where this prompt names a check that those files would have owned: `doc/here/here_desktop_wireframe.html`, `doc/here/HotelBerlin_HereWireframe_v2.html`, `doc/here/HotelBerlin_HomeHereReconciliation_BuildBrief.md`, `docs/audit/2026-09-16-full-site-audit.md` §19 + §23 + §42.

---

## 1. Im Haus: where the data comes from

### 1. `getInHouseAmenities.ts` in full

File: `src/lib/here/getInHouseAmenities.ts` (327 lines).

```ts
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
import type { Media, Venue } from '@/payload-types'

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
  venue: Venue | null | undefined,
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
```

Copy is assembled in `InTheHouseSection.tsx:13-67` from `getTranslations('here.inHouse')` (`de.json:103-157` / `en.json:103-157`).

Live `/de/hier` (fresh `:3010`, 20 Sept 2026): region `Im Haus`, eight cards in this order: KTTK, Wallride, Fingerboard-Rampen, Gym, Sauna & Sanarium, Bett & Bike, Business Center, E-Laden.

### 2. Field sources, one row per card

Live `/de/hier` values in the last column. “Venue row” means a `venues` document whose slug is in `SLUGS`. SQL this pass: **only `kttk` of the eight has a matching row.** `wallride`, `gym`, `sauna`, `bett-and-bike`, `business-center`, `e-laden` **do not exist** in `venues`. Fingerboard has no slug in `SLUGS` and is never queried.

| Card | key/slug | title | eyebrow (location) | Wann | Preis / Was | sub-line | image (live) | icon | link | pending |
|---|---|---|---|---|---|---|---|---|---|---|
| KTTK | hard-coded `key: 'kttk'` + `SLUGS.kttk = 'kttk'` (`getInHouseAmenities.ts:50-51,212`) | venue `name` with `/^KTTK.*/` → `'KTTK'` **or** `here.inHouse.kttk.title` (`:215`, `de.json:114`) | `locOf(venue)` = `venues.spotlightLocation` \|\| `venues.location` through `localizeInBuildingLocation` **or** `here.inHouse.kttk.eyebrow` (`:198-199,214`, `de.json:113`) | **i18n only** `here.inHouse.kttk.when` (`:217`, `de.json:115`). Venue `openingHours` is **not** read. | **i18n only** `here.inHouse.kttk.price` (`:218`, `de.json:116`) | `here.inHouse.kttk.sub` (`:220`, `de.json:117`) | no `venues.hero_image_id`; stand-in `/api/media/file/kttk-tournament-night.jpeg` (alt = filename) | hard-coded `ICONS.kttk = Table2` (`:61`) | `href: null` (`:222`) | `pending` omitted (false) |
| Wallride | hard-coded `key: 'wallride'` + slug `'wallride'` (`:52,225`) | venue `name` **or** `here.inHouse.wallride.title` (`:228`, `de.json:121`). No venue row → i18n. | i18n `here.inHouse.wallride.eyebrow` (`de.json:120`) because venue is null | does not exist on this card | **i18n** `here.inHouse.wallride.what` as spec “Was” (`:229-231`, `de.json:122`) | `here.inHouse.wallride.sub` (`:232`, `de.json:123`) | stand-in `suite-45-12.jpg` (room photo, not a half-pipe) | `ICONS.wallride = Waves` (`:62`) | hard-coded `href: '/here/wallride'` (`:234`). Live: `<a href="/de/hier/wallride">` | false |
| Fingerboard | hard-coded `key: 'fingerboard'` (`:237`). **Not in `SLUGS`.** No venue query. | `here.inHouse.fingerboard.title` (`:240`, `de.json:127`) | `here.inHouse.fingerboard.eyebrow` (`:239`, `de.json:126`) | does not exist (empty `specs`) | does not exist | `here.inHouse.fingerboard.sub` (`:242`, `de.json:128`) | `image: null` then stand-in `junior-01.jpg` | `ICONS.fingerboard = LayoutGrid` (`:63`) | `href: null` (`:244`) | **hard-coded `pending: true`** (`:245`) |
| Gym | hard-coded `key: 'gym'` + slug `'gym'` (`:53,248`) | venue `name` **or** `here.inHouse.gym.title` (`:251`, `de.json:131`). No venue → i18n. | i18n `here.inHouse.gym.eyebrow` (`de.json:130`) | **i18n** `here.inHouse.gym.when` (`:252`, `de.json:132`) | does not exist | `here.inHouse.gym.sub` (`:253`, `de.json:133`) | stand-in `standard-01.jpg` | `ICONS.gym = Dumbbell` (`:64`) | `href: null` | false |
| Sauna | hard-coded `key: 'sauna'` + slug `'sauna'` (`:54,258`) | venue `name` **or** `here.inHouse.sauna.title` (`:261`, `de.json:137`) | i18n `here.inHouse.sauna.eyebrow` (`de.json:136`) | **i18n `here.inHouse.hoursToConfirm`**, not `sauna.when` (`:262`, `de.json:109`). Comment at `:180-181`: “Sauna hours are never chosen from the two contradictory A–Z schedules.” | does not exist | `here.inHouse.sauna.sub` (`:263`, `de.json:138-139`) | stand-in `suite-45-123.jpg` | `ICONS.sauna = Flame` (`:65`) | `href: null` | false |
| Bett & Bike | hard-coded `key: 'bettAndBike'` + slug `'bett-and-bike'` (`:55,268`) | venue `name` **or** `here.inHouse.bettAndBike.title` (`:271`, `de.json:142`) | i18n `here.inHouse.bettAndBike.eyebrow` (`de.json:141`) | does not exist | does not exist | `here.inHouse.bettAndBike.sub` \|\| `here.inHouse.askReception` (`:273`, `de.json:143,110`) | stand-in `suite-45-11.jpg` | `ICONS.bettAndBike = Bike` (`:66`) | `href: null` | false |
| Business Center | hard-coded `key: 'businessCenter'` + slug `'business-center'` (`:56,278`) | venue `name` **or** `here.inHouse.businessCenter.title` (`:281`, `de.json:147`) | i18n `here.inHouse.businessCenter.eyebrow` (`de.json:146`) | does not exist | does not exist | `here.inHouse.businessCenter.sub` (`:282`, `de.json:148`) | stand-in `meet-01.jpg` | `ICONS.businessCenter = Briefcase` (`:67`) | `href: null` | false |
| E-Laden | hard-coded `key: 'eLaden'` + slug `'e-laden'` (`:57,288`) | venue `name` **or** `here.inHouse.eLaden.title` (`:291`, `de.json:152`) | i18n `here.inHouse.eLaden.eyebrow` (`de.json:151`) | does not exist | **i18n** `here.inHouse.eLaden.what` as spec “Was” (`:292`, `de.json:153`) | `here.inHouse.eLaden.sub` (`:293`, `de.json:154`) | stand-in `saal-berlin-berlin.jpg` | `ICONS.eLaden = Plug` (`:68`) | `href: null` | false |

Live `/de/hier` KTTK eyebrow rendered **`B2 Basement`** (English `venues.location`), not `de.json:113` “B2 Keller”. `localizeInBuildingLocation` (`src/lib/venues/localizeCopy.ts:3-12`) only rewrites “Ground Floor” → “Erdgeschoss”. Because `kttk` has a venue row, the i18n eyebrow is skipped.

Live `/en/here` titles/copy match `en.json:103-157`. EV card title is “EV charging” (`en.json:153`), DE title is “E-Laden” (`de.json:152`).

`hotel` global is **not** read by `getInHouseAmenities`.

### 3. List of eight: code or query?

**Defined in code.** The eight cards are a literal array (`getInHouseAmenities.ts:210-297`). Seven slugs are looked up with `getVenueBySlug` (`:188-194`); Fingerboard is not. A missing venue does not drop the card — i18n fills title/eyebrow/specs.

`venues.displayOrder` is **not** used. `getVenues()` / `getFeaturedVenues()` (`src/lib/payload/venues.ts:5-24`) are exported and **never called** from app code.

### 4. Card order

Hard-coded array order in `getInHouseAmenities.ts:210-297`. Rendered in that order by `InTheHouseSection.tsx:73-80`. Live `/de/hier` matched that order.

### 5. Pending state (Fingerboard)

Hard-coded `pending: true` on the Fingerboard object (`getInHouseAmenities.ts:245`). Not a field value. Not a missing record (Fingerboard is never queried). `AmenityCard.tsx:85` adds `amenity-card--pending`. Live: `class="amenity-card amenity-card--pending"`, `border-style: dashed`, `border-color: rgb(224, 220, 213)` (`--cardline` `#e0dcd5`, `globals.css:36,2037`).

The hatch in `.amenity-card--pending:not(:has(img))` (`globals.css:2072-2079`) did **not** apply live, because Fingerboard still received a stand-in `<img>` (`junior-01.jpg`).

### 6. No-photo state (flat block + Lucide glyph)

Trigger: `AmenityCard.tsx:47-59` — if `image` is falsy, media gets `amenity-card__media--empty` and renders `<Icon>`. Icon comes from the `ICONS` map (`getInHouseAmenities.ts:60-69`), passed as `icon` (`InTheHouseSection.tsx:77`).

Live `/de/hier`: **none of the eight cards hit this state.** All eight had `<img>`. Stand-in assignment (`assignAmenityStandIns.ts:41-73`) filled every card that lacked `venues.heroImage`. Last-resort `HERE_IMAGES.kttk` / `HERE_IMAGES.wallride` (`getInHouseAmenities.ts:317-318`, `images.ts:13-27`) was not needed on this render.

### 7. Hours: `openingHours` / `venue-time` or free text?

**Free-text i18n strings.** `getInHouseAmenities` never reads `venue.openingHours` and never imports `venue-time` / `deriveOpenClosed`.

Render path:

1. `InTheHouseSection.tsx:16,24,42` passes `t('kttk.when')`, `t('gym.when')`, `t('hoursToConfirm')`.
2. `getInHouseAmenities.ts:216-218,252,262` puts those strings on `specs`.
3. `AmenityCard.tsx:68-76` renders `<dl class="amenity-card__specs"><dt>…</dt><dd>…</dd></dl>`.

Live `/de/hier`: KTTK Wann `Mo–So, 13:00–23:00`; Gym Wann `24/7`; Sauna Wann `Zeiten noch zu bestätigen`.

SQL: `venues_opening_hours` for `kttk` is **only** `Thursday 19:00–02:00` / segment `Tournament Night` / `is_open_ended = t`. That row is unused by Im Haus. Seed `venuesSeed` (`data.ts:785-794`) also has `Mo-Su 13:00–23:00` Open Play; `here-dining.ts:119-134` overwrote KTTK hours to the Thursday row only.

`venue-time` **is** used on dining (`getDiningBand.ts:8,86`) and tonight (`tonight.ts:3-8`), not on Im Haus.

### 8. Links

| Card | Live tag | href | Who decides |
|---|---|---|---|
| Wallride | `<a class="amenity-card">` | `/de/hier/wallride` (`href: '/here/wallride'`, `getInHouseAmenities.ts:234`; `AmenityCard.tsx:87-91`) | hard-coded non-null `href` |
| Other seven | `<article class="amenity-card">` | none | hard-coded `href: null` |

`AmenityCard.tsx:31-32,87-95`: whole card is the link when `href` is set; otherwise inert. No per-card CTA. Live CDP: `hasCta: false` on all eight.

### 9. Thought experiment (no code change)

**(a) Add a ninth amenity “Bibliothek”**

Files a developer would touch: `getInHouseAmenities.ts` (`SLUGS`, `ICONS`, `cards` array), `InTheHouseSection.tsx` (copy keys), `de.json` + `en.json` (`here.inHouse.*`), `assignAmenityStandIns.ts` (`HINTS`, `STAND_IN_ASSIGN_ORDER`) if a stand-in photo is wanted. Optionally `src/seed/data.ts` `venuesSeed` / `hereAmenityLocalesDe` and `src/seed/here-amenities.ts` `AMENITY_SLUGS` if a venue row is wanted. Creating a `venues` row alone would **not** add a card.

Payload editor alone: **no**.

**(b) Remove “Business Center”**

Files: `getInHouseAmenities.ts` (drop the object from the array; also `SLUGS` / `ICONS` if cleaning). `InTheHouseSection.tsx` + i18n keys leftover unless removed. Deleting the venue row would do nothing — there is no `business-center` row, and the card does not require one.

Payload editor alone: **no**.

**(c) Move Sauna to first position**

Files: reorder the literal in `getInHouseAmenities.ts:210-297`. `venues.displayOrder` is ignored.

Payload editor alone: **no**.

**(d) Change the gym’s price**

The gym card has **no price spec**. Live specs are only Wann `24/7`. There is no gym price in i18n, venue `priceRange`, or `hotel.guestStay`. Adding a price would require `getInHouseAmenities.ts` (a `price` spec like KTTK) plus `de.json` / `en.json`. Changing KTTK’s price is i18n-only (`de.json:116` / `en.json:116`).

Payload editor alone: **no** (and today there is no gym price to edit).

---

## 2. Im Haus: collections and records

### 10. `Venues` collection config in full

File: `src/collections/Venues.ts`.

```ts
import type { CollectionConfig } from 'payload'

import { publicReadStaffWrite } from '@/access'
import { openingHoursArrayField } from '../fields/openingHours'
import { collectionCacheHooks } from '@/lib/payload/revalidate'

export const Venues: CollectionConfig = {
  slug: 'venues',
  ...collectionCacheHooks('venues'),
  access: publicReadStaffWrite,
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'venueType',
      type: 'select',
      required: true,
      options: [
        { label: 'Restaurant', value: 'Restaurant' },
        { label: 'Bar', value: 'Bar' },
        { label: 'Art Gallery', value: 'ArtGallery' },
        { label: 'Sports Activity Location', value: 'SportsActivityLocation' },
        { label: 'Event Venue', value: 'EventVenue' },
        { label: 'Local Business', value: 'LocalBusiness' },
      ],
    },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'e.g. "B2 Basement", "Ground Floor", "Lützowplatz 17"' },
    },
    {
      name: 'spotlightLocation',
      type: 'text',
      admin: {
        description:
          'Short in-building location for spotlight/hero secondary meta, e.g. "B2 Basement"',
      },
    },
    { name: 'telephone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'text' },
    { name: 'instagramUrl', type: 'text' },
    {
      name: 'venueMonogram',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional SVG/logo mark for SpotlightCard identity row' },
    },
    openingHoursArrayField(),
    {
      name: 'servesCuisine',
      type: 'text',
      admin: { description: 'Restaurant only. e.g. Italian, International' },
    },
    { name: 'reservationUrl', type: 'text' },
    { name: 'menuUrl', type: 'text' },
    { name: 'priceRange', type: 'text' },
    { name: 'isOpenToPublic', type: 'checkbox', defaultValue: true },
    { name: 'isGuestFacing', type: 'checkbox', defaultValue: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
      ],
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'displayOrder', type: 'number' },
  ],
}
```

Field list (type / required / localized):

| Field | Type | Required | Localized | `admin.description` |
|---|---|---|---|---|
| name | text | true | true | missing |
| slug | text | true | false | missing |
| venueType | select | true | false | missing |
| tagline | text | false | true | missing |
| description | richText | false | true | missing |
| shortDescription | textarea | false | true | missing |
| location | text | false | **false** | present |
| spotlightLocation | text | false | **false** | present |
| telephone | text | false | false | missing |
| email | email | false | false | missing |
| website | text | false | false | missing |
| instagramUrl | text | false | false | missing |
| venueMonogram | upload → media | false | false | present |
| openingHours | array | false | false | missing on array; present on row fields |
| openingHours[].dayOfWeek | text | false | false | present |
| openingHours[].opens | text | false | false | present |
| openingHours[].closes | text | false | false | present |
| openingHours[].isOpenEnded | checkbox | false | false | present |
| openingHours[].segment | text | false | false | present |
| openingHours[].note | text | false | false | present |
| servesCuisine | text | false | false | present |
| reservationUrl | text | false | false | missing |
| menuUrl | text | false | false | missing |
| priceRange | text | false | false | missing |
| isOpenToPublic | checkbox | false | false | missing |
| isGuestFacing | checkbox | false | false | missing |
| heroImage | upload → media | false | false | missing |
| images[] | array of upload + alt | image+alt required | false | missing |
| tags | relationship → tags, hasMany | false | false | missing |
| sameAs[].url | text | false | false | missing |
| featured | checkbox | false | false | missing |
| displayOrder | number | false | false | missing |

Collection `admin`: only `useAsTitle: 'name'`. No `description`, no `defaultColumns`, no `labels`. Access: `publicReadStaffWrite` (`src/access/index.ts:45-50`) — staff (admin **or** editor) may create/update/delete.

### 11. SQL: every `venues` row

```sql
SELECT v.id, v.slug, v.venue_type, v.location, v.spotlight_location,
       v.hero_image_id IS NOT NULL AS has_hero_image,
       EXISTS (SELECT 1 FROM venues_opening_hours h WHERE h._parent_id = v.id) AS has_opening_hours,
       (SELECT name FROM venues_locales WHERE _parent_id = v.id AND _locale = 'de') AS name_de,
       (SELECT name FROM venues_locales WHERE _parent_id = v.id AND _locale = 'en') AS name_en
FROM venues v
ORDER BY v.display_order NULLS LAST, v.id;
```

Result (5 rows):

| id | slug | venueType | location | spotlightLocation | hours | hero image | name DE | name EN |
|---|---|---|---|---|---|---|---|---|
| 1 | lutze | Restaurant | Ground Floor, Lützowplatz 17 | Ground floor | yes (3 rows) | no | Lütze | Lütze |
| 2 | fkkb | ArtGallery | Hotel Berlin, Berlin — multiple floors | empty | no | no | **no DE locale row** | FKKB — Freiluft Kunst Klub Berlin |
| 3 | kttk | SportsActivityLocation | B2 Basement | empty | yes (1 row: Thursday tournament) | no | **no DE locale row** | KTTK — Königlicher Tischtennis Klub Berlin |
| 4 | sissi | SportsActivityLocation | Hotel Berlin, Berlin | empty | no | no | **no DE locale row** | Sissi Skateboard Club |
| 5 | wundermart | LocalBusiness | Lobby | empty | yes (Mo-Su 00:00–24:00) | no | Wundermart | Wundermart |

`venues_locales`: 7 rows (lutze de+en, fkkb en only, kttk en only, sissi en only, wundermart de+en).

Which of the eight Im Haus cards have a matching row:

| Card | Matching `venues` row |
|---|---|
| KTTK | **yes** (`kttk`) |
| Wallride | **no** (`wallride` does not exist; `sissi` is a different slug) |
| Fingerboard | **no** |
| Gym | **no** |
| Sauna | **no** |
| Bett & Bike | **no** |
| Business Center | **no** |
| E-Laden | **no** |

`src/seed/data.ts:815-883` and `src/seed/here-amenities.ts:14-22` define wallride/gym/sauna/bett-and-bike/business-center/e-laden. Those rows are **not in this database**. `npm run seed:here-amenities` has not been applied here (or was not kept).

### 12. Other collections / globals holding facility facts

Every duplicate source for the same fact is listed. Surfaces that **compute** a value but do **not** render it are marked.

**Sauna**

| Location | What it says |
|---|---|
| Live Im Haus card | Wann “Zeiten noch zu bestätigen”; sub “Zwei veröffentlichte Zeiten…” (`de.json:109,138-139`) |
| FAQ `guest-sauna` (DB + `guest-az-faqs.ts:484-495`) | “auf Anfrage, 45 Minuten Vorlauf” |
| Prospect FAQ `does-hotel-berlin-berlin-have-a-sauna-or-fitnes` | EN only: “has a sauna and fitness centre”. DE question/answer empty |
| `hotel.guestStay.more.saunaFitness` (DB) | valueDE/EN `24/7`, noteDE `Sauna · Fitness`, noteEN `Sauna · gym` (`Hotel.ts:143-148`, seed `data.ts:124-128`) |
| `hotel.amenityFeature` row 3 (DB) | name `Sauna`, value true |
| `here.goodToKnow.health.gym` (`de.json` / `en.json:257`) | “Sauna · 24/7 gym” — **no component references `goodToKnow`** |
| `StayInfoCard` extras (`hotel.ts:190-194`) | would show saunaFitness **if** `StayInfoCard` mounted; it is only re-exported (`here/index.ts:3`), unused on `/here` |
| Galaxy `/ubernachten-relaxen/serviceleistungen` | Gym 24/7; sauna 18:00–23:00; “Öffnungszeiten: Montag–Donnerstag 18:00–23:00 Freitag–Sonntag + Feiertage 15:00–23:00” |
| Galaxy `/ubernachten-relaxen/sauna-fitness` | Fitness 24/7; Wellness 18:00–23:00 auf Anfrage; summer 15.06–15.09 on request, 45 min notice |
| Room tag `private-sauna` | room amenity, Studio 45; `rooms.has_sauna = t` only on `studio-45` |
| `venues` slug `sauna` | **does not exist** |

**Gym / fitness**

| Location | What it says |
|---|---|
| Im Haus card | Wann 24/7; sub “Rund um die Uhr” (`de.json:132-133`) |
| FAQ `guest-gym` | “Das Gym ist 24/7 für Hotelgäste offen.” |
| `hotel.guestStay.more.saunaFitness` | `24/7` (shared with sauna) |
| `hotel.amenityFeature` row 4 | `Fitness Centre` |
| Galaxy amenities-services + sauna-fitness | 24/7, free, listed machines |
| `venues` slug `gym` | **does not exist** |

**KTTK hours / price**

| Location | What it says |
|---|---|
| Im Haus Wann/Preis | i18n `Mo–So, 13:00–23:00` / `5 € / 30 Min.` (`de.json:115-116`) |
| `venues_opening_hours` for `kttk` | Thursday 19:00–02:00 tournament only |
| `venuesSeed` (`data.ts:785-794`) | Mo-Su 13:00–23:00 Open Play **and** Thursday tournament |
| `here-dining.ts:125-133` | overwrite to Thursday tournament only |
| `venues_locales` EN shortDescription | “Thursday tournament nights from 19:00… €5 entry.” |
| Event `kttk-tournament-night` | venue `kttk`; live hub strip “€5 · ohne Buchung” |

**Bett & Bike / bikes**

| Location | What it says |
|---|---|
| Im Haus card | “Fahrradverleih — an der Rezeption erfragen” |
| FAQ `guest-bike-garage` | storage + e-bike charging, not rental |
| `hotel.guestStay.more.bettAndBike` (DB) | **empty** (schema field exists, `Hotel.ts:142`) |
| Galaxy `/ubernachten-relaxen/bettundbike` | certification, covered parking, e-bike charging, tools, **rental**, packed lunches, maps, R1 |
| `venues` slug `bett-and-bike` | **does not exist** |

**E-Laden / EV**

| Location | What it says |
|---|---|
| Im Haus card | Was `8 × Typ 2`; sub “Ladestationen für Elektroautos”; eyebrow “Vor Ort” |
| FAQ `guest-ev-charging` | “8 AC-Punkte, bis 22 kW, Typ 2” |
| Prospect FAQ `parking` | “E-Ladestationen gibt es **in der Nähe**” |
| `hotel.amenityFeature` row 6 | `EV Charging Nearby` |
| `venues` slug `e-laden` | **does not exist** |

**Business Center / ATM**

| Location | What it says |
|---|---|
| Im Haus card | sub “Geldautomat im Haus”; no location spec |
| FAQ `guest-business-center` | “Das Business Center ist **in der Lobby**.” |
| `here.goodToKnow.money.atm` | “ATM · business center” — unused |
| `venues` slug `business-center` | **does not exist** |

**WiFi**

| Location | What it says |
|---|---|
| Room tag `free-wifi` | name DE===EN “Free WiFi”; 11/11 rooms |
| Homepage teaser pill | “Free WiFi” on `/de` (tag name) |
| `hotel.amenityFeature` row 1 | `Free WiFi` |
| `hotel.guestStay.wifiNetwork` / `wifiPassword` (DB) | `HBB_Guest` / `welcome1958` — rendered in `/here` hero (`HereHeroLayout.tsx:107-109`) |
| FAQ `guest-wifi` | ask Guest Care; **no credentials** |
| Prospect FAQ `is-there-wifi-at-hotel-berlin-berlin-` | EN only: free WiFi in rooms and throughout; DE empty |
| Galaxy amenities-services | “High-speed Internet” / “Highspeed Internet”, no SSID |
| Im Haus | WiFi is **not** an Im Haus card |

**Wundermart** — see §15.

### 13. Does `venues` serve other surfaces? What would a new row appear in?

`containsPlace` in this repo: **does not exist** (`src/lib/aeo-schema` and `src/lib/aeo` have zero matches). Layout hotel JSON-LD (`src/app/[locale]/layout.tsx:43-66`) has no `containsPlace` and no `amenityFeature`.

Every `venues` query:

| Call | Filter | Used by |
|---|---|---|
| `getVenues()` | none; `sort: 'displayOrder'`; limit 20 | **defined only** (`venues.ts:5-12`). No app importer. |
| `getFeaturedVenues()` | `featured: equals true`; limit 4 | **defined only** (`venues.ts:15-24`). |
| `getVenueBySlug(slug, locale)` | `slug: equals slug`; limit 1; locale + fallback EN | listed below |

`getVenueBySlug` call sites:

| Slug | File | Surface |
|---|---|---|
| `kttk` | `getInHouseAmenities.ts:188` | Im Haus card (location/title/photo only; hours ignored) |
| `wallride` | `getInHouseAmenities.ts:189` | Im Haus (null today) |
| `gym` | `:190` | Im Haus (null) |
| `sauna` | `:191` | Im Haus (null) |
| `bett-and-bike` | `:192` | Im Haus (null) |
| `business-center` | `:193` | Im Haus (null) |
| `e-laden` | `:194` | Im Haus (null) |
| `lutze` | `getDiningBand.ts:76`, `here/dining/page.tsx:37`, `restaurant/page.tsx:41,64`, `LutzeSection.tsx:19` | dining band, dining page, restaurant page, homepage Lütze teaser |
| `wundermart` | `getDiningBand.ts:77`, `here/dining/page.tsx:38` | dining band + dining page |
| `lutze-garten` | `getDiningBand.ts:78` | dining band garden card if `isGuestFacing` + copy/images |
| `fkkb` | `getArtWall.ts:64`, `getHubStripCards.ts:35`, `homepageSpotlight.ts:36`, `tonight.ts:71`, unused `ArtInBuildingSection.tsx:29` | art wall, hub strip, homepage happenings, tonight helpers |

Relationship FKs (SQL this pass): `events.venue` 4 rows (`vinyl-nights`→lutze, `zeichenstammtisch`→lutze, `kttk-open-play`→kttk, `kttk-tournament-night`→kttk); `exhibitions.venue` 1 (`magwie-x-cokyone`→fkkb); `hero_slides.venue` 0; `people.related_venue` 0.

A **new** `venues` row would **not** appear on Im Haus unless its slug is added to the hard-coded array. It would not appear on dining unless the slug is `lutze` / `wundermart` / `lutze-garten`. It would not appear in JSON-LD `containsPlace` (that field does not exist). It would appear on an event/exhibition/hero-slide/person only if an editor set that relationship. It would appear in `getVenues()` / `getFeaturedVenues()` if those functions were called (they are not). Neighbourhood map uses `neighbourhood-places`, not `venues`.

### 14. `openingHours` exceptions

Field factory: `src/fields/openingHours.ts` in full:

```ts
export const openingHoursRowFields: Field[] = [
  { name: 'dayOfWeek', type: 'text', admin: { description: 'e.g. Mo-Su, Mo-Fr, Sa-Su, or Thursday' } },
  { name: 'opens', type: 'text', admin: { description: 'e.g. 10:00' } },
  { name: 'closes', type: 'text', admin: { description: 'Clock time, e.g. 22:30 or 01:00. Required for open/closed status.' } },
  {
    name: 'isOpenEnded',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'No advertised close — still store a clock bound in `closes` so status can be derived. The UI renders the i18n “open end” phrase.',
    },
  },
  {
    name: 'segment',
    type: 'text',
    admin: {
      description:
        'Grouping label for open/closed status, e.g. "Bar" / "Kitchen" / "Breakfast". Multiple rows may share a segment.',
    },
  },
  {
    name: 'note',
    type: 'text',
    admin: { description: 'Optional status note, e.g. "Kitchen closes 22:30"' },
  },
]
```

SQL table `venues_opening_hours`: `_order`, `_parent_id`, `id`, `day_of_week`, `opens`, `closes`, `segment`, `note`, `is_open_ended`. **No** `validFrom` / `validThrough` / date / holiday / exception columns.

One-off closures, holiday hours, and an “on request” flag: **the field does not support them.** “On request” exists only as FAQ/i18n copy. Galaxy sauna-fitness summer window (15.06–15.09) has no matching schema.

### 15. Wundermart: dining, Im Haus, or both?

**Dining only.**

Live `/de/hier`: Wundermart is a dining-band card (“Rund um die Uhr Wundermart 24/7 · Lobby”). It is **not** among the eight Im Haus cards.

Code: `getDiningBand.ts:142-149` pushes a wundermart card when `getVenueBySlug('wundermart')` returns a row; `here/dining/page.tsx:102-110` also renders it. `getInHouseAmenities` never queries `wundermart`.

IA file `claude/HotelBerlin_HerePage_IA_Wireframe.html`: **does not exist.** Closest wireframe `doc/here/here_desktop_wireframe.html:232-248` “In the basement” is KTTK + Wallride + Fingerboard only. `HotelBerlin_HerePage_ContentStrategy_v1.md:71`: “Wundermart — shop/kiosk… **No `/here` card exists.**” That sentence is stale: a dining card exists; an Im Haus card does not.

---

## 3. Room amenities (tags)

### 16. `Tags` collection config

File: `src/collections/Tags.ts` in full:

```ts
export const Tags: CollectionConfig = {
  slug: 'tags',
  ...collectionCacheHooks('tags'),
  access: publicReadStaffWrite,
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'description',
      type: 'text',
      localized: true,
      admin: {
        description:
          'One-line amenity description reused on room detail grids. Amenity tags only.',
        condition: (data) => data.type === 'amenity',
      },
    },
    {
      name: 'lucideIcon',
      type: 'text',
      label: 'Lucide icon',
      admin: {
        components: {
          Field: '/components/admin/LucideIconPicker#LucideIconPicker',
        },
        description: 'Pick a Lucide icon. Leave blank for no icon.',
        condition: (data) => data.type === 'amenity',
      },
    } satisfies TextField,
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Medium', value: 'medium' },
        { label: 'Theme', value: 'theme' },
        { label: 'Amenity', value: 'amenity' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
      ],
    },
  ],
}
```

Amenity type is distinguished by `type` select value `'amenity'` (`Tags.ts:37-47`). `description` and `lucideIcon` are hidden unless `type === 'amenity'` (`condition` at `:21,33`).

No `defaultColumns`. No list-view ordering field. Access: `publicReadStaffWrite`.

### 17. SQL: all amenity tags

```sql
SELECT t.slug, t.lucide_icon,
       de.name AS name_de, en.name AS name_en,
       (de.name IS NOT DISTINCT FROM en.name) AS de_eq_en_name,
       (SELECT COUNT(*) FROM rooms_rels r WHERE r.tags_id = t.id AND r.path = 'amenities') AS rooms_amenities
FROM tags t
LEFT JOIN tags_locales de ON de._parent_id = t.id AND de._locale = 'de'
LEFT JOIN tags_locales en ON en._parent_id = t.id AND en._locale = 'en'
WHERE t.type = 'amenity'
ORDER BY t.slug;
```

Summary: **50** amenity tags. `de === en` name: **49**. DE name empty: **1** (`wellness-bathroom`). DE different: **0**. Same 49/50 as 19 Sept launch-readiness.

| slug | name DE | name EN | icon | rooms |
|---|---|---|---|---|
| accessible | Wheelchair accessible | Wheelchair accessible | Accessibility | 0 |
| adjoining-rooms | Adjoining rooms | Adjoining rooms | DoorOpen | 0 |
| adjustable-ac | Adjustable AC | Adjustable AC | Thermometer | 6 |
| air-conditioning | Air conditioning | Air conditioning | AirVent | 5 |
| balcony | Balcony | Balcony | Flower2 | 1 |
| bath-shower | Bath & shower | Bath & shower | Bath | 4 |
| berlin-doors | Berlin door headboards | Berlin door headboards | DoorClosed | 9 |
| books | Books | Books | BookOpen | 1 |
| bunk-beds | Bunk beds | Bunk beds | BedSingle | 2 |
| desk | Desk | Desk | Laptop | 6 |
| dimmable-lighting | Dimmable lighting | Dimmable lighting | Lightbulb | 1 |
| dj-deck | DJ deck | DJ deck | Disc3 | 1 |
| double-bed | Double bed | Double bed | Bed | 1 |
| foldout-sofa | Foldout sofa | Foldout sofa | Sofa | 0 |
| free-wifi | Free WiFi | Free WiFi | Wifi | 11 |
| ftc-windows | Floor-to-ceiling windows | Floor-to-ceiling windows | Maximize | 1 |
| garden-view | Garden view | Garden view | Trees | 4 |
| hair-dryer | Hair dryer | Hair dryer | Wind | 0 |
| hifi-sound | High-end sound system | High-end sound system | AudioLines | 1 |
| instruments | Instruments | Instruments | Music | 1 |
| king-bed | King bed | King bed | BedDouble | 7 |
| king-bed-freestanding | King bed freestanding | King bed freestanding | BedDouble | 1 |
| luetzowplatz-view | Lützowplatz view | Lützowplatz view | Building2 | 1 |
| minibar | Minibar | Minibar | Wine | 0 |
| nespresso | Nespresso machine | Nespresso machine | Coffee | 11 |
| non-smoking | Non-smoking | Non-smoking | CigaretteOff | 11 |
| parquet | Parquet flooring | Parquet flooring | Grid2x2 | 1 |
| pet-friendly | Pet friendly | Pet friendly | PawPrint | 0 |
| private-sauna | Private sauna | Private sauna | Flame | 1 |
| queen-bed | Queen bed | Queen bed | BedDouble | 2 |
| rain-shower | Rain shower | Rain shower | ShowerHead | 1 |
| refrigerator | Refrigerator | Refrigerator | Refrigerator | 11 |
| room-safe | Room safe | Room safe | LockKeyhole | 11 |
| seating-area | Seating area | Seating area | Sofa | 5 |
| separate-living | Separate living area | Separate living area | LayoutPanelLeft | 4 |
| separate-wc | Separate guest WC | Separate guest WC | Toilet | 4 |
| shower | Shower | Shower | ShowerHead | 5 |
| soundproof-windows | Sound-proof windows | Sound-proof windows | VolumeOff | 2 |
| spa-bathroom | Spa bathroom | Spa bathroom | Bath | 1 |
| tea | Tea facilities | Tea facilities | Coffee | 11 |
| teufel-sound | Teufel sound system | Teufel sound system | Speaker | 10 |
| tv-42 | 42" TV | 42" TV | Tv | 5 |
| tv-49 | 49" TV | 49" TV | Tv | 5 |
| tv-55 | 55" TV | 55" TV | Tv | 1 |
| tv-dual | 2× TVs | 2× TVs | Tv2 | 2 |
| twin-beds | Twin beds | Twin beds | Bed | 1 |
| vinyl-collection | 200 records | 200 records | Disc3 | 1 |
| wellness-bathroom | **(empty)** | Wellness Bathroom | **(empty)** | 0 |
| work-dining | Work & dining area | Work & dining area | UtensilsCrossed | 2 |
| ymb-map | You, Me & Berlin map | You, Me & Berlin map | MapPin | 6 |

Descriptions: DE and EN **differ** on the 49 filled tags (seed `amenity-tags.json` has separate `description.de` / `description.en`). Only `wellness-bathroom` has empty DE+EN descriptions.

`rooms_rels` paths: `amenities` 178 rows; `homepageTeaser.featuredAmenities` 4 rows (all on room `individual`: double-bed, free-wifi, nespresso, tv-42).

Other tag types in DB: category 7, medium 3, theme 2, neighbourhood 2.

### 18. How rooms reference them; where they render

**Field:** `rooms.amenities` — relationship → `tags`, `hasMany: true`, `filterOptions: { type: { equals: 'amenity' } }` (`Rooms.ts:115-120`). Order stored in `rooms_rels.order`. No `orderable` collection plugin. Editors can reorder inside the document; the tags **list** view cannot set room order.

**Homepage teaser subset:** `rooms.homepageTeaser.featuredAmenities` — same relation, max 4 (`Rooms.ts:183-196`). Resolver `resolveTeaserAmenities` (`roomHero.ts:103-121`): featured if non-empty, else first 4 of `room.amenities`.

**Omit from detail grid:** `SPEC_STRIP_AMENITY_SLUGS` in `roomPage.ts:16-29` (beds, showers, hair-dryer).

Render sites:

| Surface | File:line | Live this pass |
|---|---|---|
| Room detail grid | `RoomAmenityGrid.tsx:17-48`; mounted `rooms/[slug]/page.tsx:226-230` | not re-clicked; code path present |
| Room detail feature flags | `RoomFeatureIcons.tsx:22-51`; mounted `rooms/[slug]/page.tsx:194-206` | `hasSauna` etc. are **room checkboxes**, not tags |
| Homepage teaser pills | `RoomsTeaser.tsx:212-232` via `roomHero.ts:149` | `/de`: **Double bed / Free WiFi / Nespresso machine / 42" TV** on Individual (`Sleep & Relax`) |

JSON-LD: `hotelRoom.ts:60` maps `room.amenities` to schema `amenityFeature`. `layout.tsx` hotel node does **not** read `hotel.amenityFeature`.

### 19. Icon mapping

**CMS for room tags.** `tags.lucideIcon` is a string; admin picker `LucideIconPicker.tsx`. Front end `AmenityIcon.tsx:18-25` does `LucideIcons[iconName]`. If the name is missing or not a Lucide component, **`return null`** — label still renders, no fallback glyph, no error.

**Code for Im Haus.** `ICONS` in `getInHouseAmenities.ts:60-69` is a hard-coded Lucide map. A new tag in `tags` does not get an Im Haus card. A new Im Haus key without an `ICONS` entry would be `undefined` at render.

`wellness-bathroom` has empty `lucide_icon` today; 0 rooms use it.

### 20. Overlap between room tags and Im Haus / hotel facts

| Fact | Room tag | Im Haus | Hotel global / FAQ |
|---|---|---|---|
| WiFi | `free-wifi` (11 rooms) | no card | `amenityFeature` “Free WiFi”; hero SSID/password; FAQ ask Guest Care |
| Sauna | `private-sauna` (Studio 45) + checkbox `hasSauna` | hotel sauna card (shared facility, hours TBC) | `saunaFitness` 24/7; FAQ on request; Galaxy two schedules |
| Gym | does not exist as a room tag | Gym card 24/7 | FAQ 24/7; `Fitness Centre` amenityFeature |
| EV | does not exist | E-Laden 8× Type 2 on site | amenityFeature “**Nearby**”; parking FAQ “in der Nähe” |
| Bike | does not exist | Bett & Bike rental | FAQ storage + e-bike charging |
| Business center | does not exist | Business Center + ATM | FAQ “in the lobby” |

---

## 4. The `/ausstattung` · `/amenities` page

### 21. Scaffold today

`src/app/[locale]/amenities/page.tsx:1-6` → `createScaffoldPage('amenities')` → `ScaffoldPageView`.

Live `:3010`:

| URL | Status | Rendered |
|---|---|---|
| `http://localhost:3010/de/ausstattung` | 200 | kicker **In Arbeit**; h1 **Ausstattung & Services**; intro **Was außer dem Zimmer im Haus ist — Leihräder, Sauna und Fitness, praktische Extras. Details folgen.** Related: Barrierefreiheit · Parken & Gebühren · Kontakt & Anfahrt · Zimmer & Suiten · Gäste-FAQ (`de.json:1074-1077`, `catalog.ts:98-104`) |
| `http://localhost:3010/en/amenities` | 200 | kicker **In progress**; h1 **Amenities & services**; intro **What is in the house besides the room — bike hire, sauna and fitness, and practical extras. Details to follow.** Related: Accessibility · Parking & fees · Contact & location · Rooms & Suites · Guest FAQs |
| `http://localhost:3010/de/amenities` | **308** → `/de/ausstattung` | `buildScaffoldRedirects` `redirects.ts:83` |

`pages` record for amenities: **does not exist.**

```sql
SELECT slug FROM pages WHERE slug ILIKE '%amenit%' OR slug ILIKE '%ausstattung%';
-- 0 rows
```

All pages slugs (26): about, accessibility, happenings, here, here/art, here/dining, here/events, here/explore, here/faq, here/gallery, here/getting-around, here/wallride, imprint, meetings, neighbourhood, on-the-walls, people, policies/*, privacy-policy, restaurant, rooms, terms-conditions. **No `amenities`.** Seed `pagesSeed` includes `{ slug: 'amenities', … }` (`data.ts:1239-1244`) but that row is not in this DB. The scaffold does not read `pages` anyway; copy is i18n-only (`ScaffoldPageView.tsx:87-90`).

### 22. Live Galaxy + redirects

Fetched 20 Sept 2026:

**https://www.hotel-berlin.de/en/sleep-relax/amenities-services** — h2 “Convenient, professional and flexible”; h2 “Services”; items: Check In / Check Out; Languages; Breakfast; Parking; Gym & Sauna (24/7 gym; sauna 18:00–23:00 **and** “Monday–Thursday 18:00–23:00 Friday–Sunday + holiday 15:00–23:00”); Room service; Laundry service; Baby cribs; High-speed Internet; Pets; No smoking; Credit cards; Deposit; Contactless Payment.

**https://www.hotel-berlin.de/ubernachten-relaxen/serviceleistungen** — same structure in DE (“Bequem, professionell und flexibel” / “Serviceleistungen”). Gym & Sauna block includes both 18:00–23:00 and the Mon–Thu / Fri–Sun+holiday split.

**https://www.hotel-berlin.de/en/sleep-relax/sauna-fitness** and **…/ubernachten-relaxen/sauna-fitness** — Fitness 24/7; Wellness 18:00–23:00 on request; summer 15 Jun–15 Sep on request, 45 minutes notice.

**https://www.hotel-berlin.de/en/sleep-relax/bedandbike** and **…/ubernachten-relaxen/bettundbike** — Bett & Bike certification; covered parking; e-bike charging; tools; rental; packed lunches; maps; R1.

Redirects in `buildScaffoldRedirects` (`src/lib/scaffolds/redirects.ts:16-25,83`) that land here:

```
/en/sleep-relax/amenities-services → /en/amenities
/en/sleep-relax/bedandbike → /en/amenities
/en/sleep-relax/sauna-fitness → /en/amenities
/ubernachten-relaxen/serviceleistungen → /de/ausstattung
/ubernachten-relaxen/bettundbike → /de/ausstattung
/ubernachten-relaxen/sauna-fitness → /de/ausstattung
/de/amenities → /de/ausstattung
```

Wired in `next.config.ts:18-22`.

### 23. What links to it

**Nav:** `SiteNav.tsx:30-36` outside links are rooms / meetings / restaurant / happenings / neighbourhood. No amenities. Inside nav pages (SQL): here/events, here/getting-around, here/explore, here/gallery, here/wallride. No amenities.

**Footer seed / DB:** Stay / Eat & Meet / Help / Already here columns have no amenities/ausstattung URL. Live footer on `/de/hier` and `/de/ausstattung` confirmed none.

**Scaffold related links** (`catalog.ts:80-82,98-104,111,136,140`): accessibility, offers, policies-pets, policies-fees **point at** amenities. Amenities points at accessibility, policies-fees, contact, rooms, here/faq.

**Im Haus cards:** none link to `/amenities`. Wallride links to `/here/wallride`.

---

## 5. Editor experience today

### 24. What an editor would see

Only CMS user in DB: `bernardbolter@gmail.com`, `role = admin`. No editor user exists. Schema still defines `editor` (`Users.ts:29-39`). `payload.config.ts` has no `admin.access` gate. `Users.access.admin` is `isAdminUser` (`Users.ts:15`) — that hides the **Users collection** from editors (Payload collection `admin` access = nav visibility, `.agents/skills/payload/reference/ACCESS-CONTROL.md:676`), not the admin panel. `Hotel` global is `admin.hidden` unless admin (`Hotel.ts:33-36`) and `adminWritableGlobal` (`Hotel.ts:31`).

**Venues** (`/admin/collections/venues`):

- Collection label: default “Venues” (no `labels`).
- `useAsTitle: 'name'`.
- `defaultColumns`: **does not exist** — Payload default columns (not `displayOrder`).
- List-view drag/order: **does not exist**. `displayOrder` is a number field on the document, unused by Im Haus.
- Field `admin.description`: only on location, spotlightLocation, venueMonogram, openingHours rows, servesCuisine. Missing on name, slug, venueType, heroImage, featured, displayOrder, and most contact fields.

**Tags** (`/admin/collections/tags`):

- `useAsTitle: 'name'`.
- `defaultColumns`: **does not exist**.
- List-view ordering: **does not exist**.
- `description` / `lucideIcon` appear only when `type === 'amenity'`.
- `lucideIcon` uses `LucideIconPicker`.

**Rooms** amenities: hasMany relationship with `filterOptions` amenity; `featuredAmenities` validates max 4. Rooms list `defaultColumns` does not include amenities (`Rooms.ts:12`).

**Hotel global:** hidden from a true editor. `guestStay.more.saunaFitness` / `amenityFeature` are not editable by that role.

### 25. Localization

**Im Haus copy** (`here.inHouse` in `de.json` / `en.json`): DE and EN strings differ on titles/subs/specs (Gym title is “Gym” in both). Live KTTK eyebrow on `/de` is English “B2 Basement” from unlocalized `venues.location`.

**Venues (DB):** kttk/fkkb/sissi have **no DE locale row**. lutze and wundermart have DE+EN. `location` / `spotlightLocation` are not localized fields.

**Amenity tags:** 49/50 names `de === en` (English names stored in both locales). Descriptions are translated except `wellness-bathroom` (DE name empty, descriptions empty).

**Hotel `amenityFeature[].name`:** not localized; English only (`Free WiFi`, `Fitness Centre`, …).

**`hotel.guestStay.more.saunaFitness`:** DE and EN values both `24/7`.

### 26. Media

Amenity images go through `media` (`heroImage` upload; stand-in pool is `payload.find({ collection: 'media' })`). `Media.ts:17-24`: `alt` required, **localized** (schema-inventory 16 Sept still said unlocalized; the config now has `localized: true`).

Live eight cards: **none** use `venues.heroImage` (all `hero_image_id` null). All eight use stand-in files from the media pool. Alts rendered as **filenames** (`kttk-tournament-night.jpeg`, `suite-45-12.jpg`, `junior-01.jpg`, `standard-01.jpg`, `suite-45-123.jpg`, `suite-45-11.jpg`, `meet-01.jpg`, `saal-berlin-berlin.jpg`) because `getAmenityPhotoPool` sets `alt: doc.alt || filename` and these docs’ alt is empty or equals the filename.

Real facility photographs for gym, sauna, Bett & Bike, Business Center, E-Laden, Fingerboard, Wallride: **do not exist** as venue heroes. KTTK’s stand-in happens to be a KTTK tournament filename, not `venues.heroImage`.

Lucide empty block: **not shown** on this render.

---

## 6. Brief conformance

### 27. HubCards §3 / definition of done

`claude/HotelBerlin_HubCards_BuildBrief.md`: **does not exist.** 16 Sept §19 recovered Pass B as “Im Haus eight-card grid” and marked it ✅ in source. Items named in **this** prompt, checked against code + live `:3010`:

| Item | Status | Evidence |
|---|---|---|
| Eight-card Im Haus grid | ✅ | Live eight cards; `getInHouseAmenities.ts:177-185,210-297` |
| 16:9 media | ❌ | CSS `aspect-ratio: 1 / 1` with media `flex: 2` → 3:2 photo inside a square (`globals.css:2042-2047`). Live cards 199×199. Schema-inventory already recorded 3:2 of a square. |
| `tl 20` radius | ✅ | `border-top-left-radius: 20px` (`globals.css:2038`). Live CDP `radius: "20px"`. Other corners 0. |
| `--amber-deep` + `--cardline` | ✅ | `--cardline: #e0dcd5` (`globals.css:36,2037`); live border `rgb(224, 220, 213)`. Eyebrow `text-hbb-amber-deep` (`AmenityCard.tsx:62`); token `--amber-deep: #8a5818` (`globals.css:30`). Empty-icon color `--amber-deep` (`globals.css:2059`) — not visible live because every card has a photo. |
| Spec grid `dl` | ✅ | `AmenityCard.tsx:68-76`; `.amenity-card__specs` CSS grid (`globals.css:2092-2115`). Live KTTK/Gym/Sauna/Wallride/E-Laden have `dt`/`dd`. |
| 4-up → 2-up at 900 → 1-up at 560 | ✅ | `.hub-row` (`globals.css:2001-2018`). Live CDP: default desktop 4×199px; viewport 900 → `392.5px 392.5px` (2); viewport 560 → `520px` (1). |
| No per-card CTA | ✅ | `AmenityCard` comment `:31` “no CTA”; live `hasCta: false`. |
| Whole-card link where a destination exists | ✅ | Only Wallride has `href`; live `<a href="/de/hier/wallride">`. Others `<article>`. |
| Fingerboard dashed pending | ⚠️ | `pending: true` + dashed `--cardline` border live. Hatch for empty pending (`:not(:has(img))`) **not** applied because a stand-in photo is present. |
| Sauna not picking one of the two schedules | ✅ | Spec value is `hoursToConfirm` (`getInHouseAmenities.ts:180-181,262`). Live: “Zeiten noch zu bestätigen”. Sub still **names** the two schedules (`de.json:138-139`). |

HomeHereReconciliation (`doc/here/HotelBerlin_HomeHereReconciliation_BuildBrief.md:208`): Im Keller target is “**2:1 band** for KTTK and Wallride” + dashed Fingerboard — **not** an eight-card 4-up grid. Code is the eight-card grid. Both texts sit in the repo; this pass does not pick a winner.

### 28. Section heading vs divider rule

Still true. `InTheHouseSection.tsx:71`: `<HubSerifHeading … title={t('title')} />` with **no** `href` / `cta`. Live `/de/hier`: h2 “Im Haus”, CDP `headingLinks: []`.

16 Sept §23: “Im Haus \| `HubSerifHeading` **without** href \| **yes** vs uppercase-divider rule; serif without link.” `HubSerifHeading.tsx:4-6` still: serif + link if the section leads somewhere; omit if self-contained. Recovered divider rule (`HerePage_BuildBrief.md:460-471`; wireframe `here_desktop_wireframe.html:232`): uppercase hairline label “In the basement”. `SectionDivider` remains unused on the hub. Heading is still serif, still unlinked.

---

## 7. Close

### 29. What an editor can already do alone

- Log into Payload (role `editor` is allowed on collections via `publicReadStaffWrite`; no editor user exists yet).
- Create / edit / delete **`tags`** of type amenity: name (both locales), slug, description, Lucide icon.
- Attach, detach, and reorder amenity tags on a **room** (`rooms.amenities` hasMany). Cap featured teaser tags at 4 (`featuredAmenities`).
- Toggle room checkboxes `hasSauna` / `hasBalcony` / `hasSeparateLiving` / `isAccessible` (`RoomFeatureIcons`).
- Create / edit **`venues`** rows (name, hours, hero image, `displayOrder`, …). That does **not** add, remove, or reorder Im Haus cards.
- Edit **guest FAQs** (`guest-sauna`, `guest-gym`, `guest-business-center`, `guest-ev-charging`, `guest-bike-garage`, `guest-wifi`).
- Upload **media** with localized alt. Stand-in pool will pick files whose filenames match `HINT_FILENAMES` / `HINTS` if a card still has no `heroImage`.
- Edit **pages** that already exist. There is no amenities `pages` row to edit; the scaffold ignores `pages` anyway.

An editor **cannot** add a ninth Im Haus card, remove Business Center from the grid, put Sauna first, or change KTTK/gym prices/hours on the card without a developer changing code/i18n. They cannot edit `hotel.guestStay` / `hotel.amenityFeature` unless they are admin (`Hotel.ts:33-36`).

### 30. What needs a developer today

| Change | Files |
|---|---|
| Add / remove / reorder Im Haus cards | `src/lib/here/getInHouseAmenities.ts`; `src/components/here/InTheHouseSection.tsx`; `src/messages/de.json`; `src/messages/en.json`; usually `src/lib/here/assignAmenityStandIns.ts` |
| Change Wann / Preis / Was / sub / pending / href | same i18n + `getInHouseAmenities.ts` (sauna Wann is `hoursToConfirm`, not a per-item key) |
| Change Im Haus icons | `getInHouseAmenities.ts` `ICONS` |
| Seed missing venue rows (gym, sauna, wallride, …) | `src/seed/here-amenities.ts` + `src/seed/data.ts` `venuesSeed` — **script exists, DB does not have the rows** |
| Make `venues.openingHours` drive Wann | `getInHouseAmenities.ts` (currently unused) + `venue-time` |
| Make `venues.displayOrder` drive order | `getInHouseAmenities.ts` (currently a literal) |
| Amenities page body | `src/app/[locale]/amenities/page.tsx` / `ScaffoldPageView` / `de.json`+`en.json` `scaffolds.pages.amenities` |
| Nav or footer link to `/amenities` | `SiteNav.tsx` and/or Footer global / `footer.ts` |
| Hotel JSON-LD `containsPlace` / `amenityFeature` | **does not exist** as a builder on the layout hotel node |
| Translate amenity tag **names** | data in `tags_locales` (49/50 currently `de === en`); seed `src/seed/data/amenity-tags.json` uses English `name` for both locales |

### 31. Every fact held in more than one place

See §12 tables. Condensed:

- Sauna hours: Im Haus i18n TBC + two-schedules sub; FAQ on request 45 min; hotel `saunaFitness` 24/7; Galaxy amenities-services **two** clock schedules; Galaxy sauna-fitness 18:00–23:00 on request + summer window.
- Gym 24/7: Im Haus i18n; FAQ `guest-gym`; hotel `saunaFitness` 24/7 (same field as sauna); Galaxy.
- KTTK hours: Im Haus i18n Mo–So 13:00–23:00; DB hours Thursday tournament only; seed file has both; event strip Thursday €5.
- KTTK price: Im Haus i18n `5 € / 30 Min.`; venue EN shortDescription `€5 entry`; event card €5.
- EV: Im Haus 8× Type 2 on site; FAQ 8 AC / 22 kW Type 2; hotel amenityFeature “Nearby”; parking FAQ “in der Nähe”.
- WiFi: room tag; hotel amenityFeature; hero credentials; FAQ “ask Guest Care”; Galaxy “high-speed internet”.
- Bett & Bike: Im Haus rental/reception; FAQ garage + e-bike charging; Galaxy rental + parking + tools + lunches + R1.
- Business Center: Im Haus ATM; FAQ lobby.
- Wundermart 24/7 Lobby: dining band (hard-coded `'24/7'` in `getDiningBand.ts:147` plus `wundermart.location`); venue hours Mo-Su 00:00–24:00; FAQ `guest-wundermart`.

### 32. Missing data

**Per Im Haus card (this DB + live render)**

| Card | Photo | Hours | Price | DE copy |
|---|---|---|---|---|
| KTTK | no venue hero; stand-in tournament jpeg; alt = filename | i18n string; DB hours unused and incomplete vs seed | i18n only | title forced to “KTTK”; eyebrow live English “B2 Basement”; no DE locale row |
| Wallride | no venue row; stand-in **suite** photo | “Permanent” as Was, not hours | does not exist | i18n present |
| Fingerboard | stand-in junior-room photo; hotel content still TBC in sub | does not exist | does not exist | i18n present (“Wartet auf das Hotelteam”) |
| Gym | no venue row; stand-in standard-room photo | i18n 24/7 only | **does not exist** on the card | title “Gym” in DE |
| Sauna | no venue row; stand-in suite photo | explicitly not chosen; “Zeiten noch zu bestätigen” | does not exist | i18n present |
| Bett & Bike | no venue row; stand-in suite photo | does not exist | does not exist | i18n present |
| Business Center | no venue row; stand-in meet-01 photo | does not exist | does not exist | title “Business Center” in DE |
| E-Laden | no venue row; stand-in saal-berlin photo | does not exist | does not exist | i18n present |

**Per amenity tag:** 49/50 names untranslated (DE===EN). `wellness-bathroom`: DE name empty, no icon, 0 rooms. Tags with 0 room uses: accessible, adjoining-rooms, foldout-sofa, hair-dryer, minibar, pet-friendly, wellness-bathroom. Featured teaser subset filled only on `individual`.

**Pages:** no `pages` row for amenities. Scaffold intro is placeholder “Details folgen.”

**Hotel extras:** `guestStay.more.wundermart` and `bettAndBike` empty. `saunaFitness` filled 24/7 but not rendered on `/here` (StayInfoCard unused).

### 33. Contradictions between briefs, code, and seed

1. **HubCards brief vs code vs HomeHereReconciliation.** HubCards file does not exist. 16 Sept recovered “eight-card grid”. HomeHereReconciliation §4 wants 2:1 bands for KTTK and Wallride, not an eight-card 4-up. Code is the eight-card grid (`getInHouseAmenities.ts:177`, `globals.css:2001-2018`).
2. **IA wireframe file vs dining.** Named IA HTML does not exist. Content strategy said Wundermart has no `/here` card; dining band now has one. Im Haus does not.
3. **Eight venue slugs in seed vs five rows in DB.** `venuesSeed` + `here-amenities.ts` include wallride/gym/sauna/bett-and-bike/business-center/e-laden. SQL: those slugs do not exist. Im Haus still renders all eight from i18n.
4. **KTTK hours.** Seed Open Play Mo-Su 13:00–23:00 (`data.ts:785-786`); `here-dining.ts` overwrite leaves Thursday only; Im Haus Wann is i18n Mo–So 13:00–23:00; DB unused by the card.
5. **Sauna hours.** Galaxy amenities-services publishes two clock schedules on one page; Galaxy sauna-fitness says 18:00–23:00 on request + summer exception; FAQ says on request 45 min; hotel global `24/7`; Im Haus refuses to pick a schedule and still tells the reader two schedules exist (`de.json:138-139`). 16 Sept §42 recorded the same split.
6. **EV “on site” vs “nearby”.** Im Haus + `guest-ev-charging`: 8× Type 2 on site. `hotel.amenityFeature` and prospect parking FAQ: nearby.
7. **Gym price.** Prompt’s thought-experiment (d) has no gym price in code, seed, or live card.
8. **`pagesSeed` amenities vs DB.** Seed lists `slug: 'amenities'`; `pages` table does not. Scaffold does not read it.
9. **Tag names.** Seed `amenity-tags.json` has DE descriptions but English `name` for both locales (`src/seed/index.ts` / `rooms.ts` writes `name` then DE `description` only). Result: 49/50 `de === en` names, including “Free WiFi” / “Double bed” / “Nespresso machine” on `/de` homepage pills (live).
10. **16:9 vs square.** This prompt’s HubCards item list includes 16:9 media. CSS and live cards are 1:1 with 3:2 photo (`globals.css:2042-2047`).
11. **Fingerboard pending hatch vs stand-in photos.** Code sets `image: null` then fills a stand-in, so the pending empty hatch never shows. Dashed border does.
12. **`here.goodToKnow`** still in `de.json`/`en.json` and unused (16 Sept §19 D). Contains a fourth gym/sauna/ATM copy set.

No recommendations. End of report.
