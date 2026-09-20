# Hotel Berlin, Berlin — Full Pages: Amenities List, Events Agenda, Art Grid

*For Cursor · 20 September 2026*
*Visual guide: `claude/HotelBerlin_FullPages_PatternComp.html` (in the repo as `doc/fullpages/HotelBerlin_FullPages_PatternComp.html`)*
*Builds on: `claude/HotelBerlin_Amenities_BuildBrief.md` (**this brief supersedes its §5.1 and §5.2**), `claude/HotelBerlin_Events_BuildBrief.md`, `claude/HotelBerlin_EntityPages_BuildBrief.md`, `claude/HotelBerlin_HubCards_BuildBrief.md`*

---

## Kick-off prompt

```
Implement claude/HotelBerlin_FullPages_BuildBrief.md, using
doc/fullpages/HotelBerlin_FullPages_PatternComp.html as the visual guide.

Step 0 — report before writing code (no changes):
  a. Which items of the Amenities_BuildBrief definition of done are done?
     Part A assumes the `amenities` collection and getAmenities() exist.
  b. EventsRow: how does it decide its column count and breakpoints today?
  c. getEventOccurrences(): signature, window, how always-on and
     exhibitions are returned.
  d. artworks / artists / exhibitions: field lists and record counts.
     Does artworks have locationInBuilding? Does any artist have a
     public page (via people)?
  e. Why does "Was heute läuft" and its "Was ist los →" link render
     twice on /de/hier? (Visible in the 20 Sept screenshot.)

Then build in this order, one PR per part:
  Shared primitives (§1) → Part A amenities → Part C events → Part B art.
Art goes last because its data (artworks, photos) comes from the hotel
visit. Build Part B against fixtures if artworks is still empty; do not
invent records.
```

### How to read the comp

- It's a **guide, not a spec for CSS.** Take colours, type and spacing from `tokens.json` / `DESIGN.md` and the existing components, not from the comp's stylesheet.
- The desktop artboards are drawn at 1425 px. A value written as `calc(20 * var(--px))` in the comp means 20 CSS px at the 1425 layout.
- **Newsreader in the comp stands in for Laica A.** Use the site's Laica A.
- **All copy and facts in the comp are placeholders.** The Pisa73 text, year and size are invented. Never seed anything from the comp.

---

## 1. Shared primitives

### 1.1 `CappedRow` — "as many as fit"

The Im Haus row on `/hier` must behave like the events row: **minimum 2 on mobile, more as width allows, never a partial row.**

- If Step 0(b) shows `EventsRow` already does this by breakpoint, **reuse it**. Don't write a second grid.
- If `EventsRow` sets columns from the card count (the Events brief notes it does), extract a shared `CappedRow`:
  - The server renders up to `max` items (default 6).
  - CSS sets columns per breakpoint and hides the overflow with `:nth-child(n + {cols+1}) { display: none }`. No JS, no layout shift.
  - Breakpoints: `< 560` → 2 · `560–899` → 3 · `900–1199` → 4 · `≥ 1200` → 5. If `EventsRow` has different breakpoints, **use those instead** so both rows line up.
  - Fewer items than columns → the row uses fewer columns rather than leaving empty cells (`grid-template-columns: repeat(min(cols, count), 1fr)` via a CSS var).
- Move `EventsRow` onto `CappedRow` in the same PR, so the two can never drift apart.

### 1.2 `useHashOpen` — deep links into lists

Used by the amenity rows and the art grid.

- **On load:** if `location.hash` matches an item id, open it, scroll it into view with an offset equal to the sticky nav height (use the existing nav height var), and move focus to its summary or button.
- **On open:** `history.replaceState(null, '', '#' + id)`. **On close:** `replaceState` without the hash. Use `replaceState`, not `pushState`, so the back button leaves the page instead of stepping through rows.
- **On `hashchange`:** open the matching item. This handles clicking `#sauna` from elsewhere on the same page.
- **Ids are the item's `slug`**, prefixed to avoid clashes with other ids on the page: `id="sauna"` on the amenity list, `id="werk-{slug}"` on the art grid. The slug is locked after creation (Amenities brief §2), so anchors survive renames.
- **Unknown hash** (a deleted or hidden item): do nothing. The page loads at the top. No toast, no error.

### 1.3 The content-always-in-HTML rule

Collapsed content must be in the server-rendered HTML. Crawlers, screen readers and people without JavaScript have to get all of it.

- Amenity rows: native `<details>`/`<summary>`. The browser handles open and close.
- Art panels: rendered in the DOM with `hidden="until-found"`, so the text is in the HTML and find-in-page works. The `beforematch` event opens the panel.

---

## Part A — Amenities

*Supersedes Amenities_BuildBrief §5.1 and §5.2. §2 schema, §3 special hours, §4 resolver, §5.3 JSON-LD, §6 seed and §7 tags still apply, with the additions below.*

