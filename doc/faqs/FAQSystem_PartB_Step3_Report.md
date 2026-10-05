# FAQ System — Part B Step 3 report

*5 October 2026. Content pass: token conversions, merges, draft imports. Out of scope: topic chips, new surfaces, legacy retirement, `/de/faq` slug (Step 4).*

**Database:** `postgresql://bescohome@localhost:5432/hotelberlin` (local only).

---

## Task 0 — Flag ON vs OFF render check

Surfaces: home mini, `/rooms` mini, `/here` hub × DE+EN.

| Artifact | Path |
|---|---|
| Flag OFF capture | [`doc/faqs/step3/flag-off.json`](step3/flag-off.json) |
| Flag ON capture | [`doc/faqs/step3/flag-on.json`](step3/flag-on.json) |
| Diff | [`doc/faqs/step3/flag-on-vs-off.diff.md`](step3/flag-on-vs-off.diff.md) |

**Result: IDENTICAL** on all six surfaces (ids, questions, answers, JSON-LD). Proceeded.

---

## Task 1 — Token overrides

Applied `breakfastWeekday` → `06:30–10:00`; `noShowCharge` format en `90%` / de `90 %`. Updated [`scripts/faq-seed-token-values.ts`](../../scripts/faq-seed-token-values.ts) + [`src/lib/faq/tokens.ts`](../../src/lib/faq/tokens.ts).

---

## Task 2 — Conversions (dry-run then write)

All four round-trips **OK** (EN+DE); none skipped.

`guest-checkout`, `cancellation-flexible`, `guest-nonsmoking`, `guest-sauna`.

---

## Task 3 — Merges G1–G7

All seven applied. Absorbed → `_status=draft` + `mergedInto`; survivors got new Q/A + `aliasSlugs`. Nothing deleted.

DB after: **published 40**, **draft 27** (7 absorbed + 20 new).

---

## Task 4 — 20 new drafts

Imported with `_status: draft` only. Publish-guard tests added for `[CONFIRM]` / `[BESTÄTIGEN]` / `[ADD]` / `[ERGÄNZEN]`.

**Fix:** `getFaqs` now filters `_status=published` explicitly — Local API `draft:false` alone still returned draft docs under `overrideAccess`.

---

## Task 5 — Tests

57/57 pass including `faq-routing-step3.int.spec.ts` (home 4 / rooms 4 / here 3 / faq 22 / here-faq 39). Live smoke matches.

---

## Task 6 — Review diff

[`doc/faqs/step3/Step3_TextDiff.md`](step3/Step3_TextDiff.md)

---

## Task 7 — Runbook

[`FAQSystem_Production_Runbook.md`](FAQSystem_Production_Runbook.md) — Step 3 + flag flip are one release; rollback notes.

---

## Surprises

1. Payload `draft: false` + `overrideAccess: true` still returned `_status=draft` rows until an explicit `_status=published` where clause was added.
2. Next.js 16 refuses a second `next dev` in the same project dir; flag-ON capture required restarting port 3000 with `FAQ_ROUTING_V2=true`.

---

*Do not start Step 4 until Bernard signs the text diff and the production flag flip plan.*
