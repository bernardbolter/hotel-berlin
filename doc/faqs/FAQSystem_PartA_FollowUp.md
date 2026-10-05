# FAQ System — Part A follow-up

*Report only. Repo changes limited to this file and `doc/faqs/existing-faqs.json`.*
*Companion audit: `docs/audit/2026-10-05-faq-system-status.md`. Triage workbook: `doc/faqs/HotelBerlin_FAQ_Triage.xlsx`.*

---

## 1. Existing FAQ export

File: [`doc/faqs/existing-faqs.json`](existing-faqs.json) — **47** records.

Merge rule (mirrors `upsertFaqs` in `src/seed/faqs.ts` L84–96):

- Prospect: `faqsSeed.filter(context === 'prospect')` → 6 rows (`src/seed/faqs.ts` L85–90)
- Guest: all `GUEST_AZ_FAQS` → 41 rows (`src/seed/faqs.ts` L92–96)
- Overlap slugs `guest-wifi`, `guest-luggage`, `guest-checkout`: A–Z wins (A–Z written after; leftover cleanup would also drop non-A–Z guest slugs — `src/seed/faqs.ts` L98–113)
- Not included: `guest-neighbourhood-walk`, `guest-general-reception` from `faqsSeed` (deleted as leftovers on seed)

---

## 2. Category options (`faqs.category`)

Source: `src/collections/FAQs.ts` L53–73. Labels are plain English strings — **not localized** (no DE label objects). Admin description: L75–76.

### Prospect group (comment `// prospect`, L54)

| value | admin label (EN) | DE label | file:line |
|---|---|---|---|
| `rooms-booking` | Rooms & booking | does not exist | `FAQs.ts` L55 |
| `checkin-checkout` | Check-in / Check-out | does not exist | `FAQs.ts` L56 |
| `dining` | Dining | does not exist | `FAQs.ts` L57 |
| `meetings` | Meetings | does not exist | `FAQs.ts` L58 |
| `accessibility` | Accessibility | does not exist | `FAQs.ts` L59 |
| `getting-here` | Getting here | does not exist | `FAQs.ts` L60 |
| `pets-parking` | Pets & parking | does not exist | `FAQs.ts` L61 |
| `general` | General | does not exist | `FAQs.ts` L62 |

### Guest group (comment `// guest`, L63)

| value | admin label (EN) | DE label | file:line |
|---|---|---|---|
| `wifi-tech` | WiFi & tech | does not exist | `FAQs.ts` L64 |
| `guest-services` | Guest services | does not exist | `FAQs.ts` L65 |
| `neighbourhood-guest` | Neighbourhood (guest) | does not exist | `FAQs.ts` L66 |
| `arrival-departure` | Arrival & departure | does not exist | `FAQs.ts` L67 |
| `in-room` | In the room | does not exist | `FAQs.ts` L68 |
| `money-payment` | Money & payment | does not exist | `FAQs.ts` L69 |
| `health-emergency` | Health & emergency | does not exist | `FAQs.ts` L70 |
| `getting-around` | Getting around (guest) | does not exist | `FAQs.ts` L71 |
| `house-rules` | House & rules | does not exist | `FAQs.ts` L72 |

**Total: 17 values** (8 prospect-commented + 9 guest-commented). Note: guest A–Z seed also uses `dining` (`guest-az-faqs.ts` e.g. L539–540), which appears only under the prospect comment block.

---

## 3. `relevantPages`

