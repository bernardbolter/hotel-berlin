# Hotel Berlin, Berlin — `VenueCompactCard` Build Brief
*For Cursor*
*Component: `VenueCompactCard` · Used on: `/here` hub — Tonight section (Cards 3+4) and basement section (Cards 11+12)*
*Resolves the naming collision flagged in `HotelBerlin_SpotlightCard_BuildBrief.md` open item 5 — this is the "existing `<VenueCard>`" referenced there, formally named and specced here*

---

## What this is

A small, half-width tap target — name, live status, one line of detail, link. Not a reading card, not an image card. This is deliberately the lightest card in the system: a guest scanning the page should be able to parse it in under a second and tap through.

It appears at two density levels, same component:

- **Compact** — Tonight section, KTTK + Lütze. Minimal: badge, title, one line.
- **Detailed** — basement section, KTTK + Wallride. One more line of detail (KTTK gets its pricing/equipment line; Wallride gets its permanent-exhibition description).

**Not to be confused with `SpotlightCard`** — that one always has an image and is used for the masonry grids on `/here/events` and the map pages. This component never has an image and is used only in these two fixed hub sections.

---

## Section 1 — Prop contract

```typescript
type VenueCompactCardProps = {
  density: 'compact' | 'detailed';
  badge: string;           // "Thu 19:00" / "B2 · Mon–Sun" / "Permanent" / live status text
  badgeVariant: 'schedule' | 'liveStatus' | 'static'; // drives dot-indicator vs plain text
  title: string;           // "KTTK" / "Lütze" / "Wallride"
  lines: string[];         // 1 line at compact density, up to 2 at detailed
  href: string;
  categoryToken: string;   // amber (KTTK), gold (Lütze), neutral gray (Wallride)
};
```

### Badge variants
- **`liveStatus`** — Lütze's "● Kitchen open" — dot indicator + text, color-coded (green dot open / muted dot closed), computed live from `deriveOpenClosed` (see `HotelBerlin_EventHelpers_BuildBrief.md`). Per that brief's resolution, Lütze returns multiple `OpenSegment`s (Bar/Kitchen) — this card's badge shows **Kitchen** specifically, not the bar-only default used elsewhere, since "can I eat right now" is exactly what this card exists to answer. This is a deliberate, explicit exception to the bar-only default, not an accidental deviation from it.
- **`schedule`** — KTTK's "Thu 19:00" (Tonight) or "B2 · Mon–Sun" (basement) — plain text, no dot, sourced from `getNextEventForVenue` for the Tonight variant or static venue info for the basement variant.
- **`static`** — Wallride's "Permanent" — plain text, no live computation, hardcoded per the venue's exhibition status.

---

## Section 2 — Content by instance

| Card | Density | Badge | Title | Lines | Links to |
|---|---|---|---|---|---|
| Tonight — KTTK | compact | `schedule`: "Thu 19:00" | KTTK | "Tournament night · €5 · B2" | `/here/events` |
| Tonight — Lütze | compact | `liveStatus`: "● Kitchen open" | Lütze | "Until 22:30 · reserve →" | `/here/dining` |
| Basement — KTTK | detailed | `schedule`: "B2 · Mon–Sun" | KTTK | "4 JOOLA tables · €5 / 30 min" / "Bats at Lütze bar" | `/here/events` |
| Basement — Wallride | detailed | `static`: "Permanent" | Wallride | "Half-pipe · Cold War Berlin skate history" / "By Skateboardmuseum Berlin" | `/here/wallride` |

**⚠️ Open item:** Tonight-KTTK's badge ("Thu 19:00") reads as a fixed schedule string in the original brief, but per the event-helpers module, this should resolve from `getNextEventForVenue` + `formatRelativeTime` rather than being hand-typed — confirm this card is meant to be live-computed like Lütze's, not manually set per event.

---

## Section 3 — Layout

```
┌──────────────────────┐
│ Thu 19:00             │  ← badge, category-token color
│ KTTK                  │  ← title, bold
│ Tournament night ·    │  ← line(s), muted, smaller
│ €5 · B2                │
└──────────────────────┘
```

- Half-width at `xs+`, full-width below `xs` (matches the existing Tonight/basement grid spec)
- Background tint per category token — amber for KTTK, gold for Lütze, neutral gray for Wallride
- No image, no left-border accent (distinct from the generic list card and from `SpotlightCard`) — flat tinted background is the only visual differentiator
- Detailed density simply allows a second `lines` entry; no other structural change

---

## Section 4 — Data sourcing

- **Lütze badge** — `deriveOpenClosed(venue.openingHours, now)`, filtered to the `Kitchen` segment specifically (explicit exception, see Section 1)
- **KTTK badge** — pending resolution of the open item above; either `getNextEventForVenue` (if live) or a static schedule string (if not)
- **Wallride badge** — static, no resolver needed
- All four cards' `href`, `categoryToken`, and static copy (equipment lists, descriptions) come from the `venues` collection directly — no new fields required beyond what `venue-time` already added (`spotlightLocation`, etc.)

---

## Section 5 — Accessibility

- Entire card is a single tap target (`<a>` wrapping the whole card), not just the title
- `liveStatus` dot is decorative — status conveyed in the text ("Kitchen open"), not by dot color alone
- Card content order in the DOM matches visual order (badge → title → lines), no visual-only reordering

---

## Open items — do not silently resolve

1. Whether Card 2 (Tonight hero, FKKB) and Card 5 (Art current show) should be replaced with direct `<SpotlightCard>` instances rather than built as separate `TonightHeroCard`/`ArtHeroCard` components — they resolve to the same shape as `SpotlightCard`'s venue resolver output. Recommend yes; confirm before building anything new for either.
2. KTTK's Tonight badge — live-resolved vs. static schedule string (see Section 2)
3. `VenueCard` references elsewhere in the codebase/docs should be updated to `VenueCompactCard` to match this brief and avoid the collision with `SpotlightCard`

---

## Definition of done

- [ ] One component, `density` prop drives compact (1 line) vs. detailed (up to 2 lines) — not two separate components
- [ ] Lütze badge pulls the Kitchen segment specifically from `deriveOpenClosed`, not the bar-only default
- [ ] Entire card is one tap target, not just the title text
- [ ] No image, no left-border accent — flat category-tinted background only, visually distinct from `SpotlightCard` and the generic list card
- [ ] All four instances (Tonight ×2, basement ×2) render from `venues` collection data, no hardcoded copy in the component itself
- [ ] Naming collision with `SpotlightCard` resolved — no remaining references to a generic `VenueCard` anywhere in the codebase
