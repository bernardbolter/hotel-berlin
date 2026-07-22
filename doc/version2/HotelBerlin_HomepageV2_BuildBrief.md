# Hotel Berlin, Berlin — Homepage V2 (Top Section) — Cursor Build Brief

## Context & scope

This brief covers a redesign of the homepage **top section only** — header, hero, and rooms teaser — based on the new Figma comp (`Outside_short.pdf`). This is being built now to send to the client; the rest of the existing homepage is **not being deleted**.

**Supersedes:**
- `HotelBerlin_HeroSection_BuildBrief.md` — fully replaced by Section 3 below
- `HotelBerlin_RoomsHero_BuildBrief.md` / Addendum / ComponentSpec — **partially** superseded; see Section 4, spec still pending a follow-up session

**Do not delete:** Meetings block, three-card events row, neighbourhood map block, FAQ accordion, footer. See Section 5 for how to hide them.

---

## Global build requirements (apply throughout)

- **Semantic HTML is mandatory.** Use `<header>`, `<nav>`, `<main>`, `<section>`, `<figure>`/`<figcaption>` for images with captions, one `<h1>` per page, logical heading hierarchy. No `<div>`-as-button, no `<div>`-as-link — use real `<a>` and `<button>` elements per their actual behavior (navigation vs. in-page action).
- **WCAG 2.1 AA at build time**, not a post-build audit pass:
  - Colour contrast verified (values below)
  - Full keyboard navigability, visible focus states on every interactive element
  - `aria-live="polite"` on any text that changes without a page reload (rotating captions, room name/price)
  - `prefers-reduced-motion` respected — all animation reduces to instant/no motion
  - Any auto-rotating content running longer than 5 seconds needs a pause control or must fully stop under `prefers-reduced-motion` (WCAG 2.2.2)
- **Typography: Archivo only, site-wide.** Archivo Narrow has been removed from the type system per explicit client direction — this applies everywhere, including `/here`, not just this homepage section. Audit existing code/CSS for lingering Archivo Narrow references and remove them.
- **Locale:** `/de` primary, `localePrefix: 'always'`. Every client-editable text field needs a `{ de, en }` pair, written natively (not translated), `du` register per the voice/tone guide.
- **Recurring "Line-CTA" pattern (Section 2)** should be reused consistently — don't introduce a new one-off button style elsewhere without checking this one first.

---

## Section 1 — Header & primary nav

**Structure:**
```
<header>
  <div class="wordmark">Hotel Berlin, Berlin</div>
  <span class="divider" aria-hidden="true"></span>   <!-- 2px vertical bar -->
  <nav aria-label="Primary">
    Rooms | Meetings | Eat & Drink | Happenings | Neighbourhood
  </nav>
  <div class="lang-toggle">DE | EN</div>              <!-- DE first -->
  <a class="book-now-btn">Book Now</a>
  <nav aria-label="Guest hub">
    In the Building? <span class="boxed-btn">ENTER</span>
    | What's on | Getting around | Local tips | Gallery | Wallride
  </nav>
</header>
```

- **Font:** Archivo throughout — both nav rows, no exceptions.
- **Divider:** 2px solid vertical bar between wordmark and nav links. Purely decorative — `aria-hidden="true"`.
- **"ENTER"** uses the boxed/bordered small-button treatment (border, not the Line-CTA sweep) — this is the one place a visible box is intentional.
- **Wordmark** must always read "Hotel Berlin, Berlin" in full — never abbreviated (AEO/entity-grounding requirement).
- **Wallride** is the permanent skateboard-culture exhibition tied to the future Skateboardmuseum Berlin project (shares the same Payload instance, separate frontend, not yet built). Nav item ships now as a **placeholder** — visible in the nav, styled/positioned correctly, but linking to a disabled/`href="#"` state or a simple "coming soon" holding page rather than a live destination. Revisit once the Skateboardmuseum frontend exists.

---

## Section 2 — Recurring "Line-CTA" component

A reusable text-link pattern used anywhere a non-boxed CTA is needed.

