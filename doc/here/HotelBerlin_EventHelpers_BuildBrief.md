# Hotel Berlin, Berlin — Shared Event & Venue-Time Helpers
*For Cursor*
*Module: `src/lib/venue-time/` (suggested location — adjust to project convention)*
*Consumed by: `SpotlightCard` resolvers (`HotelBerlin_SpotlightCard_BuildBrief.md`) and the `/here` hero (`HotelBerlin_HereHero_Addendum.md`)*

---

## What this is

Both `SpotlightCard`'s venue resolver and the `/here` hero's live event subline need the same underlying data: what's happening right now or next at a given venue, and whether a venue is currently open. Rather than each brief defining its own version of this logic, it lives once here as a small set of pure(ish) helper functions, built **before** either consuming feature.

This is not a UI component and has no presentation logic — every function returns plain data. Formatting for display (the hero's two-line subline, the card's `primaryMeta` string) happens in each consumer's own resolver, not here.

---

## Section 1 — Time foundation

```typescript
function getBerlinNow(): Date {
  // Single source of truth for "now" in Europe/Berlin, reused everywhere below
  // and by the existing hereHero day-slot logic — do not duplicate this in
  // multiple places across the codebase.
}
```

All functions below take a `now: Date` parameter (defaulting to `getBerlinNow()`) rather than computing it internally — makes them testable without mocking the system clock.

---

## Section 2 — Core queries

### `getCurrentExhibitionForVenue(venueId, now)`

```typescript
async function getCurrentExhibitionForVenue(
  venueId: string,
  now: Date = getBerlinNow()
): Promise<Exhibition | null>
```

Queries the `exhibitions` collection for a record where `venue === venueId` and `status === 'current'` (or `status === 'permanent'` with no end date), active as of `now`. Returns `null` if none.

**Consumer:** `SpotlightCard`'s `resolveVenueSpotlight` (priority 1 — exhibition beats scheduled event).

### `getNextEventForVenue(venueId, now)`

```typescript
async function getNextEventForVenue(
  venueId: string,
  now: Date = getBerlinNow()
): Promise<EventRecord | null>
```

Queries the `events` collection for the next occurrence at this venue — resolves `isRecurring` records against `recurrenceRule` to find the next actual date/time, same logic already described in the AEO schema brief for generating the next-3-occurrences `Event` JSON-LD. Returns `null` if nothing is scheduled.

**Consumer:** `SpotlightCard`'s `resolveVenueSpotlight` (priority 2).

### `getCurrentOrNextEventToday(now)`

```typescript
async function getCurrentOrNextEventToday(
  now: Date = getBerlinNow()
): Promise<(EventRecord & { relativeTime: RelativeTimeState }) | null>
```

Site-wide (not venue-scoped) — finds whichever event is happening now or coming up **today**, across all venues, for the hero's live subline. Returns `null` if nothing today. Includes the computed `relativeTime` state (see Section 3) since the hero needs it directly and this is the one place it's genuinely tied to "today" rather than any future date.

**Consumer:** `/here` hero's `getHeroSubline`.

**⚠️ Open item:** if two events are happening today simultaneously (e.g. KTTK Open Play, which runs daily 13:00–23:00, plus a one-off Vinyl Night), which one wins the single hero subline slot? Recurring daily events like KTTK Open Play may need to be excluded from this query entirely — otherwise it could always win over more interesting one-off events just by being permanently "current." Recommend excluding always-on recurring events (anything recurring at daily granularity) from this specific query and reserving it for genuinely time-boxed occurrences — confirm before build.

### `deriveOpenClosed(openingHours, now)`

```typescript
type OpenSegment = { label: string; status: 'Open' | 'Closed'; note?: string };

function deriveOpenClosed(
  openingHours: OpeningHoursEntry[],
  now: Date = getBerlinNow()
): OpenSegment[]
```

**Returns an array, not a single status** — the existing Lütze `openStatus.ts` tracks bar and kitchen independently (they close at different times), and collapsing that into one Open/Closed value would be a regression from what's already live, not a refactor. A single-hours venue like KTTK returns a one-item array; Lütze returns two:

```typescript
// KTTK
[{ label: 'KTTK', status: 'Open' }]

// Lütze
[
  { label: 'Bar', status: 'Open' },
  { label: 'Kitchen', status: 'Closed', note: 'Reopens 17:00' },
]
```

This requires `openingHours` entries on the `venues` collection to carry a `segment` label (e.g. "Bar" / "Kitchen") rather than one flat schedule per venue — see schema blockers below.

**Consumer:** `SpotlightCard`'s `resolveVenueSpotlight` (priority 2, when no exhibition is current) — for single-segment venues this collapses straightforwardly into `primaryMeta`; for multi-segment venues like Lütze, the resolver needs a rule for which segment (if any) surfaces on the card, since the card only has room for one `primaryMeta` line. The existing Lütze `OpenStatusBadge` (`src/lib/lutze/openStatus.ts`) should be refactored to call this function rather than keeping its separate hardcoded timeline — it can display all segments since that component has more room than the compact card.

**⚠️ Open item:** which segment (if any) `SpotlightCard`'s single `primaryMeta` line shows for a multi-segment venue — bar status only, kitchen status only, or some combined phrasing ("Bar open · kitchen closed")? Needs a decision before the venue resolver can be finished, not just before `deriveOpenClosed` itself.

---

## Section 3 — Relative time formatting