| Location | file:line | What it does |
|---|---|---|
| Collection field | `src/collections/FAQs.ts` L79–87 | Defines `relationship` → `pages`, `hasMany: true`; admin description for optional pin |
| Generated types | `src/payload-types.ts` L1025, L2319 | Type mirror of the field |
| Selection logic | `src/lib/faqs/getRelevantFaqs.ts` L44–47 | If `pageId` is passed, FAQs whose `relevantPages` contains that id are treated as pinned (sorted ahead of category matches) |
| Mini-block prop | `src/components/sections/FAQSection.tsx` L14, L31, L46 | Accepts optional `pageId` and forwards it to `getRelevantFaqs` |
| Callers passing `pageId` | does not exist | `rg pageId=` under `src/` is empty — no page currently supplies a pin id |
| `getFaqs` | `src/lib/faqs/getFaqs.ts` | does not read or filter on `relevantPages` |
| Seed `upsertFaqs` | `src/seed/faqs.ts` | does not write `relevantPages` (only slug/question/answer/context/category/order — L17, L41–79) |
| Seed data arrays | `src/seed/data.ts` `faqsSeed`, `src/seed/guest-az-faqs.ts` | no `relevantPages` property on any record |
| Admin hooks | does not exist | no FAQ collection hooks referencing `relevantPages` |
| Migrations | `src/migrations/20260921_090837_baseline.ts` L453, L1305–1306, L1503–1506 | Creates `faqs_rels` join table (supports the relationship); no data seed |
| Schema inventory (prior snapshot) | `docs/content/schema-inventory.md` L1411, L2048 | Notes `faqs.relevantPages 0/57` |

### Non-empty `relevantPages` counts

| Source | Count with non-empty `relevantPages` |
|---|---|
| Seed records (code) | **0** — field never set in seed |
| Live DB (`faqs_rels` where relationship would store pages) | **0** rows in `faqs_rels` (queried 2026-10-05) |

---

## 4. Live data (dev Postgres, read-only)

Connection: `DATABASE_URL` from `.env` → local `hotelberlin`. Queried via `psql` (no seed/migration run).

### Totals by context

| context | count |
|---|---|
| prospect | 6 |
| guest | 41 |
| **total** | **47** |

### DE locale completeness / parity

Joined `faqs` ↔ `faqs_locales` (`en` / `de`).

| Metric | Count |
|---|---|
| Non-empty DE question | 47 |
| Non-empty DE answer | 47 |
| DE question === EN question | 0 |
| DE answer === EN answer | 0 |

### Slug set vs `existing-faqs.json`

| Diff | Result |
|---|---|
| In DB, not in JSON | *(none)* |
| In JSON, not in DB | *(none)* |

Exact 47↔47 slug match.

---

## 5. Overlap: triage workbook FAQs sheet vs existing 47

Workbook: `doc/faqs/HotelBerlin_FAQ_Triage.xlsx` sheet **FAQs** (columns ID, Topic, Question EN, Answer EN). Mechanical topic/keyword/number matching. Levels: **likely** = same subject clearly; **possible** = related but narrower/wider or partial. No judgment of which text is better.

### F01 — checkin-checkout

**Q (EN):** What time can I check in, and what if I arrive late?

| existing slug | level | basis |
|---|---|---|
| `check-in-time` | likely | shared topic check-in time; EN answers both state 15:00 |
| `guest-checkin` | likely | shared topic check-in time; EN answers both state 15:00 |

### F02 — checkin-checkout

**Q (EN):** Can I check in online?

Matches: *(none)*

### F03 — checkin-checkout

**Q (EN):** Can I leave my luggage before check-in?

| existing slug | level | basis |
|---|---|---|
| `guest-luggage` | likely | luggage before check-in |
| `guest-checkin` | possible | guest-checkin answer mentions luggage storage if early |

### F04 — checkin-checkout

**Q (EN):** What time is check-out, and can I stay longer?

| existing slug | level | basis |
|---|---|---|
| `guest-checkout` | likely | check-out time 12:00; later check-out |

### F05 — checkin-checkout

**Q (EN):** Do I need to leave my key in the room at check-out?

| existing slug | level | basis |
|---|---|---|
| `guest-checkout` | possible | same check-out FAQ; workbook asks about key drop specifically |

### F06 — parking

**Q (EN):** Can I reserve parking, and how much does it cost?

