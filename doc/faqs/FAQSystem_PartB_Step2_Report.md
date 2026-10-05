# FAQ System — Part B Step 2 report

*5 October 2026. Routing + tokens, dark-launched behind `FAQ_ROUTING_V2` (default off). No merges, no answer text rewrites (Step 3).*

**Database safety:** `DATABASE_URL` → `postgresql://bescohome@localhost:5432/hotelberlin` (local). Scratch DB `hotelberlin_faq_migtest2` used for migration UP → DOWN → UP. No hosted/production DB touched.

---

## 0. Migration snapshot sync + production runbook

### Snapshot sync

Step 1’s migration had SQL + TS but **no** `.json` drizzle snapshot (latest snapshot was still `20260928_134900_…`). That made `payload migrate:create` believe every post–media-sizes schema change was pending.

**What we did (DB unchanged for this step):**

1. Wrote [`scripts/sync-drizzle-snapshot.ts`](../../scripts/sync-drizzle-snapshot.ts) and generated  
   [`src/migrations/20261005_140000_faq_topics_and_structure.json`](../../src/migrations/20261005_140000_faq_topics_and_structure.json) from the live Payload schema (`generateDrizzleJson`), with `prevId` chained from the prior snapshot.
2. Ran `payload migrate:create …` — result: **“No schema changes detected.”** (blank-migration prompt; no SQL written). Snapshot is in sync for Step 1.

### Step 2 migration

After adding hotel/amenity/placement fields, `payload migrate:create faq_placements_hotel_facts` produced SQL cleanly (no enum rename hang). Renamed files to `20261005_150000_…` so the snapshot sorts **after** Step 1. Registered **after** `140000` in [`src/migrations/index.ts`](../../src/migrations/index.ts).

Scratch cycle on `hotelberlin_faq_migtest2`: UP_OK → DOWN_OK → UP_OK. Applied to local `hotelberlin` (batch 16).

### Runbook

[`doc/faqs/FAQSystem_Production_Runbook.md`](FAQSystem_Production_Runbook.md) — ordered Neon/prod steps: migrate → `faq:backfill-structure --write` → `faq:seed-placements --write` → `faq:seed-token-values --write` → opt-in `FAQ_ROUTING_V2`. Seeds are **not** automatic.

---

## 1. `faq-placements` global + pins

| Item | Evidence |
|---|---|
| Global | [`src/globals/FaqPlacements.ts`](../../src/globals/FaqPlacements.ts) — array: route (unique select), audience, topics→faq-topics, showAll, cap, heading (localized) |
| Registered | [`src/payload.config.ts`](../../src/payload.config.ts) globals |
| Defaults | [`src/lib/faq/defaultPlacements.ts`](../../src/lib/faq/defaultPlacements.ts) — bundled fallback if CMS empty |
| Seed | [`scripts/faq-seed-placements.ts`](../../scripts/faq-seed-placements.ts) · `pnpm faq:seed-placements` |

### Dry-run (abridged)

```
DATABASE_URL= postgresql://bescohome@localhost:5432/hotelberlin
=== faq-placements (18) mode=DRY-RUN ===
  home … policy-payment (18 rows; caps/topics match faq-placements.json)
=== pinnedRoutes (9 FAQs) ===
  check-in-time: [] → ["home","rooms","policy-fees"]
  parking: [] → ["home","rooms","meetings","policy-fees"]
  … guest-housekeeping: [] → ["sustainability"]
Dry-run only. Re-run with --write to apply.
```

### Write

`WRITE DONE: faq-placements + pinnedRoutes` (local only, after dry-run review in this session).

---

## 2. Hotel structured fact fields + token seed

### Field choices (report)

