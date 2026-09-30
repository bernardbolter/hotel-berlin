# Hotel Berlin, Berlin — Entity Pages Build Brief

*For Cursor · 16 September 2026*
*Covers: `/nachbarschaft/[slug]`, `/you-me-and-berlin/[slug]`, `/happenings/[slug]`*
*Design record: `claude/HotelBerlin_EntityPages_Comp.html` — three page types, thin/full toggle, provenance overlay*
*Supersedes: the "stub `[slug]/page.tsx` with JSON-LD wired up, layout TBC" scope note in `HotelBerlin_NachbarschaftYouMeBerlin_BuildBrief.md`. That layout is now specified. Nothing else in that brief changes.*

---

## Context

Two of these three pages already exist as the deliberate stubs the Nachbarschaft brief called for: `neighbourhood/[slug]/page.tsx` and `you-me-berlin/[slug]/page.tsx` both resolve from Payload, call `notFound()` on a miss, and emit `buildPlacePageGraph` / `buildPersonPageGraph`. This brief builds them out. **`/happenings/[slug]` does not exist** and is new work.

The constraint shaping every decision below: **the records are thin and will stay thin for a while.** 21 neighbourhood places with zero CMS images between them. 16 people, 6 published. 4 events. A detail page assembled from one record's fields would be three lines and a gap.

---

## The governing idea

A page built from a record's **fields** goes thin when the record does. A page built from the **edges around** the record does not, because the graph always has more than the node. And those edges are the same thing AEO wants.

Every block on these pages is one of three kinds. Tag them mentally as you build:

| Kind | Source | Thins? |
|---|---|---|
| **FIELD** | the record's own columns | yes — this is the only kind that can go empty |
| **EDGE** | a relation to another entity | no — and each one is a `review`, an `ItemList` item, or a `location` in the JSON-LD |
| **COMPUTED** | derived from geometry, dates or postcode | no — and it can never go stale, because nobody maintains it |

If a section you are building is FIELD-only and optional, it is a candidate for deletion, not for a placeholder.

### Five rules

1. **No grids.** A three-column grid with one cell filled reads as broken; a full-width band with one item in it reads as deliberate. Bands stack vertically and a band with one child is fine. The only grid on these pages is the borrowed-row at the bottom, which always has 3 items or does not render.
2. **Blocks come from edges, not fields.** Optional single fields (hours, price, website, floor size) collapse into **one** `<dl>`, never into separate cards. A `<dl>` with three rows looks complete. Three one-line cards look abandoned.
3. **The ballast slides up.** The map (place, person) and the schedule (event) have intrinsic height independent of content. When there is no hero image — which today is *always*, see §8 — the ballast becomes the first visual element rather than leaving an empty frame where a photo should be.
4. **Borrow, don't pad.** Everything below the facts comes from siblings: the same recommender's other places, the same district, the same week. Padding is invisible to a crawler; borrowing is an internal link.
5. **A short page is allowed.** Four bands ending in a confident onward CTA beats seven with three empty. The onward block is the floor and always renders.

---

## Section 1 — Routing

### 1.1 Pathnames

`/neighbourhood/[slug]` and `/you-me-berlin/[slug]` already exist in `src/i18n/pathnames.ts`. Add:

```ts
'/happenings/[slug]': { en: '/happenings/[slug]', de: '/happenings/[slug]' },
```

⚠️ `/happenings` is still commented as a placeholder in `pathnames.ts` — the German slug is not signed off. The detail route inherits that. **Do not resolve this** — add the entry alongside the existing placeholder comment so both move together when the client signs off.

### 1.2 `generateStaticParams`

None of the three slug routes has it; `rooms/[slug]` and `meetings/[slug]` both do. Add it to all three, following `rooms/[slug]/page.tsx:33-39` exactly.

- places: `status === 'active'`
- people: `status === 'published'` (6 today, not 16)
- events: all — **including past one-offs**, per the AEO-first principle that past event pages stay indexed

### 1.3 The broken default href