| existing slug | level | basis |
|---|---|---|
| `parking` | likely | parking availability and €4/€25 pricing |
| `guest-parking` | likely | parking spaces/pricing 208, €4, €25, 1.80 m |

### F07 — getting-here

**Q (EN):** Do you offer an airport transfer, and how do I get to the hotel from the airport?

| existing slug | level | basis |
|---|---|---|
| `airport-transfer` | likely | airport to hotel directions |

### F08 — breakfast

**Q (EN):** When is breakfast served?

| existing slug | level | basis |
|---|---|---|
| `breakfast-times` | likely | breakfast serving times |
| `guest-breakfast` | likely | breakfast times including weekend until 11:00 |

### F09 — breakfast

**Q (EN):** Where is the breakfast restaurant?

| existing slug | level | basis |
|---|---|---|
| `breakfast-times` | possible | breakfast topic only; location not in existing answers |
| `guest-breakfast` | possible | breakfast topic only; location not in existing answers |

### F10 — breakfast

**Q (EN):** Can I book breakfast after I've booked my room, and what does it cost?

| existing slug | level | basis |
|---|---|---|
| `guest-breakfast` | likely | breakfast cost €23 / child price |
| `breakfast-times` | possible | breakfast topic; times only, no price |

### F11 — dining

**Q (EN):** Do you have room service?

| existing slug | level | basis |
|---|---|---|
| `guest-room-service` | likely | room service question |

### F12 — wifi

**Q (EN):** How do I connect to the WiFi?

| existing slug | level | basis |
|---|---|---|
| `guest-wifi` | likely | WiFi connect question (workbook: “How do I connect to the WiFi?”; existing: “…to the hotel WiFi?”) |

### F13 — pets

**Q (EN):** Can I bring my dog?

| existing slug | level | basis |
|---|---|---|
| `guest-dogs` | likely | dogs allowed + fee |
| `pet-policy` | likely | pets allowed + €30 fee |

### F14 — rooms

**Q (EN):** Can I request a quiet room?

Matches: *(none)*

### F15 — rooms

**Q (EN):** Do any rooms have a balcony?

Matches: *(none)*

### F16 — rooms

**Q (EN):** Which are the largest rooms?

Matches: *(none)*

### F17 — rooms

**Q (EN):** How do I find my room?

Matches: *(none)*

### F18 — in-room

**Q (EN):** Do I need my key card to use the lifts?

Matches: *(none)*

### F19 — in-room

**Q (EN):** Is there a Nespresso machine in the room?

Matches: *(none)*

### F20 — in-room

**Q (EN):** Is my room cleaned every day?

| existing slug | level | basis |
|---|---|---|
| `guest-housekeeping` | likely | room cleaning / housekeeping frequency |

### F21 — in-room

**Q (EN):** Can I connect my own streaming stick (e.g. Amazon Fire TV) to the TV?

Matches: *(none)*

### F22 — services

**Q (EN):** Where can I get a power adapter?

| existing slug | level | basis |
|---|---|---|
| `guest-adapter` | likely | power adapter |

### F23 — services

**Q (EN):** Can I borrow an iron or an ironing board?

| existing slug | level | basis |
|---|---|---|
| `guest-iron` | likely | iron / Bügeleisen |

### F24 — services

**Q (EN):** Do you offer a laundry service?

Matches: *(none)*

### F25 — services

**Q (EN):** Can you print a document for me?

Matches: *(none)*

### F26 — wellness

**Q (EN):** What are the sauna opening hours?

| existing slug | level | basis |
|---|---|---|
| `guest-sauna` | possible | sauna access; existing has notice period not clock hours |

### F27 — wellness

**Q (EN):** Is the sauna clothing-free?

| existing slug | level | basis |
|---|---|---|
| `guest-sauna` | possible | sauna topic only |

### F28 — wellness

**Q (EN):** Who can use the gym?

| existing slug | level | basis |
|---|---|---|
| `guest-gym` | likely | gym access for guests |

