# Hotel Berlin, Berlin — Homepage Map Teaser Build Brief
*For Cursor*
*Component: homepage live map — mid-page `NeighbourhoodMapSection` (after Lutze / events), not the forest-panel circular hero teaser*
*Confirms and formalizes `NachbarschaftYouMeBerlin_BuildBrief.md` Section 5's "map component (smaller instance reused on the homepage teaser)" as the correct direction. The circular Mapbox/static teaser inside the Forest hero panel (`HomepageV2_BuildBrief.md` Section 3) stays as-is — separate component.*

---

## What this is

The homepage's **mid-page** map is the **same live Mapbox GL JS component** used on `/nachbarschaft` and `/here` — not a static image, not a separate implementation. Reused smaller, with its own curated content and interaction pattern suited to a teaser rather than a full browsing page.

**Rectangular, not circular** — top corners rounded to match the arch-topped photo motif used elsewhere, not a hard circle mask. A live, pannable map inside a circular crop reads as broken at the edges; a circle remains correct for the **hero** static directions teaser only.

---

## Section 1 — Curated pin set

- **15 places total**, editorially curated — not the full 91-place neighbourhood dataset.
- **Paginated in batches of 5** — 3 pages. Changing pages swaps the entire visible pin set, the legend list, and resets the viewbox to the new page's first item, all three together, never out of sync.
- New field needed on `neighbourhoodPlaces`: `featuredOnHomepage` (boolean) — or a dedicated ordering field if exact sequence/grouping into pages of 5 needs editorial control beyond simple boolean inclusion. Recommend a `featuredOrder` (number) field so editors control both inclusion and exact page grouping, rather than relying on document creation order.
- **AEO note — this component needs no JSON-LD of its own.** The complete, unfiltered structured-data graph for all neighbourhood places already lives on `/nachbarschaft` via `buildNeighbourhoodListGraph`, which outputs the full dataset regardless of what's paginated client-side there. Duplicating a subset of place entities into homepage schema would add redundancy, not crawlable value. Pin count here is a pure UX decision.

---

## Section 2 — Layout

**Desktop/tablet (≥768px):** map and a side panel, side by side. Panel contains, top to bottom: viewbox, legend (5 items), pagination control, "View full map →" Line-CTA.

**Mobile (<768px):** stacked — map on top, viewbox below, legend as a horizontally scrolling row (space-saving trade-off over a vertical list; revisit if it proves hard to scan), pagination, CTA.

```
Desktop:                          Mobile:
┌──────────┬─────────────┐        ┌─────────────────┐
│          │  Viewbox     │        │       Map        │
│   Map    ├─────────────┤        ├─────────────────┤
│          │  Legend (5)  │        │     Viewbox      │
│          ├─────────────┤        ├─────────────────┤
│          │  ● ○ ○  →   │        │  Legend (scroll) │
│          ├─────────────┤        ├─────────────────┤
│          │ Full map →  │        │  ● ○ ○   Full →  │
└──────────┴─────────────┘        └─────────────────┘
```

---

## Section 3 — Viewbox

Always shows content for the **currently selected place** — defaults to page 1's first item on load, never an empty state.

```typescript
type ViewboxState = {
  categoryLabel: string;
  title: string;
  metaLine: string; // e.g. "3 min walk · free entry"
};
```

Text-only, no image — keeps the panel lightweight at this size. If this feels sparse once built, revisit with a small thumbnail, but start without one.

