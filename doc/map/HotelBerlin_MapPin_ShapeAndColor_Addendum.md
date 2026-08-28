# Hotel Berlin, Berlin — Map Pins: Shape, Colour, Marker & Images (Addendum)

**Supersedes:** `HotelBerlin_HomepageMap_StylingList_Addendum.md` §2 (hotel marker) in full, and the Sightseeing-contrast portion of §1. Adds a new pin-shape decision not covered by any prior brief. Confirms the image-sourcing staging already proposed in `NeighbourhoodTeaser_Addendum.md` §8.

**Context:** Resolves the open items left after the pin-palette audit — hotel marker colour (previously flagged as a spec conflict, then iterated through a few directions before landing here), Sightseeing's contrast failure, a new pin-shape direction, and how to stage the info-card photos.

---

## 1. Hotel marker — final colours

**Not fixed, not accent-tracking in the direction DESIGN.md would predict — a deliberate reversal, confirmed intentional:**

| Context | Fill | Glyph | Glyph rationale |
|---|---|---|---|
| `/` (main site) | Teal `#2C6B7A` | White `#FFFFFF` | 5.0:1, clean pass |
| `/here` | Amber `#F79B2E` | Ink `#1A2B4A` | White fails at 2.6:1 on amber — same rule used everywhere else amber appears on the site |

This is the reverse of DESIGN.md's documented main-site-is-amber / `/here`-is-teal convention. **Log it as a named exception in DESIGN.md** — a line stating the hotel marker deliberately inverts the site's accent-swap rule — not left as an implicit override that reads as a bug the next time someone opens that file. Same treatment already given to the Meetings-page teal exception.

Glyph stays `Home`, shape per §3 below, applies to both instances identically apart from fill/glyph colour.

## 2. Sightseeing pin — contrast fix

White glyph on `#E08A28` measures ~2.68:1, fails the 3:1 non-text minimum. Fix: **Ink `#1A2B4A` glyph**, fill unchanged. Brings it to ~5.27:1.

**Icon choice still open.** `FerrisWheel` (the Lucide component named in the confirmed v2 palette) reads as the most specific "sightseeing" signal but hasn't been checked at actual live pin size — do that before deciding whether to keep it or move to something that reads cleaner small (candidates discussed: `Camera`, `Compass`, `Binoculars`). Landmark's already taken by Museum, so whatever's chosen needs to stay visually distinct from that glyph.

## 3. Pin shape — three rounded corners, one square

New treatment for **all** pins — hotel marker and all nine category pins alike:

```
border-radius: 14px 14px 14px 2px;   /* top-left, top-right, bottom-right rounded; bottom-left square */
```

This isn't a new visual language — it's a direct relative of the single-oversized-corner treatment already used on the Meet & Work homepage photo and the rooms teaser (`HotelBerlin_MeetAndWork_BuildBrief.md`: "large corner radius on one corner only... same oversized-radius technique as the rooms teaser"). Those treatments round exactly one corner and leave the rest square; pins invert that — three rounded, one square — placed at **bottom-left**, mirroring the corner Meet & Work highlights.

- Applies uniformly to hotel marker and category pins — same shape, only fill/glyph vary per §1 and the confirmed v2 palette.
- Pins still sit on a thin stem/line down to the actual map coordinate, unchanged from the current implementation — this only replaces the badge silhouette, not the positioning mechanism.
- Size unchanged from current spec: hotel marker 42px, category pins 32px (scale the corner radii proportionally — the 14px/2px values above are calibrated for roughly 40px, adjust down for the 32px category pins).

**Not part of this addendum, but worth prototyping directly in the live build since it can't be previewed in flat mockups:** solid/filled Lucide icon glyphs instead of outline. Outline can read thin at small pin scale against a saturated fill, and a filled silhouette would also help the Bar/Restaurant/Sightseeing warm-colour-cluster legibility issue flagged earlier. Try it live, compare against outline, decide from there.

## 4. Image sourcing — placeholder now, Commons later

- **Now:** `picsum.photos/{width}/{height}?random={id}` for all `PlaceInfoCard` images — free, no licensing risk, obviously placeholder.
- **Build the schema field now regardless:** `imageCredit` on `neighbourhoodPlaces` (group: `creditText`, `creditUrl`, `license` select — `CC-BY` / `CC-BY-SA` / `licensed-stock` / `original` / `other`), per `NeighbourhoodTeaser_Addendum.md` §8. Leave it empty for now — building it ahead of the content means swapping in real photos later is a data update, not a schema migration. Same pattern already used elsewhere in this project (the hero's body paragraph field, kept in schema while unrendered).
- **Later, for the real launch places:** check Wikimedia Commons against each place's Wikidata entity where one exists — several already have or will get IDs through the ongoing AEO authority-identifier work. Populate `imageCredit` and render a small credit line whenever `creditText` is set (required for CC-BY/CC-BY-SA, not optional).
- Independent spots with no Commons presence still need real photography eventually — not blocking, handle case by case.

---

## Definition of done

- [ ] Hotel marker: Teal fill/white glyph on `/`, Amber fill/ink glyph on `/here` — documented as a named exception in DESIGN.md, not an implicit override
- [ ] Sightseeing pin: Ink glyph on existing `#E08A28` fill
- [ ] Sightseeing icon choice confirmed after a live-size legibility check (FerrisWheel vs. alternatives)
- [ ] Pin shape updated to `14px 14px 14px 2px` (scaled per pin size) across hotel marker and all category pins
- [ ] `imageCredit` field added to `neighbourhoodPlaces` schema, left empty
- [ ] All `PlaceInfoCard` images pointing at `picsum.photos` placeholders
- [ ] Filled-vs-outline icon comparison prototyped live, decision logged either way

## Open items — do not silently resolve

- Sightseeing icon — FerrisWheel vs. Camera/Compass/Binoculars, pending live legibility check
- Filled vs. outline icon style system-wide — worth a live comparison, not decided here
- Kids category/taxonomy — carried forward from earlier briefs, unrelated to this addendum, still open
