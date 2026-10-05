# FAQ System: Part A status audit — 5 October 2026

*Report only. Repo unchanged except this file.*
*Against: `doc/faqs/HotelBerlin_FAQSystem_BuildBrief.md` Part A (L17–31), companion `doc/faqs/HotelBerlin_FAQ_Triage.xlsx`.*

**Missing source documents (referenced by the audit brief, not in the repo today):**

| Named document | Status |
|---|---|
| `HotelBerlin_AISurvey_BuildBrief.md` | **does not exist** (cited at BuildBrief L21 for `context` / `category` spec). Current `faqs` shape matches the older in-repo `doc/faqs/HotelBerlin_FAQ_BuildBrief.md` instead. |

**In-repo sources used:** `doc/faqs/HotelBerlin_FAQSystem_BuildBrief.md`, `doc/faqs/HotelBerlin_FAQ_Triage.xlsx` (sheets: README, FAQs, Taxonomy, Tokens, Routes, Placement, Gaps, Contact routing, Source map), `doc/faqs/HotelBerlin_FAQ_BuildBrief.md` (legacy shell this code implements).

---

## Verdict

A working FAQ **shell** from the older brief already ships: Payload `faqs` + `getFaqs` + accordion on home / rooms / `/faq` / `/here` / `/here/faq` + `buildFAQPageGraph` from CMS text. The **October 2026 hybrid model is not started** — no `faq-topics`, no `faqPlacements`, no route registry, no `{{token}}` resolver, no triage seed (38 drafts F01–F38). Current seed is **47** legacy rows (6 prospect + 41 guest A–Z), not the workbook set. Every Routes-sheet page template **already exists**, including `/faq` (workbook note “new” is stale).

---

## 1. `faqs` collection today

**Definition:** `src/collections/FAQs.ts`  
**Registered:** `src/payload.config.ts` (import + collections array)  
**Generated type:** `src/payload-types.ts` (`Faq` — `question`/`answer` strings; `context: 'prospect' | 'guest'`)

### Collection admin

| Setting | Evidence |
|---|---|
| `slug: 'faqs'` | `FAQs.ts` L5 |
| `useAsTitle: 'question'` | L8 |
| `defaultColumns` | L9 — `question`, `context`, `category`, `order` |
| `group: 'Content'` | L10 |
| `access.read: () => true` | L12–14 |
| `admin.hidden: hideFromHotelStaff` | L7 |

### Fields (every field)

| Field | Type | Required | Localized | Options / notes | admin.description |
|---|---|---|---|---|---|
| `question` | `text` | yes (L19) | yes (L20) | — | L22–23 — write as someone would ask an AI |
| `answer` | **`textarea`** (not `richText`) | yes (L29) | yes (L30) | Admin: “Plain text, not richText” | L32–33 — ships into FAQPage `acceptedAnswer.text` |
| `context` | `select` | yes (L39) | no | **`prospect` \| `guest` only — no `both`** (L40–43); admin says duplicate if needed | L45–46 |
| `category` | `select` | yes (L52) | no | 17 values: prospect L55–62, guest L64–72 | L75–76 — “provisional until real questions land” |
| `relevantPages` | relationship → `pages`, `hasMany` | no | no | Old pin-to-page model | L85–86 |
| `order` | `number` | yes (L92) | no | `defaultValue: 0` (L93) | L95 |
| `slug` | `text`, `unique` | yes (L102) | no | Sidebar; deep-link anchor | L105 |

### Specced Part B fields / collections

| Item | Status |
|---|---|
| `audience` with `both` | **does not exist** — use `context` without `both` |
| `topic` / `secondaryTopics` → `faq-topics` | **does not exist** |
| `priority`, `pinnedRoutes`, `pinnedEntities` | **do not exist** |
| `internalNote`, `source`, `lastReviewed` | **do not exist** |
| `_status` drafts | **does not exist** on this collection |
| `faq-topics` collection | **does not exist** under `src/` |
| `faqPlacements` global | **does not exist** under `src/globals/` |

**AISurvey / category as specced:** Cannot verify against missing `HotelBerlin_AISurvey_BuildBrief.md`. Present `context` + `category` match `doc/faqs/HotelBerlin_FAQ_BuildBrief.md` §1. **`answer` is localized but not richText** (BuildBrief Part B asks for richText).