| Token / need | Chosen field | Notes |
|---|---|---|
| `{{checkinTime}}` / `{{checkoutTime}}` | `hotel.checkinTime` / `checkoutTime` | Existing |
| `{{earlyCheckinFrom}}` / `Fee` | `hotel.earlyCheckin.from` / `.fee` | New group |
| `{{lateCheckoutTime}}` / `Fee` | `hotel.lateCheckout.until` / `.fee` | New; **left empty** (seedNow=false) |
| `{{breakfastWeekday}}` | `hotel.guestStay.breakfast.valueEN/DE` | Existing localePair; seed normalizes to `6:30–10:00` |
| `{{breakfastWeekend}}` / child price | (same pricing group / hours) | **left empty** |
| `{{breakfastPrice}}` / child age | `hotel.breakfastPricing.adultPrice` / `childAgeFrom` | Existing |
| Parking tokens | `hotel.parking.{spaces,hourly,dailyMax,maxHeight}` | New group (not guestStay prose) |
| `{{petFee}}` | `hotel.petFee` (number) | New; formatted €n / n € |
| `{{saunaNotice}}` | `amenities.noticeMinutes` on slug `sauna` | New amenity field (not hotel) |
| Rate / smoking / room phone | `hotel.ratePolicy.*`, `smokingFee`, `roomPhoneRates.*` | New |
| Emails | `hotel.email` + `hotel.emails.{reservations,sustainability,careers}` | New group; dept emails left empty |
| `{{emailConference}}` | `meetings.contactEmail` | Existing; left empty for seedNow=false |
| `{{hotelAddress}}` | `hotel.address` structured | Existing; **not overwritten** by flat string |
| `{{lostPropertyUrl}}` / room sizes | `hotel.lostPropertyUrl`; `rooms.*.floorSizeM2` | New URL; room sizes left empty |
| HOLD | `wifiSsid`, `saunaHours`, `phoneMain`, `phoneReception` | Getters always null; never seeded |

Migration: [`src/migrations/20261005_150000_faq_placements_hotel_facts.ts`](../../src/migrations/20261005_150000_faq_placements_hotel_facts.ts).

Seed: [`scripts/faq-seed-token-values.ts`](../../scripts/faq-seed-token-values.ts) · `pnpm faq:seed-token-values`.

### Dry-run summary

- **Would write:** checkinTime, checkoutTime, earlyCheckin*, breakfastWeekday/Price/ChildMinAge, parking*, petFee, saunaNotice, cancelFlexibleUntil, noShowCharge, smokingFee, phoneRate*, emailInfo (+ address skip)
- **Left empty:** lateCheckout*, breakfastWeekend, breakfastPriceChild, emailReservations/Conference/Sustainability/Careers, lostPropertyUrl, room*Size
- **HOLD never write:** wifiSsid, saunaHours, phoneMain, phoneReception

Write applied locally after dry-run; `amenities/sauna noticeMinutes=45`.

---

## 3. Token resolver + FAQ hooks

| Piece | Path |
|---|---|
| Registry + `resolveFaqTokens` | [`src/lib/faq/tokens.ts`](../../src/lib/faq/tokens.ts) |
| Typo guard (`beforeValidate`) | [`src/lib/faq/hooks.ts`](../../src/lib/faq/hooks.ts) → FAQs |
| Publish bracket guard (`beforeChange`) | same — blocks `[CONFIRM` / `[BESTÄTIGEN` / `[ADD` / `[ERGÄNZEN` when publishing |
| Answers with no tokens | Pass through unchanged |

---

## 4. `getFAQsForRoute`

[`src/lib/faq/getFaqsForRoute.ts`](../../src/lib/faq/getFaqsForRoute.ts) + pure selection [`src/lib/faq/selectFaqsForRoute.ts`](../../src/lib/faq/selectFaqsForRoute.ts).

- Built on extended [`getFaqs({ allPublished: true })`](../../src/lib/faqs/getFaqs.ts) — single Payload FAQ query path.
- Algorithm: placement → pins (route / entity) → fill (audience + topic/secondary) → resolve tokens → **drop unresolved before cap** → cap (pins never trimmed) → `{ items, trimmedCount }`.
- CMS miss / error → default placements constant; missing route row → `[]`.

**Live smoke (local, after seeds):** matches oracle for home/rooms/here/faq/here-faq (4/4/3/27/46; trimmed 8/5/0/0/0).

---

## 5. Surfaces behind `FAQ_ROUTING_V2`

| Surface | Flag OFF (legacy kept) | Flag ON |
|---|---|---|
| Home mini | `FAQSection` category=general | `routeKey="home"` → getFAQsForRoute |
| `/rooms` mini | same | `routeKey="rooms"` |
| `/faq` | `getFaqs({prospect})` | `getFAQsForRoute('faq')` |
| `/here` hub | `HUB_FAQ_SLUGS` + getRelevantFaqs | `getFAQsForRoute('here')` |
| `/here/faq` | `getFaqs({guest})` | `getFAQsForRoute('here-faq')` |

