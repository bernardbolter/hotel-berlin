# Hotel Berlin, Berlin — Rooms Pages (Index + Detail) — Cursor Build Brief
*For Cursor*
*Pages: `/rooms` (index) and `/rooms/[slug]` ×11 (detail)*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4 · Lucide React*
*Content source: `HotelBerlin_RoomsHero_Addendum.md` — bilingual copy and amenity data already written and seeded, no new content to invent*

---

## Context & scope

Two pages, not one. The live site (`hotel-berlin.de/en/sleep-relax`) already runs individual pages per room type — this brief keeps that architecture, rebuilds it in the new design system, and adds the AEO layer the audit flagged as missing (POOR ratings on Hotel/HotelRoom schema, JSON-LD format, offer markup, room-specific amenity differentiation, and rate comparison).

- **`/rooms`** — overview/index. Short cards for all 11 room types, a scoped sticky nav rail, an optional comparison table. Links out to each detail page. Carries no `HotelRoom` schema of its own — see Section 4.
- **`/rooms/[slug]`** — the real entity. Full gallery, full spec, full amenity list, full description, own canonical URL, own `HotelRoom` + `Offer` JSON-LD.

Everything is Payload-editable. No hardcoded room content in either template — all copy, images, prices, and amenity lists come from the existing `rooms` collection and `tags` collection (see `HotelBerlin_RoomsHero_Addendum.md` for the schema and full seed data).

**Supersedes:** nothing structurally — this is additive to the `rooms` collection already built. The homepage "Sleep & Relax" teaser (Homepage V2 brief, Section 4) is unaffected; it continues to link to `/rooms`.

---

## Mandatory Step 0 — diagnose before building

