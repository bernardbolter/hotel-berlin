# Hotel Berlin, Berlin — FAQ System — Cursor Build Brief
*Paste into Cursor against the `hotel-berlin-de` repo. October 2026.*
*Companion file: `HotelBerlin_FAQ_Triage.xlsx` (the content, tokens, topic taxonomy, route table and placement matrix this brief implements).*

---

## Why this exists

The DialogShift chatbot export (42 Q&As) was triaged into **38 FAQs** with EN + DE answers. The site needs (a) one comprehensive FAQ set and (b) a way to show the *relevant* FAQs on each page without editors wiring every FAQ to every page by hand.

Design is a **hybrid**: FAQs carry **topics**; each page template declares which topics it shows; an FAQ can additionally be **pinned** to a specific route or a specific entity (a room, a venue). Everything resolves from one `faqs` collection, so `/faq`, `/here/faq` and every embedded section are views of the same data.

Governing principles that apply (from `decisions-and-principles`): **maintenance-aware defaults** (no price/hour/phone typed into answer text), **hide-don't-delete**, **open items stay open**, **AEO-first** (JSON-LD is a render-time projection, via `aeo-schema`, never hand-written), entity name is always "Hotel Berlin, Berlin", WCAG 2.1 AA at build time.

---

## Part A — Step 0: report only, change nothing

Answer with file:line. Where something does not exist, write "does not exist".

1. **`faqs` collection today.** Every field (path, type, required, localized, options, admin.description). Does it have `context` (prospect/guest/both) and `category` as specced in `HotelBerlin_AISurvey_BuildBrief.md`? Is `answer` richText, localized?
2. **Seed state.** How many records, what source, EN/DE parity, how many DE values equal EN.
3. **Data seam.** Current implementation of `getFAQsProspect()` / `getFAQsGuest()` — static JSON or Payload?
4. **Where FAQs render today.** Homepage accordion, `/here/faq`, any other. Component names, aria attributes, whether DE strings are English.
5. **JSON-LD.** Which routes emit `FAQPage`, from which function in `aeo-schema`, and is it fed from the collection or hardcoded (FullSiteAudit Q33).
6. **`hotel` global.** Which of these exist as fields today: check-in time, check-out time, late check-out time/fee, pet fee, wifi SSID, telephone, reception phone, email, reservations/sustainability/careers emails, address, lost-property URL. Which amenity/dining records hold breakfast hours/prices, parking, sauna hours.
7. **Route inventory.** Every page template that exists today and its path in both locales (`/de/hier`, `/de/zimmer`, `/de/tagungen`, …), so the route keys in Part B can be matched to real templates. Flag any in the Routes sheet that do not exist (`/faq`, `/policies/*`, `/amenities`, `/contact`, `/sustainability`, `/offers`).
8. **Rich-text serialization.** How richText is rendered to HTML and to plain text (needed for tokens and JSON-LD).

Deliver as a short status report. Do not guess intent; flag it.

---

## Part B — Build (after Part A is reviewed)

### 1. Collections and globals

**`faq-topics`** (collection) — lets the hotel add a topic without a deploy.

| field | type | notes |
|---|---|---|
| `slug` | text, unique, required | e.g. `checkin-checkout` |
| `label` | text, localized, required | EN + DE labels (see Taxonomy sheet) |
| `sortOrder` | number | order on `/faq` grouping |

Seed the 20 topics from the Taxonomy sheet.

**`faqs`** (extend the existing collection; keep existing records)

| field | type | notes |
|---|---|---|
| `question` | text, localized, required | |
| `answer` | richText, localized, required | may contain `{{tokens}}` |
| `audience` | select: `prospect` / `guest` / `both` | maps to existing `context` if present — do not duplicate |
| `topic` | relationship → `faq-topics`, required | primary |
| `secondaryTopics` | relationship → `faq-topics`, hasMany | optional |
| `priority` | select 1/2/3 (1 = most important) | decides who survives a route's cap |
| `pinnedRoutes` | select, hasMany | options generated from the route registry (§2) |
| `pinnedEntities` | polymorphic relationship, hasMany → `rooms`, `meeting-rooms`, `venues`, `pages` | e.g. balcony FAQ pinned only to rooms that have balconies |
| `internalNote` | textarea, admin-only | open questions / source; never rendered |
| `source` | select: `chatbot` / `website` / `staff` | |
| `lastReviewed` | date | admin-only; drives a "stale >12 months" admin list view |
| `_status` | drafts on | seed everything as **draft**; hotel publishes |

