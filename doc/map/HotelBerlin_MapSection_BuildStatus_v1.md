# Hotel Berlin, Berlin — Map Section (Places ↔ People) Build Status v1
*Captured 2026-08-24, reported by Cursor against `hotel-berlin-de`. Reconciled against `HotelBerlin_HomepageMapTeaser_BuildBrief.md`, `HotelBerlin_NeighbourhoodMap_BuildBrief.md`, `HotelBerlin_NeighbourhoodTeaser_Addendum.md`, `HotelBerlin_NachbarschaftYouMeBerlin_BuildBrief.md`, and seed notes `HotelBerlin_Nachbarschaft_SeedData_v1.md` / `v2.md`. Part A only — no code changes in this pass.*

**Bottom line:** the destinations map is one shared Mapbox GL stack, live on the homepage, `/here`, and `/nachbarschaft`. Pin/card treatment is the later 9-category palette (addendum v2), **not** the six muted v4 tokens the Neighbourhood Map brief still claims are signed off and live. `/you-me-and-berlin` exists as a person grid with no map. Place and person `[slug]` pages are the plain stubs the Nachbarschaft brief asked for, plus extra fields. Several teaser pieces were written (`TeaserPlaceIndex`, consent adapter) and never mounted. There is no people-first map.

---

## Built and live in code

**Shared Mapbox GL stack** — parameterized by context, not three forks of the GL runtime:

| Layer | Path | Role |
|---|---|---|
| Pin primitive | `src/components/map/MapPin.tsx` | `variant: 'hotel' \| 'category'` — 42px ink house / 32px category, hover+focus+touch label reveal |
| Pin mount | `src/components/map/mountMapPin.tsx` | `createRoot` into Mapbox marker hosts |
| GL canvas | `src/components/map/NeighbourhoodGuideMap.tsx` | Mapbox init, hotel marker, category pins, `aria-label`, `<noscript>`, touch first-tap-reveals / second-tap-opens |
| Info card | `src/components/map/PlaceInfoCard.tsx` | description, transit row, **all** endorsement chips, image + `imageCredit` |
| Teaser wrapper | `src/components/map/HomepageMapTeaser.tsx` | homepage + `/here` curated pins + card chrome |
| Full-page wrapper | `src/components/map/NeighbourhoodFullMap.tsx` | `/nachbarschaft` — same pin/card, filters owned by the page |
| Server section | `src/components/map/NeighbourhoodMapSection.tsx` | `context="homepage" \| "here"`, calls `getMapTeaserPlaces` |

**Call sites:**

- Homepage mid-page: `src/app/[locale]/page.tsx` → `<NeighbourhoodMapSection />` (default `context="homepage"`)
- `/here` hub card: `src/app/[locale]/here/page.tsx` → `<NeighbourhoodMapSection context="here" layout="card" ctaHref="/here/explore" />`
- `/here/explore` footer: `src/app/[locale]/here/explore/page.tsx` → `<NeighbourhoodMapSection context="here" />` (full teaser, not compact)
- `/nachbarschaft`: `src/app/[locale]/neighbourhood/page.tsx` → `<NeighbourhoodFullMap />`

**Leftover, not in the live path** (not imported by any page):

- `src/components/map/NeighbourhoodMap.tsx` — older teal/amber/purple disc markers, `places` query type
- `src/components/map/NeighbourhoodMapCanvas.tsx` — hotel-only canvas, amber-dot hotel pin
- `src/components/map/TeaserPlaceIndex.tsx` — legend + place-list from the teaser addendum, **never mounted**
- `src/app/[locale]/map-styles/page.tsx` — style preview, not a public map surface

**`neighbourhood-places` collection** — `src/collections/NeighbourhoodPlaces.ts`. Section 1.2 fields from the Nachbarschaft brief are present (name, slug, category, schemaType, address, geo, walkingMinutes, distanceTier, indoorOutdoor, targetAudience, description, endorsements[], website, openingHours, priceRange, image, authority, status). Map-brief additions `transit`, `homepageTeaser`, `hereTeaser` are present. Addendum addition `imageCredit` is present. Geocoding hook auto-fills missing geo / walkingMinutes / distanceTier via Nominatim + Mapbox Directions (`src/collections/hooks/geocodeNeighbourhoodPlace.ts` → `src/lib/geocode/`).