### A.1 `/hier` — Im Haus row

Comp section 1.

- `getAmenities({ context: 'hub' })`, max 6, in `CappedRow`. **Order = drag order in Payload**; there is no separate importance field (decision 20 Sept).
- **Heading gets its link:** `Im Haus` + `Alle Ausstattung →` / `All amenities →` → `/ausstattung` · `/amenities`. This supersedes Amenities decision A5's "unlinked heading" and brings the section in line with the heading rule.
- **Every card is a link** to `/ausstattung#{slug}`, pending cards included. This supersedes the HubCards "inert card" rule: every card now has a destination. Whole-card link, no CTA text.
- Card body on the hub: eyebrow (location) · title · **one line**: `when` + `price` joined with ` · ` (e.g. `Mo–So 13–23 · 5 € / 30 Min.`), falling back to `summary` when neither exists. The full spec grid moves to the list page. The row stays short and even.
- Icon block, pending hatch and the `notice` line stay as specified in the Amenities brief.

### A.2 `/ausstattung` · `/amenities` — the list

Comp section 2.

```
h1  Ausstattung & Services
intro (i18n, Bernard writes)

── IM HAUS · {count} ─────────────────────────────
[row] icon │ name / LOCATION │ WANN value │ PREIS value │ Mehr zu … → │ ⌄
  └ open: photo 3:2 │ text + notice │ facts dl + "Dazu in den FAQs"
…
[pending row] hatched, not openable, "Wartet auf Inhalte vom Hotel-Team…"

── SERVICES · {count} ────────────────────────────
[row] … same, no photo column when there is no image
```

- **Component `AmenityListRow`** — `<details id={slug} class="…">`, `<summary>` holding the grid.
- **Columns (≥ 900):** icon 40 · name + location · fact 1 · fact 2 · page link (only when `link.type !== 'none'`) · chevron.
- **Fact labels:** `Wann`/`When` and `Preis`/`Price` by default. Services may override the labels per record; add `factLabels` to the collection only if Step 0 shows it's needed for check-in/out. Otherwise render check-in/out as `Wann: ab 15:00 · bis 12:00`.
- **Open state:** three-column body: photo (only if `image`) · `details` rich text + `notice` · a facts `dl` (location, access, any `hours.note`) + related FAQs as links to `/faq#{faq-slug}` (or the guest FAQ page, whichever the FAQ belongs to).
- **Open-row accent:** a 3 px inset left bar in `--amber-deep` and a warm background. This is the only colour change.
- **Pending rows:** not a `<details>`, not focusable, the hatch from the hub card, the `summary` text across the fact columns. Still gets its `id`, so a hub link to it lands on it.
- **Grouping:** `kind === 'facility'` under *Im Haus*, `service` under *Services*. The count comes from the query, never hardcoded.
- **Mobile (< 700):** the summary is icon · name + location · first fact · chevron. The second fact and the page link move into the open body. The open body stacks as photo → text → facts.
- **Arrival from the hub:** `useHashOpen` opens the row. With JS off, `<details>` stays closed but its content is in the HTML (§1.3).
- Keep the scaffold's related links (accessibility, fees, contact, rooms, guest FAQ) at the bottom.

### A.3 JSON-LD per amenity

Extends Amenities brief §5.3.

- Each live amenity gets a node with `@id: {canonical}/ausstattung#{slug}` and `name`, `description` (summary). Set `image` only if a real photo exists.
- Add an optional collection field **`schemaType`** (select, admin-only help text): `ExerciseGym` · `SportsActivityLocation` · `ParkingFacility` · `none` (default).
  - Set → emit as that type, linked from the Hotel node via `containsPlace`.
  - `none` → a `LocationFeatureSpecification { name, value: true }` in `amenityFeature`.
- **`openingHoursSpecification` only for `hours.mode` `always` or `schedule`.** Never for `onRequest` or `unknown`. Special hours are not emitted in v1.
- Pending amenities: no node.
- Builder in `src/lib/aeo-schema`, with tests: each `schemaType`, each hours mode, pending excluded, stable `@id`.

---

## Part C — Events agenda

Comp section 3. Applies to **`/happenings`** (outside, amber) and **`/hier/events`** (inside, teal): the same components with the existing `framing` prop.

### C.1 Page structure

```
h1  Was ist los / What's on
intro (i18n)

[featured]  up to 3 SpotlightCards in CappedRow (max 3)
[filters]   Alle · Musik · Sport · Kunst · Community   (chips = links)
[agenda]    grouped by Berlin calendar day, next 30 days
[footer]    Vergangene Veranstaltungen → (only if the archive route exists, C.4)
```