`resolvers.ts:220-225` defaults event card hrefs to `/here/events/${slug}`, and that route does not exist. Once `/happenings/[slug]` is live, fix the default at source: `prospect` framing → `/happenings/[slug]`, `guest` framing → `/hier/events#[slug]`. Remove the per-caller overwrites in `homepageSpotlight.ts:42,76`. Also fix `spotlightTeasers.ts`, which still points a fallback at `/here/gallery`.

---

## Section 2 — Data resolution

All resolvers take `locale` and pass it to Payload. `depth: 2` is required wherever endorsements or picks are involved — `buildPlacePageGraph` expects `endorsements[].person` to be a resolved object, and a wrong depth fails silently by emitting a graph with no reviewer rather than throwing.

### 2.1 Primary

```ts
// src/lib/payload/entities.ts
getResolvedPlace(slug: string, locale: Locale): Promise<ResolvedPlace | null>   // exists — lib/aeo/resolve.ts
getResolvedPerson(slug: string, locale: Locale): Promise<ResolvedPerson | null> // exists — must resolve the `picks` join
getEventBySlug(slug: string, locale: Locale): Promise<ResolvedEvent | null>     // NEW
```

`getEventBySlug` must return the raw record including `recurrenceRule`, not a single resolved occurrence — the page renders a schedule, not a date.

### 2.2 The borrow queries — new, and the reason the pages aren't thin

```ts
// src/lib/payload/borrow.ts
getPlacesByPerson(personId: string, excludeSlug: string, limit = 3): Promise<PlaceCardData[]>
getPlacesInDistrict(district: string, excludeSlug: string, limit = 3): Promise<PlaceCardData[]>
getPeopleSharingTags(personId: string, limit = 3): Promise<PersonCardData[]>
getEventsInWindow(excludeSlug: string, limit = 3): Promise<EventCardData[]>  // wraps getEventOccurrences
```

Each returns **exactly `limit` items or an empty array** — never one or two. A borrowed row is a design element with a fixed shape; a partial row is worse than no row. If a query cannot fill it, widen the net before giving up: person's other places → same district → same category anywhere. If still short, return `[]` and the band does not render.

`getEventsInWindow` calls the existing `getEventOccurrences({ from: now, to: +14d, includeAlwaysOn: true })`. Do not add a fifteenth event resolver path.

### 2.3 District — ⚠️ open

`neighbourhood-places` has no district field. It carries `address.addressLocality` (always `"Berlin"`) and `address.postalCode`. "Mehr in Schöneberg" has nothing to query on.

**Build against a derivation helper for now:**

```ts
// src/lib/places/district.ts
districtFromPostalCode(postalCode?: string | null): string | null
```

A Berlin postcode → Ortsteil lookup table, `null` when unknown, and the band does not render when null. This is a stopgap — the durable fix is a `district` select on the collection, which needs a decision (see Open items). Keep the helper's call sites to one so swapping it out is a one-line change.

---

## Section 3 — Shared shell

Three pages, one skeleton. Build the skeleton once.

```
Breadcrumb
EntityIdentity      — always renders. h1 + meta line + optional lead
Lead block          — the most human element: endorsement / quote / price+booking
Ballast             — EntityMap (place, person) | ScheduleList (event)
EntityFacts         — one <dl>, empty rows omitted
Borrowed band(s)    — 3-up or absent
OnwardBlock         — always renders
```

### 3.1 Component contracts

Build these four; reuse everything else.

