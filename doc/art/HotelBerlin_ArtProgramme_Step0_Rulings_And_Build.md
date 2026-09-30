# Kunst im Haus: Step 0 rulings and build

*For Cursor · 30 September 2026*
*Amends `claude/HotelBerlin_ArtProgramme_BuildBrief.md` with the Step 0 answers folded in. Designs: `doc/art/HotelBerlin_ArtSection_States.html` (the `/hier` section, seven states) and `doc/art/HotelBerlin_ArtPages_Comp.html` (index and work page).*
*Supersedes `claude/HotelBerlin_FullPages_BuildBrief.md` §B.3 (open-in-place panels) and §B.5 (the `@id` anchors).*

---

## What Step 0 established

- **The database is empty**: 0 artworks, 0 artists, 0 exhibitions. Everything visible today is fixtures. **The schema can change freely; there is nothing to migrate.**
- `exhibitions` exists with a **hand-set** `status` and both a `location` text and a `venue` relationship.
- **The `/hier` mosaic is hardcoded** — a fixed exhibition title fallback and the literal mural keys `somari`, `deerbln`, `pisa73`. It is not a query and would never have updated itself.
- **The agenda knows only FKKB**, through `getCurrentExhibitionForVenue`.
- `artists` has no `sameAs` and no `wikidataId`.
- **There is only one gallery venue** (FKKB, id 2). The photo gallery does not exist as a venue.
- Artwork fields already cover floor, spot, `medium`, `dimensions`, `year`, `description`. Missing: context and detail images, and a pin.

---

## Rulings

### R1. No duplicate fields. `medium` **is** the technique; `description` **is** the story.

Do not add `technique` or `story`. Label `medium` as *Technik / Technique* in the admin and on the page, and `description` is the paragraph shown in the panel and on the work page. Two fields for one thought is how a CMS starts lying to itself.

### R2. `exhibitions.status` becomes derived, with one honest exception.

Replace the hand-set select with:

```
runType   select: 'dated' | 'permanent'   (required, default 'dated')
startDate date   (required)
endDate   date   (required when runType = 'dated'; hidden when permanent)
```

`status` becomes a **computed value**, never stored and never editable: `upcoming` before `startDate`, `current` between the dates, `past` after `endDate`, all in Berlin time. A `permanent` run is always `current` and shows the chip `Dauerhaft` rather than a closing date.

**A permanent installation never outranks a dated show** for the lead tile. Dated current shows first, ending soonest; permanent after.

### R3. `exhibitions.location` (the text field) is removed. The venue relationship is the only source.

The floor and room come from the venue record. Two places to write where something is, is the same mistake as R1.

### R4. The photo gallery needs a venue record, and I'm not inventing its name.

Create it as an `ArtGallery` venue with the name, floor and room **Bernard gives you**. Until then, leave `exhibitions.venue` pointing only at FKKB and don't seed a placeholder gallery. Nothing in the code may assume there are exactly two galleries, or that FKKB is special — **every query is "all gallery venues"**, never `getCurrentExhibitionForVenue('fkkb')`.

### R5. `artists` gains identity fields.

```
wikidataId  text, optional
sameAs      array of url, optional
```

`admin.description`, both languages: *Only identifiers the artist publishes themselves. Never guess a Q-number, and never use an entry for someone with the same name.*

### R6. `artworks` gains exactly three fields.

```
contextImage   upload, optional   — the step-back shot showing where it hangs
detailImages   array of uploads, optional
pinned         boolean, default false, with drag order among pinned
```

The exhibition link stays **one-way**: `exhibitions.artworks` is the join, and a work page finds its show by querying which exhibition contains it. No `artworks.exhibition` field, or the two will disagree.

### R7. One URL per work. The panels go.

New route `/hier/art/[slug]` (DE and EN entries in `pathnames.ts`). Grid tiles become `<Link>`s. **Delete** the panel markup, the `order`-shuffling code, `useHashOpen` on this page and the `#werk-` hrefs in the mosaic. `generateStaticParams` over live works, `dynamicParams = true`, `notFound()` for hidden or unknown slugs — the pattern F3 settled.

### R8. The `@id` moves with it.

`VisualArtwork` `@id` becomes `{canonical}/hier/art/{slug}`, not an anchor on the index. The index emits a `CollectionPage` with an `ItemList` of **`@id` references**, not a second copy of every work. One declaration per entity, at its own URL.

Add the work pages to the sitemap.

---

## Build, three PRs

### A1 — Schema and data layer

- The field changes in R1–R6, as **one migration**. The database is empty, so no backfill.
- `getExhibitionStatus(exhibition, now)` in `src/lib/art/status.ts`, Berlin time, unit-tested at the boundaries: the closing day itself, the day after, the opening day, the day before, and a permanent run.
- `getCurrentExhibitions()` — **all** gallery venues, sorted by `endDate` ascending, permanent last. Replaces `getCurrentExhibitionForVenue`. Report every call site you change.
- `getUpcomingExhibitions(withinDays = 30)`.
- `getWorks({ floorGroup?, artist?, exhibition?, limit? })`, ranked pinned first, then newest, excluding works without an image.
- `getArtists()` with a work count each, name-sorted.
- Delete `MURALS`, `MURAL_SPANS` and the hardcoded tile list in `getArtWall.ts`.

