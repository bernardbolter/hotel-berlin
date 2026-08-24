# Hotel Berlin, Berlin — Map Section (Places ↔ People) Build Status v2
*Captured 2026-08-24, reported by Cursor against `hotel-berlin-de`, closing out `HotelBerlin_MapSection_CursorPrompt_v2.md`. Cursor's own copies: `doc/map/HotelBerlin_MapSection_BuildStatus_v2.md` and `doc/map/HotelBerlin_NeighbourhoodEditorialAddFlow_v1.md`. Not yet opened as a PR — code is complete locally, pages verified with 200s, not clicked through in a browser.*

**Bottom line:** Option B shipped as scoped — one Mapbox stack, reskinned and filtered per view, not a second map. Destinations (`/nachbarschaft`) and recommendations (`/you-me-and-berlin`) now read as distinct experiences sharing the same underlying plumbing. Detail pages, fallback states, and dead-code cleanup are done. One real design gap surfaced during the build and was flagged rather than papered over — see below. Consent gating, draft-record 404s, and publishing the seeded people are still untouched, as agreed.

---

## What shipped

- **Destinations vs. recommendations styling.** `MapPin` has a new `variant="person"` (portrait, or initials on ink if no photo, at the place's existing coordinates). `PlaceInfoCard` takes `emphasis="place" | "person"` to reorder which fields lead. Shared chrome lives in `PlacesMapView`; `/nachbarschaft` keeps category pins as before.
- **`/you-me-and-berlin` map.** Person-pin map plus `?person=slug` filtering, per the Option B decision. With every seeded person still `draft`, the listing grid and this map both stay empty/hidden until someone is published — expected, not a bug.
- **Detail pages, built past the stubs:**
  - `/nachbarschaft/[slug]` — hero, address/walking time/transit, all endorsement chips, a compact single-pin map.
  - `/you-me-and-berlin/[slug]` — portrait or initials, quote, bio (falls back to `shortBio`), video if present, `PlaceCard` picks, a compact person-filtered map. JSON-LD untouched on both.
- **Filler-content fallbacks.** No stock photos anywhere. Empty bio collapses rather than showing an empty heading. Zero picks shows "coming soon" instead of an empty grid. Missing place images use the same gray placeholder well as rooms — the picsum stand-in is gone.
- **Cleanup.** Dead `NeighbourhoodMap.tsx` and `NeighbourhoodMapCanvas.tsx` deleted, as flagged in the status v1 report.
- **Editorial add-flow, documented and corrected.** The v1 status report assumed geocoding was fully manual — it isn't. Save already attempts a Nominatim lookup when lat/long is empty; transit (station/line/minutes) is still hand-typed. Full writeup for the hotel team in `HotelBerlin_NeighbourhoodEditorialAddFlow_v1.md`.

## Flagged, not resolved: multi-endorser places on the unfiltered map

On the unfiltered recommendations view, a place with more than one endorser (e.g. Schloss Charlottenburg — Alessandra Botts and Maike) still renders as **one pin**, showing only the first published endorser's face. The second person is reachable by opening the place's card or by filtering `?person=`, but isn't visible as a separate pin at rest. Stacking multiple avatars at one lat/long wasn't attempted — flagged as needing its own design pass (options include a small stacked-avatar cluster, a "+1" badge, or leaving this as an intentional simplification since it's still fully discoverable one click deeper).

## Verification done vs. not done

Confirmed locally: pages return 200 (König Galerie place layout, Kristiane's detail page with quote + picks, Maike's page with initials fallback and her Schloss Charlottenburg pick, and the empty listing state). Not yet done: an actual browser click-through — no browser tooling was available in that session. Recommend a manual pass (or Chrome automation) before merging, especially the touch-device pin interactions and the person-filtered map transitions, since those were called out as needing explicit QA back in the original Neighbourhood Map brief and still haven't been tested that way.

## Still out of scope (unchanged from v2 prompt)

- Cookie-consent gating on the homepage map
- Gating draft-status people behind a real 404 instead of `noindex`-only
- Publishing the seeded people/places to make the live pages non-empty

## Next step

Code is complete locally; no PR opened yet.
