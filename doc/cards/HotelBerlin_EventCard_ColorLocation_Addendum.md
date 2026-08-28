# Hotel Berlin, Berlin — Event Card: Category Colour Fix + Location Reposition (Addendum)

**Supersedes:** category-colour rendering on the `/here` events grid (component TBC — see Step 0), and the current placement of the bottom venue/location meta row.

**Context:** The live event cards on `/here` are rendering category badges in colours that don't match any of DESIGN.md's six category tokens — likely a placeholder set that never got swapped for the real ones. Fixing that surfaced a real gap (Community has no defined token) and two smaller bugs (a contrast failure on Food, and the underline apparently following venue instead of category). Bundled with a layout fix: the location line currently sits alone at the bottom of the card, disconnected from — and partly duplicating — the venue identity row at the top.

---

## Step 0 — Diagnostic (do this first, do not skip)

Per `claude_HotelBerlin_EventCard_ContentGuide.md`, only two card components are confirmed live: `VenueCompactCard` and `TonightHeroCard`. Neither matches what's rendering on the `/here` events grid (image with top-right badge, title, coloured underline, venue+monogram row, description, conditional bottom meta row, no CTA). Before applying anything below:

```
Search the codebase for the component rendering the /here events grid (4-up cards:
image, category badge top-right, title, coloured underline, venue + monogram row,
description, conditional bottom meta row with venue + location). What is it
actually called? File:line.

Where do its badge colour and underline colour come from — a categoryToken /
category prop, a venue field, or something else? Are badge and underline
sourced independently or from the same value?

Where does the bottom meta row's venue name + location come from — is the
venue name a duplicate render of the same field already shown in the identity
row above, or two different fields? Is location a static per-venue field or
entered per-event?
```

Report findings before touching anything. If badge/underline colour turns out to already be category-driven, the mismatch seen live (e.g. a Community event showing a gold underline) may be a data problem — wrong category assigned, or wrong token value seeded — not a component-logic problem, and the fix below changes accordingly.

---

## 1. Category token — add Community

DESIGN.md's `Category tokens` table and `tokens.json` → `color.category` are both missing `community`, though it's a live category in the `events` collection schema (maps to schema.org `Event`). Add:

| Category | Token | Hex | Text on fill |
|---|---|---|---|
| Community | `--cat-community` | `#216A95` (navy) | White `#FFFFFF` — passes AA, ~5.9:1 |

This reuses the existing `--navy` brand token (Pantone 3015 U) rather than introducing a new hex — just a second, separate application of it. `--navy` is currently only used for the "Conference" status badge, a different token family rendering in a different context, so there's no direct collision — but flag it to whoever owns `tokens.json` since it's the first time a brand token has been claimed by both a status badge and a category token.

If the component has a TypeScript union for category, it should now read:

```ts
type EventCategory =
  | 'art'
  | 'sport'
  | 'music'
  | 'food'
  | 'neighbourhood'
  | 'partnerships'
  | 'community';
```

`skate` (future Wallride/Skateboardmuseum Berlin category) has the same gap. **Leave unresolved** — Wallride's frontend doesn't exist yet, not urgent.

## 2. Fix Food badge contrast

`--cat-food` (`#B87A2E`) fails AA for white text at small sizes (~3.6:1) — the same problem DESIGN.md already documents for Amber and Coral, just not listed for Food/gold. Wherever the Food/Lütze badge renders, switch its text to Ink (`#1A2B4A`), not white. Add this pairing to DESIGN.md's accessibility table — it was missing from the original audit.

## 3. Underline must follow category, never venue

Badge fill and title underline should both read from the same category value for a given card — never two independent lookups. Visible symptom to check for: a Community event hosted at Lütze currently shows a gold underline, which is the Food token, not Community's. Confirm (or fix, per Step 0's findings) that both are driven by one source.

## 4. Location moves into the identity row

**Current:** venue name renders twice — once in the top identity row (monogram + venue name), again in a bottom meta row (`venue · location`) separated from it by the full description.

**Change:** drop the bottom meta row. Append location to the top identity row instead:

```
[monogram]  VENUE NAME · Ground floor, Lützowplatz 17
DO., 27 AUG · 19:00                                      ← unchanged, event-specific
description...
```

If `location` resolves from a static per-venue field (e.g. the same way `venue.spotlightLocation` resolves elsewhere in the system), this is a render-position change only — no new field needed. If Step 0 finds it's entered per-event instead, sourcing is unaffected but worth flagging for the seed data process.

---

## Definition of done

- [ ] Step 0 audit completed — actual component confirmed, findings reported before other work started
- [ ] `--cat-community` added to DESIGN.md and `tokens.json`, navy `#216A95`, white text
- [ ] Food badge text switched to Ink; DESIGN.md accessibility table updated with the Food/gold pairing
- [ ] Badge and underline confirmed (or fixed) to read from one category value, never venue
- [ ] Bottom meta row removed; location appended to the identity row
- [ ] Screenshot QA across all seven categories (six existing + Community) — contrast check on each badge at actual render size, not just the token's nominal ratio
- [ ] Skate/Wallride token gap logged as a known open item, not resolved here

## Open items — do not silently resolve

- Skate/Wallride category token — deferred, no urgency until that frontend exists
- Whether `location` is a static per-venue field or entered per-event — confirmed in Step 0
- Whether a Line-CTA belongs on this card now that the bottom row is freed up — not addressed here, flagged for a follow-up conversation
