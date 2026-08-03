# Hotel Berlin, Berlin — `SpotlightCard` Build Brief
*For Cursor*
*Component: `SpotlightCard` · Used on: `/here/events` ("What's on"), below the map on `/nachbarschaft` and `/you-me-and-berlin`*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*

---

## What this is

`SpotlightCard` is one abstracted component that renders **venues, events, and people** — a distinct, larger card type from the generic list card already specced in `DESIGN.md` (image → category label → title → meta line, left-border accent). It exists for content that needs richer per-item treatment: a monogram or identity mark, a two-line meta block, and a longer description — not for simple paginated list rows.

**Do not confuse this with the existing `<VenueCard>` referenced in the `/here` basement section brief.** That's a lighter compact card (badge + title + one meta line). This is a different, larger shape. Rename the basement one if it collides in code (e.g. `VenueCompactCard`).

The component itself has **no knowledge of venues, events, or people** — it renders one shared visual shape from a common prop contract. All type-specific logic lives in three separate *resolver* functions that each produce the same shape.

---

## Section 1 — The shared shape

```
┌───────────────────────────────┐
│  ⬤ ART        (circle badge,  │
│                top-left,      │
│    [photo]     ~90% opacity)  │
│                                │
├───────────────────────────────┤
│  [mark]  TITLE                │  ← identityMark + title, flex row
│                                │
│  PRIMARY META LINE             │  ← teal, uppercase, dot-joined
│                                │
│  Description text, one         │  ← Laica A paragraph
│  paragraph...                  │
│  ─────────────────────────     │  ← hairline, only if secondaryMeta exists
│  SECONDARY META LINE           │  ← conditional second row
│                                │
│  │ CTA LABEL                   │  ← Line-CTA, category-token color
└───────────────────────────────┘
```

### Prop contract

```typescript
type SpotlightCardProps = {
  image: { src: string; alt: string };
  badge: { label: string; categoryToken: string }; // circle, top-left, ~90% opacity fill
  identityMark?: { src: string; alt: string };      // optional flex item — see Section 2
  title: string;
  primaryMeta: string;                              // always present when card is visible
  description: string;
  secondaryMeta?: { left: string; right: string };  // optional — renders divider only if present
  cta: { label: string; href: string; categoryToken: string };
};
```

Every field the component itself needs is already resolved by the time it reaches this shape — the component does no data fetching, no time logic, no conditional business rules. That all lives in the resolvers below.

### How each source maps onto the shape

| Slot | Venue | Event | Person |
|---|---|---|---|
| `image` | venue photo | event photo | portrait |
| `badge` | category (Art/Sport/Food) | category (Music/Art/Sport) | `type` field (artist/curator/host) |
| `identityMark` | venue monogram | **hosting venue's monogram**, reused | *(skipped — see note)* |
| `title` | venue name | event title | person name |
| `primaryMeta` | status + admission ("On now · Free entry") | date + time | role ("Curator" / "Local") |
| `secondaryMeta` | location + schedule | venue + location | room number |
| `description` | venue/exhibition blurb | event description | bio line |
| `cta` | "Explore [venue]" | "See event" / booking link | link to `/you-me-and-berlin/[slug]` |

**Two judgment calls baked into this table — confirm before build:**
- **Event `identityMark` defaults to the hosting venue's monogram** (a Lütze event shows the Lütze mark), not blank. This is a nice connective-tissue touch given how much the AEO work leans on venue relationships already, but it's an assumption, not a stated requirement.
- **Person `identityMark` defaults to none.** The portrait already carries identity, so adding a small badge (initials, room number) felt redundant. If you do want one there later, the flex-row math in Section 2 needs revisiting — right now it assumes the slot is either a small monogram or fully absent, not a second small avatar sitting next to a portrait.

---

## Section 2 — Layout behavior

### Image block
- Top corners rounded only (arch-topped motif, matches rooms teaser)
- Badge: circle, top-left, **~90% opacity** fill in the category token color — holds contrast regardless of what's behind it, without reading as a solid sticker
- Badge text: uppercase, dark stop of the same token, per the existing category-token contrast table in `DESIGN.md`

### identityMark + title row
- `display: flex; align-items: center; gap: [spacing token]`
- `identityMark` is a **fixed-size flex item rendered only when present** — not a fixed-width slot with an empty state. When absent, `title` takes the full row. No placeholder box.

### primaryMeta
- Always present when the card is visible — one dot-joined line, teal, Archivo uppercase, small tracking, same typographic treatment as the existing category label

### description
- Laica A, one paragraph — length naturally varies by resolver/source, which is what drives the masonry variation (see Section 4), not artificial padding