### F29 — activities

**Q (EN):** Is there still a fingerboard park?

Matches: *(none)*

### F30 — bikes

**Q (EN):** Can I store my own bike at the hotel?

| existing slug | level | basis |
|---|---|---|
| `guest-bike-garage` | likely | store bike |

### F31 — bikes

**Q (EN):** Can I rent a bike?

| existing slug | level | basis |
|---|---|---|
| `guest-bike-garage` | possible | bike facility; rent vs store |

### F32 — payment

**Q (EN):** Can I pay without a credit card?

| existing slug | level | basis |
|---|---|---|
| `guest-card-only` | likely | cash vs card payment |
| `guest-dining-card-only` | possible | card-only for food/drink |

### F33 — loyalty

**Q (EN):** Do you have a loyalty programme?

Matches: *(none)*

### F34 — lost-property

**Q (EN):** I lost something at the hotel. What should I do?

| existing slug | level | basis |
|---|---|---|
| `guest-lost-and-found` | likely | lost property / Fundbüro |

### F35 — meetings

**Q (EN):** How do I book a meeting room?

Matches: *(none)*

### F36 — contact

**Q (EN):** How can I contact the hotel?

| existing slug | level | basis |
|---|---|---|
| `guest-care-center` | possible | where to get help / Guest Care |
| `guest-staff-24-7` | possible | staff contactability |

### F37 — payment

**Q (EN):** How do I change a prepayment invoice?

Matches: *(none)*

### F38 — sustainability

**Q (EN):** Who is the contact for sustainability?

Matches: *(none)*

---

## 6. Typed facts in existing answers (token candidates)

Scanned EN and DE `question`/`answer` in the 47 export records for hard-typed prices, clock times / 24×7 phrases, phone numbers, emails, URLs. (Addresses and quantities like “208 spaces” / “1.80 m” omitted — not in the requested kinds.)