Add `admin.description` on every field (launch checklist 3.27).

**`faqPlacements`** (global) — array, one row per route key:

| field | type | notes |
|---|---|---|
| `route` | select (from registry) | unique per row |
| `topics` | relationship → `faq-topics`, hasMany | empty = pins only |
| `showAll` | checkbox | true for `/faq` and `/here/faq` (the "ALL" rows in the Routes sheet) |
| `audience` | select `prospect`/`guest`/`both` | |
| `cap` | number | max FAQs rendered inline; ignored when `showAll` |
| `heading` | text, localized, optional | falls back to a default |

Seed from the **Routes** sheet.

### 2. Route registry (code)

`src/lib/faq/routes.ts` exports a const array of route keys (`home`, `rooms`, `room-detail`, `meetings`, `amenities`, `sustainability`, `offers`, `contact`, `faq`, `here`, `here-dining`, `here-getting-around`, `here-faq`, `policy-checkin`, `policy-cancellation`, `policy-pets`, `policy-fees`, `policy-payment`). It is the single source for the `pinnedRoutes` / `faqPlacements.route` option lists. Adding a template = add a key. Keys must match Part A item 7 — **do not invent routes that don't exist**; keys for pages not yet built are registered but inert.

### 3. Selection algorithm

`getFAQsForRoute(routeKey, locale, { entity? })`:

