# Hotel Berlin, Berlin — Map Section Build Status v2
*Captured 2026-08-24, after `HotelBerlin_MapSection_CursorPrompt_v2.md`. Follows `HotelBerlin_MapSection_BuildStatus_v1.md` / `v1_1.md`. Option B (one map, reskinned and filtered) confirmed before this pass.*

**Bottom line:** destinations vs recommendations is now two *views* of the same Mapbox stack, not two maps. `/you-me-and-berlin` has a person-pin map filtered by `?person=slug`. Place and person detail pages are real layouts with fallbacks. Picsum is gone. Dead map files are gone. Consent gating, draft 404s, and publishing seed people were out of scope and are unchanged.

---

## What shipped

**Shared pin/card variants** (`src/components/map/MapPin.tsx`, `PlaceInfoCard.tsx`, `PlacesMapView.tsx`, `NeighbourhoodGuideMap.tsx`):

- `MapPin variant="category" | "person" | "hotel"` — person is avatar/initials-on-ink at the **place’s** lat/long. Same aria-label / focus-visible / touch two-tap contract.
- `PlaceInfoCard emphasis="place" | "person"` — field order changes; not a second card component.
- `PlacesMapView` is the shared chrome (floating card md+, in-flow below `md`). `NeighbourhoodFullMap` is a thin category wrapper. `/here` compact teaser was not touched.

**`/you-me-and-berlin`** — `src/app/[locale]/you-me-berlin/page.tsx`:

- Person-pin map of every active place that has a **published** endorser.
- `?person=slug` remaps every pin to that person’s portrait and person-leading card.
- Person with zero geo picks: no pin (and `mapEmpty` copy if that filter is on).
- Map section hidden while every person is still `draft` (current seed) — listing grid unchanged.

**Detail pages**

- `/nachbarschaft/[slug]`: hero (or gray category well), name, category, description, address/walk/transit, endorsement chips, compact single-pin map, back link. JSON-LD untouched. Inactive still 404s.
- `/you-me-and-berlin/[slug]`: portrait or initials, name/role/`basedIn`, quote, `bio` richText (shortBio only if bio is empty), video embed if URL is YouTube/Vimeo, picks as `PlaceCard`s + compact person-filtered map. Zero picks → “coming soon” line, no empty grid. JSON-LD untouched. Drafts still reachable with noindex (explicitly out of scope).

**Fallbacks**

- No portrait → `InitialsAvatar` ink fill (`#1A2B4A`), not a stock photo.
- No image on a place → same gray well + category glyph as rooms empty media (`PlaceImageFallback`).
- Homepage teaser no longer picsum-fills missing photos.
- Empty bio/shortBio sections collapse; quote can stand alone.

**Cleanup:** deleted unused `NeighbourhoodMap.tsx` and `NeighbourhoodMapCanvas.tsx`.

**Editorial how-to:** `doc/map/HotelBerlin_NeighbourhoodEditorialAddFlow_v1.md`.

---

## Option B — where the framing held, and one flag

Held: no `basedIn` geo; pins stay on `neighbourhood-places` coordinates; `variant="person"` is a reskin; card emphasis is a prop; person detail embed is the same map pre-filtered.

**Flag, not silently resolved:** unfiltered recommendations map is **one pin per place**, skinned with the first published endorser’s face. Schloss Charlottenburg (two endorsers) is one pin until you open the card or filter `?person=`. Two avatars at the same lat/long would overlap; that is a real limit of Option B, not a second map. Person-filtered view is the unambiguous person-first mode.

---

## Editorial add-flow vs the v2 prompt’s “still manual lat/long”

The prompt asked to flag geocoding as still fully manual. **That is not quite true in code.** `geocodeNeighbourhoodPlaceBeforeChange` still auto-fills geo / walking minutes when they’re empty (Nominatim + Mapbox walking, fails soft). Transit is still 100% manual. The hotel-team doc states both: try-on-save, type-by-hand if it misses. Do not tell the team “coordinates are always a developer step.”

Endorsements are **not** required to save a place. A zero-endorser place is valid.

---

## Still out of scope / unchanged

| Item | Status |
|---|---|
| Homepage cookie-consent gate | `mapConsent.ts` unused |
| Draft people 404 | Direct URL + noindex |
| Publishing seed people | All still `draft`; listing map therefore hidden in production until someone publishes |
| Homepage teaser legend | Still unmounted (`TeaserPlaceIndex.tsx` remains unused) |
| `/here` compact (no card) | Left as designed |
| Pin clustering, Kids taxonomy, transit backfill, touch QA | Still open from v1 |

---

## Files to look at

| Area | Path |
|---|---|
| Pin variants | `src/components/map/MapPin.tsx` |
| Card emphasis | `src/components/map/PlaceInfoCard.tsx` |
| Shared map chrome | `src/components/map/PlacesMapView.tsx` |
| People listing + `?person=` | `src/app/[locale]/you-me-berlin/page.tsx` |
| Place detail | `src/app/[locale]/neighbourhood/[slug]/page.tsx` |
| Person detail | `src/app/[locale]/you-me-berlin/[slug]/page.tsx` |
| Hotel-team how-to | `doc/map/HotelBerlin_NeighbourhoodEditorialAddFlow_v1.md` |
