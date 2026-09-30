# Rescue landing plan

*21 September 2026. How `rescue/uncommitted-2026-09-21` reaches `main`.*

The rescue branch is a snapshot of a dirty checkout. It is not a merge candidate. Port work onto `main` in small PRs. F1 is already the schema floor.

---

## Hard rules

1. **Do not merge the rescue branch.** Cherry-pick or copy files onto branches cut from current `main`.
2. **F1 first.** `feat/production-f1-migrations` fast-forwards `main` before any rescue port. Later schema work gets a **new** migration on top of `20260921_090837_baseline`. Do not copy rescue’s `20260919_*` / `20260920_*` migrations; they were generated against a different snapshot and will not apply on F1.
3. **One PR per step.** No bundled “and also” landings.
4. **Do not overwrite what main already shipped.** Amenities list, events agenda, art grid, localized venue `location` / `spotlightLocation`, `link.venue` on amenities, and the artwork AEO builder stay. Rescue implementations of those are older or conflicting.
5. **AEO is additive.** Keep main’s artwork builder. Add the event builder, happenings URLs, and `HotelEvent` types. Do not drop `art` paths or `artworkNodeId`.
6. **No invented content. No stock photos.** Entity empty states use the grey name-block; `safeMediaUrl` rejects picsum.
7. **Do not force-push `main`.** Fast-forward only.
8. **Do not commit `.env` or secrets.**
9. **Do not start F2 (R2) until this landing is done and reported.**

---

## Already decided vs main

| Item | Land? | Notes |
|---|---|---|
| F1 baseline migration | **Now, first** | Fast-forward `feat/production-f1-migrations` → `main`. |
| Docs / audits not already on main | **#1** | Rescue-only paths. Do not replace `doc/amenities/` or `doc/fullpages/`. |
| Entity pages + `happenings/[slug]` | **#2** | Neighbourhood + YMB rewrite onto `Entity*`; new happening detail route. |
| Legal documents + pages | Later | Own collection + own migration. |
| `Users.role` admin/editor | Later | `src/access/index.ts` is already on main and identical. Role field is not. |
| Booking widget | Later | No schema. |
| Media `imageSizes` | Later (F3) | Own migration. |
| Venues `specialHours` | **Not with amenities, not now** | Main shipped special hours on amenities only. Rescue added them on venues; `:3000` push created `venues_special_hours`. If venues ever get them, that is a new migration on F1. Also: rescue venues `location` is unlocalized; main’s is localized — keep main. |
| Scaffolds / policy / about / status pages | Later | Main already has amenities / happenings hub / art from fullpages. |
| `amenities_rels.venues_id` | **Drop** | Stale leftover. Neither tree owns it. |

---

## #1 — Docs

Copy rescue files that **do not exist** on `main`:

- `docs/audit/*`
- `docs/content/schema-inventory.md` + `.json`
- `doc/booking-dropdown/HotelBerlin_BookingWidget_Audit.md`
- `doc/cards/HotelBerlin_FullPages_BuildBrief.md`
- `doc/cards/HotelBerlin_FullPages_PatternComp.html`
- `doc/contentSchema/HotelBerlin_ContentSchema_Extraction.md`
- `doc/enitities/HotelBerlin_EntityPages_BuildBrief.md`
- this file → `doc/rescue/HotelBerlin_Rescue_LandingPlan.md`

Leave `doc/amenities/` and `doc/fullpages/` alone (including r1 screenshots). Those already landed with the four fullpages PRs.

---

## #2 — Entity pages + `happenings/[slug]`

Port from rescue, onto current `main`:

**New**

- `src/components/entity/*`
- `src/lib/entity/{canonical,mediaUrl,takeFilledRow}.ts`
- `src/lib/payload/{entities,borrow}.ts`
- `src/lib/events/schedule.ts`
- `src/lib/places/district.ts`
- `src/app/[locale]/happenings/[slug]/page.tsx`
- `src/lib/aeo-schema/src/builders/event.ts`
- `src/lib/aeo-schema/test/event.test.ts`
- `tests/int/entity-pages.int.spec.ts`

**Replace with rescue versions** (routes exist on both; rescue is the Entity* rewrite)

- `src/app/[locale]/neighbourhood/[slug]/page.tsx`
- `src/app/[locale]/you-me-berlin/[slug]/page.tsx`

**Patch, do not wholesale-copy**

- `src/lib/aeo-schema/src/types.ts` — add `HotelEvent` / `HotelEventVenue` and `paths.happenings`; keep `paths.art`.
- `src/lib/aeo-schema/src/lib/config.ts` — add happenings paths; keep art.
- `src/lib/aeo-schema/src/lib/ids.ts` — add `eventUrl` / `happeningsListUrl` / `eventNodeId`; keep artwork helpers and main’s `venueNodeId(config, slug?)`.
- `src/lib/aeo-schema/src/index.ts` — `export * from './builders/event'` **and** keep `./builders/artwork`.
- `src/lib/aeo/mapToSchema.ts` — add `toAeoEvent`; leave place/person/artwork mapping as on main.
- `src/lib/payload/events.ts` — locale + `depth: 2` on `getEventBySlug`; add slug helpers. Existing `getEventBySlug(slug)` callers stay valid.
- `src/lib/payload/index.ts` — export the new helpers; do not drop main’s existing exports.
- `src/i18n/pathnames.ts` — add `/happenings/[slug]` only. Do not copy rescue legal / hybrid / policy pathnames.
- `src/messages/{en,de}.json` — add `entity.*` and neighbourhood `indoorOutdoorBoth`. Do not replace the files.
- `src/app/globals.css` — add `--dim`, `--bg-subtle`, and the `.entity-*` rules. Do not copy rescue globals.

No Payload schema change in this PR. No migration.

Venue `location` at runtime is already a locale string on main; the event builder stores it as a string. Do not un-localize venues.

---

## Later (not this pass)

Legal, booking, imageSizes, `Users.role`, venues specialHours, scaffolds/status, YMB portrait seed, and anything else on the rescue branch. Each of those that touches schema gets its own migration after F1.

F2 Cloudflare R2 starts after this report, not before.
