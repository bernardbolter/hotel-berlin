# Hotel Berlin, Berlin — Design System

Source: `HotelBerlin_StyleGuide_v4.html` (Rev. 2, new forest green #56674F).
Covers the **visual system only** — brand voice/tone rules live in a
separate `HotelBerlin_VoiceToneGuide_v2.md` and aren't duplicated here.

Two contexts share this system with different accent temperatures:
**outside** (main site, prospect-facing — **navy** `#216A95`) and **`/here`**
(guest hub — **amber**, with a text-safe split — see `--ctx-accent` below).
Component structure is identical; one CSS custom property flips via
`data-context` on the route-group wrapper.

This inverts the previous assignment (outside = amber, `/here` = teal).
Teal `#2C6B7A` is now **only** a category token (`--cat-art`). Navy was
chosen as the outside accent so context signal and ART category signal
stay distinct (F1 in `HotelBerlin_HomeHereReconciliation_BuildBrief.md`).
`--cat-sport` stays amber; the overlap with the `/here` context accent is
accepted and flagged, not silently retinted.

**Meet & Work:** the `/meetings` teal carve-out is **folded back** into the
outside default. That exception existed only to differentiate meetings from
amber; with navy as the outside accent it no longer describes anything
coherent. The Meet & Work teaser may still use its own deep-teal section
colour (`#1E4B5D`) the same way Rooms uses terracotta — that is section
identity, not a context accent.

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
| `--ctx-accent` | outside `#216A95` / `/here` `#B87A2E` | Borders, rules, icon strokes, large display type. Set via `data-context`. |
| `--ctx-accent-text` | outside `#216A95` / `/here` `#9A6420` | Link text, labels, any type below 18.66px bold / 24px regular |
| `--ctx-accent-quiet` | outside `#EEF4F8` / `/here` `#FBF3E8` | Quiet fills / callout grounds |
| `--teal` | `#2C6B7A` | **Category only** (`--cat-art`). Not a context accent. |
| `--ink` | `#1A2B4A` | Headings, wordmark, nav |
| `--body-text` | `#2A3540` | All body copy |
| `--dim` | `#6B7C8D` | Captions, metadata, footers |
| `--rule` | `#D8DCE0` | Dividers, borders, outlines |
| `--bg-subtle` | `#F4F6F7` | Card backgrounds, inputs |
| `--teal-light` | `#EBF3F5` | Pullquote background |
| `--amber` | `#F79B2E` | Solid fills only, always with Ink `#141414` on top. Never white text on this. Never as type on `--panel-grey`. |
| `--amber-dark` | `#B87A2E` | Borders that sit on white (e.g. the /here WiFi password pill). Not type on grey (2.88:1). |
| `--amber-mid` / `--amber-text` | `#9A6420` | 4.98:1 on white — amber type on white; hairlines on grey at 42% alpha. **Not** small type on `--panel-grey` (4.00:1, fails AA). |
| `--amber-deep` | `#8A5818` | **4.84:1 on `--panel-grey`** — the only amber allowed as small type on the /here hero panel. 6.0:1 on white. Also the §4 Im Haus amenity-card eyebrow / icon. |
| `--panel-grey` | `#EAE6E0` | /here hero panel ground. Ink `#141414` on this is 14.8:1. |
| `--green` / `hbb-green` / `hbb-forest` | `#56674F` | Canonical green (F3). The old `#4A7A68` token is retired. Map pins, neighbourhood category, hero map disc. |
| `--forest` / `hbb-deep-forest` | `#1E4234` | Guest-hub dining band (heading, chips, service-card borders, SweepCta). 11.1:1 on white / white-on-forest. Cool against `/here` amber so the section reads as Eat & Drink, not as the hub chrome. Not a context accent. |
| `--espresso` / `hbb-espresso` | `#5C4033` | Home Eat & Drink / Lütze (heading, chip borders, SweepCta). Pair to `--forest`: same restaurant, opposite temperature, opposite photo side. |
| `--cardline` / `hbb-cardline` | `#E0DCD5` | AmenityCard and PersonCard 1px borders. Not `--rule`. |
| `--nbhd` / `hbb-nbhd` | `#56674F` | Hub people cards (eyebrow, room pill, CTA). Same hex as `--green` / `--cat-nbhd`; named for the section so it is not mistaken for a context accent. |

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

**Hotel marker (signed off):** pin shape + `Home` glyph, **not** an “HBB” text badge. Fill is brand amber `#F79B2E`, glyph is ink `#1A2B4A`. Same treatment on `/` and `/here` — it does **not** track the page accent. Person-pin fallback fill stays ink so endorser avatars never pick up amber.

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
| Navy `#216A95` on white | 5.9:1 | Pass | Pass |
| White on Forest `#1E4234` | 11.1:1 | Pass | Pass |
| Forest `#1E4234` on white | 11.1:1 | Pass | Pass |
| Amber-text `#9A6420` on white | 4.98:1 | Pass | Pass |
| Amber-deep `#8A5818` on panel-grey `#EAE6E0` | 4.84:1 | Pass | Pass |
| Amber-text `#9A6420` on panel-grey `#EAE6E0` | 4.00:1 | **Fail** — use `--amber-deep` for type on grey | Pass |
| Ink `#141414` on panel-grey `#EAE6E0` | 14.8:1 | Pass | Pass |
| Ink `#141414` on Amber `#F79B2E` | 5.4:1 | Pass | Pass |
| White on Amber-dark `#B87A2E` | 3.58:1 | **Fail** for small text — use `--amber-text` | Pass |

Never place white text on Amber `#F79B2E`, Coral, or Food/gold at body-copy or badge sizes — this is the single most likely accessibility regression when this system gets reused, since all three look "brand-safe" but fail contrast at small sizes. Never use `#B87A2E` as small link text; that is `--amber-text` `#9A6420`. Never use `#9A6420`, `#B87A2E`, or `#F79B2E` as type on `--panel-grey` — only `--amber-deep` `#8A5818` passes AA there.

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

Two rows on both contexts. Wordmark is invariant: **"Hotel Berlin, Berlin" in full** on both — never shortened, never swapped for "The hotel". The bridge does that job.

**Row 1** is context-local. Link colour stays neutral `#6B6762` — row 1 is not where the accent lives.

- Outside (`/`): Zimmer · Meetings · Essen & Trinken · Happenings · Nachbarschaft
- `/here`: Was ist los · So kommst du hin · Die Nachbarschaft · Galerie · Wallride

**Row 2** is the door to the other place, and nothing else. Prefix label + boxed action. Copy comes from `hotel.bridgeNav` (all four locale/direction values). Prefix and button use `var(--ctx-accent-text)` at 11–12px. Row 2 keeps the `#F3F3F3` bar on both contexts — identical treatment, only accent and copy differ.

**CTA** (`Jetzt buchen` / `Komm wieder`) stays Ink, not the context accent. `Komm wieder` still points at `/book` pending a destination decision (F5).

Mobile disclosure: row 1’s five links plus the single bridge. No duplicated cross-context set.

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

`--bg-subtle` background, `--rule` 1px border, 3px radius, Archivo 0.78rem `--dim` text with Ink-colored bold lead-ins. The `/here`-specific variant (`.here-note`) uses `--ctx-accent-quiet` with a `--ctx-accent` border instead — same shape, different temperature, consistent with the context accent swap.

---

## 5. Known open items — do not silently resolve these

- **Forest `#1E4234` is assigned** to the `/here` dining band (`hbb-deep-forest`). Do not reuse it as a fourth map-pin colour or a nav/footer stand-in for Ink without a new decision.
- **F1 (pending client confirm):** outside context accent is navy `#216A95` as implemented. `--cat-sport` remains amber; overlap with `/here` accent is flagged, not moved to coral.
- **F5:** `Komm wieder` still points at `/book`. Needs a rebooking/loyalty destination, or drop the CTA on `/here`.
- **`/here` map copy** (`map.hereTitle` / `map.hereCta`) is placeholder TBC with the client.
- **Photography gaps on `/here` bands:** Kunst im Haus floor locations need `locationInBuilding`; KTTK basement and Wallride halfpipe have stand-in images (Wallride marked placeholder). Fingerboard ramps still blocked on hotel-team content. Do not fill by ad-hoc image search.
- This document does not cover brand voice/tone, iconography beyond what's implied by component structure, or motion beyond `prefers-reduced-motion` stopping hero animation — those live elsewhere in the project and should be supplied alongside this file if a Claude Design project needs the full picture, not just the visual system.
