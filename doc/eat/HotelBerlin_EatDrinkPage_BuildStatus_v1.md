# Hotel Berlin, Berlin — Eat & Drink / Dining Build Status v1
*Captured 2026-08-20, reported by Cursor against `hotel-berlin-de`, reconciled against `HotelBerlin_HerePage_BuildBrief.md`, `HotelBerlin_SkeletonPages_BuildBrief.md`, `HotelBerlin_PayloadCollections_Brief.md`, and `HotelBerlin_VenueCompactCard_BuildBrief.md`.*

**Bottom line:** there is no public Eat & Drink page. Nav, homepage, and Meetings all point at `/restaurant`, but that route has no `page.tsx` — it 404s. The only live dining surface is the thin guest-hub stub `/here/dining`. The `venues` collection and `@hotel-berlin/aeo-schema` both exist; neither has a restaurant/shop schema builder, a menu, or an OpenTable integration.

---

## Built and live in code

**Guest-hub dining stub** — `src/app/[locale]/here/dining/page.tsx`. Locale routing: `/en/here/dining` ↔ `/de/hier/dining` (German slug is still `dining`, not `essen-trinken`). Pulls Lütze `shortDescription` from Payload; hours, breakfast, Wundermart, and garden copy are hardcoded i18n, not read live.

**`venues` Payload collection** — real, registered, seeded. Fields (`src/collections/Venues.ts:6-93`): `name`, `slug`, `venueType` (Restaurant | Bar | ArtGallery | SportsActivityLocation | EventVenue | LocalBusiness), `tagline`, `description`, `shortDescription`, `location`, `spotlightLocation`, `telephone`, `email`, `website`, `instagramUrl`, `venueMonogram`, `openingHours` (array: dayOfWeek/opens/closes/segment/note), `servesCuisine`, `reservationUrl`, `menuUrl`, `priceRange`, `isOpenToPublic`, `isGuestFacing`, `heroImage`, `images`, `tags`, `sameAs`, `featured`, `displayOrder`. Registered at `src/payload.config.ts:50`. Seeded from `venuesSeed` at `src/seed/index.ts:186-190`. Query helpers: `getVenues` / `getFeaturedVenues` / `getVenueBySlug` in `src/lib/payload/venues.ts:5-37`.

**Seeded venue records** (`src/seed/data.ts:655-728`):

| Venue | In seed? | Slug | Notes |
|---|---|---|---|
| Lütze | yes | `lutze` | `venueType: Restaurant`, Bar+Kitchen hours, `priceRange: €€`, `reservationUrl` → old-site URL, no `menuUrl` |
| KTTK | yes | `kttk` | Thursday 19:00 tournament only; €5 is prose in `shortDescription`, not a price field |
| Sissi Skateboard Club | yes | `sissi` | No opening hours |
| Wallride | no | — | Mentioned inside Sissi's description; has its own `/here/wallride` page, not a venue row |
| Wundermart | no | — | i18n placeholder only |

Lütze's opening hours (the only structured dining hours in Payload):
```
openingHours: [
  { dayOfWeek: 'Mo-Su', opens: '10:00', closes: 'open end', segment: 'Bar' },
  { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00', segment: 'Kitchen' },
  { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30', segment: 'Kitchen' },
],
servesCuisine: 'Italian, International',
reservationUrl: 'https://hotel-berlin.de/en/eat-drink/luetze-bar-berlin',
priceRange: '€€',
```
Consumed live by the Tonight Lütze card via `deriveOpenClosed` (`src/lib/here/tonight.ts:145-174`). **`/here/dining` does not read these hours — it reprints them from `messages`.**

**Breakfast hours** live on the `hotel` global, single string, no weekday/weekend split: `reception: 'Mo-Su 00:00-24:00'`, `breakfast: 'Mo-Su 06:30-10:00'` (`Hotel.ts:136-141`, seed `data.ts:79-85`, `breakfastLocation: 'Lütze ground floor'`). Rendered on `/here` Stay Info (`src/lib/payload/hotel.ts:27-42`, `StayInfoCard.tsx:81-86`). The weekend 06:30–11:00 split exists **only** as hardcoded copy on `/here/dining` (`src/messages/en.json:198-203`) — not in Payload.

**Homepage Eat & Drink teaser** — `LutzeSection` → `LutzeTeaser`. Copy/photo from `hotel.eatAndDrink` (`Hotel.ts:329-380`, `homepage.ts:321-351`). CTA already points at `/restaurant` — currently dead:
```tsx
<SweepCta href="/restaurant" color="espresso" className="mt-10">{copy.ctaLabel}</SweepCta>
```

**`aeo-schema` lib exists** — in-repo package `@hotel-berlin/aeo-schema` at `src/lib/aeo-schema/`. Exact import path used by `/rooms` and `/meetings`: `@/lib/aeo-schema/src/index`. Every currently exported `build*` function:

