# Hotel Berlin, Berlin — Multi-endorser pins — Status
*Captured 2026-08-24, against `HotelBerlin_MapSection_MultiEndorserPins_BuildBrief.md`.*

**Picked: option 2** (primary pin + `+N` badge), with option 3’s label copy added on the same pin — not stacked avatars.

Rationale: one confirmed multi-endorser place in seed (Schloss Charlottenburg). Option 1’s overlap cluster is more than this scale needs; option 3 alone only reveals the extra person on hover/AT. A corner `+N` is visible at rest, and the existing card chips still list everyone after click.

## What shipped

- `MapPin` (category and person variants): `extraEndorserCount` → white `+N` badge on the lower-right of the disc. Hotel pin unchanged.
- Hover/focus label: `{place} — {n} recommenders` when `n > 1`.
- `aria-label`: `{place}, {category|person}, {n} recommenders` in the same case.
- Wired through `NeighbourhoodGuideMap` / `PlacesMapView` / homepage teaser from `endorsements.length`.
- Person-filtered view (`?person=slug`): still that person’s face, `+N` if others also endorse the same place.

Card behavior unchanged (all chips). No schema change.

## Verification

Typecheck is clean. Local 200s on `/en/neighbourhood`, `/en/neighbourhood/schloss-charlottenburg`, and draft person URLs (`/en/you-me-and-berlin/maike`). Payload still has two endorsers on Schloss (Maike + Alessandra Botts, both `draft`). The destinations map and Schloss/Maike compact maps should show `+1` now. The unfiltered `/you-me-and-berlin` listing map stays hidden until a person is published — same as v2.

No browser click-through in this pass (no browser tooling). No PR opened.

## Not done

Stacked-avatar cluster (option 1). Revisit if the 91-row seed makes multi-endorser pins common.
