# Hotel Berlin, Berlin — Test Seed Data: Events & Exhibitions
*For Cursor — insert into Payload, then verify against `HotelBerlin_EventHelpers_BuildBrief.md`'s test checklist*
*Purpose: exercise every recurrence type, the daily-exclusion rule, and the still-unconfirmed `exhibitions` branch in one pass*

---

## 1 — Vinyl Nights (weekly recurrence)

```typescript
// events collection
{
  title: 'Vinyl Nights',
  slug: 'vinyl-nights',
  category: 'music', // → MusicEvent
  venue: 'lutze', // relationship → venues
  description: 'Wax spins from local selectors, drinks flowing, no cover.',
  shortDescription: 'Weekly vinyl night at Lütze — local DJs, no cover.',
  startDate: '2026-08-03', // a Monday — recurrence anchors to this weekday
  startTime: '18:00',
  isRecurring: true,
  recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
  recurrenceDescription: 'Every Monday from 18:00',
  status: 'scheduled',
  entryFee: 'Free',
  organiser: 'lutze',
  locale: ['en'], // DE copy still needed
}
```

**Tests:** `getNextEventForVenue('lutze')` returns the next Monday. `VenueCompactCard`'s Tonight badge shows correctly only on Mondays.

---

## 2 — Zeichenstammtisch (last-Thursday-monthly recurrence)

```typescript
{
  title: 'Zeichenstammtisch',
  slug: 'zeichenstammtisch',
  category: 'community', // → Event
  venue: 'lutze',
  description: 'An open drawing table for illustrators, sketchers, and the curious. Bring your own materials.',
  shortDescription: 'Monthly open drawing meetup at Lütze, last Thursday of the month.',
  startDate: '2026-08-27', // last Thursday of August 2026 — recurrence anchors here
  startTime: '19:00',
  isRecurring: true,
  recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1TH',
  recurrenceDescription: 'Last Thursday of every month, from 19:00',
  status: 'scheduled',
  entryFee: 'Free',
  organiser: 'lutze',
  locale: ['en'],
}
```

**Tests:** this is the record that originally exposed the broken `MONTHLY`/`BYDAY` parser — re-confirming it resolves correctly (next occurrence = Sept 24, 2026) is the most important single check in this batch, since everything else has been built on top of the fix.

---

## 3 — KTTK Open Play (always-on daily recurrence — the exclusion case)

```typescript
{
  title: 'KTTK Open Play',
  slug: 'kttk-open-play',
  category: 'sport', // → SportsEvent
  venue: 'kttk',
  description: 'Drop-in table tennis, open to all guests. Bats available at the Lütze bar.',
  shortDescription: 'Daily open table tennis at KTTK, no booking required.',
  startDate: '2026-08-01',
  startTime: '13:00',
  endTime: '23:00',
  isRecurring: true,
  recurrenceRule: 'FREQ=DAILY',
  recurrenceDescription: 'Daily, 13:00–23:00',
  status: 'scheduled',
  entryFee: 'Free',
  organiser: 'kttk',
  locale: ['en'],
}
```

`recurrenceRule` is confirmed free-text (iCal RRULE subset), not a select — the earlier "missing `daily` option" concern doesn't apply; this schema was never blocked on that.

**Tests:** this event should resolve correctly for `getNextEventForVenue('kttk')` (used by `SpotlightCard` and `VenueCompactCard`), but should **never** win `getCurrentOrNextEventToday`'s hero subline slot on its own — that's what record 4 is for.

---

## 4 — KTTK Tournament Night (one-off — proves the exclusion rule)

```typescript
{
  title: 'KTTK Tournament Night',
  slug: 'kttk-tournament-night',
  category: 'sport', // → SportsEvent
  venue: 'kttk',
  description: 'A one-night knockout tournament, open sign-up at the door. Bats provided.',
  shortDescription: 'One-night table tennis tournament at KTTK.',
  startDate: '2026-08-13', // a Thursday — deliberately not the same day as the FKKB vernissage below, keeps the two tests independent
  startTime: '19:00',
  endTime: '22:00',
  isRecurring: false,
  status: 'scheduled',
  entryFee: '€5',
  organiser: 'kttk',
  locale: ['en'],
}
```

**Tests:** this is the actual proof of the exclusion rule — on Aug 13, `getCurrentOrNextEventToday` has two candidates (this event and the always-on KTTK Open Play) and must pick this one for the hero subline. Neither record 3 nor 4 alone proves the rule works; only this pair does. Also exercises `formatRelativeTime`'s `soon` state if checked within ~2 hours of 19:00 on that day.

---

## 5 — Magwie × CokyOne (exhibitions collection — the untested branch)

```typescript
// artists collection — create first, exhibition references these
{
  name: 'Magdalena Wiegner',
  alias: 'Magwie',
  slug: 'magwie',
  instagram: 'https://www.instagram.com/x.magwie.x/',
  medium: 'Illustration, mixed media',
  shortBio: 'Magdalena Wiegner, known as Magwie, creates surreal dreamscapes filled with playful, beautifully imperfect characters that blur the line between fantasy and reality.',
},
{
  name: 'Andreas Ponto',
  alias: 'CokyOne',
  slug: 'cokyone',
  instagram: 'https://www.instagram.com/cokyone/',
  medium: 'Graffiti, nature-inspired imagery',
  shortBio: 'Andreas Ponto, known as CokyOne, brings the energy of graffiti together with nature-inspired imagery, exploring our connection to the world around us.',
}
```

