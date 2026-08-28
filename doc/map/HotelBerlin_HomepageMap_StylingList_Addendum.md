# Hotel Berlin, Berlin — Homepage Map: Pin Palette, Place List, Image Sourcing (Addendum)

**Reconciles:** `HomepageMapTeaser_BuildBrief.md`, `NeighbourhoodMap_BuildBrief.md`, and `NeighbourhoodTeaser_Addendum.md` against the current live build (`Hotel-Berlin-Berlin_-_map_srceen.png`).

**Context:** Reviewing the live homepage map section surfaced three things. Pin styling looks close to spec but needs an audit rather than an eyeball fix — several palette iterations exist in this project's history and only one table is actually authoritative. The side-panel/list component described in two separate briefs doesn't appear to have shipped — only the map and the floating info-card popup are live. And the image-sourcing question for the info card's photo has an answer already worked out, it just needs picking up.

---

## Step 0 — Diagnostic (do this first, do not skip)

```
Confirm against the current homepage map implementation:

1. Pin colours — read the actual hex values wired to each category (wherever
   pinCategoryTokens / category.pinMuted or equivalent lives). Do they match
   NeighbourhoodTeaser_Addendum.md §7's v2 table (Art #2C6B7A, Museum #A08C38,
   Shopping #5F4E68, Bar #D14A50, Restaurant #C1652F, Parks #56674F,
   Sightseeing #E08A28, Party #9B3F6B, Kids #4A90C4)? Or an earlier iteration —
   the original card tokens, or the muted v1 attempt that collided Museum and
   Parks on the same green? File:line.

2. Pin icons — which icon components are actually rendering per category?
   Confirmed Lucide names: Home, Palette, Landmark, ShoppingBag, Martini,
   UtensilsCrossed, TreePine, FerrisWheel, PartyPopper, Baby. Flag any
   category using a different or generic icon, or a hand-approximated SVG.

3. Hotel marker — is it rendering as [pin shape + Home glyph] (the general
   MapPin spec in NeighbourhoodMap_BuildBrief.md §3) or [rounded black badge +
   "HBB" text, no pin shape] (the homepage-specific override in
   HomepageMapTeaser_BuildBrief.md §5)? These two specs conflict — report
   which one shipped, don't guess which is correct.

4. Side panel / list — does a side panel (viewbox + legend + pagination +
   "View full map" CTA) exist anywhere in the homepage map component, per
   HomepageMapTeaser_BuildBrief.md §2 and §4? Does a place list (thumbnail +
   name + colour dot + recommender + walking time) exist per
   NeighbourhoodTeaser_Addendum.md item 5? If neither exists, confirm that —
   not hidden behind a breakpoint or a feature flag, actually absent.

5. Data layer for the list — do `featuredOnHomepage` / `featuredOrder` fields
   and a `getTeaserPlaces()`-style resolver already exist per the original
   brief? If the panel is missing, is it a missing UI layer on top of real
   data, or is the data layer missing too?

6. White-glyph contrast — has this been checked against any of the nine pin
   hexes? Flagged unverified in two separate open-items lists previously.

7. Image sourcing — what's currently populating PlaceInfoCard's image field
   for the live teaser places? Placeholder, real photography, or something
   sourced ad hoc? Does `imageCredit` exist on `neighbourhoodPlaces` yet?

Report back before applying anything below.
```

---

## 1. Pin palette — audit and correct to v2

If Step 0 finds anything other than the v2 table, correct it. Reference (unchanged from `NeighbourhoodTeaser_Addendum.md` §7):

| Category | Hex | Lucide icon |
|---|---|---|
| Hotel marker | `#1A2B4A` | `Home` |
| Art | `#2C6B7A` | `Palette` |
| Museum | `#A08C38` | `Landmark` |
| Shopping | `#5F4E68` | `ShoppingBag` |
| Bar | `#D14A50` | `Martini` |
| Restaurant | `#C1652F` | `UtensilsCrossed` |
| Parks and Nature | `#56674F` | `TreePine` |
| Sightseeing | `#E08A28` | `FerrisWheel` |
| Party | `#9B3F6B` | `PartyPopper` |
| Kids | `#4A90C4` (provisional) | `Baby` |

