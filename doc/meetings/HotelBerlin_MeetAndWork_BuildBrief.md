# Hotel Berlin, Berlin — "Meet & Work" Component Build Brief
*For Cursor / Claude Opus*
*Component: homepage — "Meetings block" (Homepage V2 brief, Section 5)*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*

---

## What this is

A single-instance editorial section on the **homepage** — kicker headline, a short pitch (subhead + body), a supporting photo of a meeting space, and a teaser link out to the full `/meetings` page. Same architectural role as the "Sleep & Relax" Rooms teaser (Homepage V2, Section 4): a homepage summary block linking out to its dedicated page, not the page itself.

**RESOLVED — placement:** this is the "Meetings block" listed in Homepage V2 Section 5's hide-don't-delete set, previously behind a feature flag. That flag is now off — this design is what fills the block. Remove/retire the placeholder flag wrapper for this block specifically; the other Section 5 items (three-card events row, neighbourhood map block, FAQ accordion) stay flagged off until their own builds are ready — don't unflag those as a side effect of this change.

**RESOLVED — color choice:** this component uses the dark teal panel (`~#2C6B7A`) intentionally. This is a **scoped, component-specific exception** — teal here does not change the site-wide convention documented in `DESIGN.md` (teal = `/here` guest-hub accent, amber = main site accent). No other component, page, or the `/here` nav/buttons/badges/callouts are affected. `DESIGN.md` itself does not need updating for this.

---

## Section 1 — Desktop layout (1024px+)

```
┌───────────────┬─────────────────────────────────┐
│ Meet & Work    │                                    │
│ (white bg,     │                                    │
│  Laica A)      │         photo — meeting room        │
├───────────────┤         (large radius on bottom-  │
│ Serious        │          left corner only, reveals │
│ business,      │          teal panel behind it)     │
│ playful spaces │                                    │
│                │                                    │
│ Business is in │                                    │
│ our DNA. With  │                                    │
│ over 4,000 m²  │                                    │
│ ...            │                                    │
│ (teal panel,   │                                    │
│  white text)   │                                    │
└───────────────┴─────────────────────────────────┘
                              │ All meeting rooms →
```

- **Header strip** — white background, top-left, Laica A serif, contains only the kicker ("Meet & Work"). Not part of the teal panel.
- **Teal panel** — sits below the header strip, extends wider than it (runs partway under the photo's left edge). Contains subhead (bold, white, Archivo) + body paragraph (white/85% opacity, Archivo).
- **Photo** — right-hand column, full section height, large corner radius on one corner only (bottom-left, per the comp) using the same oversized-radius technique as the rooms teaser (`border-radius` on one corner, `overflow: hidden`, `object-fit: cover` — not a clipped/masked image). The radius is generous enough that the teal panel shows through behind it at that corner.
- **CTA** — "All meeting rooms" sits below both blocks, right-aligned under the photo, small vertical accent bar to its left (same visual language as other section links on the site — confirm against the Line-CTA component before treating it as a new pattern; if it's a plain link rather than the bar+swipe-hover pattern, note that as a deliberate variant, not an inconsistency).

**Note on fidelity:** this is read from a flattened PDF export, not the source Figma file — exact panel widths, the corner-radius value, and the overlap amount between teal panel and photo should be pulled from Figma directly before Cursor builds pixel values. Treat the proportions here as close-enough-to-build-from, not exact.

---

## Payload schema

Lives on the **homepage** — add as a group on the existing `hotel` global, same convention used for the hero's `getDirectionsLabel`/`heroShortAddress` additions in Homepage V2:

| Field | Type | Notes |
|---|---|---|
| `kicker` | Group `{ de, en }` — Text | "Meet & Work" |
| `subhead` | Group `{ de, en }` — Text | "Serious business, playful spaces" |
| `body` | Group `{ de, en }` — Textarea | Short pitch paragraph |
| `photo` | Upload (media) | Required |
| `photoAlt` | Group `{ de, en }` — Text | Required both locales — AEO `ImageObject.description` |
| `ctaLabel` | Group `{ de, en }` — Text | "All meeting rooms" |
| `ctaLink` | Fixed → `/meetings` | Teaser-to-page link, same pattern as the Rooms teaser's CTA to `/rooms` — no relationship field needed unless `/meetings` later splits into sub-pages |

---

## Section 2 — Tablet (768–1023px)

The two-column split holds, but the layered "teal peeks out from behind the photo" detail is the first thing to simplify — it depends on generous horizontal space to read as intentional rather than as a rendering glitch at this width.

- Collapse the white header strip and teal panel into **one continuous block** — kicker, subhead, and body all sit inside the teal panel, stacked, no separate white strip above it. Removes one visual seam without losing any content.
- Photo and teal panel become the same height, flush at the bottom — no offset/reveal notch. Corner radius moves to a single corner (top-right of the photo, or whichever reads cleanest against a flush bottom edge) rather than the layered cutout.
- CTA stays right-aligned beneath, same as desktop.

## Section 3 — Mobile (below 768px)

Full stack. One sequencing decision worth flagging rather than assuming:

**Photo first, then text block.** This differs from the hero's text-first stacking order — deliberately. The hero's H1 carries page-level orientation and AEO weight, so it leads. This section is a feature/amenity pitch further down the page, where a strong photo is more likely to hold attention on a small screen than an eyebrow headline is. If that reasoning doesn't hold up against the rest of the page's mobile flow, flip it — it's a one-line change, not a structural one.

- Photo — full width, moderate height (not full-bleed hero-height), single corner radius or none at all (the layered reveal trick doesn't have room to work at this width).
- Teal block — full width below, kicker + subhead + body all stacked, left-aligned.
- CTA — full width tap target, left-aligned (not right-aligned — avoids an orphaned right-aligned link under a full-width stack).

---

## Open items summary (do not silently resolve)

1. ~~Does this replace the homepage's flagged-off "Meetings block," or is it `/meetings`-page-specific?~~ **Resolved** — it's the homepage block. See note above.
2. ~~Is teal intentional here despite being the documented `/here` swap color?~~ **Resolved** — scoped exception, confirmed. See note above.
3. Exact corner-radius value and teal/photo overlap amount — pull from Figma, not this PDF.
4. CTA target confirmed as `/meetings`. Still open: whether it should use the standard Line-CTA hover treatment or is a deliberate plain-link variant.
5. Mobile stacking order (photo-first) — confirm against the rest of the homepage's mobile flow once this sits alongside the other re-enabled sections.
