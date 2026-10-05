# FAQ System — Part B Step 1 report

*5 October 2026. Structure only — no placement logic, tokens, merges, or answer text changes.*
*Against: `HotelBerlin_FAQSystem_Step0_Rulings.md` / Part A Rulings R1–R12; `HotelBerlin_FAQ_Reconciliation.xlsx`; `faq-structure-backfill.json`; Bernard sign-off (existing 47 master; merges deferred; `/de/faq` slug unchanged).*

**Database safety:** `DATABASE_URL` → `postgresql://bescohome@localhost:5432/hotelberlin` (local). Migration SQL tested UP → DOWN → UP on scratch DB `hotelberlin_faq_migtest` (pg_dump of hotelberlin) before applying to local `hotelberlin`. No hosted/production DB touched.

---

## 1. Topics collection (`faq-topics`)

| Item | Evidence |
|---|---|
| Collection | [`src/collections/FaqTopics.ts`](../src/collections/FaqTopics.ts) — `slug` unique+required, `label` localized required, `sortOrder` number; `admin.hidden: hideFromHotelStaff` |
| Registered | [`src/payload.config.ts`](../src/payload.config.ts) — import + `collections` array (with `FAQs`) |
| Seed | 24 rows from `doc/faqs/faq-structure-backfill.json` → Topics (revised), via `npm run faq:backfill-structure -- --write` |
| Live count | `SELECT COUNT(*) FROM faq_topics` → **24** |

---

## 2. Route registry

[`src/lib/faq/routes.ts`](../src/lib/faq/routes.ts) — `FAQ_ROUTE_KEYS` (18), `FAQ_ROUTE_META` (template + EN/DE pathnames), `FAQ_ROUTE_OPTIONS` for `faqs.pinnedRoutes`. Imported only by [`src/collections/FAQs.ts`](../src/collections/FAQs.ts) for select options. No selection algorithm yet.

---

## 3. New fields on `faqs`

[`src/collections/FAQs.ts`](../src/collections/FAQs.ts):

| Field | Notes |
|---|---|
| `audience` | select prospect/guest/both — not required yet; admin.description present |
| `topic` | → `faq-topics` — not required yet |
| `secondaryTopics` | hasMany → `faq-topics` |
| `priority` | select `1`\|`2`\|`3` |
| `pinnedRoutes` | hasMany select from registry |
| `pinnedEntities` | polymorphic hasMany → rooms, meeting-rooms, venues, pages |
| `aliasSlugs` | array of `{ slug }` — for Step 3 |
| `mergedInto` | self-relation — for Step 3 |
| `internalNote` | textarea; field access editor/admin only |
| `source` | chatbot \| website \| staff |
| `lastReviewed` | date |
| `versions.drafts` | enabled |
| `category` | **admin.hidden** (kept) |
| `relevantPages` | **admin.hidden** (kept; R4: unused in live data) |
| `context` | still visible; description says replaced by `audience` |

`getFaqs` now passes `draft: false` ([`src/lib/faqs/getFaqs.ts`](../src/lib/faqs/getFaqs.ts)) so public reads stay on published docs.

---

## 4. Migration + backfill

### Migration

| File | Role |
|---|---|
| [`src/migrations/20261005_140000_faq_topics_and_structure.ts`](../src/migrations/20261005_140000_faq_topics_and_structure.ts) | up/down via drizzle `sql.raw` |
| `…structure.up.sql` / `…structure.down.sql` | DDL + `UPDATE faqs SET _status='published'` |

Registered in [`src/migrations/index.ts`](../src/migrations/index.ts).

**Scratch cycle:** UP_OK → all 47 `published`; DOWN_OK → faq tables gone, 47 faqs remain; UP again OK.

**Local `hotelberlin`:** UP applied; row in `payload_migrations` named `20261005_140000_faq_topics_and_structure`.

*(Note: `payload migrate` CLI hung on an interactive drizzle enum prompt in this environment; SQL was applied via `psql -f` after the scratch proof, then the migrations table was updated. Same SQL as the migration module.)*

### Backfill script

[`scripts/faq-backfill-structure.ts`](../scripts/faq-backfill-structure.ts) — `npm run faq:backfill-structure` (dry-run) / `-- --write`.

- Match by slug; abort if slug sets diverge (none did).
- Sets only: audience, topic, secondaryTopics, priority, source.
- Does **not** touch question/answer/context/category/order.
- Does **not** run merges.

### Dry-run output (abridged; full log `/tmp/faq-backfill-dryrun.txt`)

```
=== faq-topics (24) mode=DRY-RUN ===
  would-create checkin-checkout … house-rules (24 lines)

=== faqs structure backfill (47) mode=DRY-RUN ===
  check-in-time: audience null→both; topic →checkin-checkout; priority null→1; source →website
  … (47 lines)
  guest-dining-card-only: audience null→both; topic →payment; priority null→1; source →website

both-count (file)=26
Dry-run only. Re-run with --write to apply.
```

### Write result

```
WRITE DONE: faq-topics=24; faqs with audience=47; audience=both=26
```

DB: prospect context 6 / guest context 41 unchanged; audience both=26, guest=20, prospect=1; all 47 published with topic+priority+source.

---

## 5. Anchor audit (report only)

