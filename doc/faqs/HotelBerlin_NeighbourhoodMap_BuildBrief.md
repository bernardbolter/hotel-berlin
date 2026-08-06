# Hotel Berlin, Berlin — Neighbourhood Map Build Brief
*For Cursor*
*Components: `NeighbourhoodMapTeaser`, `MapPin`, `PlaceInfoCard` · Pages: homepage/`/here` teaser instance, `/nachbarschaft` full page (existing)*
*Stack: Next.js 15 · Payload CMS 3 · Mapbox GL JS · Tailwind CSS*

---

## What this is

A revision of the neighbourhood map's visual treatment, covering two distinct surfaces that were previously conflated:

1. **Teaser** — a small, editor-curated set of places (5), shown on the homepage and on `/here`, each context with its own independently-picked set. No pagination, no filtering beyond the category legend. Links out to the full page.
2. **Full page** — `/nachbarschaft`, already specced in the Nachbarschaft/You-Me-Berlin brief (Section 4): full Mapbox GL instance, category + distance-tier filters, numbered pagination. **Not rebuilt here** — only the pin/legend/info-card visual treatment below applies there too, on top of the existing filter/pagination logic.

This brief also corrects a live-site gap: the current build shows category places with no visible recommender at all, despite `endorsements` already being `hasMany` in the `neighbourhood-places` schema. The revised card surfaces every endorser, not just one.

Accepted design reference: `HotelBerlin_NeighbourhoodMap_DesignRevision_v4.html` (four rounds of iteration — v1 single-color pins → v2 split legend → v3 category-token colors → v4 muted tokens, hover labels, floating card, transit info). Build against v4.

---

## Section 1 — Payload schema additions to `neighbourhood-places`