Updates when: a pin is clicked, a legend item is clicked, or pagination changes the page (resets to the new page's first item).

---

## Section 4 — Legend

Lists the current page's 5 places. Each item is a real focusable control (button or link, not a styled `<div>`), clicking or pressing Enter selects that place — same effect as clicking its pin.

- **Selected item** gets a visually distinct state (background fill, matching the viewbox's current content)
- **Legend order matches tab order** — keyboard users move through the same 5 places in the same sequence sighted users see, rather than jumping around the map in DOM-arbitrary order
- Each item: small color dot (or category icon) + place name — compact, single line

---

## Section 5 — Pins

- **Neighbourhood pins:** single color (existing green "Neighbourhood" token) — consistent with `/nachbarschaft`'s rule of one pin color, category differentiated by icon glyph, not hue. **Selected pin is emphasized by size and a ring/halo, not a color change** — deliberately not switching to amber or another hue for the selected state, since that could read as bleeding the page's site-wide accent color into pin-selection logic, which is a separate concern from category or brand color.
- **Hotel's own marker — not a pin shape at all.** A small rounded badge, **black fill**, "HBB" in Archivo (medium weight), fixed at the hotel's location. Not selectable, not part of pagination, doesn't appear in the legend or update the viewbox on click — it's a fixed anchor, not a browsable place.
  - **`aria-label` carries the full name** — "Hotel Berlin, Berlin, Lützowplatz 17" — even though the visible label is just "HBB." This keeps the abbreviation purely visual and doesn't conflict with the site-wide rule that the wordmark is never abbreviated in the site's formal entity presentation; a map badge is a compact UI affordance, not that presentation.
  - Stays fixed and identical across all 3 pagination pages.

---

## Section 6 — Consent gating

Live map requires cookie consent before initializing — this is the homepage, a cold landing page for anonymous EU visitors, unlike `/here` where GDPR concern was explicitly waived for guest-facing context.

**Before consent:** static placeholder — icon, "Map requires cookies to load" text, "Enable map" button (forest green fill, white text). Clicking triggers whatever the site's consent flow exposes — if the CMP supports per-component consent, this can enable just the map; if it's site-wide accept/decline only, this button instead opens/re-triggers the global consent banner.

**⚠️ Open item:** confirm which consent model the CMP actually supports before building the "Enable map" button's behavior — the two cases need different implementations.

**If declined permanently:** static fallback — a plain image (the existing satellite JPG asset from the older hero spec may already cover this, worth reusing rather than sourcing a new image) plus the address as plain text. No interactivity, no viewbox/legend/pagination in this state.

---

## Section 7 — Accessibility

Same contract as the other live map instances (`/nachbarschaft`, `/here`) — this is the same underlying component:

- Every pin `focusable: true`, keyboard Tab + Enter opens/selects
- `role="application"` with a descriptive `aria-label` on the map itself
- `<noscript>` fallback listing the hotel's address and nearest transit as plain text
- Legend items are real interactive elements, tab order matches visual order (Section 4)
- Hotel badge's full-name `aria-label` (Section 5)
- Pagination control is operable by keyboard, not just click/tap

---

## Open items — do not silently resolve

1. Consent model (per-component vs. site-wide) — blocks the "Enable map" button's exact behavior. **Interim:** no CMP in repo; `src/lib/consent/mapConsent.ts` stores a local preference so pending / granted / declined UI can ship. Swap this adapter when a CMP is chosen.
2. Whether the old satellite JPG asset can be reused for the declined-consent fallback image, or a new one is needed — **using** `public/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg`.
3. Mobile legend as horizontal scroll vs. vertical stack — went with horizontal for space, but it's a real tradeoff (space vs. scannability), not an obvious default
4. Viewbox staying text-only vs. adding a small thumbnail — start without, revisit if it reads as sparse

---

## Definition of done

- [x] Map is the same live Mapbox GL JS component as `/nachbarschaft`/`/here`, not a separate static implementation — lives in mid-page `NeighbourhoodMapSection` (hero circular teaser unchanged)
- [x] Exactly 15 curated places, paginated 5 at a time, 3 pages
- [x] Changing pages swaps pins, legend, and resets viewbox together — never partially updated
- [x] Viewbox defaults to page 1's first item on load, never empty
- [x] Legend items are real focusable controls, tab order matches visual order
- [x] Neighbourhood pins are single-color green, selected state shown by size/ring not hue change
- [x] Hotel badge: black fill, "HBB" in Archivo, fixed position, not selectable, full name in `aria-label`, unchanged across all pagination pages
- [x] Map does not initialize before cookie consent; static placeholder shown until then
- [x] "View full map →" links to `/nachbarschaft`, always visible regardless of pagination state
- [x] No JSON-LD generated by this component — confirmed the full graph lives on `/nachbarschaft` only
- [x] `role="application"`, `<noscript>` fallback, and keyboard operability match the existing map accessibility contract