- **Featured cards:** same fill order as the hub strip (Events brief §6): live now → dated today → dated this week → always-on. Use **`SpotlightCard` unchanged**, at its own ratio. The comp's 5:4 is illustrative. Featured items are **not repeated** in the agenda for the same day.
- **Agenda row** — `<a>` to `/happenings/{slug}` (both contexts; `/here/events/[slug]` must not exist, per the Entity brief):
  - ≥ 900: `time` (mono) · category chip (existing category colour tokens) · title · venue short + floor · price/entry · `Details`.
  - < 700: two lines: `time · title` / `venue · price`, with the chip before the title.
  - A recurring event shows one row per occurrence in the window. The link always goes to the event's one evergreen page (Entity brief open item 4).
- **Day headers:** `Heute` / `Morgen` / weekday name, plus `dd.m.` (Berlin time, `venue-time` helpers). Empty days are skipped, never rendered empty.
- **Always-on items and running exhibitions** appear **once**, under *Heute*, with the time column reading `ganztags` / `all day` and the price column reading `bis 30.9.` (end date). They are **not** repeated on every day.
- **Filters:** server-rendered links `?kategorie=musik` (DE) / `?category=music` (EN). Filtered views carry `<link rel="canonical">` to the unfiltered page. An empty filtered result shows one line, `Keine Termine in den nächsten 30 Tagen.`, plus a link back to *Alle*.
- **Empty agenda overall:** no featured row, a short line, and a link to the always-on amenities (`/ausstattung`). Never a blank page.

### C.2 Where it replaces what

- `/happenings/page.tsx`: the current `SpotlightCard` grid becomes featured cards + agenda.
- `/hier/events/page.tsx`: same, with `framing="guest"`. Remove any remaining hardcoded fact groups or "In Arbeit" kicker (Events brief §5).

### C.3 Fix while in there

- The duplicate **"Was heute läuft" heading and "Was ist los →" link on `/hier`** (Step 0e). Find the cause, report it, fix it in this PR.

### C.4 Archive

**Open item, not built here.** Past event pages stay live at 200 (Entity brief). Whether a past-events list page exists (`/happenings/archiv`?) needs a decision. Until then, the footer link doesn't render.

---

## Part B — Art grid

Comp section 4. Route: **`/hier/art`** (guest context, teal). The outside `/on-the-walls` page is **open item O-F2**.

### B.1 Data needed first (Step 0d decides the scope)

