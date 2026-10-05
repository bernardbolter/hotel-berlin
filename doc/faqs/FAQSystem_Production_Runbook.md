# FAQ System — Production runbook

*How to bring a database to the FAQ state after Part B Steps 1–3.
These steps are deliberate and are **not** run automatically on deploy.*

**Safety:** Confirm `DATABASE_URL` points at the intended database before every command. Never point a seed/backfill/content script at production by accident.

**Rehearsed:** 5 Oct 2026 on scratch DB `hotelberlin_faq_step3_rehearse` (clone of pre–Step 1 content from `hotelberlin_faq_step1_scratch`: 47 published FAQs, `audience` null, parking/check-in still pre-merge). Oracle with `FAQ_ROUTING_V2=true`: home 4, rooms 4, here 3, faq 22, here-faq 39 — slug order matched `faq-routing-expected-step3.json`.

---

## Critical: Step 3 content + flag flip are one release

After Step 3 merges, **seven guest FAQs are draft** (absorbed into survivors). With `FAQ_ROUTING_V2` **OFF**, legacy `/here/faq` still filters by `context=guest` and therefore **loses those five guest-only absorbed slugs** that no longer have a published guest twin (plus any prospect-only path issues). Survivors with `audience=both` only appear on guest pages when the v2 router is on.

**Production must ship Step 3 content and `FAQ_ROUTING_V2=true` in the same release**, after Bernard signs off [`doc/faqs/step3/Step3_TextDiff.md`](step3/Step3_TextDiff.md).

Do **not** apply Step 3 content to production while the flag stays off.

---

## Prerequisites

1. Target DB already has the **pre–Step 1 FAQ corpus** (47 published rows from `existing-faqs.json` / normal site seed). Migrations alone do **not** insert FAQ text.
2. Hotel global + amenities (at least `sauna`) exist so token seeding can write attested facts.
3. If you need a greenfield FAQ corpus first: `pnpm seed:faqs` **before** Step 3. After Step 3, reseed is safe: survivors are skipped and absorbed slugs are not republished (see `src/seed/faqs.ts` + `tests/int/faq-seed-merge-guard.int.spec.ts`).

---

## Ordered steps

### 1. Run Payload migrations

```bash
# Confirm target
echo "$DATABASE_URL"

pnpm migrate
```

Includes:

- `20261005_140000_faq_topics_and_structure`
- `20261005_150000_faq_placements_hotel_facts`

Do **not** use `PAYLOAD_DATABASE_PUSH=true` against production.

#### Fallback when `pnpm migrate` hangs (drizzle enum prompt)

If the CLI hangs on an interactive drizzle “create or rename enum?” prompt (non-TTY / CI), apply the `.up.sql` files with `psql`, **then insert matching `payload_migrations` rows**, then verify with `pnpm migrate:status`.

```bash
echo "$DATABASE_URL"   # must be the intended DB

# 1) Apply schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f src/migrations/20261005_140000_faq_topics_and_structure.up.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f src/migrations/20261005_150000_faq_placements_hotel_facts.up.sql

# 2) Record both migrations (same batch = max(batch)+1)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO payload_migrations (name, batch, updated_at, created_at)
SELECT v.name, (SELECT COALESCE(MAX(batch), 0) + 1 FROM payload_migrations), now(), now()
FROM (VALUES
  ('20261005_140000_faq_topics_and_structure'),
  ('20261005_150000_faq_placements_hotel_facts')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM payload_migrations m WHERE m.name = v.name
);
SQL

# 3) Confirm both show Ran = Yes
pnpm migrate:status
```

Expect `20261005_140000_faq_topics_and_structure` and `20261005_150000_faq_placements_hotel_facts` with **Ran = Yes** and a shared batch number. Skipping the `INSERT` leaves them as **Ran = No**; `pnpm migrate` will then try to re-apply them.

### 2. Structure backfill (Step 1)

```bash
pnpm faq:backfill-structure
pnpm faq:backfill-structure -- --write
```

Expect: `faq-topics=24`, FAQs with audience=47, `audience=both=26`.

### 3. Placements + pins (Step 2)