### secondaryMeta (conditional)
- Hairline divider (`--rule`) renders **only when this row is present** — never an orphaned divider above empty space
- Two-part line, left/right, Archivo, muted color, matching the `/here` section-divider treatment

### cta
- Reuses the existing **Line-CTA** component (Homepage V2 brief, Section 2) — 2px bar + highlight-swipe on hover, color from `categoryToken` rather than hardcoded coral, since this card spans multiple category colors across all three sources

---

## Section 3 — Resolvers (data → shared shape)

Each resolver reads from existing Payload collections and produces exactly the `SpotlightCardProps` shape above. None of this logic lives in the component.

### `resolveVenueSpotlight(venue)`

Same time-driven logic as before — venue identity from `venues`, live status from either a current `exhibitions` record or `events` + `openingHours`.

```typescript
async function resolveVenueSpotlight(venue: Venue): Promise<SpotlightCardProps | null> {
  const now = getBerlinNow();

  const currentExhibition = await getCurrentExhibitionForVenue(venue.id, now);
  if (currentExhibition) {
    return {
      image: { src: currentExhibition.heroImage.url, alt: currentExhibition.heroImage.altText },
      badge: { label: venue.categoryLabel, categoryToken: venue.categoryToken },
      identityMark: venue.venueMonogram ? { src: venue.venueMonogram.url, alt: venue.name } : undefined,
      title: venue.name,
      primaryMeta: `On now · ${currentExhibition.entryFee}`,
      description: currentExhibition.shortDescription,
      secondaryMeta: undefined, // exhibitions are ongoing — no schedule row
      cta: { label: `Explore ${venue.name}`, href: '/here/art', categoryToken: venue.categoryToken },
    };
  }

  const nextEvent = await getNextEventForVenue(venue.id, now);
  if (nextEvent) {
    return {
      image: { src: venue.images[0].url, alt: venue.images[0].altText },
      badge: { label: venue.categoryLabel, categoryToken: venue.categoryToken },
      identityMark: venue.venueMonogram ? { src: venue.venueMonogram.url, alt: venue.name } : undefined,
      title: venue.name,
      primaryMeta: deriveOpenClosed(venue.openingHours, now),
      description: venue.shortDescription,
      secondaryMeta: { left: venue.spotlightLocation, right: nextEvent.recurrenceDescription },
      cta: { label: `Explore ${venue.name}`, href: `/here/${venue.slug}`, categoryToken: venue.categoryToken },
    };
  }

  return null; // nothing current or scheduled — card is absent, not empty
}
```

### `resolveEventSpotlight(event)`

```typescript
async function resolveEventSpotlight(event: EventRecord): Promise<SpotlightCardProps> {
  const venue = event.venue; // relationship, already populated

  return {
    image: { src: event.image.url, alt: event.image.altText },
    badge: { label: event.categoryLabel, categoryToken: event.categoryToken },
    identityMark: venue?.venueMonogram
      ? { src: venue.venueMonogram.url, alt: venue.name }
      : undefined, // hosting venue's mark, reused — confirm this is wanted (see Section 1 note)
    title: event.title,
    primaryMeta: formatDateTime(event.startDate, event.startTime), // "Fri 14 Aug · 19:00"
    description: event.shortDescription,
    secondaryMeta: { left: venue?.name ?? '', right: venue?.spotlightLocation ?? '' },
    cta: { label: 'See event', href: `/here/events/${event.slug}`, categoryToken: event.categoryToken },
  };
}
```

### `resolvePersonSpotlight(person)`

```typescript
async function resolvePersonSpotlight(person: Person): Promise<SpotlightCardProps> {
  return {
    image: { src: person.portrait.url, alt: person.portrait.altText },
    badge: { label: person.type, categoryToken: categoryTokenForPersonType(person.type) },
    identityMark: undefined, // intentionally skipped — portrait carries identity
    title: person.name,
    primaryMeta: person.role,
    description: person.bio,
    secondaryMeta: person.roomNumber ? { left: `Room ${person.roomNumber}`, right: '' } : undefined,
    cta: { label: `Meet ${person.name}`, href: `/you-me-and-berlin/${person.slug}`, categoryToken: '...' },
  };
}
```

**⚠️ Open item:** for people, `secondaryMeta.right` is left blank when only a room number exists — worth deciding whether the row should collapse to a single left-aligned value in that case rather than rendering an empty right side.

### New field — add to existing `venues` collection

| Field | Type | Notes |
|---|---|---|
| `venueMonogram` | Upload (media, optional) | SVG/logo mark. Not every venue has one |
| `spotlightLocation` | Text (optional) | Short in-building location string, e.g. "B2 Basement" — for the secondary meta row only |