**`people` collection** — `src/collections/People.ts`. `picks` is a Payload **`join`** field (`collection: 'neighbourhood-places', on: 'endorsements.person'`). Admin copy: *"Payload join field — confirmed on 3.85"*. Installed Payload is `3.85.0` (`package.json`). **No `afterChange` sync hook.** Reverse join is fetched with `joins: { picks: { limit: 100 } }` in `getResolvedPerson` (`src/lib/aeo/resolve.ts`).

**`/you-me-and-berlin` listing** — `src/app/[locale]/you-me-berlin/page.tsx`. Filter-by-tag, search, numbered pagination at 24/page (`PEOPLE_PAGE_SIZE` in `src/lib/queries/people.ts`), `PersonCard`, intro, bridge CTA to `/neighbourhood`. URL query params. Canonical is the unfiltered listing URL. **No map on this page.** Listing query is `status: published` only — with the current all-draft seed, the grid is empty and the page sets `robots: noindex`. JSON-LD (`getAllPeopleForSchema`) still includes drafts.

**Detail stubs** — both exist, both emit JSON-LD:

- `/nachbarschaft/[slug]` → `src/app/[locale]/neighbourhood/[slug]/page.tsx` — comment: *"Stub layout — polished design TBC."* `<h1>`, category, description, endorsement quotes + person links. `buildPlacePageGraph`. Inactive places 404 (`status: active` in `getResolvedPlace`).
- `/you-me-and-berlin/[slug]` → `src/app/[locale]/you-me-berlin/[slug]/page.tsx` — name, jobTitle, roomNumber, basedIn, quote, shortBio, picks as a linked list. `buildPersonPageGraph`. **`bio` richText and `portrait` are not rendered.** Drafts do **not** 404 — `getResolvedPerson` has no status filter; drafts get `noindex` instead (comment: preview pipe).

**Teaser curation** — `getTeaserPlaces()` at `src/lib/places/getTeaserPlaces.ts`; fetched via `getMapTeaserPlaces()` at `src/lib/queries/neighbourhoodPlaces.ts`. Independent `homepageTeaser` / `hereTeaser` enabled+order flags. Seed sets (`src/seed/homepage-featured-places.ts`):

| Context | Slugs (order) |
|---|---|
| Homepage | `neue-nationalgalerie`, `kaethe-kollwitz-museum`, `hamburger-bahnhof`, `koenig-galerie`, `893-ryotei-bar` |
| `/here` | `893-ryotei-bar`, `hamburger-bahnhof`, `koenig-galerie`, `schloss-charlottenburg`, `anjoy` |

Three overlap; two unique each. Not the same five. Homepage still has a **legacy fallback** to `featuredOrder` then “any geo-tagged place” if `homepageTeaser` is empty; `/here` returns `[]` if `hereTeaser` is empty.

**Mobile card-below-map** — implemented on the homepage teaser (full variant) and `/nachbarschaft`: `hidden md:block` floating card, `md:hidden` in-flow card (`HomepageMapTeaser.tsx`, `NeighbourhoodFullMap.tsx`). `/here` hub uses `layout="card"` / `variant="compact"` — **no PlaceInfoCard at all**, map only (160–280px).

---

## Specced / linked, partially built

### 1. Map component inventory

**Genuinely one shared GL component** (`NeighbourhoodGuideMap` + `MapPin` + `PlaceInfoCard`), parameterized by:

- `context` on `NeighbourhoodMapSection` (`homepage` | `here`) — data + accent
- `layout` (`section` | `card`) — height and whether the info card mounts
- `NeighbourhoodFullMap` vs `HomepageMapTeaser` — wrappers around the same canvas, not separate Mapbox implementations