Flag helper: [`src/lib/faq/flag.ts`](../../src/lib/faq/flag.ts). Old paths (`getRelevantFaqs`, `HUB_FAQ_SLUGS`, category heuristic) **not deleted**.

- Mini CTA: FAQSection shows “All questions →” when `trimmedCount > 0` (home/rooms still show; matches today). Here hub keeps always-on A–Z CTA for HTML identity.
- JSON-LD: still `buildFAQPageGraph` on the exact rendered list.
- Hash deep-links: `FAQAccordion` matches `slug` **or** `aliasIds` ([`FAQAccordion.tsx`](../../src/components/primitives/FAQAccordion.tsx)).

No new FAQ sections on other routes.

---

## 6. Tests

| Suite | Result |
|---|---|
| `tests/int/faq-routing.int.spec.ts` | **18/18** — all routes vs `faq-routing-expected.json` |
| `tests/int/faq-tokens.int.spec.ts` | **9/9** — replace, unresolved, HOLD, typo, publish guard, plain text, JSON-LD parity |
| `tests/int/guest-az-faqs.int.spec.ts` | **6/6** |

---

## Flag OFF vs Flag ON diff table

*Flag OFF live HTML (localhost, default env): counts match Step 1 — home/rooms 4, here 3, /faq 6, /here/faq 41 (DE+EN); JSON-LD entity count = accordion id count on each surface.*

*Flag ON expected from oracle / live `getFAQsForRoute` (flag not enabled in process env for page HTML — review before enabling).*

| Surface | OFF count | ON count | Added | Removed | Reordered? |
|---|---|---|---|---|---|
| home mini | 4 | 4 | — | — | No (identical slugs) |
| rooms mini | 4 | 4 | — | — | No |
| here hub | 3 | 3 | — | — | No |
| `/faq` | 6 | **27** | 21 guest/`both` fills (e.g. guest-checkout, guest-checkin, guest-parking, … guest-babysitting) | — | Yes — shared six become topic/priority order: check-in-time, airport-transfer, parking, breakfast-times, pet-policy, cancellation-flexible |
| `/here/faq` | 41 | **46** | check-in-time, airport-transfer, parking, breakfast-times, pet-policy | — | Yes — full list reordered by priority/topic/order |

**Do not set `FAQ_ROUTING_V2=true` in any environment until this `/faq` and `/here/faq` diff is signed off.**

---

## Acceptance

| Criterion | Result |
|---|---|
| Flag OFF: HTML + JSON-LD counts identical to Step 1 on 10 surfaces | **Pass** — 4/4/6/3/41 (DE+EN); entity count = accordion ids |
| Flag ON: home / rooms / here identical to OFF | **Pass** (oracle + live getFAQsForRoute) |
| Flag ON: /faq 27, /here/faq 46 with documented diffs | **Pass** (oracle + live); page HTML with flag on not flipped in this session |
| Migration snapshot clean for Step 1; Step 2 up/down on scratch | **Pass** |
| Dry-runs shown; `--write` applied locally after dry-run | **Pass** |
| `tsc --noEmit` | **Pass** (exit 0) |
| Tests | **Pass** — 33 FAQ-related |
| `pnpm build` | **Pass** (exit 0) |
| Lint | Pre-existing ESLint circular-config error — not fixed here |

---

## Surprises

1. Step 1 migration lacked a drizzle `.json` snapshot; syncing it was required before Step 2 `migrate:create` was safe.
2. Auto-created migration timestamp `123433` sorted **before** `140000`; renamed to `150000` and fixed `migrations` array order so topics exist before placement FKs.
3. `payload migrate:create --skipEmpty` still prompted for a blank file in this CLI; the important signal was “No schema changes detected.”
4. Breakfast weekday token uses existing `guestStay.breakfast` localePair (valueEN/DE), not a separate hours column — reported above.
5. `saunaNotice` lives on `amenities.noticeMinutes`, not hotel — matches registry intent.
6. Oracle unit tests reconstruct FAQs from JSON (no DB); live smoke after seed confirmed the same slugs.

---

*Hotel Berlin, Berlin — FAQ System Part B Step 2 · 5 October 2026. Do not start Step 3 until this report is reviewed and the flag-ON faq/here-faq diffs are accepted.*
