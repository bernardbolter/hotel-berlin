# Hotel Berlin, Berlin — `/here` Hero Rebuild + Map Reframing
*For Cursor*
*Components: `HereHero` / new `HereHeroLayout` · `HomepageMapTeaser` (compact variant)*
*Supersedes: `HotelBerlin_HereHero_Addendum.md` in full (the live-event-resolver hero). Does **not** touch the `?event=` conference-QR override — see Section 1.4.*
*Reference: `HotelBerlin_HereWireframe_v2.html` — mobile 480px + desktop 1280px frames, hero and map sections only*
*Grounded in: the Sept 1 2026 codebase audit (file:line citations below are from that audit; re-verify anything that's moved)*

---

## Why this brief exists

Two decisions came out of a design review: the `/here` hero's live-event subline logic (`resolveHereHeroSubline()`) is more editorial upkeep than it's worth — nothing bad happens if it goes stale, so it will — and the neighbourhood map teaser should lead with *who's* recommending a place, not just the place. Both are scoped narrowly. Nothing else on `/here` changes.

---

## Section 1 — Hero rebuild

### 1.1 What's being removed

- `resolveHereHeroSubline()` (`src/lib/here/hero.ts:34-57`) and its call site in `HereHero.tsx:49-51` — delete, don't deprecate.
- The Thursday-specific manual subline string and any sibling day-slot subline keys in `src/messages/en.json` / `de.json` under the `here.hero.*` (or wherever the day-copy currently lives) — remove. Keep `here.greeting.morning|afternoon|evening` (`en.json:94-97`) exactly as-is; that's staying.
- No `hereHero` Payload global exists (confirmed by audit), so there's no schema/collection to migrate or delete here — this is pure code cleanup, not a data migration.

### 1.2 What's being built

**New `HereHeroLayout`** — a 1fr 2fr grid, modeled on the *shape* of `HomeHeroLayout` (`src/components/home/HomeHeroLayout.tsx:18-22`) but not reusing it directly — `HomeHero`/`HomeHeroLayout`/`HeroPhotoSlider` own homepage-specific things (forest panel, floating map badge, typewriter captions) that don't belong here.

Instead, drop **`KenBurnsSlider`** (`src/components/primitives/KenBurnsSlider.tsx:8-32`, `showDots` default `true`) directly into the photo panel. It's already a decoupled primitive — this is the intended reuse path per the audit, not a workaround.

```
Desktop (1fr 2fr):
┌──────────────┬─────────────────────────────┐
│ text panel   │  photo panel                │
│ (teal bg)    │  (KenBurnsSlider)            │
│              │                    [clock]   │
│ THURSDAY     │                              │
│ Good evening │                              │
│ Hotel Berlin,│              [caption][dots] │
│ Berlin ·     │                              │
│ Lützowplatz  │                              │
└──────────────┴─────────────────────────────┘

Mobile (stacked, photo first):
┌─────────────────────────────┐
│  photo panel        [clock] │
│              [caption][dots]│
├─────────────────────────────┤
│  text panel (teal bg)       │
│  THURSDAY                   │
│  Good evening                │
│  Hotel Berlin, Berlin · ...  │
└─────────────────────────────┘
```

**Text panel content — final list, nothing else:**
- Day label — same computed-weekday logic already in the codebase (not a new field)
- Greeting — existing `here.greeting.*` strings, existing time-of-day logic, untouched
- Location line — static, "Hotel Berlin, Berlin · Lützowplatz 17"
- **No subline. No CTA.** The nav already carries "Plan your next stay" — repeating it in the hero panel is the kind of commercial push `/here` is supposed to avoid. Don't add one even though `HomeHeroLayout`'s forest panel has one.

**Clock** — the existing clock component stays exactly as it is (Berlin time, 60s update, `aria-label="Current time in Berlin"`, `aria-live="off"`). Just reposition it: absolutely positioned top-right of the *photo panel* specifically (not the whole hero), same spot on both breakpoints. This was an open item since the original addendum — deciding it now since the layout changed anyway.

### 1.3 Photo source — new `context` field, not a new collection

Add `context: 'homepage' | 'here'` to the existing `hero-slides` collection (`src/collections/HeroSlides.ts:3-13`), default `homepage` on existing docs so nothing currently live breaks. Seed 4–5 `here`-context slides — reuse the homepage's own evergreen set (courtyard, Lütze, FKKB, rooms) rather than commissioning new photography; zero new upload burden is the point.

`getHeroSlides()` (`src/lib/payload/homepage.ts:65-109`) needs a `context` param, or a sibling function — either is fine, just keep the `enabled` + `sort: 'order'` + `depth: 2` behavior intact. Ignore the legacy `Homepage.heroSlides` global fallback (`src/globals/Homepage.ts:24-32`) and the hardcoded `src/components/home/heroSlides.ts` fallback for the `here` context — those are homepage-specific safety nets, don't extend them.

### 1.4 What's *not* changing — the `?event=` override

`HereHero`'s `eventSlug?` prop and its conference-QR override path stay exactly as implemented. This is a different thing from the day-slot subline that's being removed: a real, currently-scheduled event with a `heroActive` flag someone flips on for its own reason (the conference exists) is the same category as the Tonight card's event data, not the same category as a hand-typed mood line nobody has a reason to update. When `?event=[slug]` resolves to an active event, it still overrides the hero's image/greeting/location entirely, same as today. The wireframe only shows the default state — build the override path as a variant of `HereHeroLayout`, not a separate component, and confirm the override still fully replaces the gallery (not just adds a line on top of it).

---

## Section 2 — Map reframing ("Local picks")

### 2.1 What's already there — don't rebuild this

`NeighbourhoodMapSection context="here" layout="card"` (`src/app/[locale]/here/page.tsx:125-130`) → `getMapTeaserPlaces(locale, 'here')` reading the `hereTeaser` field (`src/lib/queries/neighbourhoodPlaces.ts:101,126-141`) → `HomepageMapTeaser` (`NeighbourhoodMapSection.tsx:182-194`) → `NeighbourhoodGuideMap`. All of this stays. `endorsements` (`NeighbourhoodPlaces.ts:153-180`) already exists and is already populated for 4 of the 5 current `hereTeaser` places.

### 2.2 What changes

`EndorsementChipList` already renders correctly elsewhere (`PlaceInfoCard.tsx:128-166`, the non-compact homepage teaser, `/neighbourhood`, `/you-me-berlin`) — it's just switched off for the compact `/here` instance specifically:

```
HomepageMapTeaser.tsx:212 — {!compact && card ? <EndorsementChipList .../> : null}
```

Don't just flip that condition — the compact card's markup almost certainly isn't laid out to fit the existing chip presentation at that size. Build a condensed variant for the compact case that leads with the recommender, per the wireframe:

```
[avatar/initials]  [NAME] recommends
                    Place name
                    Walk time · category
```

Reuse whatever avatar/initials pattern already exists for people elsewhere in the codebase (check `you-me-berlin` listing components) rather than inventing a new one.

### 2.3 Data gap — flag, don't fix in code

`hamburger-bahnhof` has an empty `endorsements` array in seed data (`src/seed/data/neighbourhood-v1-places.json:112`) — it's the one `hereTeaser` place with no one to recommend it. This needs a real person assigned by whoever owns that content, or it should come out of the `hereTeaser` set (`src/seed/homepage-featured-places.ts:25-31`) until it has one. Don't seed a placeholder endorser.

### 2.4 Copy

Section label changes from whatever currently renders (audit didn't confirm the live string) to something that reads person-first — "Local picks" was used in the wireframe as a placeholder. Needs real EN/DE strings before ship; not Cursor's call to finalize, flag for i18n review.

---

## Open items — do not silently resolve

1. `hero-slides.context` field vs. a fully separate collection — this brief specs the shared-collection approach; flag if it turns out messier in practice than expected
2. Exact `here`-context photo set — reuse homepage images as-is, or reframe/recrop for guest-hub context? Content decision, not Cursor's to make
3. `hamburger-bahnhof` endorsement — backfill or drop from `hereTeaser`
4. "Local picks" section label — placeholder copy, needs real EN/DE strings
5. Confirm the `?event=` override still fully replaces the gallery hero (image + greeting + location), not just layers a line on top of it, once `HereHeroLayout` exists

---

## Definition of done

- [ ] `resolveHereHeroSubline()` and its call site deleted, not deprecated
- [ ] Day-slot manual subline message keys removed from `en.json`/`de.json`; `here.greeting.*` untouched
- [ ] `HereHeroLayout` built as its own component — 1fr 2fr desktop grid, stacked mobile (photo first)
- [ ] Photo panel uses `KenBurnsSlider` directly — not `HomeHero`/`HomeHeroLayout`/`HeroPhotoSlider`
- [ ] Text panel renders only: day label, greeting, location line — no subline, no CTA
- [ ] Clock repositioned to top-right of the photo panel specifically, same position both breakpoints, `aria-label`/`aria-live` behavior unchanged
- [ ] `hero-slides` collection gets a `context` field, defaults `homepage` on existing docs, 4–5 `here`-context slides seeded
- [ ] `getHeroSlides()` (or a sibling) filters by context; legacy global/hardcoded fallbacks not extended to `here`
- [ ] `?event=[slug]` override path preserved and still fully overrides the hero when `heroActive`
- [ ] `EndorsementChipList` condensed variant built for the compact `/here` map teaser — recommender leads, not the place
- [ ] No placeholder endorser seeded for `hamburger-bahnhof` — flagged instead
- [ ] Section label copy left as a flagged placeholder, not silently finalized
- [ ] Mobile: photo panel ~210px, full width, text panel below, full width
- [ ] `prefers-reduced-motion`: gallery rotation and any hover/dot transitions respect it, matching the rest of `/here`
- [ ] No console errors, no regressions on `/` (homepage hero untouched by the `context` field addition)