---

## 2. Seed state

| Artifact | Role | Evidence |
|---|---|---|
| `src/seed/data.ts` → `faqsSeed` | 11 rows (6 prospect + 5 guest) | ~L966–1101 |
| `src/seed/guest-az-faqs.ts` → `GUEST_AZ_FAQS` | 41 guest A–Z rows | verified: 41 unique slugs |
| `src/seed/faqs.ts` → `upsertFaqs` | CLI `npm run seed:faqs` | L84–116; prospect filter L85–90, guest L92–96 |
| `src/seed/index.ts` | Runs FAQ upsert only when collection empty | ~L237–240 |
| `src/seed/apply-faq-schema.ts` | Postgres enum/column migration, not content | package script `apply:faq-schema` |

**What a full FAQ seed writes:** 6 prospect + 41 guest = **47** distinct slugs (`faqs.ts` L84–96). Guest leftovers not in `GUEST_AZ_FAQS` are deleted (L98–113). Overlap slugs (`guest-wifi`, `guest-luggage`, `guest-checkout`) — A–Z wins.

**Workbook target:** 38 FAQs (F01–F38) in the FAQs sheet — **not seeded**.

**EN/DE parity (seed source files, field-level):**

| Source | Rows with DE | DE question === EN | DE answer === EN |
|---|---|---|---|
| `faqsSeed` (11) | 11 | **0** | **0** |
| `GUEST_AZ_FAQS` (41) | 41 | **0** | **0** |

Upsert writes EN then DE locale update (`faqs.ts` L41–79, comment L2–3). Live DB row count not re-queried this pass — claim is seed-script intent, not a `payload.find` count.

**Static FAQ JSON file:** **does not exist**.

---

## 3. Data seam

| Symbol | Status | Implementation |
|---|---|---|
| `getFAQsProspect()` | **does not exist** | Named only in BuildBrief L23 |
| `getFAQsGuest()` | **does not exist** | Same |
| `getFaqs()` | **exists — Payload** | `src/lib/faqs/getFaqs.ts` L62–79 — `payload.find({ collection: 'faqs', locale, fallbackLocale: 'en', where: { context }, sort: 'order' })` |
| `getRelevantFaqs()` | **exists — pure filter** | `src/lib/faqs/getRelevantFaqs.ts` — no I/O |
| `getFAQs()` (deprecated) | **Payload wrapper** | `src/lib/payload/faqs.ts` |
| `getFAQsForRoute()` | **does not exist** | Part B §3 |
| Token resolver / route registry | **do not exist** | Part B §2 / §4 |

**Call sites today:** `/faq` and `/here/faq` pages; `FAQSection`; `HereHelpSection` — all via `getFaqs({ context })`.

---

## 4. Where FAQs render today

### Surfaces

| Surface | Route (key → DE/EN) | Entry | UI stack | Data |
|---|---|---|---|---|
| Homepage mini | `/` | `src/app/[locale]/page.tsx` ~L79–83 | `FAQSection` → `FAQAccordion` | prospect + `getRelevantFaqs` (category `general`, limit 4) — `FAQSection.tsx` L27–50 |
| Rooms mini | `/rooms` → DE `/zimmer` | `rooms/page.tsx` ~L194 | same | `FAQSection context="prospect" category="general"` |
| Prospect hub | `/faq` → `/de/faq`, `/en/faq` | `faq/page.tsx` | `FAQPageView` → `FAQAccordion` | `getFaqs({ context: 'prospect' })` |
| Guest hub mini | `/here` → DE `/hier` | `here/page.tsx` ~L89 | `HereHelpSection` → `FAQAccordion` | guest + `HUB_FAQ_SLUGS` (`guest-wifi`, `guest-luggage`, `guest-checkout`) — `getFaqs.ts` L52–53 |
| Guest hub full | `/here/faq` → DE `/hier/faq` | `here/faq/page.tsx` | `FAQPageView` | `getFaqs({ context: 'guest' })` |

**Not rendering FAQ accordion today (Part B drop-in targets):** meetings, `rooms/[slug]`, amenities, contact, sustainability, offers, all five policy pages, `here/dining`, `here/getting-around`.

