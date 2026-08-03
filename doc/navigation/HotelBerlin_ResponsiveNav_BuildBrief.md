# Hotel Berlin, Berlin — Responsive Navigation Build Brief
*For Cursor*
*Component: primary site nav — shared between `/` (Home) and `/here` (guest hub)*
*Implementation: `src/components/layout/SiteNav.tsx`, `NavSecondary.tsx`, `NavBridgeButton.tsx`; styles in `src/app/globals.css`*
*Supersedes: the single-row + "What's on" chevron-dropdown nav described in `DESIGN.md` Section 4 — see note at the end*

---

## What this is

One nav component, two contexts. Home and `/here` share identical structure and identical link content — wordmark, five main-site links, language toggle, CTA button, and a five-item secondary row. Differences: accent color, CTA label, bridge direction, and **how rows collapse** as width shrinks (Home and `/here` are not mirrored 1:1 at mid widths).

---

## Section 1 — Resolved decisions

| Item | Home (`context="outside"`) | `/here` (`context="inside"`) |
|---|---|---|
| Accent color | Amber (`#B87A2E`) | Teal (`#2C6B7A`) |
| Wordmark | "Hotel Berlin, Berlin" → `/` | "Hotel Berlin, Berlin" → `/` |
| CTA button | "Book Now" | "Plan your next stay" |
| Bridge item | "In the building? **ENTER**" — boxed, amber | "Not here yet? **STAY**" — boxed, teal |

Bridge treatment is symmetric — same boxed component, swapped color/label (`NavBridgeButton`).

---

## Section 2 — Full nav structure (desktop, ≥1024px)

```
Row 1: [Wordmark]  Rooms | Meetings | Eat & Drink | Happenings | Neighbourhood     [DE|EN]  [CTA]
Row 2: [Bridge — boxed]  What's on tonight | Getting around | Explore the area | Gallery | Wallride
```

Row 1 / Row 2 link content is identical on both pages. Only accent, CTA label, and bridge direction change.

**Scroll behaviour (desktop):** Row 2 (true guest secondary) hides on scroll down, returns on scroll up / near top. Implemented via `useNavScroll` + `.nav-secondary-clip`.

---

## Section 3 — Responsive breakpoints

Breakpoints used: **480** (`xs`), **768** (`md`), **1024** (`lg`). Hamburger only below **768px**.

### Below 480px — both contexts
- **Visible:** wordmark (smaller), language toggle, hamburger
- **Dropdown:** both groups (own-page group first) + CTA + language

### Home — 480–767px
```
Row 1: [Wordmark — desktop size]                              [Hamburger]
Row 2: Rooms | Meetings | … | Neighbourhood     [DE|EN]  [Book Now]
```
- Guest secondary (ENTER + stay links) in the hamburger dropdown only
- Primary strip **does not** hide on scroll

### `/here` — 480–767px
- Promoted secondary link in chrome: **"What's on tonight"**
- Rest in the dropdown (both groups)

### 768–1023px — both contexts, **no hamburger**
Three rows:
```
Row 1: [Wordmark]                              [DE|EN]  [CTA]
Row 2: Rooms | Meetings | …          ← bg `hbb-nav-bg` (#F3F3F3)
Row 3: [Bridge]  What's on …         ← bg `hbb-nav-bg-deep` (#E6E6E6), slightly darker
```
- Primary has dropped out of Row 1 into its own strip
- Secondary is a full third row (not in a drawer)
- On scroll, Row 3 (guest secondary) may hide; Row 2 primary strip stays
- At ≥1024, secondary returns to standard `hbb-nav-bg` as the sole lower bar

### ≥1024px — both contexts
- Full two-row desktop layout (primary beside wordmark; secondary below)
- No hamburger, no dropdown

---

## Section 4 — Hamburger + dropdown

### Hamburger button
- Present only **below 768px** (`.nav-hamburger.md:hidden`)
- Custom three-line icon — `.nav-hamburger`
- `cursor: pointer`
- **Hover:** outer lines expand apart slightly
- **Open:** box spins 90°; lines morph into an X
- Respects `prefers-reduced-motion`

### Dropdown behaviour
- Only below 768px
- Slides open/closed under the nav
- **Does not** lock `body` scroll — page keeps its scrollbar; site can scroll underneath
- Escape closes; closes automatically at ≥768px
- `role="region"`, `inert` when closed

### Dropdown content grouping
Keep Row 1 and Row 2 as two labeled groups; **own-page group first**.

| Width | Home dropdown | `/here` dropdown |
|---|---|---|
| <480 | Both groups + CTA | Both groups + CTA |
| 480–767 | Stay group only (primary is in strip) | Both groups (one link promoted in chrome) |

---

## Section 5 — Implementation notes

- **Context prop:** `outside` | `inside` → `--nav-accent`, CTA copy, bridge, drawer order
- **Book Now / CTA:** `.book-now-btn` must **not** set `display` in CSS — use wrappers / `inline-flex book-now-btn`
- **Secondary links:** Payload Inside Navigation global via `getSecondaryNavLinks` (`SiteNavWithData`)
- **Key files:**
  - `src/components/layout/SiteNav.tsx`
  - `src/components/layout/NavSecondary.tsx`
  - `src/components/layout/NavBridgeButton.tsx`
  - `src/hooks/useNavScroll.ts`
  - `src/app/globals.css` (`.nav-secondary-clip`, `.nav-hamburger`, `.nav-drawer-*`)

---

## Section 6 — `DESIGN.md` update needed

`DESIGN.md` Section 4 currently describes a **single-row** nav with "What's on" as a text link plus a separate chevron-triggered dropdown — that's not what's built. Update `DESIGN.md` to match this brief so it doesn't keep describing a structure nobody's shipping.

---

## Open items — do not silently resolve

1. `DESIGN.md` Section 4 rewrite — still outstanding
2. Exact boxed-button sizing/padding for "STAY" vs "ENTER" — should remain the same component (done in code; confirm visually in both contexts)
3. Whether Home mid-width should ever reintroduce a single promoted link below 480 — currently none

---

## Definition of done

- [x] One nav component serves both `/` and `/here`, driven by a context prop
- [x] Wordmark reads "Hotel Berlin, Berlin" on both pages, both linking to `/`
- [x] CTA reads "Book Now" on Home, "Plan your next stay" on `/here`
- [x] Bridge button ENTER (amber) / STAY (teal) — same component, swapped props
- [x] Below 480px: wordmark, language, hamburger; full groups in dropdown
- [x] Home 480–767: desktop-sized wordmark + hamburger; primary + lang + Book Now on strip; secondary in dropdown; strip persists on scroll
- [x] 768–1023: three rows, no hamburger — wordmark/lang/CTA | primary | secondary
- [x] `/here` 480–767: promoted "What's on tonight"
- [x] ≥1024px: full two-row, no hamburger
- [x] Hamburger only below 768px: pointer, expand-on-hover, spin-to-X
- [x] Dropdown animates open/close; no body scroll lock / no scrollbar layout shift
- [x] Drawer groups labeled, own-page group first
- [x] Accent driven by the same context prop
- [ ] `DESIGN.md` Section 4 updated to match
