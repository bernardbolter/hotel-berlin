# Hotel Berlin, Berlin — Map Section (Places ↔ People) Build Status v1
*Captured 2026-08-24, reported by Cursor against `hotel-berlin-de`. Reconciled against `HotelBerlin_HomepageMapTeaser_BuildBrief.md`, `HotelBerlin_NeighbourhoodMap_BuildBrief.md`, `HotelBerlin_NeighbourhoodTeaser_Addendum.md`, `HotelBerlin_NachbarschaftYouMeBerlin_BuildBrief.md`, and seed notes `HotelBerlin_Nachbarschaft_SeedData_v1.md`/`v2.md`. This is Part A of `HotelBerlin_MapSection_CursorPrompt_v1.md` — status audit only, no code changes in this pass. Cursor's own copy lives at `doc/map/HotelBerlin_MapSection_BuildStatus_v1.md` in the repo; this is that report folded into the project record.*

**Bottom line:** the destinations map is one shared Mapbox GL stack, live on the homepage, `/here`, and `/nachbarschaft`. Pin/card treatment is the later 9-category palette (addendum v2), **not** the six muted v4 tokens the Neighbourhood Map brief still claims are signed off and live. `/you-me-and-berlin` exists as a person grid with no map. Place and person `[slug]` pages are the plain stubs the Nachbarschaft brief asked for, plus extra fields. Several teaser pieces were written (`TeaserPlaceIndex`, consent adapter) and never mounted. There is no people-first map.

---

## Answers to the ten audit questions

1. **Map inventory.** One GL runtime: `NeighbourhoodGuideMap` + `MapPin` + `PlaceInfoCard`. Wrappers: `HomepageMapTeaser` (homepage + `/here`) and `NeighbourhoodFullMap` (`/nachbarschaft`). Dead leftovers in the repo: `NeighbourhoodMap.tsx`, `NeighbourhoodMapCanvas.tsx`. `TeaserPlaceIndex.tsx` exists and is unused.
2. **`neighbourhood-places` schema.** Nachbarschaft brief §1.2 fields are all present, plus `transit`, `homepageTeaser`, `hereTeaser`, and `imageCredit`. Place-level `associatedRoom` was correctly moved onto the endorsement row (per the seed data v1 fix). `pinMuted`/`PIN_MUTED_TOKENS` are **not** in the repo — the Neighbourhood Map brief's "signed off and live" framing is stale.
3. **`people.picks`.** Implemented as a real `join` field (Payload 3.85 installed). No `afterChange` hook fallback needed or present.
4. **Pin/card visual treatment.** Uses the addendum's palette v2 (`color.category.pin`), not the v4 muted tokens. `description` renders in the info card. All endorsers render as chips (not just the first). Hotel marker is the house glyph, not the "HBB" badge from the Homepage Map Teaser brief. Teaser still fills missing place photos with picsum placeholders.
5. **`/you-me-and-berlin` listing.** Built: tag filter, search, 24/page pagination, `PersonCard`. No map on this page. All seeded people are `status: draft`, so the live public grid is currently empty.
6. **Detail pages.** Stubs with JSON-LD wired up, not 404s, matching the brief's "do not build yet, just stub" instruction. Inactive places 404 correctly. Draft people are reachable by direct URL with `noindex` — the listing hides them, but the route itself does not gate on status.
7. **Teasers.** Independent curated sets via `getTeaserPlaces()` confirmed. Homepage and `/here` share three slugs and have two unique picks each. The `/here` hub uses a compact variant with no info card at all.
8. **Mobile.** Card-below-map under `md` works correctly on the homepage (full) and `/nachbarschaft` instances. The `/here` compact variant has no card to test. The homepage teaser's horizontal-scroll legend never fires — because no legend is mounted there at all, not because the responsive rule is broken.
9. **Consent gating.** Not live. `mapConsent.ts` exists in the repo but is unused — the map currently loads whenever a Mapbox token is present, with no cookie-consent gate in front of it. The CMP model question from the brief is still open.
10. **Open items from the original brief.** Pin-token sign-off is superseded — addendum v2 shipped instead of v4 muted tokens, so that item is effectively closed by a different outcome than what was asked. Still genuinely open: transit data backfill, touch-device label QA, the hover-only-labels tradeoff, pin clustering at the eventual 91-place scale, and the "Kids" taxonomy question. Icon/glyph set is confirmed shared between the map and `PlaceCard` (the one item that did get reconciled).

---

## Things worth flagging beyond the checklist

- **Consent gating is a real gap, not a nice-to-have.** The homepage map is cold, anonymous EU traffic — the brief called this out specifically as different from `/here`'s guest context, where GDPR concern was explicitly waived. Right now the map loads unconditionally. This should be treated as a compliance item, not just an "open item."
- **Draft people are technically reachable, not truly gated.** `noindex` keeps them out of search, but the seed data instructions were explicit — "do not invent bios or quotes... leave minimal until confirmed" — for records like Maike and Alessandra Botts. A thin, unconfirmed profile being live at a guessable/shared URL (even unindexed) sits slightly at odds with that intent. Worth deciding whether draft should 404 instead.
- **`/you-me-and-berlin` is publicly empty right now.** Every seeded person is still `draft`, so the page that exists and is built has nothing in it today. That's a content/publishing task, not a code task, but worth knowing before anyone reviews the live site expecting to see people.
- **The Neighbourhood Map brief's v4 palette is now stale documentation** — addendum v2 is what's actually live. Worth a formal note in that brief (or a superseding addendum) so nobody rebuilds against v4 later thinking it's still the target.

---

## Part B §1 — map-split proposal (from Cursor, not yet decided)

Two real options were on the table:

- **A — second map, pins are people.** Needs a real `basedIn` geo field (it's free text today) plus a defined rule for thin records with no location and no picks. Answers "where does this person live in Berlin," which isn't really what the "You, Me & Berlin" letters are about.
- **B — filtered view of the destinations map.** Same place coordinates, person-first chrome (`?person=slug` narrows the existing map to just that person's picks; the card leads with the person, not the place). Matches how `people.picks` already works. A person with zero picks simply doesn't appear on the map — no new empty-state design needed.

**Cursor's recommendation: B.** `MapPin variant="person"` as a reskin of the existing place pin (an avatar rendered at the pick's existing lat/long), not a second coordinate system. `/nachbarschaft` stays category-first; `/you-me-and-berlin` keeps its own route and card; the person detail page is the right home for a small embedded map of just that person's picks.

**Flagged explicitly as not decided by the briefs:** if the actual ambition is "500 personalities placed on a map of Berlin" as its own browsing experience, that's Option A, and it requires a `basedIn` geo field that doesn't exist in any spec today. That's a real scope question for the hotel team, not something to infer from the existing docs.

---

## Status

Part A complete, no product code changed. Sections 2–6 of the Cursor build prompt are blocked on confirming A vs. B for the map split.
