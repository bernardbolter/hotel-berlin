# Hotel Berlin, Berlin — Hero Section 2:1 Ratio Addendum
*For Cursor*
*Component: `<HomeHero>`*
*Supersedes: Section 3 ("Hero") of `HotelBerlin_HomepageV2_BuildBrief.md` — only the parts listed below*

---

## Context & scope

Client requested a **2:1 photo-to-text ratio** (66.7% / 33.3%) for the hero, replacing the current ~58/42 split defined in V2 Section 3.

Selected direction: **floating map badge** — the circular map moves out of the forest panel and floats on the boundary between the two panels instead. Chosen over two alternatives (a compact stack that shrinks everything to fit, and a version that drops the map from the hero entirely) because it lets the headline keep close to full size in the now-narrower text column, and it reuses the overlap motif from the very first hero concept without bringing back the old amber border box.

**This addendum only changes:** column ratio, removal of the on-panel `MiniSatellite` block in favor of a floating circular badge, and forest panel copy (body paragraph dropped from render). Everything else in V2 Section 3 — photo rotation, Ken Burns/zoom animation, slide captions, dot nav, the `heroSlides` Payload collection, hotel-global fields — is unchanged and still applies. Don't rebuild those.

---

## ⚠️ Two flagged inconsistencies — do not silently resolve

1. **Forest panel color.** V2 Section 3 lists `#4F674F`. `tokens.json` and `DESIGN.md` both give the canonical green as `#56674F` ("green," replaces old Pantone 341U). This brief uses `#56674F` as canonical and treats `#4F674F` as a likely transposition typo in the V2 brief. Flag before touching any other component that may have copied the V2 value.
2. **Headline/body font assignment.** `DESIGN.md` §3 (Typography) says Archivo for all headings, Laica A for body copy. Other project decisions — and V2's own "Archivo only, site-wide" global rule — point the other way: Laica A for headings, Archivo for UI/body. `DESIGN.md` is already known to misattribute Laica A's vendor (says Colophon Foundry; confirmed vendor is Dinamo/abcdinamo.com), so it's a plausible source of drift here too, not just on the one point. This brief specs Archivo for the H1 (below) to match V2's global rule — flag for a real decision before H1 styling is finalized, since `DESIGN.md` disagrees.

---

## Layout — desktop

Two-column grid, text panel first:

```css
grid-template-columns: 1fr 2fr; /* 33.3% text / 66.7% photo */
```