**FAQ-adjacent (not accordion):** amenity rows link to `/faq#…` or `/here/faq#…`; `StayInfoCard` default `faqHref = '/here/faq'`.

### Aria (shared accordion)

`src/components/primitives/FAQAccordion.tsx`:

- Trigger: `aria-expanded`, `aria-controls` (L91–92); question `id` (L90)
- Panel: `role="region"`, `aria-labelledby`, `aria-hidden` when closed, `inert` when closed (L106–111)
- Chevron: `aria-hidden="true"` (L98)
- Section heading: `aria-labelledby="faq-heading"` when heading set (~L141–150)
- Hash deep-link opens item on mount (L69–76)

`FAQPageView`: category filter `role="group"` + chips `aria-pressed`.  
`HereHelpSection`: `aria-labelledby="here-faq-heading"` (L46).

### DE vs EN

- UI chrome: `src/messages/de.json` / `en.json` `faq.*` and `here.faqsHeading` — proper DE present.
- CMS Q&A: localized fields; fetch uses `fallbackLocale: 'en'` (`getFaqs.ts` L72) — missing DE in DB → English on `/de`.
- Hardcoded EN default: `ctaLabel = 'See all FAQs'` (`FAQAccordion.tsx` L60); `FAQSection` overrides with `t('allFaqs')` (L71).

---

## 5. JSON-LD

**Builder:** `src/lib/aeo-schema/src/builders/faq.ts` — `buildFAQPageGraph` (L21–33). Maps Payload `question` → `Question.name`, `answer` → `Answer.text`. Comment L17–19: pass the exact list on screen. **Not hardcoded FAQ text.**

| Route / surface | Call site | Input |
|---|---|---|
| Homepage mini | `FAQSection.tsx` L59–64 | mini `relevant` subset |
| `/rooms` mini | same component | same |
| `/faq` | `faq/page.tsx` | **full** prospect list from CMS (page comment: full set even when UI chips filter) |
| `/here` hub | `HereHelpSection.tsx` L49 | hub slug subset |
| `/here/faq` | `here/faq/page.tsx` | full guest set |

Emitted via `JsonLdScript`. No other `buildFAQPageGraph` call sites in `src/`.

---

## 6. `hotel` global and token-source fields

**Schema:** `src/globals/Hotel.ts` (slug `hotel`).  
**No `Dining` collection** — outlets use `venues`. Facilities use `amenities`.

| Requested field | Status | Evidence |
|---|---|---|
| Check-in time | **Exists** | `checkinTime` L91 |
| Check-out time | **Exists** | `checkoutTime` L92; guest hero `guestStay.checkout` L108–113 |
| Late check-out time/fee | **Does not exist** as dedicated fields; copy-only via checkout notes (“Later on request”) | L108–112 |
| Pet fee | **Exists** as localized text pair (not numeric) | `guestStay.more.pets` L149–154 (defaults €30/day) |
| WiFi SSID | **Exists** | `guestStay.wifiNetwork` L99–101 |
| WiFi password | **Exists** (related) | L104–106 |
| Telephone | **Exists** | `telephone` L48 |
| Reception phone | **Does not exist** (separate). Related: `conferencePhone` L49 | |
| Email | **Exists** | `email` L50 |
| Reservations / sustainability / careers emails | **Do not exist** on `hotel` | |
| Address | **Exists** | `address` group L52–59 |
| Lost-property URL | **Does not exist** on `hotel` | |

**Breakfast hours/prices:** `guestStay.breakfast` L114–118; structured `hours` array; `breakfastPricing` L263+. Seed mirrors in `src/seed/data.ts`.  
**Parking:** `guestStay.parking` L120–125 (rates in copy). No parking amenity seed row.  
**Sauna:** `guestStay.more.saunaFitness` summary L143–148; amenity `sauna` seed has `hoursOverride` “Hours to confirm” (`src/seed/data/amenities.ts` L100–111) — aligns with workbook **HOLD** on `{{saunaHours}}`.

### Workbook Tokens sheet — HOLD (do not seed / leave unresolved)