- **`artworks.locationInBuilding`**, outstanding since August. Add as a group:
  - `floor`: select `B2 · B1 · EG · 1 … 10 · Dach`
  - `spot`: text, localized, max 40 (e.g. „bei den Aufzügen")
- **`artworks.images`**: at least one upload. Help text: *„Querformat und Hochformat willkommen; für die Übersicht wird 4:5 zugeschnitten – Fokuspunkt setzen."*
- **`artworks.story`** (richText, localized). Optional facts: `year`, `technique` (localized), `dimensions`.
- `artworks.status`: `live` · `hidden`, plus drag order (same `orderable` approach as amenities).
- **No invented records.** If `artworks` is empty, build against fixtures in `tests/fixtures/artworks.ts` and leave the page rendering its empty state (B.4).

### B.2 Grid

- 4 columns ≥ 900 · 3 at 700–899 · 2 below. Gap 4 px. No card chrome, no radius: the "hung wall" look from the hub.
- Tile: image at 4:5 `object-fit: cover` with the focal point. The caption is always visible, never on hover: location chip (`{floor} · {spot}`) + artist display name.
- **The current exhibition** (from `exhibitions`, status current) is always the **first tile**, with the teal date chip `Jetzt · bis {end}`. It links to the exhibition's page if one exists, otherwise it opens like any other tile.
- **Floor filter chips:** `Alle {n}` · `Lobby` · `1.–4. Etage` · `5.–10. Etage` · `Keller`. These are **client-side filters** (hash-free, no reload). The grid without JS shows everything.

### B.3 Opening a work in place

- Each tile is a `<button aria-expanded aria-controls="panel-{slug}">`, not a link.
- **The panel is in the DOM directly after its tile** (screen-reader order), with `hidden="until-found"`. Visually it has to appear **after the last tile of that row**:
  - On open, read the grid's column count from `getComputedStyle(grid).gridTemplateColumns`.
  - Assign CSS `order` so the tiles keep `index*2` and the open panel gets `(rowEndIndex*2)+1`. The panel spans `grid-column: 1 / -1`.
  - Recompute on resize and on filter change.
- **Only one panel open at a time.** Opening another closes the first. Escape closes and returns focus to the tile. Focus moves to the panel's heading on open.
- A small pointer notch under the open tile, plus a 4 px teal inset outline on it, as in the comp.
- **Panel content:** image (the uncropped aspect if the orientation allows) · location line (teal, uppercase) · title (or „Ohne Titel") · `von {Artist} →` · story · facts `dl` (year, technique, size: only those that exist) · `Weitere Werke von {Artist} →`, which filters the grid to that artist.
- **Artist link:** if the artist has a linked `people` record with a public page, link to it (`/you-me-and-berlin/{slug}`). **Otherwise the name is plain text, not a link.** Artist pages are **open item O-F3**; don't create an artist route here.
- `useHashOpen` with ids `werk-{slug}`. A hub mosaic tile links to `/hier/art#werk-{slug}`. Update `ArtWallSection` tiles to do so.

### B.4 States

- No artworks: one line, `Die Werke im Haus werden gerade fotografiert.` / `We're photographing the works in the building right now.`, plus the current exhibition tile if one exists.
- An artwork without an image: not shown in the grid at all (a wall of grey tiles helps nobody). Payload shows it in the *Needs attention* view (H.13).

### B.5 JSON-LD

`VisualArtwork` per live artwork, `@id: {canonical}/hier/art#werk-{slug}`, with `creator` → the artist's Person `@id` when it exists, `contentLocation` → the Hotel `@id`, and `locationCreated` not set. Tests alongside the other builders.

---

## i18n keys (new)

`amenities.list.{facilities,services,openRow,closeRow,morePrefix,faqHeading,pendingText}` · `hub.inHouse.allLink` · `events.agenda.{today,tomorrow,allDay,until,emptyWindow,emptyFilter,details,pastLink}` · `events.filters.*` · `art.grid.{all,lobby,floors1to4,floors5to10,basement,by,moreBy,untitled,close,emptyState,nowUntil}` — DE and EN both, no English in DE values.

---

## Open items — do not resolve silently

- **O-F1** Services with non-standard fact labels (check-in/out): is a `factLabels` field needed, or does the `Wann` fallback do? Decide after Step 0.
- **O-F2** `/on-the-walls` (outside, amber): render the same grid in amber, redirect it to `/hier/art`, or keep a separate outside page? Canonical has to be settled either way.
- **O-F3** Artist pages: a dedicated `/kunst/kuenstler/[slug]`, or always via the `people` record? Until decided, only artists with a people page get a link.
- **O-F4** Events archive route (C.4).
- **O-F5** `EventsRow` breakpoints vs the `CappedRow` numbers in §1.1: whichever exists wins. Report which.

---

## Definition of done

**Shared**
- [ ] `CappedRow` (or the reused `EventsRow`) drives both the events row and Im Haus; at 390 / 700 / 1000 / 1425 px both rows show the same number of columns
- [ ] `useHashOpen`: `/ausstattung#sauna` and `/hier/art#werk-x` arrive open, scrolled below the sticky nav, with focus inside; toggling updates the hash with `replaceState`; the back button leaves the page; an unknown hash does nothing

**Amenities**
- [ ] Hub shows 2 / 3 / 4 / 5 cards by width, in Payload drag order; the heading links to the list; every card links to its row
- [ ] The list renders facilities and services from the collection with correct counts; rows open in place; pending rows are hatched and not openable
- [ ] With JS disabled, all row content is present in the HTML
- [ ] Per-amenity JSON-LD with anchor `@id`s; pending excluded; no hours for `onRequest`/`unknown`; builder tests pass

**Events**
- [ ] `/happenings` and `/hier/events`: up to 3 featured cards, then the agenda by Berlin day for 30 days; featured items not repeated; always-on and exhibitions appear once, under *Heute*
- [ ] Rows link to `/happenings/{slug}` from both contexts
- [ ] Filters are server-rendered links with canonical to the unfiltered page; empty states as specified
- [ ] The duplicate heading on `/hier` is gone, and the cause is reported

**Art**
- [ ] `locationInBuilding`, `images`, `story`, `status` + order on `artworks`
- [ ] The grid renders 4 / 3 / 2 columns; the exhibition tile comes first; the floor filter works client-side
- [ ] The panel opens after the row's last tile at every width and re-flows on resize and filter; one open at a time; Escape and focus behave; `hidden="until-found"` in the HTML
- [ ] Artist link only where a people page exists
- [ ] Hub mosaic tiles link to `/hier/art#werk-{slug}`
- [ ] `VisualArtwork` JSON-LD with tests

**Everywhere**
- [ ] Both locales, no English in DE; axe clean on `/hier`, `/ausstattung`, `/happenings`, `/hier/events`, `/hier/art`; one `h1` per page; reduced motion respected on panel open (no animated height)
- [ ] No placeholder or comp copy seeded; no stand-in photos

## Do not

- Do not copy the comp's CSS; use tokens and existing components.
- Do not restyle `SpotlightCard`, `AmenityCard` (beyond the one-line body and link) or the hub art wall.
- Do not add modals or new routes for single amenities or single artworks.
- Do not use `pushState` for opening rows.
- Do not create `/here/events/[slug]` or an artist route.