- Forest panel background: `#56674F` (see flag #1 above)
- Photo panel: unchanged from V2 — same rotation, zoom-only animation, crossfade, per-slide caption, dots nav
- No unifying border box — this is not a return to the pre-V2 teal/amber-box spec

### Forest panel content — changed

Body paragraph is **removed from render** at the new width. Panel now holds headline + CTA only:

```
[H1 headline]
[Book Now CTA]
```

- `hero.body` and its `{ de, en }` Payload values **stay in the schema, just unused by this component** — hide-don't-delete. Don't delete the field; a future wider treatment (e.g. a `/here` variant, a seasonal takeover) may reuse it.
- H1 headline: suggest dropping from V2's 48–56px display scale to **32px** desktop to fit the narrower column. Two lines is the target, three is acceptable; if the current copy pushes to four lines, that's a signal to trim copy, not shrink the font below ~28px.
- Font: **Archivo**, per the flagged rule above — not Laica A, pending the font-assignment decision.
- Book Now CTA: unchanged from V2 (amber `#B87A2E` background, white text, `border-radius: 0`, Radisson URL placeholder `#`).

### Floating map badge — new, replaces the on-panel `MiniSatellite` block

Circular Mapbox static image, floating on the seam between the two panels instead of sitting inside the forest panel.

- **Diameter:** `128px` desktop (suggested — adjust if it crowds the CTA)
- **Horizontal position:** centered on the 1/3 column boundary — `left: calc(33.333% - 64px)` — so it straddles both panels
- **Vertical position:** bottom edge `40px` up from the section's bottom padding line, roughly level with the Book Now CTA so the two read as a paired anchor
- **z-index:** `3` — above both the forest panel and the photo
- **Border:** `2px solid #B87A2E`, `#FBFBFB` fill behind the map image, `border-radius: 50%` — the deliberate exception to the site's `border-radius: 0` rule (same exception already used for this map in V2)
- **No drop shadow** — flat fill + border only
- Same Mapbox source as V2: Static Images API, light style, pin ~40–45% down from the circle's top edge
- ⚠️ **Known gotcha (carried over from the original map work):** the Mapbox Static Images API does not support Mapbox Standard–based styles for static export — use the Studio print panel to bake this image, not a live Standard-style export

### Get Directions — reused directions-pill pattern, not the V2 Line-CTA

The badge straddles a dark green panel and a photo, so a plain coral text link risks losing contrast wherever it crosses onto the green half. Reuse the dark-pill overlay pattern from the original (pre-V2) hero spec instead of the Section 2 Line-CTA:

- Dark pill `rgba(0,0,0,0.55)`, bottom-center of the badge, overlapping its lower edge
- Default (persistent) state: arrow icon only
- Hover-expanded state: reveals "Lützowplatz 17, Tiergarten · Get directions" via CSS `max-width` transition — no JS
- Font: **Archivo** — the original pill spec used Archivo Narrow, which has since been removed site-wide; update when porting this pattern over
- The entire badge is wrapped in one `<a>` to the same Google Maps directions URL used previously — the pill is a visual affordance, not a separate link
- `aria-label` on the `<a>` includes destination + "(opens Google Maps)"

```tsx
<a
  href="https://www.google.com/maps/dir/?api=1&destination=Hotel+Berlin+Berlin&destination_place_id=ChIJYcbvb-9RqEcRhD94S5F0Nw0"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Get directions to Hotel Berlin, Berlin at Lützowplatz 17, Tiergarten (opens Google Maps)"
  className="absolute z-[3] rounded-full border-2 overflow-hidden"
  style={{
    width: 128,
    height: 128,
    left: 'calc(33.333% - 64px)',
    bottom: 40,
    borderColor: '#B87A2E',
    background: '#FBFBFB',
  }}
>
  <img
    src="/images/hotel-berlin-berlin-luetzowplatz-map.jpg"
    alt=""
    aria-hidden="true"
    className="w-full h-full object-cover"
  />
  <span
    className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/55 text-white px-3 py-1.5 overflow-hidden whitespace-nowrap max-w-[2rem] hover:max-w-[20rem] transition-[max-width] duration-300 ease-in-out"
  >
    <span aria-hidden="true">↗</span>
    <span className="text-xs" style={{ fontFamily: 'Archivo, sans-serif', letterSpacing: '0.04em' }}>
      Lützowplatz 17, Tiergarten · Get directions
    </span>
  </span>
</a>
```

The badge `<img>` alt is empty/`aria-hidden` because the parent `<a>` already carries the full descriptive `aria-label` — avoids duplicate screen-reader announcement.

### Responsive behaviour

Still desktop-only, per V2 — no mobile breakpoints defined yet. The floating badge specifically will need its own mobile treatment when that work starts: a badge straddling a column boundary has no obvious equivalent once the layout stacks vertically. Flag as a new open item rather than guessing a mobile position now.

---

## Payload schema changes

None required beyond what V2 Section 3 already defines (`heroSlides` collection, hotel-global `getDirectionsLabel` / `heroShortAddress` fields). `hero.body` stays defined but unused by this component — see flag above. The badge reuses the same static map image path as the original pre-V2 `MiniSatellite` spec.

---

## i18n

Reuses existing keys: `hero.headline`, `hero.cta`, `hero.address`, `hero.directions`. `hero.body` stays defined, unused by this render.

---

## Definition of done

- [ ] Hero grid is `1fr 2fr` (33% text / 67% photo)
- [ ] Forest panel uses `#56674F` (flagged — confirm against V2's `#4F674F` before merging)
- [ ] Forest panel renders headline + Book Now CTA only; `hero.body` field untouched in schema, just not rendered
- [ ] H1 sized to fit the 1/3 column (suggested 32px desktop), wraps to ≤3 lines with current copy
- [ ] Circular map badge: 128px, centered on the panel boundary, 40px up from bottom padding
- [ ] Badge: amber 2px border, `#FBFBFB` fill, no drop shadow, `border-radius: 50%`
- [ ] Directions pill (dark, hover-expand, arrow default) sits bottom-center of badge, Archivo (not Narrow)
- [ ] Badge wrapped in one `<a>` to Google Maps directions URL, full `aria-label`
- [ ] Badge `<img>` alt is empty/`aria-hidden`
- [ ] Map image baked via Mapbox Studio print panel, not a Standard-style static export
- [ ] Photo panel, Ken Burns rotation, captions, dots nav — unchanged from V2 Section 3
- [ ] No mobile breakpoints defined — new open item logged for the badge specifically

---

## Open items — do not resolve without client/hotel input

- Forest green hex conflict (`#56674F` vs V2's `#4F674F`) — confirm canonical value before it spreads to other components
- Headline/body font assignment conflict between `DESIGN.md` and the rest of the project — confirm before finalizing H1 styling
- Mobile layout for the floating badge — no stacked-layout equivalent defined yet
- `hero.body` copy — confirm whether it's genuinely retired from the hero or should resurface elsewhere now that it's unused here