```tsx
// src/components/entity/EntityIdentity.tsx
type EntityIdentityProps = {
  breadcrumb: { label: string; href: LocalHref }
  title: string
  meta: ReadonlyArray<string | { chip: string; token: CategoryToken }>
  lead?: string            // one paragraph, Laica, max 62ch — omitted when absent
  portrait?: MediaRef | null
  fallback?: 'quote' | 'dot'   // what to render instead of a portrait — see §5.2
}

// src/components/entity/EntityBand.tsx
type EntityBandProps = {
  heading?: string
  href?: LocalHref         // presence of href decides serif+link vs plain label
  label?: string           // uppercase divider variant, for self-contained sections
  children: React.ReactNode
}

// src/components/entity/EntityFacts.tsx
type EntityFactsProps = {
  rows: ReadonlyArray<{ term: string; value: React.ReactNode } | null | false>
}
// Falsy rows are filtered before render. A rows array that filters to empty
// renders NOTHING — not an empty <dl>, not a heading.

// src/components/entity/BorrowedRow.tsx
type BorrowedRowProps<T> = {
  items: ReadonlyArray<T>   // renders only at exactly 3
  render: (item: T) => React.ReactNode
}
```

### 3.2 Reuse, do not rebuild

| Need | Use | Not |
|---|---|---|
| Section heading + link | `SectionHeading` + `LineCta` | a third heading component; `HubSerifHeading` is hub-only |
| Primary CTA | `SweepCta` | a new button |
| Place card in a borrowed row | `PlaceCard` (`neighbourhood/`) | a new mini-card |
| Person card | `PersonCard` (`neighbourhood/`) | `PersonCard` (`here/`) — that one is dead, leave it alone in this PR |
| Map | `PlacesMapView` | a new map shell — §29 of the audit confirms it takes a caller-supplied `places` array |
| Body copy | `RichTextParagraphs` | raw `dangerouslySetInnerHTML` |
| Avatar with no portrait | `InitialsAvatar` | a generic silhouette |
| Editorial 1:2 photo/text band | **`EditorialBand`** (`primitives/EditorialBand.tsx:39`) | a bespoke layout |

**`EditorialBand` is currently built and mounted nowhere** — its only consumers are the unused `ArtInBuildingSection` and `BasementSection`. Use it for the person letter (§5.4). That retires an orphan rather than adding a second one.

### 3.3 Design tokens

Outside context → **amber** accent (`DESIGN.md` §1). Not teal. Ground `#FBFBFB`. Archivo for headings/labels/meta, Laica A for body and quotes — and **never `font-weight: 700` on Laica without `font-style: italic`**, there is no plain Bold cut and it silently falls back to Georgia. Category chips take their colour from the CMS category field via the category tokens, never per-page editorial choice.

---

## Section 4 — Place page

`src/app/[locale]/neighbourhood/[slug]/page.tsx`

| # | Block | Kind | Content | When absent |
|---|---|---|---|---|
| 1 | Identity | FIELD | h1 name; meta: category chip, district, walking time, indoor/outdoor | always renders |
| 2 | Lead — the endorsement | **EDGE** | portrait (or `InitialsAvatar`), pull-quote in the `DESIGN.md` pullquote treatment, name + role + "empfiehlt N Orte", `LineCta` to their profile | multiple endorsers → stack them, quote each; **zero endorsers → skip to §3** |
| 3 | Ballast — map | **COMPUTED** | full-bleed `PlacesMapView`, two pins (hotel + place) and a dashed route; caption line: walking time, distance, nearest U-Bahn | no `geo` → omit band entirely |
| 4 | Facts | FIELD | one `<dl>`: address, opening hours, website, indoor/outdoor, price range, audience chips | rows filter out individually |
| 5 | Authority | FIELD | "Auch verzeichnet als" + Wikidata / GooglePlaceID as inline code chips | omit when `authority.identifier` is empty |
| 6 | Borrowed A | **EDGE** | "{Person} empfiehlt außerdem" — `getPlacesByPerson` | absent |
| 7 | Borrowed B | **COMPUTED** | "Mehr in {district}" — `getPlacesInDistrict` | absent |
| 8 | Onward | — | `SweepCta` → `/nachbarschaft` | always renders |

The endorsement leads, not the description. That is the editorial call and it is also the structurally correct one: the quote is the only thing on the page that no other website has.

---

## Section 5 — Person page

`src/app/[locale]/you-me-berlin/[slug]/page.tsx`