They have **not** forked into three GL runtimes. They **have** forked at the chrome layer (compact `/here` drops the card; teaser legend/list was built then left unmounted; two dead older canvases remain in `src/components/map/`).

`pinColorMode` / `hotelMarkerVariant` props on `NeighbourhoodGuideMap` are deprecated stubs — comment says pins “always use muted category tokens”; the live colors are palette v2 (see §4), not v4 muted.

### 2. `neighbourhood-places` schema vs briefs

**Present (Nachbarschaft §1.2):** name, slug, category (9 xlsx values including Kids), schemaType, address, geo, walkingMinutes, distanceTier, indoorOutdoor, targetAudience, description (localized `textarea`, brief said `text`), endorsements[] (`person` + `quote`, both required **per row** — the array itself is not required, so a place with zero endorsers saves), website, openingHours, priceRange, image, authority, status (`active`/`inactive`).

**Present (Neighbourhood Map §1 additions):** `transit` group (minutes / station / line), `homepageTeaser` `{enabled, order}`, `hereTeaser` `{enabled, order}`.

**Present beyond either brief:** `imageCredit` (teaser addendum §8), `featuredOrder` (legacy homepage pagination), `endorsements[].associatedRoom` (place-level `associatedRoom` from Nachbarschaft §1.2 was **moved onto the endorsement row**).

**Missing / relocated:**

| Brief field | Status |
|---|---|
| `associatedRoom` on the place | Relocated to `endorsements[].associatedRoom` — flag, not silently equivalent |
| `featuredOnHomepage` boolean (Homepage Map Teaser §1) | Never added; superseded by `homepageTeaser` |
| `PIN_MUTED_TOKENS` / `color.category.pinMuted` | **Not in the repo.** Neighbourhood Map brief §2 status line claiming they are live is stale |

**Geocoding:** no longer a purely manual lat/long step. `beforeChange` hook geocodes when geo is empty (Nominatim, fails soft, skipped when `SKIP_GEOCODE_HOOK=1`). Editors can still type coordinates. Walking minutes / distanceTier fill only when those fields are also empty.

### 3. `people` schema — join vs hook