| Token | Status in sheet | Proposed source |
|---|---|---|
| `{{wifiSsid}}` | HOLD | hotel → wifi SSID |
| `{{saunaHours}}` | HOLD | amenities → sauna.hours |
| `{{phoneMain}}` | HOLD | hotel → telephone |
| `{{phoneReception}}` | HOLD | hotel → receptionPhone (field missing) |

---

## 7. Route inventory vs Routes sheet

**Pathnames:** `src/i18n/pathnames.ts` L7–79. Locales always prefixed (`/de/…`, `/en/…`).

### Workbook Routes sheet (18 keys) → templates

| Route ID | Workbook path note | Template exists? | EN | DE |
|---|---|---|---|---|
| `home` | `/` | **yes** `page.tsx` | `/en` | `/de` |
| `rooms` | `/rooms` | **yes** | `/en/rooms` | `/de/zimmer` |
| `room-detail` | `/rooms/[slug]` | **yes** | `/en/rooms/…` | `/de/zimmer/…` |
| `meetings` | `/meetings` | **yes** | `/en/meetings` | `/de/tagungen` |
| `amenities` | `/amenities (TBC)` | **yes** — TBC resolved | `/en/amenities` | `/de/ausstattung` |
| `sustainability` | `/sustainability` | **yes** | `/en/sustainability` | `/de/nachhaltigkeit` |
| `offers` | `/offers` | **yes** | `/en/offers` | `/de/angebote` |
| `contact` | `/contact` | **yes** | `/en/contact` | `/de/kontakt` |
| `faq` | `/faq (new)` | **yes** — not new | `/en/faq` | `/de/faq` (slug placeholder, L53 comment) |
| `here` | `/here` | **yes** | `/en/here` | `/de/hier` |
| `here-dining` | `/here/dining` | **yes** | `/en/here/dining` | `/de/hier/dining` |
| `here-getting-around` | `/here/getting-around` | **yes** | `/en/here/getting-around` | `/de/hier/getting-around` |
| `here-faq` | `/here/faq` | **yes** | `/en/here/faq` | `/de/hier/faq` |
| `policy-checkin` | `/policies/check-in` | **yes** | `/en/policies/check-in` | `/de/richtlinien/check-in` |
| `policy-cancellation` | `/policies/cancellation` | **yes** | … | `/de/richtlinien/stornierung` |
| `policy-pets` | `/policies/pets` | **yes** | … | `/de/richtlinien/haustiere` |
| `policy-fees` | `/policies/fees` | **yes** | … | `/de/richtlinien/parken` |
| `policy-payment` | `/policies/payment` | **yes** | … | `/de/richtlinien/zahlung` |

**None of the Routes-sheet paths are missing as templates.** Flags from the brief’s “flag any that do not exist” list are **resolved in code** (all exist).

**Related gaps (not in Routes sheet):**

| Path | Status |
|---|---|
| `/faqs` | Pathname only (`pathnames.ts` L54) — **no** `src/app/[locale]/faqs/page.tsx` |
| `/parking` | Linked in footer seed — **does not exist** in pathnames or app |

**Full pathname key list:** `/`, `/here`, `/here/events`, `/here/getting-around`, `/here/explore`, `/here/gallery`, `/here/dining`, `/here/faq`, `/here/art`, `/here/art/[slug]`, `/here/wallride`, `/neighbourhood`, `/neighbourhood/[slug]`, `/map-styles`, `/you-me-berlin`, `/you-me-berlin/[slug]`, `/rooms`, `/rooms/[slug]`, `/meetings`, `/meetings/[slug]`, `/meetings/request`, `/meetings/hybrid`, `/restaurant`, `/happenings`, `/happenings/[slug]`, `/offers`, `/faq`, `/faqs`, `/imprint`, `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/about`, `/people`, `/on-the-walls`, `/accessibility`, `/sustainability`, `/contact`, `/amenities`, `/awards`, `/policies/cancellation`, `/policies/check-in`, `/policies/pets`, `/policies/fees`, `/policies/payment`.

---

## 8. Rich-text serialization