| Function | File:line |
|---|---|
| `buildHotelRoomRef` / `buildHotelRoomNode` | `hotelRoom.ts:11` / `:23` |
| `buildOfferNode` | `hotelRoom.ts:68` — rooms only, not venues |
| `buildRoomBreadcrumbList` | `hotelRoom.ts:91` |
| `buildMeetingRoomRef` / `buildMeetingRoomNode` | `meetingRoom.ts:10` / `:22` |
| `buildMeetingRoomBreadcrumbList` | `meetingRoom.ts:60` |
| `buildPlaceRef` / `buildPlaceNode` | `place.ts:6` / `:51` |
| `buildPersonRef` / `buildPersonNode` | `person.ts:14` / `:27` |
| `buildReviewNode` / `buildReviewNodesForPlace` | `review.ts:18` / `:32` |
| `buildAuthorityProps` | `lib/authority.ts:16` |
| `buildFAQPageGraph` | `faq.ts:21` |
| `buildPlacePageGraph` / `buildPersonPageGraph` | `graph.ts:66` / `:82` |
| `buildNeighbourhoodListGraph` / `buildPeopleListGraph` | `graph.ts:107` / `:126` |
| `buildHotelRoomPageGraph` / `buildRoomsListGraph` | `graph.ts:146` / `:161` |
| `buildMeetingRoomPageGraph` / `buildMeetingsListGraph` | `graph.ts:181` / `:197` |

No `buildRestaurantSchema` / `buildVenueSchema` / `buildMenuSchema`. `defaultConfig.paths` has `neighbourhood`, `people`, `rooms`, `meetings` — no `restaurant` path (`lib/config.ts:9-26`).

**`VenueCompactCard`** — this is the card the `/here` brief called `<VenueCard>`. Props (`src/components/cards/VenueCompactCard.tsx:7-21`): `density` (compact | detailed), `badge`, `badgeVariant` (schedule | liveStatus | static), `liveOpen?`, `title`, `lines`, `href`, `external?`, `categoryToken`, `className?`. Used for the Tonight KTTK/Lütze cards and the basement KTTK/Wallride cards. **Naming note:** `src/components/here/VenueCard.tsx` actually exports `TonightHeroCard` (FKKB image hero) — a leftover naming mismatch, not a second real card.

**Open/closed helper** — `deriveOpenClosed` + `OpenStatusBadge` (`src/lib/venue-time/deriveOpenClosed.ts`, `OpenStatusBadge.tsx:22-27`). Badge is exported but **not mounted on any page** yet.

---

## Specced / linked, not built as pages

**`/restaurant`** — pathname placeholder, same slug both locales, explicitly flagged:
```ts
// Placeholder — NOT final, do not let these reach production before sign-off:
'/restaurant': { en: '/restaurant', de: '/restaurant' },
```
Linked from primary nav (`SiteNav.tsx:19-22`), the homepage Lütze CTA (`LutzeTeaser.tsx:37`), and the Meetings banquet teaser (`meetings/page.tsx:313`). CMS pages seed has a skeleton row `slug: 'restaurant'` (`seed/data.ts:843-847`). Skeleton brief expected `app/restaurant/page.tsx`. **No file exists under `src/app/[locale]/restaurant/`. Hitting `/en/restaurant` or `/de/restaurant` 404s right now.**

**Restaurant JSON-LD** — the Payload collections brief says venues "generate `LocalBusiness`/`Restaurant` JSON-LD per venue type." The collection is built; the schema builders are not.

**Menus** — `menuUrl` field exists, unseeded; no menus collection; no menu PDF or items anywhere in Payload. The only real "Banquet Menu" document is Meetings-only.

**Reservations** — `reservationUrl` is a plain text field, currently pointing at the old-site Lütze page, not a real booking target. Zero OpenTable/Resy code anywhere in `src/`. `/here/dining`'s reserve copy is just "Ask at the bar or reception." `lutze.ctaReserve` ("Reserve a table") string exists in `messages/en.json:601` but is unused.

**Wundermart / Lütze-Garten** — named on `/here/dining` as unconfirmed placeholders. Footer sends "Wundermart" to `/here/explore`, not to any dining surface.

---

## Not built at all

| Item | Status |
|---|---|
| `/restaurant` page | Pathname + nav + homepage CTA + CMS skeleton row only — no `page.tsx`, live 404 |
| `buildVenue*`/restaurant schema builder | Not in `aeo-schema` exports; `defaultConfig` has no `restaurant` path |
| OpenTable / any reservation widget or API | Zero hits beyond the `reservationUrl` text field |
| Menu data (items, PDFs, `menuUrl` values) | Field exists, empty; no collection |
| Wundermart venue record | Not in `venuesSeed`; hours/location unconfirmed |
| Wallride venue record | Page exists at `/here/wallride`; not a `venues` row (lives inside Sissi's description) |
| Live hours on `/here/dining` | Hours duplicated in i18n messages, not read from `venues.openingHours` |
| Weekend breakfast hours in Payload | Hotel global is flat `Mo-Su 06:30-10:00`; the 11:00 weekend split is messages-only |
| `OpenStatusBadge` on any dining page | Component built, unused |

---

## Route inventory

| Path | `page.tsx` | Locale routing |
|---|---|---|
| `/eat-drink` | none | — |
| `/essen-trinken` | none | — |
| `/here/dining` | `src/app/[locale]/here/dining/page.tsx` | `/en/here/dining` ↔ `/de/hier/dining` |
| `/restaurant` | none | pathname only: `/en/restaurant` ↔ `/de/restaurant` |

---

## Note

`/here/dining` is the guest-hub inside-nav page (teal `/here` chrome) — "already here, where do I eat." `/restaurant` is the public prospect-facing destination the homepage CTA and Meetings banquet teaser are already selling — "come eat here." They're different surfaces serving different intents, both real, only one of them (`/here/dining`) currently has a page behind it.