**Join path. Confirmed.** Payload 3.85.0. Field at `People.ts:98-109`. Admin: *“Do not hand-maintain.”* `allowCreate: false`. Detail resolver requests the join explicitly. Listing `getPeople` does not request `picks` (cards don't need it).

Minor diffs vs Nachbarschaft §1.1: `slugField()` helper instead of a plain text slug; `shortBio` is `textarea`; portrait alt lives on `media.alt` rather than a nested `altText` on the upload field.

A person with zero endorsements is a valid empty profile — join returns no docs. Seed people (Maike, Alessandra Botts, etc.) are `status: draft` with no bio/portrait by design.

### 4. Pin / card visual treatment

**Not v4 muted tokens. Live is addendum palette v2.**

Neighbourhood Map brief §2 listed six muted pin hexes and marked them signed off / live in `tokens.json → color.category.pinMuted` and `PIN_MUTED_TOKENS`. **Neither exists.** Live tokens are `tokens.json → color.category.pin` (nine hues) and `CATEGORY_PIN_COLOR` in `src/lib/neighbourhood/categories.ts` — the 9-category palette from `HotelBerlin_NeighbourhoodTeaser_Addendum.md` §7 (“pulled back from full brand saturation, not all the way to muted”). Hotel marker fill `#1A2B4A` (`color.map.hotelInk`) matches.

Hotel marker is the **house glyph**, always-labeled — Neighbourhood Map brief §3, not the Homepage Map Teaser brief’s black “HBB” text badge.

`description` **does render** in `PlaceInfoCard` (`PlaceInfoCard.tsx` — under the title, above transit). Endorsement chips map **every** `endorsements[]` entry, each linking to `/you-me-and-berlin/[slug]`. “Recommended by” label is wired.

**Divergences:**

- Homepage teaser still swaps missing images for `picsum.photos/seed/{slug}/…` (`HomepageMapTeaser.tsx`). Addendum §1 allowed this for layout testing and warned not to ship it. `/nachbarschaft` full map does **not** picsum-fill — missing image → no image block.
- Teaser addendum §4–5 (scoped category legend + place list under the map) — components exist in `TeaserPlaceIndex.tsx`, **not used** by `HomepageMapTeaser`.
- Homepage Map Teaser brief’s 15 places / 3-page pagination is **not live**. Constants `HOMEPAGE_FEATURED_LIMIT = 15` / `HOMEPAGE_FEATURED_PAGE_SIZE = 5` remain as legacy comments. Live teaser is 5 pins, no pagination (Neighbourhood Map brief §5 + addendum).
- Homepage Map Teaser brief said this component needs no JSON-LD; Neighbourhood Map brief §6 said teaser JSON-LD should cover the 5 shown. **Live follows the later brief** (`NeighbourhoodMapSection` emits `buildNeighbourhoodListGraph` for the curated set).

### 5. `/you-me-and-berlin` listing

**Built as specced for the grid, not for a map.**

| Spec (Nachbarschaft §5) | Live |
|---|---|
| Intro block | yes |
| Filter by tags | yes (`?tag=`, `FilterChipBar` `aria-pressed`) |
| Search | yes (extra vs brief) |
| Pagination 24/page | yes |
| `PersonCard` (photo, name, role, room, one-line bio) | yes — initials placeholder if no portrait |
| URL query params + canonical on unfiltered URL | yes |
| Bridge CTA to `/nachbarschaft` | yes |
| Shared map (smaller instance) | **no map** |
| People-first map | **does not exist** |

Shared with `/nachbarschaft`: `FilterChipBar`, `PaginationNav`, `SearchFilter`. Not shared: the map.

### 6. Detail pages

Both routes exist. Neither 404s for a valid slug. Both are the stub plus a bit more than `<h1>+<p>`:

**Place** (`/en/neighbourhood/[slug]` ↔ `/de/nachbarschaft/[slug]`): JSON-LD + name, category, description, all endorsement quotes. No hero image, no address/transit/walking row, no embedded map, no `PlaceCard` chrome. Inactive → 404.

**Person** (`/en/you-me-and-berlin/[slug]` same slug in DE): JSON-LD + name, jobTitle, room, basedIn, quote, shortBio, picks as text links. No portrait, no `bio` richText, no video embed, no `PlaceCard` grid. **Drafts are publicly reachable with noindex** — listing hides them; the URL does not. That is a deliberate preview-pipe comment in `resolve.ts`, not the “draft 404s” rule in Part B §6 of this prompt. Flag, don’t treat as settled.

### 7. Homepage + `/here` teaser instances

**Independently curated, both via `getTeaserPlaces` / `getMapTeaserPlaces`.** Not the same five. See table in “Built and live”.

Caveats:

- `/here` hub is `layout="card"` — same data, stripped chrome (no info card, no legend, cooperative gestures, 160–280px). `/here/explore` uses the full teaser (`layout` default `section`).
- Homepage `getMapTeaserPlaces` will silently fall back to `featuredOrder` then any geo-tagged places if flags aren’t seeded. `/here` will not.

### 8. Mobile behavior

| Spec | Live |
|---|---|
| `PlaceInfoCard` drops from floating-over-map to full-width-below-map under `md` | **Yes** on homepage teaser (full) and `/nachbarschaft`. **N/A** on `/here` hub compact — there is no card to drop. |
| Homepage teaser legend horizontal-scroll under 768px | **No legend is mounted.** `TeaserCategoryLegend` has `flex-wrap`, not `overflow-x-auto`. The original homepage brief’s side-panel legend + pagination chrome is gone. |

Floating card does **not** overlap at narrow widths on the two surfaces that use it. `/here` compact map has no card overlap because it has no card.

Touch first-tap / second-tap is implemented in `NeighbourhoodGuideMap` via `matchMedia('(hover: hover) and (pointer: fine)')`. **Not verified on a real touch device in this audit** — still an open QA item.

### 9. Consent gating (homepage only)

**Not live.** `src/lib/consent/mapConsent.ts` still exists (localStorage `hbb-map-consent`, pending / granted / declined). `readMapConsent` / `writeMapConsent` are **not imported anywhere else**. `HomepageMapTeaser.tsx` comment: *“Cookie consent gate temporarily skipped: map loads whenever a token is present.”* Fallback satellite JPG only shows when `accessToken` is missing, not when consent is declined.

CMP model (per-component vs site-wide) is **still unresolved**. No Cookiebot / Usercentrics / etc. in the repo. Homepage Map Teaser brief DoD checkbox for consent is marked done in that file; the code does not match.

### 10. Open items from Neighbourhood Map brief (the 7)

| # | Item | Status 2026-08-24 |
|---|---|---|
| 1 | Six muted pin tokens need sign-off | **Superseded, not implemented as written.** Brief now says signed off / live in `pinMuted` — that path does not exist. Live palette is addendum v2 nine-hue `color.category.pin`. Contrast of white glyphs vs those hexes still flagged unverified in the addendum. |
| 2 | Transit data gaps | **Still open.** Schema + card conditional render are in. Seed transit exists on **KaDeWe only** (`neighbourhood-v2-places.json` + featured-places script). Current teaser sets do **not** include KaDeWe, so the live teasers have no transit row. Content-gathering task, not a render bug. |
| 3 | Touch-device label reveal | **Built, QA still open.** Code path exists. This audit did not run it on a phone. |
| 4 | Hover-only labels tradeoff | **Still open.** Live behavior is hover/focus/active. No user-testing note in repo reversing it. |
| 5 | Icon/glyph reconciliation | **Partially done.** `CATEGORY_LUCIDE_ICON` is shared by `MapPin` and `PlaceCard` (`src/lib/neighbourhood/categoryIcons.ts`). Footer amenity icons are a separate CMS picker — different domain, not category collision. White-glyph contrast vs pin hex still unverified (addendum §7). |
| 6 | Pin clustering at 91-place scale | **Still open.** Zero clustering / Supercluster code. Current seed is ~20 places; full page plots the **filtered** set, unpaginated, so a future 91-place unfiltered view would draw 91 markers. |
| 7 | “Kids” taxonomy | **Still open.** `Kids` remains a `category` value with provisional pin `#4A90C4` / `Baby` glyph. `targetAudience` also exists. Addendum: only keep the Kids pin token if Kids stays a category. Not re-litigated. |

Additional open items carried from other briefs, still open:

- Homepage CMP / consent model
- Teaser legend + place list (addendum §4–5) written but unmounted
- picsum placeholders on the teaser
- Room-number mismatches in seed (Kristiane 1185 vs 1514, Gita, Katja) — seed notes, not map code
- All v1/v2 people records `status: draft` — listing empty until publish
- Party → `LocalBusiness` schemaType mapping still the “no closer fit” flag from Nachbarschaft §1.2

---

## Not built at all

| Item | Status |
|---|---|
| People-first map on `/you-me-and-berlin` | No map instance, no `?person=` filter on the destinations map |
| `MapPin variant="person"` | Only `'hotel' \| 'category'` |
| Polished place detail layout (hero, address/transit, embedded map) | Stub only |
| Polished person detail layout (portrait, bio richText, video, `PlaceCard` picks) | Stub only; `bio` unused on the page |
| Homepage consent placeholder → “Enable map” → declined static fallback | Adapter file only; teaser skips the gate |
| Homepage 15-place / 3-page pagination | Superseded in later briefs; leftover constants only |
| Mounted teaser category legend / place index | Components exist, unused |
| Pin clustering | None |
| Public 404 for draft people | Draft person URLs render with noindex |

---

## Route inventory

| Path | `page.tsx` | Map | Notes |
|---|---|---|---|
| `/` (mid-page) | `src/app/[locale]/page.tsx` | teaser, `context=homepage` | 5 curated places, floating card md+, card below on mobile |
| `/here` | `src/app/[locale]/here/page.tsx` | compact card, `context=here` | no info card |
| `/here/explore` | `src/app/[locale]/here/explore/page.tsx` | full teaser, `context=here` | |
| `/neighbourhood` · `/nachbarschaft` | `src/app/[locale]/neighbourhood/page.tsx` | full map + grid | filters in URL; JSON-LD = full active set |
| `/neighbourhood/[slug]` · `/nachbarschaft/[slug]` | `src/app/[locale]/neighbourhood/[slug]/page.tsx` | none | stub + JSON-LD; inactive 404 |
| `/you-me-and-berlin` | `src/app/[locale]/you-me-berlin/page.tsx` | **none** | grid only; published-only |
| `/you-me-and-berlin/[slug]` | `src/app/[locale]/you-me-berlin/[slug]/page.tsx` | none | stub + JSON-LD; drafts reachable, noindex |

---

## Editorial add-flow (as the code actually behaves today)

Not a hotel-team how-to yet — snapshot of what Payload will do, so Part B §4 has a baseline.

**New place:** create `neighbourhood-places`. Required: name, slug, category, schemaType, `address.addressLocality` (defaults Berlin), status. Address street/postcode, geo, walkingMinutes, endorsements, image, teasers are all optional. `endorsements[]` can be empty — a place with zero recommenders is valid and will pin if it has geo. On save, if geo is empty, the geocode hook tries Nominatim and (on success) fills geo + walkingMinutes + distanceTier. Soft-fail: save succeeds with no pin if geocode misses. `status: active` is the public gate. Flip `homepageTeaser.enabled` / `hereTeaser.enabled` + `order` to feature. Map teaser query also requires `geo.latitude` / `geo.longitude` to exist — a live place without geo appears in the `/nachbarschaft` grid, not on the map.

**New person:** create `people`. Required: name, type, status (default `draft`). `picks` is read-only; it fills when this person is added as `endorsements[].person` on a place. Zero endorsements = empty profile. Listing and (intended) public page require `status: published`. **Today the detail route still renders drafts.**

Developer vs hotel team: category → schemaType mapping is still “apply at seed, not by editor judgment” (admin description). Geocoding no longer requires a developer for typical Berlin addresses, but a miss still needs a manual lat/long. Transit (station/line/minutes) is still hand-entered. Image licensing (`imageCredit`) is editor-owned. Wikidata/authority identifiers are editor-owned.

---

## Note on conflicting briefs

Three map briefs plus one addendum do not describe the same teaser. Live code follows, in order of what actually shipped:

1. Neighbourhood Map brief’s 5-pin teaser (no pagination) over the Homepage Map Teaser brief’s 15/5 pagination.
2. Teaser addendum palette v2 over Neighbourhood Map brief v4 muted six-token palette — **including over that brief’s later “signed off / live in pinMuted” status line**, which the repo does not match.
3. Consent DoD checkmarks in the Homepage Map Teaser brief overstate the code.
4. Teaser addendum §4–5 (legend + list) was coded and then not wired.

Do not treat the Homepage Map Teaser brief’s all-checked DoD as an accurate picture of production.

---

# Part B §1 — Proposal: destinations map vs recommendations map

No code. Two architectures, then a recommendation.

The product intent is clear: `/nachbarschaft` = browse by destination, see who recommends it (category-first). `/you-me-and-berlin` = browse by person, see what they recommend (person-first). They should feel like different tools even if they share Mapbox plumbing. What is **not** decided is whether “recommendations map” is a second pin set (people as markers) or a filtered view of the existing place pins.

## Approach A — Second map, pins are people

One pin per person. Coordinate from `people.basedIn` (geocoded neighbourhood) or from a centroid / first of `people.picks`. Cluster at neighbourhood scale. Clicking a pin opens a person-leading card (portrait, name, role, list of picks). `MapPin variant="person"` = avatar/initials, not category glyph.

**Fits** the “different tool” read: the map is a directory of people in the city.

**Cost / blockers in this codebase:**

- `basedIn` is free text (`"Prenzlauer Berg / Neukölln"`), not geo. There is no neighbourhood centroid table. Pins cannot be placed from current data without a new geocoding pass or a new field.
- Thin records (Maike, Alessandra Botts, Benson, …) have no `basedIn`, no portrait, no picks — nowhere honest to put a pin. Omitting them makes the map a subset of published, well-filled people; including them requires inventing a location.
- A person with many picks is one pin. The map then answers “where is this person based?”, which is not the editorial product (the letter is about *places they love*). Centroid-of-picks is a synthetic location that is not in the CMS.
- Duplicate of clustering, which is already an open item on the destinations map at 91-place scale.

## Approach B — Filtered view of the destinations map

Same `neighbourhood-places` pins and the same `NeighbourhoodGuideMap`. `/you-me-and-berlin` adds a person-first chrome: people index (already built) plus a map that, with `?person=[slug]`, shows only that person’s `picks`. Info card leads with the person and lists picks underneath. Unfiltered people-map state could show every endorsed place (places that appear in some `picks`), still category-located, with person chips as the primary affordance rather than category legend. `MapPin variant="person"` would reskin the **place** pin (portrait of the endorser) rather than move the coordinate.

**Fits** the data model: the join already is “person → places.” No new geo. Zero-pick people simply don’t affect the map (listing card still exists; map section hidden or “coming soon”). Schloss Charlottenburg with two endorsers stays one pin with two chips, or (in person-filter mode) appears once per selected person.

**Risk:** it can still *read* as `/nachbarschaft` with a person dropdown unless the chrome is aggressively person-first (portrait markers, person card, no category legend, different accent/copy). Shared plumbing makes “feels like a different tool” a visual/IA problem, not an architecture problem.

## Recommendation

**Approach B, with a person-first reskin — not a second coordinate space.**

Reasons that are facts in this repo, not taste:

1. The join is place-located. People do not have coordinates.
2. Seed people are too thin to pin as a population.
3. `/you-me-and-berlin` already has the person grid; what’s missing is “see what they recommend,” which is a filtered place set.
4. Part B §2’s `MapPin variant="person"` then means: same accessibility contract (`aria-label`, focus-visible label, touch two-tap), different skin (avatar/initials at the **pick’s** lat/long). Variants stay one component. Destinations map keeps `variant="category"`.
5. Person detail (`/you-me-and-berlin/[slug]`) is the right home for a small embedded map of *that* person’s picks — one person, their places — without forcing the listing page to invent a people-location geography.

What this is **not**: a query-param filter bolted onto `/nachbarschaft`. The people listing keeps its own route, its own legend/card, and its own empty/thin states. It may import `NeighbourhoodGuideMap` the same way `HomepageMapTeaser` and `NeighbourhoodFullMap` already do.

**Do not silently resolve:** if the hotel team actually wants “where our 500 personalities live on a Berlin map,” that is Approach A and it needs a `basedIn` geo field (or neighbourhood centroid list) plus a rule for people with no location. That requirement is not in the briefs today; `basedIn` is a text line on the profile, not a map key.

---

## Suggested next build order (after this report is signed off)

1. Agree Approach B (or A) in writing — blocks §2 visual split and §3 mobile for the people view.
2. Wire or drop `TeaserPlaceIndex` (addendum §4–5) and kill picsum on the teaser — leftover from the last map pass, independent of the people split.
3. Consent gate — still blocked on CMP model; don’t pretend the DoD checkbox closed it.
4. Editorial how-to (Part B §4) once geocode-hook behavior is accepted as the hotel-team path.
5. Real detail layouts (Part B §5) + empty-field fallbacks (Part B §6). Draft-person 404 vs noindex needs an explicit call: listing already hides drafts; the stub currently does not.