### Visibility

Fully automatic, no manual toggle. `resolveVenueSpotlight` returns `null` when nothing is current or scheduled, and the card is absent from the DOM entirely — not rendered empty. Events and people don't have this hidden state; they're only queried when they exist (e.g. only upcoming events feed `/here/events`).

**⚠️ Open item:** revalidation window for venue visibility — fully dynamic per request vs. ISR on some interval — is still undecided. This is a real infra tradeoff since it drives visible layout changes, not just text.

---

## Section 4 — Masonry grid

Used on: `/here/events`, and below the map on `/nachbarschaft` + `/you-me-and-berlin`.

### Why not CSS multi-column or a packing library
- **CSS `columns`** distributes items top-to-bottom-then-across, silently reordering visual position away from DOM order — a real cost given how much this project's AEO strategy depends on predictable document structure for crawlers.
- **JS masonry libraries** (Masonry.js and most React wrappers) either have licensing terms worth re-checking before depending on them, or are themselves column-distribution under the hood with the same DOM-reorder problem, just hidden behind a component API.

### What to build instead
CSS Grid with row-span computed from real rendered height, so **DOM order and visual order stay identical**:

```css
.spotlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: 8px;
  gap: 16px;
}
```

```typescript
function setRowSpan(cardEl: HTMLElement, rowUnit = 8, gap = 16) {
  const height = cardEl.getBoundingClientRect().height;
  const span = Math.ceil((height + gap) / (rowUnit + gap));
  cardEl.style.gridRowEnd = `span ${span}`;
}
```

- Trigger on initial mount (after fonts + images ready) and on `ResizeObserver` fire per card
- Height variation across venue/event/person descriptions and conditional `secondaryMeta` rows already produces natural variety — no need to artificially vary anything for the "non-uniform movement" effect
- On the two map pages: this grid sits below the existing map, still governed by the same URL-query-param pagination rules already specced (numbered pages, canonical tag to unfiltered page 1) — packing only affects layout within a page, not the pagination/crawlability contract

**⚠️ Open item:** map ↔ card connectivity (pin click scrolls to card, card click pans map) is intentionally **out of scope for this brief** — build the card and grid first, then the events page, then revisit map/grid interaction once both exist.

---

## Section 5 — Accessibility

- Badge circle is decorative alongside its visible text label — `aria-hidden` on the decorative wrapper, real text label stays in the DOM
- No information conveyed by color alone in either meta line
- Card is not `aria-live` — it either renders or doesn't per request; no in-place client-side update like the `/here` hero
- `ResizeObserver`-driven re-layout must not steal focus or scroll position — purely visual reflow

---

## Open items — do not silently resolve

1. Event `identityMark` defaulting to the hosting venue's monogram — confirm this is wanted
2. Person `identityMark` skipped entirely — confirm, and note the layout doesn't yet support a small identity badge next to a portrait if this changes
3. Person `secondaryMeta` with only a left value — collapse to single-aligned or leave blank right side?
4. Venue resolver priority (exhibition vs. event vs. hidden) — confirm against real data for all four venues, not just FKKB
5. Revalidation/caching window for automatic venue visibility
6. Map ↔ grid connectivity — deferred, not forgotten
7. `VenueCard` naming collision with the existing basement compact card — needs a rename on one side

---

## Definition of done

- [ ] `SpotlightCard` renders from the shared `SpotlightCardProps` shape only — no venue/event/person-specific logic inside the component itself
- [ ] Three resolvers (`resolveVenueSpotlight`, `resolveEventSpotlight`, `resolvePersonSpotlight`) each independently produce that shape
- [ ] Venue card is fully absent from the DOM (not empty/hidden) when nothing is current or scheduled
- [ ] `identityMark`-present and `identityMark`-absent layouts both render correctly, title reflows to fill the row when absent
- [ ] `secondaryMeta` and its divider only render together — never a divider with nothing below it
- [ ] Badge is ~90% opacity category-token fill, top-left, holds contrast against at least one dark and one light test photo
- [ ] Line-CTA color pulls from `categoryToken`, not hardcoded, across all three sources
- [ ] Masonry grid preserves DOM order == visual order (verify by tabbing through with keyboard)
- [ ] Grid re-packs correctly after image load and on viewport resize
- [ ] `/nachbarschaft` and `/you-me-and-berlin` masonry grids still respect existing pagination + canonical-tag rules
- [ ] No CSS `columns` or DOM-reordering masonry library used anywhere in the implementation