Run a formal contrast check — white glyph on each hex — before calling this locked; it's never been done despite being flagged twice already. Any pairing under 3:1 (WCAG non-text minimum for icons) needs either a darker pin fill or an ink glyph instead of white.

## 2. Hotel marker — resolve the spec conflict

Two documents describe this differently:

- `NeighbourhoodMap_BuildBrief.md` §3, general `MapPin` component: pin shape, ink fill, `Home` glyph, 42px
- `HomepageMapTeaser_BuildBrief.md` §5, homepage-specific override: not a pin at all — rounded badge, black fill, "HBB" in Archivo, no glyph

**Do not silently pick one.** The teaser-specific override exists because this instance was meant to read differently from the full `/nachbarschaft` map, so there's a real argument for honoring it — but it needs an explicit decision from you or the client, not a default carried over from whichever spec Cursor happened to build against.

## 3. Build the side panel and place list

Per `HomepageMapTeaser_BuildBrief.md` §2 and §4, refined by `NeighbourhoodTeaser_Addendum.md` item 5:

- **Desktop/tablet (≥768px):** map and side panel, side by side. Panel, top to bottom: viewbox → legend (5 items) → place list (one row per place: thumbnail, name, colour dot matching its pin, recommender name, walking time) → pagination control → "View full map →" Line-CTA.
- **Mobile (<768px):** stacked — map, viewbox, legend as a horizontal scroll, list, pagination, CTA.
- List rows are real focusable controls (button or link). Clicking or pressing Enter pans the map to that pin and opens its `PlaceInfoCard` — same effect as clicking the pin.
- Legend and list order match tab order.
- Pagination: 15 curated places, batches of 5, 3 pages. Changing pages swaps the pin set, legend, list, and viewbox together — never partially, never out of sync.
- This is a UI-only build if Step 0 confirms the data layer (`featuredOnHomepage`/`featuredOrder`, `getTeaserPlaces()`) already exists — don't re-spec what's already there. If Step 0 finds the data layer missing too, that's a bigger scope than this addendum covers; flag back before proceeding.

## 4. Image sourcing

- **Don't** source photos via ad-hoc image search — licensing is unknown and it's easy to ship a copyrighted image past testing.
- **Placeholder now, for pure layout testing:** `picsum.photos/{width}/{height}?random={id}` — free, no auth, obviously not a real photo.
- **Real, for the live launch places:** check Wikimedia Commons against each place's Wikidata entity. Several already have or will get Wikidata IDs through the existing AEO authority-identifier work, and Commons often carries CC-licensed images tied to the same entity.
- Requires `imageCredit` on `neighbourhoodPlaces` — already specced in `NeighbourhoodTeaser_Addendum.md` §8 (group field: `creditText`, `creditUrl`, `license` select — `CC-BY` / `CC-BY-SA` / `licensed-stock` / `original` / `other`). Add if Step 0 finds it's missing. Render as a small, unobtrusive credit line wherever `creditText` is populated — required, not optional, for CC-BY/CC-BY-SA.
- Doesn't cover independent spots with no Commons presence — those need real photography regardless. Don't block the rollout on that; populate case by case, one launch place at a time.

---

## Definition of done

- [ ] Step 0 audit completed and reported before any fix applied
- [ ] Pin hex values confirmed or corrected to the v2 table
- [ ] Pin icons confirmed or corrected to the Lucide list, no hand-approximated SVGs
- [ ] White-glyph contrast checked against all ten hexes (nine categories + hotel); failures resolved
- [ ] Hotel marker spec conflict resolved with an explicit decision, documented in DESIGN.md
- [ ] Side panel (viewbox + legend + list + pagination + CTA) built per spec, or scope-flagged back if the data layer isn't there yet
- [ ] Image sourcing plan in place: picsum placeholder now, Commons/Wikidata path for real places, `imageCredit` field live and rendering credit lines

## Open items — do not silently resolve

- Kids category/taxonomy decision (category vs. `targetAudience`) — still open, palette entry provisional
- Hotel marker: pin+glyph vs. badge+text — needs an explicit call, see §2
- Full contrast check on the v2 palette — never formally done, do it here
- Independent spots with no Wikimedia Commons presence — ongoing photography need, not resolved by this addendum