| # | Block | Kind | Content | When absent |
|---|---|---|---|---|
| 1 | Identity | FIELD | portrait, h1, jobTitle, basedIn, room number ("Brief in Zimmer 412") | always renders; see 5.2 |
| 2 | Ballast — picks map | **EDGE** | `PlacesMapView` with `places = person.picks`, pins coloured by category, hotel pin included | no picks with geo → omit |
| 3 | Picks list | **EDGE** | numbered rows: name, category · district · walking time, the person's own quote for that place, link to the place page | omit |
| 4 | The letter | FIELD | `EditorialBand`, portrait left / `bio` richText right at 1:2 | omit |
| 5 | Links | FIELD | website, instagram | omit |
| 6 | Borrowed | **COMPUTED** | "Andere mit ähnlichem Blick" — `getPeopleSharingTags` | absent |
| 7 | Onward | — | `SweepCta` → `/you-me-and-berlin` | always renders |

### 5.2 The no-portrait state — required, not an edge case

Katja Morkel is published with `portrait_id = null` by deliberate seed (`ymb-portraits.ts:112-118`), because her only source image is unusable. **The page must work without a portrait at page scale, not just at 26px.**

When `portrait` is null: the `quote` field becomes the hero, set in Laica italic at 22–30px, `max-width: 20ch`, above a smaller h1. The category dot in a dashed ring (the existing 26px no-portrait state, scaled) sits in the meta line. **No placeholder image, no initial, no generic silhouette.** If `quote` is also empty, fall back to `InitialsAvatar` at 104px — do not invent a third state.

Do not emit an `image` key in the JSON-LD at all in this case. An absent key is correct; a placeholder URL is a lie.

---

## Section 6 — Event page — new

`src/app/[locale]/happenings/[slug]/page.tsx`

| # | Block | Kind | Content | When absent |
|---|---|---|---|---|
| 1 | Identity | FIELD | category chip, h1, venue + floor (`venue.spotlightLocation`) | always renders |
| 2 | Lead — price bar | FIELD | `price` + `priceCurrency`, or "kein Eintritt" when `isFree`, plus `bookingNote` | renders with whatever exists; never empty — `isFree` is an explicit editorial choice |
| 3 | Ballast — schedule | **COMPUTED** | "Jeden Donnerstag, 19:00" + next 6–8 dates from the RRULE | one-off → renders the single date and the past-state line (6.3) |
| 4 | Description | FIELD | `RichTextParagraphs` | omit |
| 5 | Venue | **EDGE** | what the venue is, floor, `LineCta` to the venue page; `<dl>`: address, organiser, duration | always renders — every event has a venue |
| 6 | Borrowed | **COMPUTED** | "Diese Woche im Haus" — `getEventsInWindow` | absent |
| 7 | Onward | — | `SweepCta` → `/hier` (guest hub) | always renders |

**No map on this page.** A map of a room inside this building is filler. The schedule is the ballast — always six to eight rows long, computed, and it doubles as `eventSchedule` in the JSON-LD.

### 6.2 Schedule expansion

```ts
// src/lib/events/schedule.ts
expandSchedule(event: ResolvedEvent, opts: { from: Date; count: number }): Occurrence[]
scheduleSummary(event: ResolvedEvent, locale: Locale): string | null  // "Jeden Donnerstag, 19:00"
```

Use the existing recurrence lib and `venue-time` helpers — Berlin time throughout, DST-correct. Reuse `isAlwaysOnDailyRecurring` to render `FREQ=DAILY` events as "Täglich 13–23 Uhr" rather than eight identical rows.

### 6.3 Past one-off events — ⚠️ open, build the default

Past event pages stay indexed to build entity authority. So a one-off whose date has passed needs a designed state, not a 404:

- Identity unchanged
- Schedule block becomes: **"Fand statt am Donnerstag, 13. August 2026"**, past tense, no CTA
- Price bar renders but is not a call to action
- The borrowed row becomes the primary path: "Was als Nächstes läuft"
- JSON-LD keeps `eventStatus: EventScheduled` with the real past `startDate` — **do not** mark it `EventCancelled`, it happened

Recurring events have no past state; the page is evergreen.