1. Load the placement row for `routeKey`. If missing → return `[]`.
2. **Pinned:** FAQs where `pinnedRoutes` contains `routeKey`, OR (when `entity` is given) `pinnedEntities` contains it. Included regardless of audience.
3. **Topic fill:** FAQs whose `topic` or any `secondaryTopics` is in the placement's `topics` (or all, if `showAll`), AND whose `audience` is `both` or equals the placement's audience (placement `both` matches everything).
4. De-duplicate; order = pinned first, then `priority` asc, then topic `sortOrder`, then FAQ order.
5. Cap: pinned are never trimmed; fill is trimmed so the total ≤ `cap` (unless `showAll`).
6. Return `{ items, trimmedCount }`. When `trimmedCount > 0`, the section links to the full FAQ page for that audience (`/faq` prospect, `/here/faq` guest).
7. Only published FAQs; **drop any FAQ whose tokens cannot all be resolved** (hide-don't-delete) and log a warning with the FAQ id and token.

This is exactly the logic the Placement sheet computes with formulas — use the workbook as the test oracle: write unit tests that load the seeded data and assert each route returns the same set the sheet shows.

### 4. Tokens

Answers store tokens as plain `{{name}}`. A resolver `resolveFaqTokens(text, locale)` runs at render time and in the JSON-LD builder, using a typed registry `src/lib/faq/tokens.ts` mapping each token to a getter on the `hotel` global / amenity / dining / rooms / meetings records (see the **Tokens** sheet for the full list and the proposed source field of each).

- Formatting is locale-aware (`Intl`): `€30` in EN, `30 €` in DE; times as stored (the DE answers add "Uhr").
- A `beforeValidate` hook on `faqs.answer` rejects any `{{token}}` not in the registry (typo guard).
- Missing source value ⇒ unresolved ⇒ FAQ hidden (see §3.7). This is the forcing function: when the hotel changes the parking price in one place, every answer changes.
- **Do not seed any token whose Tokens-sheet status is `HOLD`** (WiFi SSID, sauna hours, both phone numbers). Leave the source field empty so those FAQs stay hidden until confirmed.
- `[CONFIRM: …]` / `[BESTÄTIGEN: …]` / `[ADD: …]` bracket markers in the seed answers mean "draft not final". A `beforeChange` publish guard must block publishing any answer that still contains `[` + uppercase marker.

### 5. Components

Reuse the existing accordion (do not fork it).

- `<FAQSection routeKey entity? />` — server component: calls `getFAQsForRoute`, renders heading, accordion, and the "All questions →" link when trimmed. Renders nothing when `items` is empty.
- Keep existing aria pattern (button + `aria-expanded` + `aria-controls`, region labelled by the question). First item closed by default on cards, open state not persisted.
- Drop into: homepage, `/rooms`, `/rooms/[slug]` (pass `entity`), `/meetings`, `/here`, `/here/dining`, `/here/getting-around`, contact, sustainability, offers, and the policy pages **when those pages exist**.
- `/faq` (prospect) and `/here/faq` (guest): grouped by topic (`faq-topics.sortOrder`), with a topic jump-nav. Confirm whether `/faq` is wanted at all — see Open items.
- Both locales: nothing English may render on `/de`.

### 6. Structured data

- Extend the existing `FAQPage` builder in `src/lib/aeo-schema/` to take the **already-resolved, already-rendered** items (plain text answers, tokens resolved). No hand-written JSON-LD in components.
- Emit `FAQPage` on a route **only for the FAQs actually visible on that route**; text must match the visible answer. When the page already emits another graph, add the FAQPage node into the same `@graph`.
- Add tests: parity between rendered subset and JSON-LD; no unresolved `{{` in output; no FAQ with a bracket marker is emitted.
- Note: Google restricted FAQ rich results to a small set of sites in 2023, as far as I know — the value here is machine-readable answers for AI/answer engines, not a SERP feature. Don't promise rich results to the hotel.

### 7. Seed

Write a script that reads the **FAQs**, **Taxonomy**, **Tokens** and **Routes** sheets of the triage workbook (export to JSON or read xlsx) and creates draft records. Idempotent by FAQ id (store as `externalId`). Map workbook status → `internalNote` prefix (`[HOLD]`, `[NEEDS CONFIRM]`). When the full DialogShift export arrives, import it as a *second* pass that skips questions whose normalised text matches an existing FAQ or its source rows.

### 8. Editor experience

- Admin list view for `faqs`: columns topic, audience, priority, status, lastReviewed; filters for topic and "has bracket marker".
- Admin preview of resolved tokens beside the answer field.
- The hotel's 3–4 general editors can add FAQs and change which topics a page shows (`faqPlacements`) without code. Adding a route is a code change.
- Contribute one instructional video outline for "add a FAQ" to the content-handover list.

---

## Definition of done

- [ ] Part A report delivered and reviewed before any code
- [ ] `faq-topics` seeded (20), `faqs` extended, `faqPlacements` seeded from the Routes sheet
- [ ] 38 FAQs seeded as drafts in EN + DE; DE parity checked (no `de === en`)
- [ ] `getFAQsForRoute` unit tests reproduce the Placement sheet for all 18 routes
- [ ] Token resolver, typo guard, publish guard for bracket markers
- [ ] FAQ with an unresolvable token is hidden and logged, not rendered broken
- [ ] `<FAQSection>` on every route above that exists; empty route renders nothing
- [ ] FAQPage JSON-LD only for visible FAQs; parity tests pass
- [ ] `/here/faq` and (if approved) `/faq` grouped by topic
- [ ] No English on `/de`; WCAG 2.1 AA, keyboard + aria verified
- [ ] `pnpm build`, `tsc --noEmit`, lint, tests clean

---

## Open items — do not silently resolve

1. **Does `/faq` (prospect full list) exist?** The briefs only mention the homepage accordion and `/here/faq`. The workbook assumes a new `/faq`.
2. **Pinned vs cap.** Proposed: pinned never trimmed, fill trimmed to cap. Alternative: cap applies to everything.
3. **Topics as a collection vs a hard-coded select.** Proposed: collection, so editors can add topics. Cost: topics can be created that no route uses.
4. **Placement in CMS vs code.** Proposed: `faqPlacements` global editable by the hotel, route keys in code. Alternative: mapping fully in code.
5. **Which phone number is canonical** (`+49 30 26050`, `+493026050`, `+49 30 2600 50`) and what `{{phoneReception}}` is. Blocks F02, F13, F23, F36.
6. **Sauna hours** — two published schedules conflict (launch checklist 3.13). Blocks F26.
7. **WiFi SSID/password publishability** (D3 / checklist 3.12). Blocks F12.
8. **Check-in time** (15:00 from the old brief stub) — confirm. F01.
9. **Fingerboard park location/hours** (checklist 3.15). Blocks F29.
10. **Room-number → floor logic** (F17), **Nespresso capsules** (F19).
11. **Giropay** still accepted? "Entirely cashless" wording for the payment policy (F32).
12. **Radisson Rewards** naming/benefits and link (F33).
13. **Internship/careers** — no careers page in the briefs; the chatbot's careers email is routed, not an FAQ.
14. **17 gaps** (Gaps sheet) — cancellation and accessibility are required by the AEO brief and have no answer yet.
15. **German review** — DE answers are drafts in the `du` register; a native pass is still needed.
16. **Contact-routing items** (reservations, invoices, printing) — keep as FAQs or fold into a contact block? Workbook keeps both.

---
*Hotel Berlin, Berlin — FAQ System Build Brief · October 2026*
*Base data: `HotelBerlin_FAQ_Triage.xlsx` from the DialogShift chatbot export*
