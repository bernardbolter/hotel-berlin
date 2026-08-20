# Hotel Berlin, Berlin — `/here` Build Status v1
*Captured 2026-08-20, reported by Cursor against the codebase at `hotel-berlin-de`, reconciled against `HotelBerlin_HerePage_BuildBrief.md`, `HotelBerlin_HereHero_Addendum.md`, and `HotelBerlin_HerePage_ContentStrategy_v1.md`.*

**Bottom line:** `/here` today is Stay Info + Tonight + map + a separate FAQ page. Most of the 13-card grid from the build brief, and nearly all of the `/here/*` deep pages, are still ahead.

---

## Built and live in code

- **Route + i18n:** `/en/here` ↔ `/de/hier`, teal inside-nav context applied
- **Hub page** (`src/app/[locale]/here/page.tsx`):
  - Simple text hero (headline + subline from `messages`) — **not** the live clock / day-label / two-line live-event hero specced in the addendum
  - Stay Info card, real data via `getGuestStayInfo()` from the `hotel` Payload global
  - Tonight section — FKKB hero + KTTK / Lütze compact cards (`TonightSection` + `lib/here/tonight`)
  - Neighbourhood map (`NeighbourhoodMapSection` with `context="here"`)
  - Query params: `?context=dining|gallery` hides Stay Info; `?event=` shows an event row (slug only — not the full conference hero override from the brief)
- **`/here/faq`** — full guest FAQ page, standalone
- **Infra:** `here-grid` / `xs` breakpoint, Stay/Venue card components, section divider, footer "Already here?" links, integration tests for the stay-info and tonight helpers

## Specced / linked, not built as pages

Pathnames exist in the footer and URL structure but there is no `page.tsx` yet for any of:

`/here/events` · `/here/art` · `/here/dining` · `/here/explore` · `/here/getting-around` · `/here/gallery` · `/here/wallride`

## Not built yet

| Item | Status |
|---|---|
| Full hero (greeting, clock, two-line live event) | Spec only — no `hereHero` global exists |
| Art current-show + 4 floor-location mural cards | Spec only — needs `locationInBuilding` field on `artworks` |
| KTTK + Wallride basement cards (dedicated) | Spec only — venues currently only surfaced via Tonight section |
| FAQ accordion embedded on the `/here` hub | Only the standalone `/here/faq` page exists — no accordion on the hub itself |
| "Good to know" practical A-Z card | Strategy decision made 2026-08-20 — not implemented |
| Fingerboard ramps | Blocked on content from hotel team |
| Wundermart / Bett & Bike / Sauna & Fitness / Lütze-Garten | Open client confirmation |

---

## Recommended next build order

1. **Good to know card** — all source content already confirmed (old-site A-Z directory), no blockers
2. **Hero upgrade** — build the `hereHero` global + live clock/day-label/two-line event subline per the addendum, replacing the current static text hero
3. **FAQ accordion on the hub itself** — reuse the existing `/here/faq` content/component rather than leaving the hub without one
4. **Art current-show + floor cards** — blocked only on the `locationInBuilding` field + hotel team supplying floor/wing per piece
5. **KTTK + Wallride basement cards** — promote from Tonight-only to their own dedicated cards per the brief
6. **Fingerboard ramps** — once content is sourced from the hotel team
7. **Gap-fill pass** — confirm Wundermart, "Alle Restaurants," Bett & Bike, Sauna & Fitness, Lütze-Garten with the client
8. **Deep `/here/*` pages** — events, art, dining, explore, getting-around, gallery, wallride all still need actual pages behind their existing links

---

## Note

A separate status update came through in the same message about `/en/rooms` — room copy/amenities and all 11 room-type images (`standard-01.jpg`, `superior-01.jpg`, etc.) were re-seeded and deployed after the July seed had gone stale. Unrelated to `/here`; flagging here only so it isn't lost, not incorporated into this doc's tracking.