---

## Section 7 — JSON-LD

Use `aeo-schema` builders. Do not hand-write JSON-LD in page components. `buildPlacePageGraph` and `buildPersonPageGraph` exist and are already wired — extend rather than replace.

### 7.1 Place — extend the existing builder

Currently emits Place + Review(s) + breadcrumb. Add:

- `containedInPlace` → `{ "@type": "Place", "name": "<district>, Berlin" }` from the district helper
- `openingHoursSpecification` via the existing `toSchemaDays`
- `priceRange`, `url`, `audience` when present
- `identifier` / `sameAs` via the existing `buildAuthorityProps`
- `WebPage` node with `mainEntity` → the place `@id`

The `reviewRating` guard stays. No ratings, ever.

### 7.2 Person — extend

Currently emits Person + places/reviews. Add:

- `@type: ProfilePage` for the page node, not `WebPage`
- `knowsAbout` from `tags`
- `homeLocation` from `basedIn`
- `sameAs` from website + instagram
- `memberOf` → `{ Organization "You, Me & Berlin", parentOrganization: <hotel @id> }`
- picks as an `ItemList` of `@id` refs to the place nodes — **refs, not duplicated Place nodes.** The place page is the canonical declaration; two full declarations of one entity on two URLs works against parsing.

### 7.3 Event — new builder

```ts
// src/lib/aeo-schema/src/builders/event.ts
buildEventPageGraph(event: ResolvedEvent, config: SchemaConfig): Graph
```

The important part, and the reason this page is worth building at all:

```jsonc
"eventSchedule": {
  "@type": "Schedule",
  "repeatFrequency": "P1W",                      // from FREQ=WEEKLY
  "byDay": "https://schema.org/Thursday",        // from BYDAY=TH
  "startTime": "19:00",
  "scheduleTimezone": "Europe/Berlin"
}
```

Mapped from `recurrenceRule`, so one canonical URL stays true every week instead of dying on a stale `startDate`. Plus `location` (venue, `containedInPlace` → hotel `@id`), `organizer` → hotel, `offers` (`price`/`priceCurrency`, or `price: "0"` + `isAccessibleForFree: true` when `isFree`), `eventStatus`, `eventAttendanceMode: OfflineEventAttendanceMode`, `superEvent` → `EventSeries` when the event belongs to one.

Unit-test the RRULE → `Schedule` mapping the way the rest of `aeo-schema` is tested: `FREQ=WEEKLY;BYDAY=TH`, `FREQ=DAILY`, `FREQ=MONTHLY;BYDAY=4TH`, and a non-recurring event (which emits `startDate`/`endDate` and **no** `eventSchedule`).

### 7.4 Canonical and hreflang

Per the existing `generateMetadata` pattern on the other detail routes. Canonical is the entity's own URL. Both locale alternates always present.

---

## Section 8 — Images, and the state that is actually normal

**0 of 21 neighbourhood places have a CMS image**, and `/api/media/file/…` is currently 404ing across the board. The no-image path is not a fallback, it is the path.

- **Place and event cards:** a flat neutral block with the place name set in it — Archivo, `--dim` on `--bg-subtle`, category-token left border. Per the 8 Sept call: nobody mistakes a grey block for a mistake, but they do mistake a random landscape on the Holocaust Memorial card for one. Do **not** reintroduce `picsum`; `getHubTips.ts:79-80` already rejects it at card-build time and that rejection should apply here too.
- **Hero images:** there is no hero image slot on any of these three pages in this pass. Rule 3 stands — the ballast is the first visual element. Add a hero later as an addendum when real photography lands; nothing in this layout depends on it.
- **Portraits:** the five imported YMB portraits are test-site only until the hotel confirms web rights for the You, Me & Berlin images. Do not push to production.

---

## Section 9 — Accessibility

Build-time requirement, not an audit pass. EAA applies.

