# Hotel Berlin, Berlin — Design System

Source: `HotelBerlin_StyleGuide_v4.html` (Rev. 2, new forest green #56674F).
Covers the **visual system only** — brand voice/tone rules live in a
separate `HotelBerlin_VoiceToneGuide_v2.md` and aren't duplicated here.

Two contexts share this system with different accent temperatures:
**outside** (main site, prospect-facing — amber accent) and **`/here`**
(guest hub — teal accent). Component structure is identical; only the
accent token swaps.

**Scoped exception — Meet & Work:** the `/meetings` page tree (overview,
all 22 room detail pages, and the inquiry form) uses **teal**, not the
outside-context default of amber. This started as a single homepage
teaser block and was deliberately expanded to cover the full section —
it is not a bug or an inconsistency if you spot amber missing there.
Applied the same way as the `/here` swap: a context-level wrapper around
that route group, not per-component overrides. No other outside-context
page gets this treatment without an explicit decision logged here.

---

## 1. Color tokens

### Brand palette (source of truth — Pantone-backed)

| Token | Hex | Pantone / source |
|---|---|---|
| `--silver` | `#DEE1E7` | Pantone 303 C |
| `--amber` | `#F79B2E` | Pantone 130 U |
| `--black` | `#141414` | Pantone Black C |
| `--navy` | `#216A95` | Pantone 3015 U |
| `--green` | `#56674F` | rgb(86,103,79) — replaces old Pantone 341 U (`#347963`) |
| `--coral` | `#F95D62` | Pantone 1788 U |

### Site tokens (derived — what components actually reference)

| Token | Hex | Usage |
|---|---|---|
| `--teal` | `#2C6B7A` | `/here` accent, section labels, section borders |
| `--ink` | `#1A2B4A` | Headings, wordmark, nav |
| `--body-text` | `#2A3540` | All body copy |
| `--dim` | `#6B7C8D` | Captions, metadata, footers |
| `--rule` | `#D8DCE0` | Dividers, borders, outlines |
| `--bg-subtle` | `#F4F6F7` | Card backgrounds, inputs |
| `--teal-light` | `#EBF3F5` | Pullquote background, `/here` highlight callouts |
| `--amber-dark` | `#B87A2E` | Amber hover/pressed state |
| `--forest` | `#1E4234` | **Unassigned** — deeper alt to teal/green. Do not invent a use for this; candidates on the table are a fourth map-pin colour or an alt dark nav/footer treatment instead of Ink. Ask before applying it anywhere. |

### Category tokens (card left-border / label color — driven by CMS field, never hand-picked)

| Category | Token | Hex | Text on fill |
|---|---|---|---|
| Art · FKKB | `--cat-art` | `#2C6B7A` (teal) | White `#FFFFFF` |
| Sport · KTTK | `--cat-sport` | `#F79B2E` (amber) | Ink `#1A2B4A` — white fails AA |
| Music · Events | `--cat-music` | `#F95D62` (coral) | Ink `#1A2B4A` — white fails AA |
| Food · Lütze | `--cat-food` | `#B87A2E` (gold) | Ink `#1A2B4A` — white fails AA |
| Neighbourhood | `--cat-nbhd` | `#56674F` (green) | White `#FFFFFF` |
| Partnerships | `--cat-partner` | `#6B5B8D` (purple) | White `#FFFFFF` |
| Community | `--cat-community` | `#216A95` (navy) | White `#FFFFFF` |

**Rule:** card category color comes from the CMS category field, not per-card editorial choice. One category = one token, always. Badge fill and title underline read from that same value — never from venue.

`--cat-community` reuses `--navy` (Pantone 3015 U) rather than introducing a new hex. `--navy` is also the Conference status-badge fill — first time a brand token is claimed by both a status badge and a category token. No direct collision (different token families, different contexts), but flagged here so `tokens.json` owners are aware.

**Open — Skate / Wallride:** no `--cat-skate` (or equivalent) yet. Same gap as Community had. Leave unresolved until that frontend exists; do not invent a token here.

### Map pins

Live in `tokens.json` → `color.category.pin` and `src/lib/neighbourhood/categories.ts`. Glyphs are Lucide, white unless noted.

| Marker | Fill | Glyph |
|---|---|---|
| Hotel | Amber `#F79B2E` | Ink `#1A2B4A` `Home` |
| Art | `#2C6B7A` | White `Palette` |
| Museum | `#A08C38` | White `Landmark` |
| Shopping | `#5F4E68` | White `ShoppingBag` |
| Bar | `#D14A50` | White `Martini` |
| Restaurant | `#C1652F` | White `UtensilsCrossed` |
| Parks and Nature | `#56674F` | White `TreePine` |
| Sightseeing | `#E08A28` | **Ink** `#1A2B4A` `FerrisWheel` — white fails non-text 3:1 (2.68:1) |
| Party | `#9B3F6B` | White `PartyPopper` |
| Kids | `#4A90C4` (provisional) | White `Baby` |

**Hotel marker (signed off):** pin shape + `Home` glyph, **not** an “HBB” text badge. Fill is brand amber `#F79B2E`, glyph is ink `#1A2B4A`. Same treatment on `/` and `/here` — it does **not** track the page accent (forest vs teal). Person-pin fallback fill stays ink so endorser avatars never pick up amber.

**Sightseeing glyph (signed off):** keep fill `#E08A28`; switch the glyph to ink. Icon stays `FerrisWheel` pending a live-size legibility check.

The hotel fill is `color.map.hotelFill`. `color.map.hotelInk` is the glyph / person-pin ink, not the hotel disc.

### Accessibility — verified contrast pairs (WCAG 2.1 AA baseline, EAA-required)

| Pairing | Ratio | Normal text | Large text |
|---|---|---|---|
| Ink `#1A2B4A` on white | 13.9:1 | Pass | Pass |
| Body text `#2A3540` on white | 11.2:1 | Pass | Pass |
| Teal `#2C6B7A` on white | 5.0:1 | Pass | Pass |
| White on Teal | 5.0:1 | Pass | Pass |
| White on Amber `#F79B2E` | 2.6:1 | **Fail** — use Ink text on amber | Pass |
| Ink on Amber | 5.4:1 | Pass | Pass |
| White on Coral `#F95D62` | 3.4:1 | **Fail** for small text — use Ink | Pass |
| White on Food/gold `#B87A2E` | 3.6:1 | **Fail** for small text — use Ink | Pass |
| Ink on Food/gold `#B87A2E` | 3.9:1 | Short of 4.5:1 at 10px badge size; still the required pairing — never white | Pass |
| White on Green `#56674F` | 6.1:1 | Pass | Pass |
| Green on white | 6.1:1 | Pass | Pass |
| White on Navy `#216A95` | 5.9:1 | Pass | Pass |

Never place white text on Amber, Coral, or Food/gold at body-copy or badge sizes — this is the single most likely accessibility regression when this system gets reused, since all three look "brand-safe" but fail contrast at small sizes.

---

## 2. Typography

**Two fonts only:**

- **Archivo** (Google Fonts, variable, weights 300–700) — wordmark, all headings, navigation, labels, buttons, captions, data/tabular text.
- **Laica A** (Colophon Foundry, commercial license) — body copy, pullquotes, `/here` hero greetings, cover subtitles, italic emphasis.
  - **Only three cuts exist: Regular (400), Italic (400), Bold Italic (700 italic). There is no plain Bold.** Never call for `font-weight: 700` in Laica without `font-style: italic` — it will silently fall back to Bitstream Charter → Georgia and break the brand voice mid-page.

### Type scale

| Role | Size | Weight | Font |
|---|---|---|---|
| Display / hero | 48–56px | 700 | Archivo |
| H1 — page title | 36px | 700 | Archivo |
| H2 — section title | 24px | 700 | Archivo |
| H3 — card title | 18px | 700 | Archivo |
| Section label | 10.5px | 700, uppercase, 0.14em tracking | Archivo |
| Body lead | 17.6px | 400 | Laica A |
| Body regular | 15.2px | 400 | Laica A |
| Caption / meta | 12px | 400 | Archivo |
| `/here` greeting | 28–36px | 400 italic | Laica A |

Wordmark: Archivo Regular, always **"Hotel Berlin, Berlin" in full — never shortened**. Primary color Ink; reverse (dark backgrounds) White.

---

## 3. Spacing scale

Base unit 4px, Tailwind default scale, all multiples of 4.

| Step | Value | Use |
|---|---|---|
| 1 | 4px | Micro — icon gaps, tight inline |
| 2 | 8px | XS — between label and heading |
| 3 | 12px | SM — card internal padding |
| 4 | 16px | MD — between elements in a card |
| 6 | 24px | LG — section internal gap |
| 8 | 32px | XL — between cards in a grid |
| 12 | 48px | 2XL — section top/bottom padding |
| 16 | 64px | 3XL — hero padding, page margins |
| 24 | 96px | 4XL — between major page sections |

Corner radius: 2px on buttons/badges (sharp, not pill), 3px on cards/callouts, 4px on swatches, 99px (full pill) only on `.tag` chips — the one deliberately rounded component in the system.

---

## 4. Components

### Navigation

Single bar. Wordmark left (links to `/`) → four nav links (Rooms, Restaurant, Meetings, About) → "What's on" (text links to `/here`, separate chevron button opens dropdown — two distinct focusable elements, not one) → language toggle (EN / DE) far right.

**`/here` variant:** wordmark link replaced by "The hotel" (still links to `/`). Bridge nav item sits at position 4. Hamburger menu on mobile. **Teal accent throughout, replacing amber** — same palette, different temperature, this is the one systematic swap between the two contexts.

### Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | Amber | White | none |
| Secondary | Transparent | Ink | 1.5px Ink |
| Teal | Teal | White | none |
| Ghost | Transparent | Teal | 1.5px Teal |

All: Archivo 700, 0.8rem, 0.04em tracking, 2px radius, 10px/22px padding.

### Badges & tags

Badges (solid fill, uppercase, 2px radius): amber, teal, green, coral, navy solid variants + an outline variant (transparent bg, teal border/text). Tags (pill, 99px radius): outline style, `--rule` border, `--dim` text, white background — the one pill-shaped component in the system.

### Cards

White background, `--rule` 1px border, 3px radius. Left border on the image block (3px, category-token color) is the category signal — never a background-color card, always a left-border accent. Category label above the title uses the same category-token color as the border. Structure: image block → category label → title → meta line.

### Pullquote

3px left border in Teal, `--teal-light` (`#EBF3F5`) background, Laica A italic body text colored Teal. Max-width 580px — this is a constrained editorial element, not a full-bleed one.

### Callout / note box

`--bg-subtle` background, `--rule` 1px border, 3px radius, Archivo 0.78rem `--dim` text with Ink-colored bold lead-ins. The `/here`-specific variant (`.here-note`) uses `--teal-light` background with a `#C2D8DE` border instead — same shape, different temperature, consistent with the nav accent swap.

---

## 5. Known open items — do not silently resolve these

- **Forest `#1E4234` has no assigned use yet.** If a project needs a fourth map-pin color or a dark alt to Ink for nav/footer, this is the candidate — but confirm before applying it; it is explicitly unassigned in the source, not a placeholder for "designer's choice."
- This document does not cover brand voice/tone, iconography beyond what's implied by component structure, or motion beyond `prefers-reduced-motion` stopping hero animation — those live elsewhere in the project and should be supplied alongside this file if a Claude Design project needs the full picture, not just the visual system.