### A2 — The two pages (`doc/art/HotelBerlin_ArtPages_Comp.html`)

**Index `/hier/art`:**

- Head: `h1`, the intro line, and the **computed count** („21 Werke im Haus") on the right.
- Exhibitions band above the grid: one card per current show, closing soonest first, chip `Jetzt · bis {Datum}` or `Dauerhaft`, plus the venue name. **Absent entirely when nothing is running** — the grid moves up, and no "no current exhibition" line is ever printed.
- Floor filter chips, client-side, plus `Ausstellung` for works belonging to a show. Without JS the grid shows everything.
- The grid as built: 4/3/2 columns, 4 px gap, 4:5 tiles, caption always visible. **Tiles are links now.**
- **New: the artist list** below the grid, in four columns, each name with its work count, linking to the filtered grid (or to the person page where `artists.person` is set).
- Onward block, as the comp.

**Work page `/hier/art/[slug]`:**

| Block | Source | When absent |
|---|---|---|
| Breadcrumb | Hier / Kunst im Haus / {Etage} / {Titel oder Künstler} | always |
| Main photo, 4:3 or 3:4 by the image's own orientation, oversized top-left corner | record | never published without one |
| `h1` | `title`, **or the artist's name when untitled** | — |
| `von {Artist} →` | artist, linked to the person page when one exists, otherwise plain text | omitted when the h1 is already the artist |
| Story | `description` | omitted, layout closes up |
| **Floor locator** | **computed** from the floor: eleven bars, Keller at the bottom, this floor in teal, with `{Etage}` and the spot beside it | never — every work has a floor |
| Facts `dl` | `year`, `medium`, `dimensions` | rows drop individually; empty list renders nothing |
| Detail images, 3 squares | `detailImages` + `contextImage` | omitted |
| Exhibition band | the show containing this work | absent for murals |
| „Weitere Werke von {Artist}" | edge, exactly 3 or absent | absent when the artist has one work |
| „Mehr auf der {n}. Etage" | computed, same floor group, widens to the whole house before hiding | absent |
| Onward | `SweepCta` → `/hier/art` | always |

**The exhibition band keeps the work's history:** while the show runs it reads `Teil von „…" · noch bis {Datum}`; afterwards `war Teil von „…" · {Monat Jahr}`. It does not disappear when the show closes.

Untitled works: **no „Ohne Titel" in the `h1` and no `name` key in the JSON-LD.** The grid caption may still show it as the visible placeholder the copy already defines.

### A3 — The `/hier` section and the agenda (`doc/art/HotelBerlin_ArtSection_States.html`)

- Rebuild `ArtWallSection` from the live queries, following the seven states in the comp. Two current shows is the normal state: **two equal wide tiles**, closing soonest on top, then works, then `Alle Werke`.
- Ranking, filling in this order: current shows (soonest first, permanent last) → an upcoming show within 30 days, outlined chip `Ab {Datum}` → works, pinned then newest, **no two from the same floor group** while others remain → `Alle Werke` last, whenever at least one work exists.
- Fewer candidates: fewer tiles, no padding, no skeletons. **No works with images and no shows: the section does not render on `/hier` at all.**
- **Agenda:** replace the FKKB-only path with `getCurrentExhibitions()`. Every running show appears as an all-day row for each day of its run, `ganztags · bis {Datum}`, under the art filter, linking to the exhibition. A permanent run does **not** flood the agenda: it appears once in the art filter, not daily.
- Vernissages stay ordinary `events` with a date, linked to their exhibition.
- Wire `artworks` and `exhibitions` into the revalidation hooks, so a newly published work or show appears without a rebuild.

---

## Definition of done

- [ ] One migration; no `technique`, no `story`, no `artworks.exhibition`, no `exhibitions.location`
- [ ] `status` cannot be set by hand anywhere in the admin; date tests pass at every boundary, including permanent
- [ ] No code path names FKKB; every gallery query is venue-type based
- [ ] `/hier/art/[slug]` live, SSG with `dynamicParams = true`, hidden and unknown slugs 404
- [ ] Tiles link; the panel code, the `order` shuffle and the `#werk-` hrefs are **deleted**, not left unused
- [ ] `VisualArtwork` `@id` is the work page URL; the index emits `CollectionPage` + `ItemList` of `@id` refs only; work pages are in the sitemap
- [ ] `artists.wikidataId` and `sameAs` exist with the "never guess" description in both languages
- [ ] The floor locator renders for every work, Keller at the bottom, one bar per level
- [ ] An untitled work shows the artist as `h1` and emits no `name`
- [ ] The exhibition band reads „war Teil von" after a show closes
- [ ] The `/hier` section matches all seven states in the comp; with nothing to show it does not render
- [ ] Every current show, from any gallery, reaches the agenda; a permanent run appears once, not daily
- [ ] A work published in the admin appears on `/hier`, on the index and at its own URL without a rebuild
- [ ] DE and EN throughout; axe clean on both pages; `tsc` clean; `test:int` green

## Open items

1. **The photo gallery's name, floor and room** — Bernard. Nothing is seeded until then (R4).
2. **Artist pages** (O-F3) stay open: a name links only when `artists.person` is set.
3. `/on-the-walls` (O-F2) stays open; the canonical for a work is its `/hier/art/{slug}` page either way.
