# FAQ System — Part B Step 3 follow-up

*5 October 2026. Verification + breakfast-times wording fix. No new FAQ records.*

## 1. Resolved-text section

Added to [`Step3_TextDiff.md`](step3/Step3_TextDiff.md) — OLD published vs NEW token-resolved for the 7 survivors (EN+DE, question+answer).

| slug | Q en/de | A en/de |
|---|---|---|
| check-in-time | identical / identical | **changed** / **changed** |
| parking | identical / identical | **changed** / **changed** |
| pet-policy | identical / identical | identical / identical |
| breakfast-times | **changed** / **changed** | **changed** / **changed** |
| guest-card-only | identical / identical | **changed** / **changed** |
| guest-pharmacy-nollendorf | identical / identical | identical / identical |
| guest-emergency | identical / identical | identical / identical |

## 2. Token resolve test

[`tests/int/faq-published-tokens.int.spec.ts`](../../tests/int/faq-published-tokens.int.spec.ts) — **2/2 pass**.

- Every `{{token}}` in published Q/A resolves non-empty in EN and DE.
- Per-route drop report (flag ON): **all 18 routes `[]`** — no published FAQ would be dropped for unresolved tokens.

## 3. breakfast-times wording

Labels moved out of the token. Updated `faq-step3-content.json` G4 + live DB (`scripts/faq-fix-breakfast-times.ts --write`). Reseed via `pnpm faq:step3-content -- --write` (or the fix script) keeps the same text. `{{breakfastWeekday}}` remains `06:30–10:00`.

## 4. Call sites that read `faqs`

**Runtime (should go through `getFaqs`):**

| Call site | Path |
|---|---|
| `getFaqs` | `src/lib/faqs/getFaqs.ts` — sole intended Payload query |
| `getFAQsForRoute` | `src/lib/faq/getFaqsForRoute.ts` — builds on `getFaqs` |
| FAQ surfaces | `FAQSection`, `HereHelpSection`, `/faq`, `/here/faq` |

**Parallel / seed / unused:**

| Call site | Notes |
|---|---|
| `src/lib/payload/faqs.ts` → `getFAQs` | **Deprecated direct `payload.find({ collection: 'faqs' })` when `audience` is missing/`both`.** Exported from `src/lib/payload/index.ts` but **no production caller** found. |
| `src/seed/faqs.ts`, `src/seed/amenities.ts` (`faqIdsBySlug`), `scripts/faq-*.ts` | Seed/admin scripts only |

**Not reading FAQs:** `src/app/sitemap.ts` (rooms/art only), no `llms.txt`, no search/chatbot feed, no `generateStaticParams` for FAQ slugs.

## 5. Flag-ON `/faq` + `/here/faq` HTML vs JSON-LD

See [`step3/faq-pages-flag-on.diff.md`](step3/faq-pages-flag-on.diff.md). Content multiset matches; order differs due to category grouping in `FAQPageView`.

---

*No Step 4 started.*