| Need | Status | Evidence |
|---|---|---|
| FAQ answers today | Plain `textarea` → `<p>{item.answer}</p>` | `FAQs.ts` L27–34; `FAQAccordion.tsx` L117–118 |
| Lexical → plain text | **`lexicalToPlain`** | `src/lib/richText/lexicalToPlain.ts` |
| Lexical → UI paragraphs | `RichTextParagraphs` → plain `<p>` (not HTML string) | used on rooms/meetings/etc. |
| Lexical → HTML string | **`convertLexicalToHTML` does not exist** | grep: no matches |
| Legal richText | `lexicalToBlocks` → React components | `src/lib/legal/lexical.ts` |

**Implication for Part B:** If `answer` becomes richText, use `lexicalToPlain` for tokens + JSON-LD; UI needs an explicit choice (plain paragraphs vs richer renderer). Token strings in the workbook are plain `{{name}}` in textarea-style answers today.

---

## Workbook deltas (content vs code)

| Topic | Workbook | Code today |
|---|---|---|
| FAQ count | 38 (F01–F38) | 47 seed rows (different content model) |
| Topics | 20 + empty `cancellation` (Taxonomy) | Hard-coded `category` select (17 values, different taxonomy) |
| Audience `both` | Used heavily | Schema forbids `both` — duplicate records |
| Placement oracle | Placement sheet formulas | Category / slug heuristics only |
| Tokens | 29 tokens; 4 HOLD | No resolver; prices/times typed into seed answers |

---

## Open items — do not silently resolve

From BuildBrief L154–171, with status notes where the audit can speak:

1. **Does `/faq` (prospect full list) exist?** **Yes — already live** (`faq/page.tsx`, `pathnames.ts` L53). Open item reframes to: confirm keep / localize DE slug (still `/de/faq` placeholder). Not “build new”.
2. **Pinned vs cap.** Proposed: pinned never trimmed, fill trimmed to cap. Alternative: cap applies to everything. — unresolved.
3. **Topics as a collection vs a hard-coded select.** Proposed: collection. — unresolved (today: hard-coded `category`).
4. **Placement in CMS vs code.** Proposed: `faqPlacements` global + route keys in code. — unresolved.
5. **Which phone number is canonical** and what `{{phoneReception}}` is. Blocks F02, F13, F23, F36. — **blocked**; `receptionPhone` field missing; `{{phoneMain}}` / `{{phoneReception}}` HOLD.
6. **Sauna hours** — two published schedules conflict. Blocks F26. — **blocked** (amenity override + HOLD).
7. **WiFi SSID/password publishability.** Blocks F12. — **blocked** (field exists; HOLD).
8. **Check-in time** (15:00). F01. — needs confirm (`checkinTime` field exists).
9. **Fingerboard park location/hours.** Blocks F29. — unresolved.
10. **Room-number → floor logic** (F17), **Nespresso capsules** (F19). — unresolved.
11. **Giropay** / cashless wording (F32). — unresolved.
12. **Radisson Rewards** naming/benefits and link (F33). — unresolved.
13. **Internship/careers** — not an FAQ; no careers page. — unresolved.
14. **Gaps sheet** (17 gaps) — cancellation and accessibility required by AEO, no answer yet. — unresolved.
15. **German review** — DE drafts in `du`; native pass needed. — unresolved (legacy seed DE ≠ EN, but triage DE is new draft set).
16. **Contact-routing items** — keep as FAQs or contact block? Workbook keeps both. — unresolved.

---

## Part A checklist (BuildBrief L17–31)

| # | Item | Done? |
|---|---|---|
| 1 | `faqs` fields + context/category + answer type | ✅ reported |
| 2 | Seed state / EN–DE parity | ✅ reported |
| 3 | `getFAQsProspect` / `getFAQsGuest` seam | ✅ reported (symbols absent; Payload `getFaqs`) |
| 4 | Where FAQs render + aria + DE | ✅ reported |
| 5 | JSON-LD FAQPage routes + source | ✅ reported |
| 6 | hotel / amenity / dining token sources | ✅ reported |
| 7 | Route inventory vs Routes sheet | ✅ reported — all 18 exist |
| 8 | Rich-text → HTML / plain | ✅ reported |

**Part B not started.** No schema, seed, token, or placement work until this report is reviewed.

---

*Hotel Berlin, Berlin — FAQ System Part A · 5 October 2026*