Two additions on top of the existing collection (see Nachbarschaft brief Section 1.1 for the rest — `description`, `endorsements`, `walkingMinutes`, etc. already exist and don't need to be recreated).

**Status:** `transit`, `homepageTeaser`, and `hereTeaser` added to `NeighbourhoodPlaces.ts` + types. `getTeaserPlaces` lives at `src/lib/places/getTeaserPlaces.ts`. Teaser UI migrated to `getMapTeaserPlaces` (homepage + `/here`); legacy `featuredOrder` remains as homepage fallback until seed migration.
```ts
// additions to collections/NeighbourhoodPlaces.ts
{
  name: 'transit',
  type: 'group',
  admin: { description: 'Optional — render the transit row in PlaceInfoCard only when this is populated. Do not block launch on backfilling this for all places.' },
  fields: [
    { name: 'minutes', type: 'number' },
    { name: 'station', type: 'text', admin: { description: 'e.g. "Wittenbergplatz"' } },
    { name: 'line', type: 'text', admin: { description: 'e.g. "U1" — free text, not a select, since S-Bahn/bus lines don\'t fit a clean enum.' } },
  ],
},
{
  name: 'homepageTeaser',
  type: 'group',
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number' },
  ],
  admin: { description: 'Independent from hereTeaser below — the hotel can feature a different 5 places per context. Same pattern as rooms.homepageTeaser.' },
},
{
  name: 'hereTeaser',
  type: 'group',
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number' },
  ],
},
```

**Note on `transitMinutes`:** the original AEO survey draft anticipated a `transitMinutes` field that didn't make it into the collection as actually built. This brief reintroduces it as a `transit` group (minutes + station + line) rather than a bare number, since "4 min" alone is meaningless without knowing which station/line it refers to.

**`description` already exists** on this collection (localized text, per the original spec: "1–2 sentences — editorial, not copied"). It's populated in the seed data but wasn't being rendered on the map card — Section 3 below adds it to `PlaceInfoCard`. No schema change needed for this part, just wiring it into the component that was missing it.

---

## Section 2 — Category color tokens (map-specific, **signed off**)

These are **not** the existing card category tokens from `DESIGN.md` — they're a deliberately muted/darkened variant for pins specifically. White glyphs need more contrast against the map's green terrain basemap than they do sitting flat on a white card, and the existing saturated tokens (coral, amber) read too bright/candy-like at pin scale against that background.

| Category | Existing card token | Pin token (signed off) | Reasoning |
|---|---|---|---|
| Art · FKKB | `--cat-art` `#2C6B7A` | `#1F4E59` | Darker teal — already close to the existing (unused) teal hover shade elsewhere in the system |
| Sport · KTTK | `--cat-sport` `#F79B2E` | `#B87A2E` | This one already exists as `--amber-dark` — no new token needed |
| Music · Events | `--cat-music` `#F95D62` | `#A6383D` | New — no existing dark variant of coral in the system |
| Food · Lütze | `--cat-food` `#B87A2E` | `#7A5220` | New |
| Neighbourhood | `--cat-nbhd` `#56674F` | `#3E4A39` | New |
| Partnerships | `--cat-partner` `#6A5870` | `#4F3F54` | New |

**Status:** Signed off. Live in `tokens.json` → `color.category.pinMuted` and `src/lib/neighbourhood/categories.ts` (`PIN_MUTED_TOKENS` / `CATEGORY_PIN_COLOR`). Card tokens unchanged. Hotel marker = `color.map.hotelInk` `#1A2B4A`.

---

## Section 3 — `MapPin` component

```typescript
type MapPinProps = {
  variant: 'hotel' | 'category';
  category?: keyof typeof pinCategoryTokens; // required if variant is 'category'
  icon: LucideIcon;
  label: string;         // place name, or "Hotel Berlin, Berlin"
  isActive: boolean;
  onSelect: () => void;
};
```

- Hotel pin: 42px, ink fill, house glyph, always-visible label tag above it (never hover-gated — it's the one fixed reference point on the map).
- Category pins: 32px, muted category-token fill (Section 2), glyph per category (reuse the same Lucide icon already assigned per category where one exists in the codebase; confirm/assign for any category missing one).
- **Label visibility:** category pin labels are hover/focus-only — hidden by default, shown on `:hover` and `:focus-visible` via opacity transition (see v4 mockup `.pin-tag.hover-only`). This is a genuine UX trade-off — it declutters the map at rest but means a place's identity isn't visible without interaction.
- **Accessibility requirement, non-negotiable regardless of the hover-only visual treatment:** each pin is a real button with `aria-label="{place name}, {category}"` — a screen reader user gets the name every time regardless of hover state, and keyboard focus must trigger the same visible label reveal as mouse hover (`:focus-visible`, not `:hover` alone).
- **Touch devices:** first tap reveals the label (same as focus), second tap on the same pin opens the `PlaceInfoCard`. Do not require a hover state that doesn't exist on touch to be the only way to learn a pin's identity.

---

## Section 4 — `PlaceInfoCard` component

Floating card, not a layout column — fixed width (268px), drop shadow, positioned absolutely inside the map container (top-right by default). Replaces the old bottom-left popup entirely.

```typescript
type PlaceInfoCardProps = {
  image: { src: string; alt: string };
  category: { label: string; token: string };
  name: string;
  description: string;          // NEW — from the existing `description` field, previously unrendered
  walkingMinutes?: number;
  transit?: { minutes: number; station: string; line: string };
  endorsements: { person: { name: string; slug: string; initials: string }; }[]; // hasMany — render one chip per entry, not just the first
};
```

- **Description text** — 1–2 sentences, sits directly under the title, above the transit row. This was already in the data model (`neighbourhood-places.description`) and already in the seed data — it just wasn't being displayed. No new content work needed to add this, only rendering.
- **Transit row** — walking icon + minutes, transit icon + minutes + station/line, side by side, divider below. Renders conditionally: if `transit` is absent, show only the walking time, full width, no empty gap where the transit item would have been.
- **Recommender chips** — one per `endorsements` entry, wrapping onto a second line if there are more than ~2. Each chip links to `/you-me-and-berlin/[person-slug]`.
- **Mobile behavior:** the floating-over-the-map treatment only works with room to spare. Below the `md` breakpoint, the card should not float over the map — it should render below it, full width, in normal document flow. A floating card at mobile width would obscure most of a full-width map.

---

## Section 5 — Teaser resolver and placement

```ts
// lib/places/getTeaserPlaces.ts
export function getTeaserPlaces(allPlaces: NeighbourhoodPlace[], context: 'homepage' | 'here', limit = 5) {
  const field = context === 'homepage' ? 'homepageTeaser' : 'hereTeaser';
  return allPlaces
    .filter((p) => p[field]?.enabled)
    .sort((a, b) => (a[field]?.order ?? 0) - (b[field]?.order ?? 0))
    .slice(0, limit);
}
```

- Homepage instance: unflag from Homepage V2's Section 5 hide-don't-delete list (same resolution pattern as Meet & Work and the FAQ accordion in that same list) — this build is what fills it.
- `/here` instance: same component, `context="here"`, teal-context styling per the existing nav/accent-swap convention — separate curated set via `hereTeaser`.
- Both end with the same "Explore the neighbourhood" / "See the full map" line-CTA linking to `/nachbarschaft`, no pagination on the teaser itself — pagination lives only on the full page, which already has it.

---

## Section 6 — JSON-LD

No new builder function needed. `buildNeighbourhoodListGraph`/`buildPlacePageGraph` (already in `aeo-schema`) already consume `description` and `endorsements` — confirm they're pulling from the same fields this card now renders, so the visible card and the schema stay in sync (same principle already established for the FAQ build: never let markup describe more or less than what's on screen). The teaser's JSON-LD should cover only the 5 places actually shown, not the full dataset — same scoping rule as the FAQ mini block.

---

## Open items — do not silently resolve these

1. ~~**The six muted pin tokens need sign-off**~~ — **signed off.** Live in `tokens.json` → `color.category.pinMuted`.
2. **Transit data doesn't exist yet** for the 91-place dataset — `transit` group is optional and the card handles its absence gracefully, but it's a real content-gathering task, not a quick backfill.
3. **Touch-device label reveal** (first-tap-shows-label, second-tap-opens-card) is a real interaction pattern to build and test, not just a hover CSS rule — flag for explicit QA on a touch device before considering this done.
4. **Hover-only labels are a genuine trade-off**, not a strictly-better change — decluttering the map at rest costs discoverability at a glance. If user testing says this is worse than always-on labels once real content is loaded (all ~20 seed places, eventually 91), revisit rather than treating this brief as final.
5. **Icon/glyph assignment per category** — v4 reuses illustrative Lucide glyphs per category but doesn't confirm these against whatever icon set is already assigned elsewhere in the codebase (e.g. the footer's Lucide icon picker work). Reconcile before implementation so the same category doesn't end up with two different glyphs in two different places.
6. **Pin clustering at scale** — this brief covers the ~5-item teaser and the current ~20-seed dataset on the full page. Clustering behavior at the eventual 91-place scale is still the open design question already flagged elsewhere in the project state — not solved here.
7. **"Kids" category / taxonomy question** from the original Nachbarschaft brief is still unresolved and affects which glyph/color this component needs to support — carried forward, not re-litigated here.
