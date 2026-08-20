# Hotel Berlin, Berlin — `/restaurant` (Lütze) — Cursor Build Brief
*For Cursor*
*Page: `/restaurant` (`/restaurant` — same slug both locales, per existing `pathnames.ts`)*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*
*Reconciled against the build status audit, 2026-08-20 — see `HotelBerlin_EatDrinkPage_BuildStatus_v1.md`*
*Pattern base: `HotelBerlin_MeetingsPage_BuildBrief.md` / `HotelBerlin_RoomsPages_BuildBrief.md`*

**STATUS: v2 — ready to build.** v1 assumed a 4-page `/eat-drink` hub that didn't match the real codebase. The audit changed the shape of this brief in two ways, both reflected below: (1) the real target is the single `/restaurant` route already linked from nav/homepage/Meetings — confirmed with the client, not renamed; (2) the `venues` collection already exists and is seeded — this brief extends it, it does not create a new one.

---

## Context & scope

`/restaurant` is the public, prospect-facing page for **Lütze** — the destination the homepage teaser and the Meetings banquet teaser are already selling ("come eat here"). It is a single full-entity page, not a multi-venue hub. This is a deliberate scope narrowing from the original "Eat & Drink" concept: the live routing (one slug, singular, CTA'd specifically from Lütze content) already tells us this is Lütze's own page, and one page declaring one clean `Restaurant` entity is the correct AEO shape anyway — the earlier concern about cramming multiple schema.org types onto one URL doesn't apply once the scope is just Lütze.

**What's in scope on this page:**
- Full Lütze content — hours, cuisine, price range, gallery, description, reservation, menu
- Breakfast — a content section on this page (not a separate URL), since it's part of deciding whether/when to eat here
- Lütze-Garten — same treatment, a content section, not a separate URL

**What's explicitly out of scope:**
- **Wundermart** — different business type (shop, not dining), not linked from anywhere real yet (only an i18n placeholder + a footer link that currently points to `/here/explore`). Separate future page once the hotel team confirms hours/location.
- **KTTK** — already covered by the `/here` Tonight/basement cards. Don't duplicate.
- **`/here/dining`** — the existing guest-hub stub stays as the separate "already here" surface. This brief's job is to fix it so it reads live data instead of duplicating hardcoded copy (Section 5), not to replace it.

**Color:** outside-context page (like Rooms), standard **amber** accent — not the `/here`/Meetings teal.

---

## Section 1 — Payload schema (extend `venues`, don't fork it)

`src/collections/Venues.ts` already has everything needed for Lütze itself: `openingHours`, `servesCuisine`, `reservationUrl`, `menuUrl`, `priceRange`, `heroImage`, `images`, `description`/`shortDescription`. **No new fields needed for Lütze.**

**Content gaps to fill on the existing `lutze` record** (data entry, not schema work):
- `reservationUrl` — currently the old-site URL (`hotel-berlin.de/en/eat-drink/luetze-bar-berlin`). Replace with the real booking target once confirmed. No OpenTable integration exists anywhere in the repo — this is a plain link-out field for now, not a widget. Confirm with the client whether an embedded OpenTable widget is wanted for this pass or later.
- `menuUrl` — empty. Simplest path: link to a PDF, same pattern as the old site (structured menu items are a known gap per `Luetze_SiteReference.md` — not solving that here).

**Lütze-Garten content** — no field currently holds this. Recommend **not** a new collection or a `parentVenue` relationship (that's more structure than this needs) — just use the existing `images` array (tag a few as garden photos) plus a short paragraph inside `description`. If the client wants it visually distinct on the page, that's a template decision (Section 2), not a schema one.

**Breakfast content** — already lives on the `hotel` global, not `venues`: `hotel.openingHours.breakfast` (`'Mo-Su 06:30-10:00'`) + `breakfastLocation` (`'Lütze ground floor'`). Reuse this directly rather than duplicating it into `venues`.

**Known data gap — fix alongside this build:** the weekend breakfast hours (06:30–11:00) only exist as hardcoded copy in `messages/en.json`, not in Payload. Add a `breakfastWeekend` (or restructure `openingHours` into a small array like Lütze's) field to the `hotel` global so Stay Info and this new page can both read the real split instead of two surfaces silently disagreeing.

---

## Section 2 — `/restaurant` page structure

```
Breadcrumb: Home / Restaurant
<h1> Lütze
Gallery (reuse existing RoomGallery-style component pattern, don't fork)
Live status: <OpenStatusBadge> driven by deriveOpenClosed(venue.openingHours) — this component
  already exists and is built but unmounted anywhere. Mount it here.
Hours block: Bar / Kitchen segments from venue.openingHours
Cuisine + price range line (servesCuisine, priceRange)
Full description (venue.description)
Menu — link to menuUrl
Reserve — CTA to reservationUrl
── Breakfast ──
  hotel.openingHours.breakfast + breakfastWeekend (once added) + breakfastLocation
── Lütze-Garten ──
  short paragraph + garden-tagged images from venue.images
Cross-link row: "Also here: KTTK, Wundermart" → /here or wherever those live publicly
  (not schema, just navigation — confirm target with client, KTTK/Wundermart don't
  have public pages yet either)
```

```typescript
type RestaurantPageProps = {
  venue: Venue; // from getVenueBySlug('lutze', locale) — already exists, src/lib/payload/venues.ts
  breakfast: { hours: string; weekendHours?: string; location: string }; // from hotel global
};
```

---

## Section 3 — JSON-LD

Model this after `buildHotelRoomNode` / `buildHotelRoomPageGraph` (`src/lib/aeo-schema/src/builders/hotelRoom.ts`, `graph.ts:146`) — same file/naming pattern, not a new style.

**Build this generically as `buildVenueNode`, not `buildRestaurantNode`.** The `venues` collection already has `venueType` values beyond Restaurant (Bar, ArtGallery, SportsActivityLocation, EventVenue, LocalBusiness) for KTTK/Sissi, which will need their own schema output eventually. Writing a generic venue-type-aware builder now means this brief's work is directly reusable later instead of needing a second pass — same "category → schemaType mapping" pattern already used in the Nachbarschaft brief for `neighbourhoodPlaces`.

### 3.1 `venueType` → schema.org `@type` mapping

| `venueType` | schema.org `@type` |
|---|---|
| Restaurant | `Restaurant` |
| Bar | `BarOrPub` |
| ArtGallery | `ArtGallery` |
| SportsActivityLocation | `SportsActivityLocation` |
| EventVenue | `EventVenue` |
| LocalBusiness | `LocalBusiness` |

Fill this table in at seed/build time, don't leave the mapping to editor judgment per venue.

### 3.2 `buildVenueRef(venue)` / `buildVenueNode(venue)`

```typescript
{
  "@type": venueTypeToSchemaType(venue.venueType), // "Restaurant" for Lütze
  "@id": `https://hotel-berlin.de/restaurant#venue`, // this page only has one venue on it — no [slug] segment needed yet
  "name": venue.name,
  "description": venue.description,
  "url": "https://hotel-berlin.de/restaurant",
  "image": venue.images.map(img => ({ "@type": "ImageObject", "contentUrl": img.url, "description": img.altText })),
  "servesCuisine": venue.servesCuisine,           // Restaurant/Bar only — omit for other venueTypes
  "priceRange": venue.priceRange,
  "openingHoursSpecification": venue.openingHours.map(h => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": h.dayOfWeek, "opens": h.opens, "closes": h.closes,
  })),
  "menu": venue.menuUrl,
  "acceptsReservations": Boolean(venue.reservationUrl),
  "telephone": venue.telephone,
  "email": venue.email,
  "sameAs": venue.sameAs,
  "containedInPlace": { "@id": "https://hotel-berlin.de/#hotel" },
}
```

### 3.3 `buildVenueBreadcrumbList` / `buildVenuePageGraph`

Same shape as `buildRoomBreadcrumbList` / `buildHotelRoomPageGraph` — Home → Restaurant.

### 3.4 Register the path

Add `restaurant` to `defaultConfig.paths` in `src/lib/aeo-schema/src/lib/config.ts:9-26`, alongside `neighbourhood` / `people` / `rooms` / `meetings`.

---

## Section 4 — Component reuse

- **`OpenStatusBadge`** (`src/components/primitives/OpenStatusBadge.tsx`) + **`deriveOpenClosed`** (`src/lib/venue-time/deriveOpenClosed.ts`) — both exist, both unmounted anywhere. Mount on this page for the live "open now" state.
- **Do not** use `src/components/here/VenueCard.tsx` — despite the filename, it exports `TonightHeroCard`, a leftover naming mismatch. If a compact card is needed anywhere in this build (e.g. a KTTK/Wundermart cross-link row), reuse `VenueCompactCard` (`src/components/cards/VenueCompactCard.tsx`), the actual card the `/here` brief meant.
- Homepage `LutzeTeaser` CTA (`LutzeTeaser.tsx:37`) already points at `/restaurant` — no change needed there once this page exists, it just stops 404ing.
- Meetings banquet teaser (`meetings/page.tsx:313`) — same, already correctly linked.

---

## Section 5 — Fix `/here/dining` to match (small, do alongside)

`/here/dining` currently reprints Lütze's hours as hardcoded i18n copy instead of reading `venues.openingHours` the way the Tonight card already does via `deriveOpenClosed`. Once this page's data path exists, point `/here/dining` at the same source so the two surfaces can't drift out of sync the way breakfast hours already have.

---

## Build sequence

1. **`buildVenueNode` / `buildVenuePageGraph` + `paths.restaurant`** in `aeo-schema` (Section 3) — write it generic (3.1 mapping table) even though only Lütze consumes it this pass.
2. **`/restaurant` page.tsx`** — full assembly (Section 2), pulling `getVenueBySlug('lutze')` (already exists) + `hotel.eatAndDrink` photo/copy (already used by `LutzeTeaser`, reuse rather than re-fetch differently) + `hotel.openingHours.breakfast`.
3. **Mount `OpenStatusBadge`** on the page using the existing `deriveOpenClosed` helper.
4. **Content fills** (Section 1): real `reservationUrl`, a `menuUrl` PDF, garden photos/copy, `breakfastWeekend` field + value on the `hotel` global.
5. **`/here/dining` fix** (Section 5) — point at the same live data.
6. **Wundermart** — separate brief, once hours/location are confirmed. Not blocking this one.

---

## Open items — do not silently resolve

1. **Reservation flow** — plain link-out for now, or does the client want an embedded OpenTable widget this pass? No existing code either way — genuinely greenfield.
2. **Menu format** — PDF link only (matches old site), or invest in structured menu items now? Flagged, not decided.
3. **Lütze-Garten presentation** — confirmed as page content, not new schema; exact template treatment (its own subsection vs. woven into the gallery) is a design call, not specified here.
4. **KTTK / Wundermart cross-link targets** — neither has a public page yet, so the "Also here" row on `/restaurant` needs a real destination decided (link to `/here` cards? Nothing until Wundermart/KTTK get their own pages?).
5. **`breakfastWeekend` field** — naming/shape is a suggestion; confirm against however the `hotel` global's `openingHours` group is meant to evolve (it's currently flat strings, Lütze's is already a structured array — consider whether `hotel.openingHours` should be restructured to match rather than growing more flat string fields).

---

*Hotel Berlin, Berlin — `/restaurant` Build Brief · v2 · August 2026*
*Pattern base: `HotelBerlin_MeetingsPage_BuildBrief.md` · Status source: `HotelBerlin_EatDrinkPage_BuildStatus_v1.md`*