| slug | locale | literal | kind |
|---|---|---|---|
| `breakfast-times` | de | `06:30` | time |
| `breakfast-times` | de | `10:00` | time |
| `breakfast-times` | en | `06:30` | time |
| `breakfast-times` | en | `10:00` | time |
| `cancellation-flexible` | de | `90 %` | price |
| `cancellation-flexible` | de | `18:00` | time |
| `cancellation-flexible` | en | `90%` | price |
| `cancellation-flexible` | en | `18:00` | time |
| `check-in-time` | de | `30 €` | price |
| `check-in-time` | de | `06:00` | time |
| `check-in-time` | de | `15:00` | time |
| `check-in-time` | en | `€30` | price |
| `check-in-time` | en | `06:00` | time |
| `check-in-time` | en | `15:00` | time |
| `guest-adapter` | de | `24/7` | time |
| `guest-adapter` | en | `24/7` | time |
| `guest-breakfast` | de | `12 €` | price |
| `guest-breakfast` | de | `23 €` | price |
| `guest-breakfast` | de | `06:30` | time |
| `guest-breakfast` | de | `10:00` | time |
| `guest-breakfast` | de | `11:00` | time |
| `guest-breakfast` | en | `€12` | price |
| `guest-breakfast` | en | `€23` | price |
| `guest-breakfast` | en | `06:30` | time |
| `guest-breakfast` | en | `10:00` | time |
| `guest-breakfast` | en | `11:00` | time |
| `guest-care-center` | de | `24/7` | time |
| `guest-care-center` | en | `24/7` | time |
| `guest-checkin` | de | `15:00` | time |
| `guest-checkin` | en | `15:00` | time |
| `guest-checkout` | de | `12:00` | time |
| `guest-checkout` | en | `12:00` | time |
| `guest-dogs` | de | `30 €/Tag` | price |
| `guest-dogs` | en | `€30 per day` | price |
| `guest-emergency` | de | `112` | phone |
| `guest-emergency` | de | `Rund um die Uhr` | time |
| `guest-emergency` | en | `112` | phone |
| `guest-emergency` | en | `around the clock` | time |
| `guest-gym` | de | `24/7` | time |
| `guest-gym` | en | `24/7` | time |
| `guest-lost-and-found` | de | `rund um die Uhr` | time |
| `guest-lost-and-found` | en | `24/7` | time |
| `guest-lutze-hours` | de | `01:00` | time |
| `guest-lutze-hours` | de | `10:00` | time |
| `guest-lutze-hours` | en | `01:00` | time |
| `guest-lutze-hours` | en | `10:00` | time |
| `guest-medical-on-call` | de | `112` | phone |
| `guest-medical-on-call` | de | `116 117` | phone |
| `guest-medical-on-call` | en | `112` | phone |
| `guest-medical-on-call` | en | `116 117` | phone |
| `guest-minibar` | de | `24/7` | time |
| `guest-minibar` | en | `24/7` | time |
| `guest-nonsmoking` | de | `250 €` | price |
| `guest-nonsmoking` | en | `€250` | price |
| `guest-parking` | de | `25 €/Tag` | price |
| `guest-parking` | de | `4 €/Std` | price |
| `guest-parking` | en | `€25 per day` | price |
| `guest-parking` | en | `€4 per hour` | price |
| `guest-phone-rates` | de | `0,40 €/Min` | price |
| `guest-phone-rates` | de | `0,80–3,20 €/Min` | price |
| `guest-phone-rates` | de | `3,20 €/Min` | price |
| `guest-phone-rates` | en | `€0.40 per minute` | price |
| `guest-phone-rates` | en | `€0.80–€3.20 per minute` | price |
| `guest-staff-24-7` | de | `Rund um die Uhr` | time |
| `guest-staff-24-7` | en | `around the clock` | time |
| `guest-wundermart` | de | `24/7` | time |
| `guest-wundermart` | en | `24/7` | time |
| `parking` | de | `25 € pro Tag` | price |
| `parking` | de | `4 € pro Stunde` | price |
| `parking` | en | `€25 per day` | price |
| `parking` | en | `€4 per hour` | price |
| `pet-policy` | de | `30 € pro Nacht` | price |
| `pet-policy` | en | `€30 per night` | price |

Total fact rows: **73**. Emails: **0**. URLs: **0**.

---

## Observations

(Opinions / surprises only — not facts for the reconcile table above.)

1. Live DB already matches the merged seed set exactly (47/47, full DE, zero DE===EN). Reconcile can treat seed JSON as authoritative for current content.
2. Two `faqsSeed` guest rows (`guest-neighbourhood-walk`, `guest-general-reception`) are dead weight in `data.ts` — seed deletes them; they never appear in the 47.
3. Overlap A–Z vs `faqsSeed` for wifi/luggage/checkout: EN/DE text is identical today, but **category differs** (e.g. A–Z `guest-wifi` is `in-room` vs seed `wifi-tech`). A–Z wins on seed.
4. `relevantPages` is schema-only dead wire: defined, typed, selectable in `getRelevantFaqs`, but never seeded, never related in DB, never passed as `pageId` from a page.
5. Workbook FAQs with **no** existing counterpart cluster around rooms product detail (balcony, quiet, size, Nespresso, lifts, streaming), online check-in, laundry/print, fingerboard, loyalty, meetings booking, sustainability contact, invoice amend — i.e. net-new content for triage import.
6. Airport directions diverge between existing (`RE7`/`RB14` + Bus 100) and workbook F07 (`RE20`/`FEX` + Bus 106 / M46) — same topic, different facts; flagged as likely overlap only on subject, not on content agreement.
7. Category select labels have no DE admin strings; hotel staff UI is English-only for this field.
8. Prospect seed puts check-in/parking/pets/airport under `category: general` so the homepage mini-block can pull them — taxonomy in the workbook is topic-based instead.

---

*Hotel Berlin, Berlin — FAQ System Part A follow-up · 5 October 2026*
