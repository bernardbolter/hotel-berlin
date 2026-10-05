# Hotel Berlin, Berlin — FAQ System — Part A Rulings
*5 October 2026. Responds to the Part A status audit. Supersedes `HotelBerlin_FAQSystem_BuildBrief.md` wherever they differ.*
*Status: PROPOSED — Bernard to sign off the three items marked ▲ before Part B starts.*

---

## What the audit changes

The old brief assumed a blank slate. It is not one: `faqs`, `getFaqs`, `FAQAccordion`, `FAQSection`, `/faq`, `/here/faq` and `buildFAQPageGraph` all exist and work, and all 18 routes in the Routes sheet already have templates. Part B therefore **extends the existing collection in place, with a migration**. No second FAQ collection, no parallel fetch path.

---

## Rulings

**R1 — Extend in place.** `faqs` gains the new fields; existing records keep their ids and slugs. Nothing is deleted (hide-don't-delete): superseded fields are hidden in admin, not dropped.

**R2 — `audience` replaces `context`.** Add `audience` (`prospect` / `guest` / `both`), migrate `context` → `audience`, then hide `context`. Where the same answer currently exists twice to fake "both" (the overlap slugs `guest-wifi`, `guest-luggage`, `guest-checkout`, and any prospect/guest twins), collapse to one record with `audience: both`. Cursor lists every collapse for review before running it.

**R3 — Topics are a collection.** `faq-topics` as in the brief. The existing 17-value `category` select (admin text calls it "provisional") is mapped to the 20 topics through a mapping table Cursor produces from the actual option list; I review it. `category` stays hidden-but-present until the mapping is verified, then is retired.

**R4 — `relevantPages` is the old pin model.** Step 0 follow-up: report what reads/writes it. If nothing does, drop it in favour of `pinnedRoutes` / `pinnedEntities`. If something does, migrate its values to `pinnedEntities` first.

**R5 — Answers stay plain `textarea`. (Supersedes brief §1 `richText` and §5.)** The audit shows plain text already feeds `acceptedAnswer.text` directly, `lexicalToPlain` isn't needed, and tokens, the publish guard and JSON-LD parity are all simpler on plain text. For the few answers with links (F34 lost property, contact lines), the renderer auto-links URLs, email addresses and phone numbers. Revisit richText only if the hotel asks for formatting.

**R6 — Enable drafts.** `versions.drafts` on `faqs`. Existing 47 records migrate to published; new seeded records land as draft. This is what lets HOLD items sit in the CMS safely.

**R7 — One fetch path.** `getFaqs` stays the only Payload query; `getFAQsForRoute` is built on it. Once the placement rows exist, retire: the deprecated `getFAQs` wrapper, `getRelevantFaqs`, `HUB_FAQ_SLUGS` (the three hardcoded hub slugs) and the `category: general, limit 4` heuristic on home/rooms. The brief's `getFAQsProspect/Guest` names never existed; ignore them.

**R8 — Token sources: add structured fields, don't parse copy.** The `hotel` global lacks most of what the tokens need. Add a structured group rather than scraping `guestStay` prose:
- late check-out `until` + `fee`
- `receptionPhone`
- emails: reservations, sustainability, careers
- `lostPropertyUrl`
- parking: `spaces`, `hourly`, `dailyMax`, `maxHeight` (there is no parking amenity record, so it lives on `hotel`)
- pet fee as a number (today it's localized text)

Breakfast tokens read the existing structured `hours` and `breakfastPricing`. Room-size tokens read `rooms`. `{{saunaHours}}`, `{{wifiSsid}}`, `{{phoneMain}}`, `{{phoneReception}}` stay HOLD: leave the source empty so F12, F26 and the phone-dependent FAQs stay hidden. Side note: `guestStay` already carries prices as typed copy (e.g. pets €30/day). That is the same drift risk the tokens exist to remove, but cleaning it up is a separate task, not part of this build.

**R9 — Routes.** All 18 keys map to real templates; register them. Housekeeping found by the audit, to be fixed in this build or logged:
- `/faq` is **not new**. Correct the brief and workbook. The `/de/faq` slug is a placeholder; I'd propose `haeufige-fragen` — Bernard to choose.
- `/faqs` exists in pathnames with no page. Redirect to `/faq` or remove.
- The footer links to `/parking`, which doesn't exist. Point it at the fees policy page.
- `policy-fees` has the DE slug `/de/richtlinien/parken` while the EN is `fees`. Confirm that's intended.

**R10 — Reconcile before seeding. ▲** The repo already holds 47 written FAQs (6 prospect + 41 guest A–Z) with real DE. The workbook's 38 came from the chatbot, so they overlap heavily but aren't the same set. Rule: **existing published content is never overwritten.** Workbook entries (a) create new records only where no equivalent exists, or (b) arrive as a proposed diff on an existing record (token-ised numbers, fixed errors). I need a dump of the existing 47 to do the mapping — see "Next".

**R11 — Pins and caps.** Pinned FAQs are never trimmed; fill is trimmed to the cap (as briefed). Starting caps follow what renders today — home 4, `/here` hub 3 — not the workbook's 6; raise them after a design look. Cap does not apply to `/faq` and `/here/faq`.

**R12 — JSON-LD.** Keep the existing rule (pass exactly the list on screen). Add the tests from the brief. Homepage and hub already emit `FAQPage` from their mini lists; that stays, now fed by `getFAQsForRoute`.

---

## ▲ Decisions needed from Bernard

1. **R10 approach:** existing 47 are canon, workbook only fills gaps and proposes diffs. (Alternative: replace the legacy set with the workbook set. I advise against — you'd lose hand-written DE.)
2. **R9 DE slug** for `/faq`: `haeufige-fragen`, or keep `faq`?
3. **R2 collapse of duplicates** into single `both` records: yes?

## Still open (unchanged, blocked on the hotel)
Canonical phone number and `receptionPhone`; sauna hours; WiFi publishability; check-in time; fingerboard park details; F17 floors; F19 capsules; Giropay and "cashless" wording; Radisson Rewards wording; careers routing; the 17 gaps (cancellation and accessibility first); native German review.

## Next
- **Cursor, Part A follow-up (report only):** ✅ done 5 Oct 2026
  - (a) [`doc/faqs/existing-faqs.json`](existing-faqs.json) — 47 merged records
  - (b)–(d) + overlap + typed facts: [`doc/faqs/FAQSystem_PartA_FollowUp.md`](FAQSystem_PartA_FollowUp.md)
  - R4 finding (in that follow-up): nothing writes `relevantPages`; live `faqs_rels` = 0; drop in favour of `pinnedRoutes` / `pinnedEntities` once Part B starts
- **Claude:** with that JSON, produce the reconciliation sheet — each of the 47 mapped to a topic, each workbook FAQ marked duplicate / gap-fill / diff, plus the category→topic table.
- **Then** Part B (after Bernard signs the three ▲ items).