```bash
pnpm faq:seed-placements
pnpm faq:seed-placements -- --write
```

### 4. Token source values (Step 2)

```bash
pnpm faq:seed-token-values
pnpm faq:seed-token-values -- --write
```

Writes only `seedNow=true` tokens from [`faq-tokens.json`](faq-tokens.json). HOLD / `seedNow=false` stay empty.

### 5. Step 3 content (overrides, conversions, merges, draft imports)

```bash
pnpm faq:step3-content          # dry-run
pnpm faq:step3-content -- --write
```

This script **also** applies Step 3 token value overrides (do not skip step 4; overrides refine after attested seed):

- `breakfastWeekday` → `06:30–10:00` (on `guestStay.breakfast`)
- `noShowCharge` → numeric `90` (display en `90%` / de `90 %` via `tokens.ts`)

Guarantees:

- Never publishes from the script (new FAQs + absorbed records stay `_status: draft`).
- Absorbed: hide-don't-delete (`mergedInto` + draft).
- Review [`doc/faqs/step3/Step3_TextDiff.md`](step3/Step3_TextDiff.md) before go-live.

### 6. Flip the flag (same release as Step 5)

```bash
FAQ_ROUTING_V2=true
```

Only after Bernard signs the text diff. Flag ON is required for correct `/faq` and `/here/faq` after merges.

### 7. Oracle check (flag ON)

```bash
FAQ_ROUTING_V2=true npx tsx scripts/faq-smoke-routes.ts
```

Expect published routed counts (EN):

| route | count |
|---|---|
| home | 4 |
| rooms | 4 |
| here | 3 |
| faq | 22 |
| here-faq | 39 |

Slug order must match [`faq-routing-expected-step3.json`](faq-routing-expected-step3.json). Drafts must not appear.

---

## Rollback

If production misbehaves after the combined release:

1. **Immediate:** set `FAQ_ROUTING_V2=false` (or unset) and redeploy env — restores legacy fetch paths.  
   **Caveat:** absorbed guest FAQs remain draft, so `/here/faq` will still miss those seven slugs until content is rolled back.
2. **Content rollback:** restore DB from pre–Step 3 backup (or re-publish absorbed records and revert survivor Q/A from the text diff “Old” column). Then keep the flag off until re-attempting.
3. Prefer a DB snapshot taken immediately before Step 5 `--write` on production.

---

## Do not run automatically

| Command | Why manual |
|---|---|
| `faq:backfill-structure --write` | Overwrites structure fields by slug |
| `faq:seed-placements --write` | Replaces placement rows and pin lists |
| `faq:seed-token-values --write` | Writes attested fact values into hotel |
| `faq:step3-content --write` | Rewrites answers, merges, creates drafts |
| `FAQ_ROUTING_V2=true` | Changes which FAQs appear; must pair with Step 3 |

---

## Local verification checklist

1. `echo $DATABASE_URL` → local or intended Neon branch only  
2. Dry-run each script; review stdout  
3. `--write` only after review  
4. Task 0 style check: flag ON home / rooms / here identical to flag OFF  
5. Flag ON oracle: home 4 / rooms 4 / here 3 / faq 22 / here-faq 39  
6. Drafts never appear in JSON-LD  
7. Optional: `pnpm exec vitest run tests/int/faq-seed-merge-guard.int.spec.ts` after Step 3 (reseed must not clobber merges)

---

## Runbook gaps found in scratch rehearsal (fixed here)

| Gap | Fix |
|---|---|
| Assumed migrations alone produce FAQ rows | Added **Prerequisites** (47 FAQ corpus + hotel/amenities) |
| `pnpm migrate` can hang on drizzle enum prompts | Documented `psql -f` fallback **plus** exact `payload_migrations` INSERT and `migrate:status` verify |
| No post-apply oracle command | Added **§7 Oracle check** with counts |
| Step 3 overrides vs Step 4 token seed unclear | Clarified Step 5 applies overrides after Step 4 seed |
| Reseed after merges unsafe | Seed now skips survivors/absorbed; keep-set includes Step 3 drafts |

---

*Hotel Berlin, Berlin — FAQ System · Part B Steps 1–3*
