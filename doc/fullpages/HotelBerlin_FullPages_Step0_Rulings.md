# Full Pages — Step 0 rulings

*For Cursor · 20 September 2026 · answers the Step 0 report on `claude/HotelBerlin_FullPages_BuildBrief.md`*
*Addendum: supersedes only the sections named below.*

---

## Go

Build **§1 shared primitives → Part A**, one PR each. Then Part C. Part B stays last and uses fixtures only.

**Before the first PR:** copy `claude/HotelBerlin_Amenities_BuildBrief.md` and this file into `doc/amenities/` and `doc/fullpages/`, so the briefs live next to the code.

---

## R1 — Row behaviour (supersedes §1.1 numbers, settles O-F5)

**The `EventsRow` breakpoints win:** container width `< 520` → 1 · `≥ 520` → 2 · `≥ 760` → 3 · `≥ 920` → 4, **max 4**. Same gaps as today.

Two changes in how it's built, with no visual change:

1. **CSS instead of JS.** Rebuild the column logic as **CSS container queries** on the row wrapper, using the same four thresholds. Extras are hidden with `:nth-child`, not sliced out of the DOM. The server renders up to `max` items, so there's no ResizeObserver, no hydration jump, and the markup stays complete. "Never more columns than items" is handled with a `data-count` attribute (`[data-count="2"]` caps at 2, and so on).
2. **A `minCols` prop.** Events keep `minCols={1}`: the tall 5:6 cards stay one column below 520, as signed off. **Amenities use `minCols={2}`**: the hub cards are short (icon block + three lines), so two fit side by side at 390 px, which is what Bernard asked for.

Extract this as `CappedRow` and move `EventsRow` onto it.

**Guard:** the homepage and `/hier` events rows are signed off. Attach before/after screenshots at 390 / 600 / 800 / 1000 / 1425 px. They must be pixel-identical apart from the removed JS.

---

## R2 — Amenities schema (supersedes the Part A field assumptions)

Add to `amenities`, with DE + EN help text:

| Field | Type | Note |
|---|---|---|
| `kind` | select `facility` \| `service`, required, default `facility` | Migration: the existing 8 rows → `facility` |
| `summary` | textarea, localized, max 90 | One line. It is the hub fallback and the list sub-line. Migrate the current sub-line copy into it. |
| `details` | richText, localized | Open-row body only |
| `access` | text, localized, max 80 | e.g. „Mit der Zimmerkarte" / „Anmeldung an der Rezeption". It appears in the open row's facts. |
| `schemaType` | select `none` \| `ExerciseGym` \| `SportsActivityLocation` \| `ParkingFacility`, default `none` | Admin help: „Nur ändern, wenn du weißt, was es bedeutet." |

- **`notice` is not a field.** It's derived from `specialHours` by the hours formatter. Don't add it.
- **`factLabels`: no** (O-F1 agreed).
- **Keep `includeInSchema`**, the field you already built. JSON-LD emits a node only when the amenity is live, not pending, and `includeInSchema` is on.
- Resolver: `getAmenities({ context: 'hub' | 'list', locale })`. It may wrap `getPublishedAmenities()`, but callers use the new name. `hub` = facilities with `showInHub`, max 6. `list` = everything visible, grouped by `kind`.

## R3 — Check-in / check-out (settles O-F1)

These stay facts in the hotel global, not amenity rows. On `/ausstattung`, render **one facts line from the hotel global at the top of the Services group**: `Check-in ab 15:00 · Check-out bis 12:00`, same type as a row's fact columns, not openable. No duplicate data.

## R4 — The "Was heute läuft" duplicate (Step 0e, fix in Part C)

Your finding: it isn't mounted twice. The CTA wraps under the heading as a large `SweepCta`, and its label repeats the nav item. Fix it, but **first check whether the screenshot shows something the markup doesn't**. Both full-page captures show the heading text itself doubled, one line apart, even at desktop width. Check:

- whether `SweepCta` or `HubSerifHeading` renders a second text layer (swipe mask, reveal animation, an `aria-hidden` copy) that a full-page capture can freeze mid-transition
- a real browser at 1425 and 390, scrolled normally, and a Playwright full-page capture at both widths

Report what you find. Then:

- **Rename the CTA** so it no longer restates the nav: `Alle Termine →` / `Full programme →`.
- Keep the section's CTA **style** as it is (signed off). Only if the wrap persists below 760, let the CTA drop to its own line in the smaller `hub-section-link` underline style at that width.

## R5 — Art data (feeds Part B; no build yet)

The `artworks` collection is built for **FKKB editions for sale** (edition number, sale `status`), not for murals on the walls. Don't bend it silently.

- **`locationInBuilding` → the floor + spot group** (§B.1). With 0 records this is a free migration.
- **Use the existing localized `description` as the story.** Don't add a `story` field.
- **Keep the sale `status`** (available / sold / not-for-sale). Add a separate **`visibility`: `live` \| `hidden`** for publishing, and **`artworkType`: `mural` \| `edition` \| `installation`**. The grid on `/hier/art` shows `live` works of every type, murals first by drag order. Editions for sale are a question for the FKKB frontend later.
- **`artists.person`**: an optional relationship → `people`. That's the join for O-F3. An artist links out only when this is set and the person has a public page.
- Make `artworks` orderable.

Do this as the first step of Part B, not now.

---

## Still open (unchanged)

O-F2 `/on-the-walls` · O-F3 dedicated artist pages (beyond the `person` join) · O-F4 events archive route.