- **Default state:** 2px black bar + black text, no bounding box.
- **Hover/focus (desktop):** "highlight swipe" — the bar sweeps left-to-right along the text like a highlighter pen; bar and text shift color together as the swipe passes.
- **Color:** try **Coral `#F95D62`** first (already established as the rooms/booking accent elsewhere in this comp — reusing it avoids growing the palette). Keep as a CSS variable, not hardcoded, so it's trivial to swap if Coral doesn't read well live.
- **Used for:** "Discover our rooms", "Get Directions" (hero map), any future non-boxed text CTA.
- **Not used for:** compact nav actions like "ENTER" — those keep the boxed treatment.
- **Markup:** real `<a>` for navigation, real `<button>` for in-page actions. Never a styled `<div>`.
- **Motion:** respect `prefers-reduced-motion` — swipe reduces to an instant color change, no animated sweep.

---

## Section 3 — Hero

### Layout
- Two-panel layout: **Forest panel** (left, ~58%) + **Photo panel** (right, ~42%). No unifying border box (this supersedes the old teal/Ken-Burns/amber-border spec entirely).
- Forest panel background: **`#4F674F`**. White text on this background measures **6.2:1 contrast** — passes AA comfortably, no adjustment needed.

### Forest panel copy
- H1 headline + body paragraph, both `{ de, en }`, written in `du` register per the Voice/Tone guide.
- Copy is a Payload text field, not hardcoded — `du` register vs. collective tone is a content decision the client can adjust themselves when writing final copy, not a build blocker.

### Circular map teaser (inside Forest panel)
- Mapbox Static Images API, **light map style**.
- Hotel pin positioned roughly **40–45% down from the top of the circle**, not dead-center — accounts for the visual weight of the "Get Directions" bar sitting near the bottom of the circle.
- **"Get Directions"** — Line-CTA pattern (Section 2), try the highlight-swipe treatment here too. Links out to Google Maps (static-tile + click-to-open pattern — consistent with the existing neighbourhood-map approach elsewhere on the site, not a live embed).
- Short address line beneath the map — editable (see Payload schema below).

### Photo panel — rotation
- Rotates through multiple client-uploaded photos.
- **Animation: subtle zoom only, no pan.** CSS `@keyframes` on `transform: scale()` only (e.g. `1 → 1.04` over ~12–15s) — never animate `background-position`, `top/left`, or `width/height` (forces layout recalculation, causes jank regardless of device).
- **Must be CSS-only**, not JS-driven per-frame updates — CSS animations run on the compositor thread and stay smooth even under main-thread load; a JS `requestAnimationFrame` loop competing with other page work is the most likely cause of jumpiness seen in dev, and will get worse on weaker hardware, not better.
- **Preload the next image** in the rotation sequence before its transition begins, so decode isn't happening mid-animation (a second likely cause of visible hitching).
- Crossfade between two stacked, absolutely-positioned images via `opacity`.
- **Pause control required** (visible + keyboard accessible), or fully honor `prefers-reduced-motion` to stop rotation entirely — required since this changes automatically and runs longer than 5 seconds (WCAG 2.2.2).
- Per-slide caption (e.g. "LÜTZE · GROUND FLOOR") updates via `aria-live="polite"` alongside the image change, so screen reader users get the update too.
- **Radisson badge:** not a component to build. The "MEMBER OF RADISSON Individuals" mark currently visible is baked into one specific placeholder photo that will be replaced by the client. Do not build an overlay/badge element for this — any real Radisson branding placement (likely footer) is a separate future conversation.

### Payload schema — new collection: `heroSlides`

| Field | Type | Notes |
|---|---|---|
| `image` | Upload (media) | Required. Feeds `next/image` + `ImageObject.contentUrl` |
| `altText` | Group `{ de, en }` — Text | **Required, both locales.** Feeds `alt` attribute + `ImageObject.description` — highest-value AEO field per image |
| `venue` | Relationship → `venues` (optional) | If set, auto-derives the caption (e.g. "LÜTZE · GROUND FLOOR") from the venue's existing name/floor data — one source of truth, and the venue's own structured data / Wikidata `sameAs` flows through automatically |
| `captionOverride` | Group `{ de, en }` — Text (optional) | Only used if a slide isn't tied to a venue, or needs custom wording |
| `credit` | Text (optional) | Photographer/agency credit — feeds `ImageObject.creditText` |
| `order` | Number | Controls rotation sequence |
| `enabled` | Checkbox (default: true) | Lets client pause a slide without deleting — same hide-don't-delete pattern as Section 5 |