```typescript
// exhibitions collection
{
  title: 'Magwie × CokyOne',
  subtitle: 'A duo show',
  slug: 'magwie-x-cokyone',
  artists: ['magwie', 'cokyone'],
  venue: 'fkkb',
  description: 'Magdalena Wiegner aka Magwie invites us into surreal dreamscapes filled with playful, beautifully imperfect characters that blur the line between fantasy and reality. Andreas Ponto aka Cokyone brings the energy of graffiti together with nature-inspired imagery, creating works that explore our connection to the world around us.',
  shortDescription: 'Surreal dreamscapes meet graffiti-rooted nature imagery in this two-artist show at FKKB.',
  startDate: '2026-08-06',
  endDate: '2026-09-30', // ⚠️ "September 2026" wasn't given an exact day — confirm real close date
  status: 'current', // ⚠️ testing choice, not editorial convention — see note below
  heroImage: 'duo-show-magwie-cokyone.webp', // ⚠️ see note below — one file, two source photos
  vernissageDate: '2026-08-06',
  vernissageTime: '18:00',
  entryFee: 'Free', // ⚠️ no-op — exhibitions has no entryFee field; code hardcodes 'On now' with no admission text. Real deviation from the original SpotlightCard spec ("On now · ${entryFee}"), not missing data — flag separately, doesn't block seeding.
  organiser: 'fkkb',
  locale: ['en'], // DE copy still needed
}
```

**⚠️ Confirmed bug, fix before seeding this record's image:** `getCurrentExhibitionForVenue` queries at `depth: 0`, so `heroImage` comes back as a bare upload ID, not a populated Media object. `mediaUrl()` can't resolve a bare ID, so the resolver silently falls back to the venue's fallback image — no error, just the wrong photo. If you upload the duo-show image and seed this record as-is, the card will show FKKB's generic venue image instead, with nothing indicating why. Confirmed intentional-but-incomplete: `depth: 0` is fine for the `artists`/`venue` fields (nothing downstream reads them populated), but `heroImage` needs to be populated the same way `resolveEventSpotlight` already populates its venue at `depth: 1`. Get this fixed first — otherwise the photo-seeding step will look broken for the wrong reason.

**Tests:** this is the one branch nothing else in the current batch touches — `getCurrentExhibitionForVenue('fkkb')` and `resolveVenueSpotlight`'s priority-1 path. If `exhibitions.venue` or `permanent` status are still missing from the schema (flagged as an open schema blocker in the event-helpers brief and never confirmed fixed), **this record will reveal it immediately** — either the relationship field won't exist to set, or the query will silently return nothing.

**Status field note for whoever's seeding this:** `'current'` is set here specifically to make the record testable right now, ahead of the real Aug 6 opening. In production, an editor would set this to `'upcoming'` until vernissage day — this seed value is a testing convenience, not a template for how the field should normally be set.

**Image note:** the uploaded file (`duo-show-magwie-cokyone.webp`) contains two source photographs side by side (Magwie working, CokyOne installing a piece) as one composite image. Worth deciding whether that composite is used as-is for `heroImage`, or split into two separate files — one per artist — with one as `heroImage` and the other in `additionalImages`. You mentioned seeding real photos yourself, so this is just flagging the decision, not blocking on it.

---

## Cross-record open items

1. ~~`recurrenceRule` needs a `daily` option added~~ — resolved: field is free-text RRULE, not a select. All four event records now use real RRULE syntax.
2. **`getCurrentExhibitionForVenue`'s `depth: 0` leaves `heroImage` unresolved** — confirmed bug, see note on record 5. Needs a fix (raise depth, or explicitly populate `heroImage`) before uploading real exhibition photos, or they'll silently fail to show.
3. ~~Test count discrepancy~~ — resolved: 33/33 across `venue-time.int.spec.ts` (23, includes the 3 DST tests), `spotlight.int.spec.ts` (6), `here-cards.int.spec.ts` (4). The earlier "29/29" figure was simply wrong, not a regression.
4. **`exhibitions.entryFee` doesn't exist as a field** — `SpotlightCard`'s venue resolver hardcodes `'On now'` with no admission text, a real gap from the original spec's `"On now · ${entryFee}"` format. Low priority, not blocking, but worth a ticket.
5. Exhibition end date (record 5) is a placeholder guess — confirm before treating this as real content rather than test data.
6. German locale copy is missing on all five records — fine for testing resolver logic, blocks these from being real bilingual content.
7. Once photos and monograms are seeded, re-run the `SpotlightCard` monogram-present/absent layout check specifically against FKKB, KTTK, and Lütze with real images rather than the Unsplash placeholders currently in `spotlightTeasers.ts`.
8. `getCurrentOrNextEventToday` has no UI consumer yet — confirmed. The hero live subline is still unbuilt, so record 4's exclusion-rule test can currently only be verified by calling the function directly or in a test, not by looking at the live page.