`RoomSlider.tsx` already exists (per the Addendum) but was built for the **homepage teaser** — auto-rotating between *different rooms*, one image each, CSS-only crossfade. The detail-page gallery needs a different mode: *one room, its full image set, manual prev/next* (matches the old site's `1/5 →` behaviour in the reference screenshots).

Before writing new gallery code, check whether `RoomSlider.tsx` already has (or can cleanly take) a `mode: 'teaser' | 'gallery'` prop, or whether it's tightly coupled to the homepage's rotation logic and a second component (`RoomGallery.tsx`) is the cleaner path. Don't fork silently either way — note which one you did.

---

## Global build requirements (apply throughout)

- Semantic HTML: `<main>`, `<section>`, `<nav aria-label="Room types">`, `<figure>`/`<figcaption>` for gallery images, one `<h1>` per page.
- WCAG 2.1 AA at build time: contrast per `DESIGN.md`, full keyboard nav, visible focus states, `aria-live="polite"` on the nav rail's active-room label, `prefers-reduced-motion` respected on any gallery transition.
- Archivo only, site-wide — no Archivo Narrow.
- `/de` primary, `localePrefix: 'always'`, every field a `{ de, en }` pair, `du` register, written natively per the voice guide (already done in the Addendum's seed data).
- Reuse the existing **Line-CTA** pattern for in-page navigation links; reuse the existing **boxed-button** pattern (same treatment as the header's "Book Now") for the primary conversion action — see Section 3.5. Don't introduce a third button style.
- Background `#FBFBFB` throughout, matching homepage and `/here`.
- **Highlight color — scoped exception, not site-wide Coral.** Rooms pages (index + detail) use `#C16157` — a muted terracotta, confirmed distinct from `--coral` (`#F95D62`) — as the accent for prices, the nav rail's active state, active carousel dots, and similar highlight moments across `/rooms` and `/rooms/[slug]`. This is a deliberate, room-pages-specific choice (same category of exception as the Meetings block's teal panel — scoped, documented, doesn't change the site-wide convention). Add to `tokens.json` as `--rooms-highlight: #C16157` rather than aliasing or overwriting `--coral`.
  - **Contrast — verified, size-restricted.** White on `#C16157` and `#C16157` on white both land ~4.1:1 — passes WCAG AA for **large text only** (18px+/14px+bold), fails the 4.5:1 threshold for normal body text. Ink on `#C16157` is ~3.4:1 — same restriction. Use this color for large text (prices, headings, badges) and non-text elements (dots, active-state fills, icon strokes); for anything at body-copy size, use Ink or the standard `--body-text` token instead, not this color as a text fill.

---

## Section 1 — Routing & data

**Resolved — URL slug.** Plain `/rooms` (EN) / `/zimmer` (DE), not the live site's `/sleep-relax` and not a keyword-stuffed variant like `/rooms-studios`. Matches the existing H1/nav label exactly, matches the Payload collection name, and keeps room-type keywords (e.g. "Studio 45") scoped to their own detail-page URL rather than diluted into the index. Individual room slugs are unaffected — `/rooms/studio-45` (EN) / `/zimmer/studio-45` (DE) — confirm whether room slugs themselves should also localize (e.g. `studio-45` staying identical in both, since it's a proper name) or take a translated slug; recommend keeping room slugs identical across locales since they're names, not descriptions.

```
app/[locale]/rooms/page.tsx           → index        (localized path: /rooms · /zimmer)
app/[locale]/rooms/[slug]/page.tsx    → detail, generateStaticParams from rooms collection
```

This needs to be set via next-intl's `pathnames` config (localized routing), not a literal `[locale]/rooms` folder alone, since the segment itself changes per locale, not just the `/en`/`/de` prefix. Update the breadcrumb, canonical `<link>`, and `ItemList` URLs in Sections 3.1, 4.1, and 4.2 to use these resolved paths rather than a placeholder.

```typescript
export async function getAllRooms() {
  return payload.find({
    collection: 'rooms',
    where: { _status: { equals: 'published' } },
    sort: 'displayOrder',
  }).then(r => r.docs);
}

export async function getRoomBySlug(slug: string) {
  const result = await payload.find({
    collection: 'rooms',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  });
  return result.docs[0] ?? null;
}
```

`generateMetadata()` on the detail route builds `<title>`/`<meta description>` per room from `name` + `shortDescription`, plus canonical + hreflang (Section 4.3).

---

## Section 2 — `/rooms` index page

### 2.1 Page header

`<h1>` "Rooms & Suites" / "Zimmer & Suiten" + a short Laica A intro paragraph, editable — add a small field group to the existing `hotel` global rather than a new collection:

| Field | Type | Notes |
|---|---|---|
| `roomsPageIntro.title` | Group `{ de, en }` — Text | Defaults to "Rooms & Suites" — editable, not hardcoded |
| `roomsPageIntro.body` | Group `{ de, en }` — Textarea | Intro paragraph, Laica A |

### 2.2 `RoomIndexCard`

Condensed card, **not** the full gallery — one image, key facts, link out. 11 of these is the whole page body.

```typescript
type RoomIndexCardProps = {
  slug: string;
  name: string;
  fromPrice: number;
  shortDescription: string;
  heroImage: { src: string; alt: string };   // room's teaser image, falls back to first gallery image
  specChips: { icon: string; label: string }[]; // e.g. size, bed type, max occupancy — 3 max, not the full amenity list
  href: string;                                // /rooms/[slug]
};
```

- Image: top corners rounded (arch-topped motif, consistent with `SpotlightCard`/homepage teaser), `object-fit: cover`.
- Below image: name (H3, Archivo bold), from-price (Archivo, right-aligned or inline — match the homepage teaser's price treatment), short description (Laica A, 1–2 lines, clamp), 3 spec chips (icon + label, small, muted), Line-CTA "View room →" / "Zimmer ansehen →".
- **Grid:** 2 columns at 1024px+, 1 column below. Two columns keeps 11 cards from making the page absurdly long — flag this as a recommendation, not a hard requirement; confirm before build if a single column reads better for the design.

### 2.3 `RoomsNavRail` — sticky room nav

Replaces the old dark horizontal bar entirely.

- **Desktop (1024px+):** vertical rail of 11 dots along the right edge of the content column (inside the max-width, not the viewport edge). Scrollspy-driven active state — whichever `RoomIndexCard` is most in-viewport gets the active dot. Active dot expands into a small pill showing room name + from-price, `--rooms-highlight` (`#C16157`) accent — not Amber, per the scoped exception above. Inactive dots unlabeled. Clicking a dot scrolls to that card (`prefers-reduced-motion` → instant jump, no smooth-scroll).
- **Scoped sticky:** `position: sticky` within the card-list container only — starts after the intro, releases before the footer. Not viewport-pinned.
- **Below 1024px:** rail is replaced by a horizontal scrollable chip strip pinned under the page header, one chip per room name, same active-state logic, no price shown at this width.

```typescript
type RoomsNavRailProps = {
  rooms: { slug: string; name: string; fromPrice: number }[];
  activeSlug: string; // driven by IntersectionObserver in the parent
};
```

### 2.4 `RoomsCompareTable` — optional comparison matrix

Directly answers the audit's "POOR — Rate Comparison Tool" and "POOR — Room-Specific Amenity Differentiation" findings. Collapsed by default behind a Line-CTA-style toggle ("Compare all rooms ↓" / "Alle Zimmer vergleichen ↓") so it doesn't compete with the cards for a first-time visitor — confirm this default with the client rather than treating it as settled.

Rows = 11 rooms, columns = size (m²), bed type, max occupancy, bathroom type, from-price, plus a compact icon row for `hasBalcony` / `hasSauna` / `hasSeparateLiving` / `isAccessible`. No new schema — every column reads directly off fields already on `Rooms.ts` per the Addendum.

---

## Section 3 — `/rooms/[slug]` detail page

### 3.1 Structure

```
Breadcrumb: Home / Rooms / [Room name]     — small, top. Archivo, 12px caption/meta size, muted (--dim), not the page's main type scale.
Header row: <h1>[Room name]</h1> ............ from [price]€
                                              — flex row, title left / price right, Archivo. Title Ink, price `--rooms-highlight` (`#C16157`) — large text, so within the verified contrast range for this color (see Global build requirements).
                                                 Matches the live site's inline title+price placement, restyled to tokens.
Gallery (full-bleed carousel — breaks the content max-width, see 3.3)
Spec strip: size · bed · occupancy · bathroom
Feature icons: balcony / sauna / separate living / accessible (only the ones that are true)
Full description
Amenity grid: icon + label + description cells, matched to live-page structure — see 3.4
CTA: Check availability → bookingUrl (boxed button, Amber)
← All rooms (back to index)
```

### 3.2 Full description — resolved

**Confirmed against the actual collection:** the long-form copy lives on `description` — a localized richText field — not `insiderStory`. Read directly from `room.description`, not through a relationship.

Note: `Rooms.ts` still has a pending task to replace the old `storyConnection` group with a proper `insiderStory` relationship (per the Addendum's schema-addition list). That swap is unrelated to this field and doesn't block this brief — `description` already works today and is what this page should wire against regardless of when `insiderStory` lands.

This is the field that feeds the JSON-LD `description` property (Section 4.2) — **not** `shortDescription`, which is reserved for card teasers and meta descriptions.

### 3.3 Gallery — full-bleed carousel

Per Step 0: full image set for this room, manual prev/next controls (not auto-rotating — this is a browsing gallery, not a rotating teaser), image counter (`3 / 5`), each image with its own `altText`. **Resolved:** the gallery already carries per-image `alt` — nothing to add here, just wire the existing field into `ImageObject.description` in the schema builder (Section 4.1).

**Resolved (Step 0):** `RoomSlider.tsx` is confirmed homepage-teaser-only (auto-rotate across different rooms) with no gallery mode. Build a separate `RoomGallery.tsx` for this page rather than extending `RoomSlider` — the two behaviours (auto-rotating between rooms vs. manual browsing within one room's image set) are different enough that forcing them into one component would mean a mode-switch prop touching most of the internals anyway.

**New pattern — full-bleed, breaks the content max-width.** Matching the live site's carousel treatment: on desktop, the gallery container extends past the page's normal max-width, so the trailing edge of the next image sits partially visible/off-screen — a visual cue that there's more to scroll, not a fully-contained card. This is the first place in the project a component intentionally breaks the grid this way; implement as a dedicated "full-bleed" wrapper (`w-screen` + centering offset, or negative margins relative to the page container) rather than a one-off hack, since it may get reused elsewhere later.

- Manual prev/next arrows, slide transition via `transform: translateX()`, `prefers-reduced-motion` → instant snap instead of animated slide.
- Small corner radius on individual image tiles — not the large one-sided arch motif used elsewhere, since full-bleed images run edge-to-edge with no single "top" corner to round.
- Below 768px: full-bleed collapses to a standard contained carousel (edge-to-edge bleed doesn't read well at narrow widths where there's no "next image" to peek at).

### 3.4 Spec strip & amenity grid — matched to the live page's cell structure

Spec strip pulls directly from existing fields: `floorSizeM2`, `bedConfiguration.type`/`.details`, `occupancy.maxAdults`/`.maxChildren`, `bathroomLabel` (through the existing label map in `RoomSlider.tsx`) + `bathroomDescription`.

**Amenity grid scope — deliberately narrower than the live page's.** The live site's amenity icon block re-states bed size, bathroom type, and room details that are already in its own top-of-page bullet list — that duplication is part of what produced the contradicting numbers the audit (and the Individual QA pass) caught. Keep bed/bathroom/size in the spec strip only. The amenity grid covers genuine standalone features: WiFi, AC, TV, minibar, safe, desk, Nespresso/tea, sound system, fridge, Berlin doors, YMB map, balcony, sauna, separate living, views, and similar — everything on the room's `amenities` relationship *except* the tags already represented structurally in the spec strip.

**Cell structure — matched to the live page, restyled:**

```
[icon]
Label (bold)
One-line description
```

- Icon: Lucide, from `tag.lucideIcon`, no circular badge (the live page doesn't use one — bare icon, left-aligned above the text block, not centered). Stroke color `--rooms-highlight` (`#C16157`) — this is exactly the kind of highlight moment the color's scoped exception exists for.
- Label: bold, Archivo, from `tag.name` (localized) — same weight/role as the live page's bold heading per cell.
- Description: one line, Archivo regular, `--body-text` (not `--dim` — this is real informative content, not metadata), from a new `tag.description` field (localized) — see schema addition below.
- Grid: 4 columns at desktop (1024px+), 2 at tablet, 1 at mobile — same density as the live page.
- Left-aligned text block per cell, generous vertical spacing between rows (matches the live page's breathing room, avoids the cramped feel of the old global 50-icon version).

**Schema addition — `tags.description`.** A short bilingual one-liner per amenity tag ("A spacious room safe," "Wireless internet throughout your stay"), written once and reused everywhere that tag is attached — same reuse pattern as `lucideIcon` already establishes. Not written per-room; the tag's description should be generic enough to hold for every room that carries it. If a specific room needs different phrasing for the same feature, that's a signal that room needs its own distinct tag, not a per-room override on a shared one.

**Considered and rejected — extracting the live site's own SVG icon set.** Would introduce a second icon vocabulary alongside Lucide, which is already the consistent icon language everywhere else in the rebuild (footer, `MapPin`, `SpotlightCard`, `VenueCompactCard`, nav, `tags.lucideIcon`). Licensing on the current site's icon set is also unconfirmed. The visual similarity to the live page comes from matching cell *structure* (icon/label/description, grid density, spacing) and using the new `--rooms-highlight` color — not from reusing the actual asset files.

### 3.5 CTA

Boxed button, Amber, same visual family as the header's "Book Now" — this is the page's primary conversion action, so it should read heavier than the Line-CTA links used for in-page/index navigation. Label: "Check availability" / "Verfügbarkeit prüfen", linking to `bookingUrl`.

**⚠️ Open item:** in the current seed data, `bookingUrl` is identical across all 11 rooms (one generic Radisson booking-engine URL). Confirm whether the booking engine supports a room-type query parameter for a genuine per-room deep link. If not, keep the CTA copy generic ("Check availability" rather than "Book this room") so it doesn't imply a filtered result the link doesn't actually provide.

### 3.6 Prev/next room (optional)

Nice-to-have, not required for this pass: simple prev/next arrows at the bottom of the page cycling through `displayOrder`, so a visitor can browse all 11 without returning to the index each time. Flag as in/out of scope before building.

---

## Section 4 — JSON-LD

Use the existing `aeo-schema` composable builder pattern (per the Nachbarschaft/You Me & Berlin brief) — don't hand-write JSON-LD inline in the page component.

### 4.1 Detail page — `buildHotelRoomSchema(room)` + `buildOfferSchema(room)`

```typescript
{
  "@type": "HotelRoom",
  "@id": "https://hotel-berlin.de/rooms/studio-45#room",
  "name": room.name,
  "description": room.longDescription,          // NOT shortDescription — see 3.2
  "url": "https://hotel-berlin.de/rooms/studio-45",
  "image": room.gallery.map(img => ({
    "@type": "ImageObject",
    "contentUrl": img.url,
    "description": img.altText,
  })),
  "floorSize": { "@type": "QuantitativeValue", "value": room.floorSizeM2, "unitCode": "MTK" },
  "occupancy": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": room.occupancy.maxTotal },
  "bed": { "@type": "BedDetails", "typeOfBed": room.bedConfiguration.type, "numberOfBeds": 1 },
  "amenityFeature": room.amenities.map(tag => ({
    "@type": "LocationFeatureSpecification",
    "name": tag.name,
    "value": true,
  })),
  "identifier": room.slug,
}
```

```typescript
{
  "@type": "Offer",
  "itemOffered": { "@id": "https://hotel-berlin.de/rooms/studio-45#room" },
  "price": room.fromPrice,
  "priceCurrency": "EUR",
  "availability": "https://schema.org/InStock",   // static for now — no real-time inventory feed in scope
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "unitCode": "DAY",
    "referenceQuantity": { "@type": "QuantitativeValue", "value": 1 },
  },
  "url": room.bookingUrl,
}
```

Plus `BreadcrumbList` (Home → Rooms → [room name]) and a canonical `<link rel="canonical">` pointing at the detail URL itself.

### 4.2 Index page — reference, don't duplicate

**Important:** the index page must not re-declare full `HotelRoom` nodes — that would put two competing canonical declarations of the same entity on two different URLs, which works against AI parsing rather than helping it. Instead, emit an `ItemList` on `/rooms` whose items are lightweight references to the detail-page `@id`s:

```typescript
{
  "@type": "ItemList",
  "itemListElement": rooms.map((room, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "url": `https://hotel-berlin.de/rooms/${room.slug}`,
  })),
}
```

One `HotelRoom` entity, one URL, one schema declaration — living on the detail page.

### 4.3 hreflang / canonical

Both pages get `de`/`en` alternates via `localePrefix: 'always'`. Detail-page canonical is per-locale (`/rooms/studio-45` and `/de/rooms/studio-45` are alternates of each other, not duplicates of the index).

---

## Section 5 — Payload schema additions

Most of what these pages need already exists on `Rooms.ts` and `tags` per the Addendum. Additions:

| Field | Collection | Type | Notes |
|---|---|---|---|
| `roomsPageIntro.title` / `.body` | `hotel` global | Group `{ de, en }` | Section 2.1 |
| ~~`gallery[].altText`~~ | `rooms` | — | **Resolved — already exists** (`gallery[].alt`), no schema change needed. See 3.3. |
| `metaDescription` | `rooms` | Group `{ de, en }` — Text (optional) | If not already covered by `shortDescription`, a dedicated SEO-length field keeps card copy and meta copy independently editable |
| `compareTable.enabled` | `hotel` global or a small settings group | Checkbox | Hide-don't-delete toggle for Section 2.4, same pattern as elsewhere in the project |
| `socialImage` | `rooms` | Upload (media, optional) | Feeds `og:image`/`twitter:image` on the detail page. **Falls back to `gallery[0]` if left empty** — same fallback pattern already used for `homepageTeaser.teaserImage`, no new logic to invent. Only needed as an override for rooms where the first gallery image isn't the best representative shot. `og:image:alt` reuses that image's existing `gallery[].alt` — no separate field. |
| `description` | `tags` (amenity type) | Group `{ de, en }` — Text | One-line description per amenity, e.g. "A spacious room safe." Written once per tag, reused across every room that has it — see Section 3.4. |

---

## Section 6 — Open items

**Resolved:**
1. ~~`RoomSlider.tsx` mode~~ — confirmed teaser-only, build separate `RoomGallery.tsx` (Section 3.3).
2. ~~Long-description field name~~ — confirmed `description`, richText, localized (Section 3.2).
3. ~~Gallery per-image alt text~~ — confirmed already present as `gallery[].alt` (Section 3.3).
5. ~~DE path~~ — confirmed `/zimmer`, not `/rooms` (Section 1).
6. ~~Compare table default state~~ — **collapsed by default**.
7. ~~Index grid columns~~ — **2-up at 1024px+, 1-up below**.
8. ~~Prev/next room navigation~~ — **deferred**, out of scope for this pass.

**Still open:**

4. **`bookingUrl` identical across all 11 rooms.** Confirm whether the booking engine supports a room-type deep-link parameter. Until confirmed, CTA copy stays generic — "Check availability" / "Verfügbarkeit prüfen," not "Book this room" — Section 3.5.

---

## Section 7 — Build sequence

Build in this order, even within a single pass — the detail-page schema is what actually addresses the audit findings; the index-page polish (rail, compare table) is UX value on top, not a prerequisite for it. Don't let component-by-component convenience reorder this:

1. **Routing skeleton** for both pages — `/rooms`/`/zimmer` and `/rooms/[slug]`/`/zimmer/[slug]`, even bare, so the URL structure is locked before anything is styled.
2. **`RoomGallery.tsx`** — standalone, testable in isolation.
3. **Detail page** — full assembly (Sections 3.1–3.5) + `HotelRoom`/`Offer` JSON-LD (Section 4.1). This is the priority: it's the actual entity data the audit rated POOR three times.
4. **Index page** — `RoomIndexCard` + `ItemList` schema (Section 4.2). A plain single-column list linking to working detail pages is a legitimate intermediate state — ship it before the rail/compare-table polish if time is tight.
5. **`RoomsNavRail`**, then **`RoomsCompareTable`** — lowest priority, both explicitly optional.

## Section 8 — Redirects (live-site migration)

The current site is live and indexed at `/en/sleep-relax/rooms-suites/*` (EN) and `/ubernachten-relaxen/zimmer-suiten/*` (DE). Moving to `/rooms`/`/zimmer` without redirects breaks every existing bookmark/backlink and drops whatever ranking signal those URLs have already accumulated — this needs a 301 map, not a soft launch-and-see.

**Platform-level, not Payload-editable** — this is a one-time technical migration concern, not ongoing client-managed content. Implement via `redirects()` in `next.config.js` or Vercel's redirects config.

Minimum required mappings:

| Old (EN) | New (EN) |
|---|---|
| `/en/sleep-relax/rooms-suites` | `/rooms` |
| `/en/sleep-relax/rooms-suites/individual-room` | `/rooms/individual` |
| `/en/sleep-relax/rooms-suites/[old-slug]` ×10 more | `/rooms/[new-slug]` |

| Old (DE) | New (DE) |
|---|---|
| `/ubernachten-relaxen/zimmer-suiten` | `/zimmer` |
| `/ubernachten-relaxen/zimmer-suiten/einzelzimmer` | `/zimmer/individual` |
| `/ubernachten-relaxen/zimmer-suiten/[old-slug]` ×10 more | `/zimmer/[new-slug]` |

**⚠️ Slugs don't map 1:1 by pattern** — `individual-room` → `individual`, `studio45-suite` → `studio-45`, and others (`suite-one-bedroom`, `premium-family-room`, etc.) need an explicit old→new pairing checked against each room's actual new `slug` field rather than assumed from a naming convention. Build the full 11-row table before implementing, not incrementally as each room ships.

---
*Content source: `HotelBerlin_RoomsHero_Addendum.md` · Schema base: `src/collections/Rooms.ts`*
*Status: field mappings and DE path confirmed against actual codebase · defaults locked · build sequence added*