Per the threshold rule agreed for the hero subline — kept here since `SpotlightCard`'s event resolver may want the same phrasing for consistency, not just the hero:

```typescript
type RelativeTimeState =
  | { kind: 'now' }                          // "happening now"
  | { kind: 'soon'; minutesOrHours: string }  // "starts in 45 min" / "starts in 2 hours"
  | { kind: 'scheduled'; time: string };      // "starts at 18:00"

function formatRelativeTime(startDateTime: Date, now: Date = getBerlinNow()): RelativeTimeState {
  const diffMinutes = (startDateTime.getTime() - now.getTime()) / 60000;
  if (diffMinutes <= 0 /* and event hasn't ended */) return { kind: 'now' };
  if (diffMinutes <= 120) return { kind: 'soon', minutesOrHours: /* "45 min" or "2 hours" */ '' };
  return { kind: 'scheduled', time: /* "18:00" */ '' };
}
```

Three states only, no open-ended casual phrasing — deliberately narrow so translation to German doesn't need to invent equivalent colloquialisms for every possible English phrasing.

**⚠️ Open item:** exact wording for each state in both locales still needs writing (e.g. is it "starts in 45 min" or "in 45 minutes"?) — this is a Voice/Tone guide question, not an engineering one, but it blocks final copy.

---

## Section 4 — Schema blockers

This module cannot be fully built against real data until the following exist. Confirmed against the current codebase, not assumed:

| Gap | Collection | What's needed | Blocks |
|---|---|---|---|
| No venue relation on exhibitions | `exhibitions` | `venue` relationship field (+ likely a `permanent` status value, referenced in the AEO schema brief for WALLRIDE/DDR Skateboard Collection but not yet on this collection) | `getCurrentExhibitionForVenue` |
| No recurrence rule | `events` | Currently only `isRecurring` (boolean) + `recurrenceNote` (free text) — no structured `recurrenceRule` to compute an actual next occurrence from | `getNextEventForVenue`, and the "next 3 occurrences" JSON-LD generation already described in the AEO brief |
| No shared time source | — | No existing `getBerlinNow` — each feature (hereHero day-slot logic, Lütze open status) currently computes Berlin time separately | Everything in this module |
| Venue fields | `venues` | `venueMonogram`, `spotlightLocation` (from the `SpotlightCard` brief) + a `segment` label on each `openingHours` entry (new, from the `deriveOpenClosed` change above) | `SpotlightCard` resolver, `deriveOpenClosed` |

No new fields are introduced by the query/logic layer itself beyond what's listed above — this brief is otherwise pure functions on top of existing collections, once those collections have the fields they're missing.

---

## Section 5 — Consumers at a glance

| Function | `SpotlightCard` (venue resolver) | `/here` hero |
|---|---|---|
| `getCurrentExhibitionForVenue` | ✅ priority 1 | — |
| `getNextEventForVenue` | ✅ priority 2 | — |
| `getCurrentOrNextEventToday` | — | ✅ live subline |
| `deriveOpenClosed` | ✅ priority 2 status | — (hero doesn't show open/closed) |
| `formatRelativeTime` | possibly, for event cards' `primaryMeta` | ✅ subline phrasing |

Building this module first means both consuming briefs import from here rather than each defining their own version of "what's happening at this venue right now" — avoids the two features quietly drifting out of sync with each other over time.

---

## Open items — do not silently resolve

1. ~~Same-day multiple-events collision in `getCurrentOrNextEventToday`~~ — **confirmed:** exclude always-on daily recurring events (e.g. KTTK Open Play) from this query
2. Exact `relativeTime` copy in both locales — **not blocking build.** Use placeholder i18n keys (`relativeTime.now` / `.soon` / `.scheduled`) with obvious placeholder English strings; swap in real copy once Voice/Tone lands
3. Existing Lütze `OpenStatusBadge` should be refactored onto `deriveOpenClosed` — confirmed as a cleanup task alongside this build. Note it can now display all returned segments (it has the room), unlike `SpotlightCard`'s compact single-line usage
4. Which segment surfaces in `SpotlightCard`'s single `primaryMeta` line for multi-segment venues — unresolved, blocks finishing the venue resolver (not this module directly)
5. `openingHours` segment-label field on `venues` — needs adding alongside the other schema gaps in Section 4

---

## Definition of done

- [ ] `getBerlinNow` is the single Berlin-time source used by this module, the existing `hereHero` day-slot logic, and nowhere else duplicated
- [ ] All time-dependent functions accept `now` as a parameter rather than computing it internally
- [ ] `getCurrentOrNextEventToday` excludes always-on daily recurring events
- [ ] `deriveOpenClosed` returns an array of `OpenSegment` — single-segment venues return a one-item array, Lütze returns bar + kitchen independently
- [ ] Existing Lütze `OpenStatusBadge` refactored to call `deriveOpenClosed`, not its own hardcoded timeline
- [ ] `relativeTime` uses placeholder i18n keys, structured so real copy is a translation-file change only, no code change
- [ ] All functions have unit tests covering: nothing found, exactly one match, a boundary case (event starting exactly at `now`, opening-hours boundary at exact open/close time), and — for `deriveOpenClosed` — a multi-segment venue where segments disagree (one open, one closed)
- [ ] Schema gaps in Section 4 are resolved before this module is considered complete against real data — the pure-function logic can be written and unit-tested against mocked data in the meantime