Unlimited slides — client can add as many as they want in Payload.

### Payload schema — additions to existing **hotel global**

| Field | Type | Notes |
|---|---|---|
| `getDirectionsLabel` | Group `{ de, en }` — Text | Editable button label |
| `heroShortAddress` | Group `{ de, en }` — Text | Short display address under the map (e.g. "Lützowplatz 17, Tiergarten") — distinct from the full structured address already in hotel global |

Lat/long is **not** a client-editable field — it's a fixed fact derived from the existing address data, not content.

---

## Section 4 — Rooms teaser ("Sleep & Relax")

### Shape
- One container, fixed aspect box, `overflow: hidden`.
- `border-radius: 9999px 0 0 9999px` (rounded-left / square-right, matching the comp). Using an oversized value rather than a calculated one lets the browser clamp automatically to whatever the container's actual height is — no need to hardcode a pixel radius per breakpoint.
- Image inside via `object-fit: cover`, not two stitched half-images.
- Desktop-only for now, per current comp scope — mobile treatment of this shape is a separate future decision (a full semicircle bulge may not read well at narrow widths).

### Rotation
- Same discipline as the hero: CSS-only `@keyframes`, `transform: scale()` only (subtle zoom, ~1 → 1.04 over 12–15s), crossfade via `opacity` between two stacked absolutely-positioned images, next image preloaded ahead of its transition.
- Pause control or full `prefers-reduced-motion` stop — same WCAG 2.2.2 requirement as the hero.

### Text behavior (syncs with photo change)
- **Room title:** typewriter-style character reveal on change — this is the one place in the section where that effect earns its keep, since it's short and punchy.
- **Price:** simple fade/slide on change, not typewriter — animating digits character-by-character tends to read as glitchy rather than charming.
- **Amenity icons (optional, if included):** simple opacity crossfade with the rest, no individual stagger for now — keep it simple until we see the typewriter title live and know how busy the block already feels.
- Entire changing text region wrapped in `aria-live="polite"` so a screen reader announces the new room name + price together, once per rotation — not per individual animated character.

### CTA
- "Discover our rooms" uses the Line-CTA pattern (Section 2) — bar + highlight-swipe, Coral, same as elsewhere.
- Links to the `/rooms` index page. Individual room detail pages (`/rooms/[slug]`) are deferred per the existing roadmap, so this should not attempt to deep-link to a specific room yet.

### Payload — additions to existing `rooms` collection
Rather than a new collection, this teaser reads from the existing 11-room-type `rooms` collection already built:

| Field | Type | Notes |
|---|---|---|
| `homepageTeaser.enabled` | Checkbox | Include/exclude this room from the homepage rotation without deleting the room itself |
| `homepageTeaser.order` | Number | Rotation sequence |
| `homepageTeaser.teaserImage` | Upload (optional) | Falls back to the room's first gallery image if left empty — avoids forcing a duplicate upload |
| `homepageTeaser.featuredAmenities` | Relationship → tags, limit ~3–4 | A curated subset for this compact teaser — not the full 50-item amenity set used on the room detail view |

Title and price reuse the fields that already exist on each room entry — no duplication.


---

## Section 5 — Hiding existing sections (not deleting)

Wrap the following in a feature flag (env var or Payload toggle) rather than removing from the codebase:
- Meetings block
- Three-card events row (FKKB / KTTK / Lütze)
- Neighbourhood map block
- FAQ accordion
- Footer (if a new footer accompanies this build, otherwise keep existing)

**Goal:** client-facing site shows only Header + Hero + Rooms teaser for now. Full homepage must be re-enableable later without rebuilding from scratch.