- One `<h1>` per page: the entity name. Bands are `<h2>`, cards within them `<h3>`. Never skip a level.
- `<dl>` for facts — real `<dt>`/`<dd>`, not divs.
- Map: `role="img"` with a descriptive `aria-label` when static; if interactive, pins are focusable with keyboard Enter and the container gets `role="application"` + label, matching `MapPin.tsx:142`.
- Every quote in a `<blockquote>` with a `<cite>`.
- Schedule is a real list. Dates get `<time datetime="">`.
- `prefers-reduced-motion` respected on any transition.
- Visible focus states throughout, per `DESIGN.md`.

---

## Open items — do not silently resolve

1. **District field.** Derive from postcode (specced above) or add a `district` select to `neighbourhood-places` and backfill 21 records? The helper is the stopgap; the field is the durable answer. **Needs a decision before the collection is touched.**
2. **Walking times.** `walkingMinutes` exists as a stored field. Computed from `geo` is maintenance-free and always right; stored survives a missing Mapbox token. Recommendation: compute at build time, write through to the field as a cache. Not implemented in this pass — use the stored field and flag any record where it is null.
3. **`/happenings` German slug** is unsigned-off, and `/happenings/[slug]` inherits it.
4. **One page per recurring event, or one per occurrence?** This brief assumes **one evergreen URL carrying a `Schedule`**. The alternative gives more indexable URLs and a graveyard of dead ones. Recommended, not signed off.
5. **10 people are `status: 'draft'`** and will 404. Intentional, or unfinished seed?
6. **Video.** `VideoEmbed` is already imported by `you-me-berlin/[slug]/page.tsx` and the `people` collection has a `video` field. No person record uses it yet. Left in place, unspecified here.

---

## Definition of done

- [ ] `/happenings/[slug]` route exists, both locales, with a pathnames entry carrying the placeholder comment
- [ ] `generateStaticParams` on all three slug routes; past events included
- [ ] No card anywhere links to `/here/events/[slug]`; `resolvers.ts` default fixed at source; `spotlightTeasers.ts` fallback no longer points at `/here/gallery`
- [ ] Borrow queries return exactly 3 or exactly 0 — never 1 or 2
- [ ] `EntityFacts` with all rows falsy renders nothing, not an empty `<dl>` and not a heading
- [ ] **Place page with 4 fields and one endorsement renders 6 bands** — screenshot it and check
- [ ] Katja Morkel's page renders the quote-as-hero state; no placeholder image; no `image` key in her JSON-LD
- [ ] Person page map renders `picks` only, via the `places` prop — `PlacesMapView` unchanged
- [ ] `EditorialBand` is mounted on a live page for the first time
- [ ] Event page renders the schedule, not a single date; a `FREQ=DAILY` event renders as an always-on line, not eight rows
- [ ] `buildEventPageGraph` emits `eventSchedule` from the RRULE; unit tests cover weekly, daily, monthly and non-recurring
- [ ] A past one-off renders the past state and returns 200, not 404
- [ ] Person JSON-LD references places by `@id`; no duplicated `Place` nodes
- [ ] No `reviewRating` in any rendered output — check the page source once as a sanity check
- [ ] Canonical + both hreflang alternates on all three routes
- [ ] No `picsum` URL reaches any of these pages
- [ ] One `h1` per page; no skipped heading levels; `<dl>` is a real `<dl>`
- [ ] Amber accent throughout — these are outside-context pages, not `/here`
- [ ] Both locales; Berlin time throughout
- [ ] Validate one page of each type in Google's Rich Results Test before merging

---

## Out of scope

- Hero photography and any layout that depends on it
- The `district` field migration (pending the decision above)
- Deleting the dead `here/PersonCard`, `StayInfoCard`, `VenueCompactCard` — a separate tidy
- Live rates, booking deep-links, `/book` — separate workstream, see `claude/HotelBerlin_BookingWidget_Audit.md`
- Anything depending on nested locale routes resolving. **Note:** as of this morning's audit `/de/nachbarschaft` and every other nested route 404s on the dev server. That has to be cleared before any of this can be verified in a browser. It is a separate fix and it blocks the QA steps above, not the code.