`FAQAccordion` hash behaviour ([`src/components/primitives/FAQAccordion.tsx`](../src/components/primitives/FAQAccordion.tsx) L69–76): reads `location.hash`, opens the item whose `item.id` equals the hash (today `id === faq.slug`), scrolls to `faq-question-${hash}`. **No alias support yet** — Step 3 must match hash against `slug` **or** `aliasSlugs[].slug`.

| file:line | link | slug | merge group |
|---|---|---|---|
| `src/seed/data/amenities.ts:92` | relatedFaqSlugs → `/here/faq#guest-gym` (via resolve) | `guest-gym` | N |
| `src/seed/data/amenities.ts:102` | → `#guest-sauna` | `guest-sauna` | N |
| `src/seed/data/amenities.ts:125` | → `#guest-bike-garage` | `guest-bike-garage` | N |
| `src/seed/data/amenities.ts:140` | → `#guest-business-center` | `guest-business-center` | N |
| `src/seed/data/amenities.ts:149` | → `#guest-ev-charging` | `guest-ev-charging` | N |
| `src/lib/amenities/resolve.ts:69` | builds `/here/faq#${slug}` or `/faq#${slug}` | (dynamic) | n/a |
| `src/components/here/StayInfoCard.tsx:43` | default `faqHref='/here/faq'` (no hash) | (none) | n/a |
| `src/lib/faqs/getFaqs.ts:53` | `HUB_FAQ_SLUGS` order (not an href) | `guest-wifi` | N |
| `src/lib/faqs/getFaqs.ts:53` | same | `guest-luggage` | N |
| `src/lib/faqs/getFaqs.ts:53` | same | `guest-checkout` | N |

No `/faq#…` / `/here/faq#…` strings in `src/messages/{en,de}.json`.

**Merge groups (for Step 3 alias work — not executed):** G1 `check-in-time`←`guest-checkin`; G2 `parking`←`guest-parking`; G3 `pet-policy`←`guest-dogs`; G4 `breakfast-times`←`guest-breakfast`; G5 `guest-card-only`←`guest-dining-card-only`; G6 `guest-pharmacy-nollendorf`←`guest-pharmacy-wittenbergplatz`; G7 `guest-emergency`←`guest-staff-24-7`.

---

## 6. Housekeeping (separate commit)

| Change | Evidence |
|---|---|
| `/faqs` → permanent redirect to `/faq` | [`src/app/[locale]/faqs/page.tsx`](../src/app/[locale]/faqs/page.tsx); live `308` → `/de/faq` and `/en/faq` |
| `/faq` DE slug | **unchanged** (`/de/faq`) |
| Footer parking → policy-fees pathname key | [`src/seed/data/footer.ts`](../src/seed/data/footer.ts); [`src/lib/payload/footerFallback.ts`](../src/lib/payload/footerFallback.ts); live `footer_columns_links.external_url` is `/policies/fees` |

Scaffold redirects for `/parking` already existed ([`src/lib/scaffolds/redirects.ts`](../src/lib/scaffolds/redirects.ts) L10–12) — left in place.

---

## Acceptance checklist

| Criterion | Result |
|---|---|
| Before/after HTML + JSON-LD identical on `/de/faq`, `/en/faq`, `/de/hier/faq`, `/en/here/faq`, home mini, `/rooms` mini, `/here` hub (DE+EN) | **Pass** — all 10 surfaces `jsonld_same=True` and `accordion_q_same=True` (entity counts: faq 6, here-faq 41, home/rooms 4, hub 3) |
| faqs row count 47 (6 prospect / 41 guest context), all published | **Pass** |
| Every FAQ has audience, topic, priority; `both` count = 26 (workbook) | **Pass** |
| faq-topics 24; all backfill topic refs exist | **Pass** |
| Migration up AND down clean on scratch | **Pass** (migtest cycle) |
| `tsc --noEmit` | **Pass** (exit 0) |
| lint | **Blocked by pre-existing ESLint config circular JSON error** (unrelated to FAQ files); not introduced by this step |
| tests | **Pass** — `tests/int/guest-az-faqs.int.spec.ts` 6/6 |
| `pnpm build` | **Pass** (exit 0) after removing stale `payload_migrations` row `name='dev'` (batch -1) that forced an interactive “data loss?” prompt during page-data collection |
| Admin: new fields + descriptions; category/relevantPages hidden; drafts toggle | **Pass** — drafts toggled on `check-in-time` then reverted to published |

---

## Surprises

1. Enabling `versions.drafts` via schema push defaults existing rows to `_status=draft`. Migration explicitly sets all to `published` so public counts stay 47.
2. `payload migrate:create` / `payload migrate` hit interactive drizzle “create or rename enum?” prompts and hung in this non-TTY flow — SQL was proven on scratch then applied with `psql`.
3. After drafts, Payload made `context`/`category`/`slug`/`order` nullable on `faqs` (matched in migration). Collection config still marks them required in admin.
4. Live footer already stored `/policies/fees` by the time of the second check (seed/fallback updated regardless). Scaffold `/parking` redirects remain as belt-and-braces.
5. Homepage/rooms still pull `category: general` / hub slugs — intentional for Step 1 (placement retirement is Step 2).
6. ESLint project config throws a circular-structure error on validate; FAQ unit tests still green.
7. A leftover `payload_migrations` row named `dev` (batch -1) from earlier Payload push usage blocked `pnpm build` with an interactive prompt. Deleted that row only; the real FAQ migration row remains.

---

*Hotel Berlin, Berlin — FAQ System Part B Step 1 · 5 October 2026. Do not start Step 2 until this report is reviewed.*
