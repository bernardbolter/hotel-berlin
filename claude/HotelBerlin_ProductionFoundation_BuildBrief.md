# Hotel Berlin, Berlin — Production Foundation (checklist 1.7–1.12)

*For Cursor · 20 September 2026*
*Relates to: `HotelBerlin_LaunchChecklist_v1.md` Phase 1, `HotelBerlin_Production_Infrastructure.md`, `docs/audit/2026-09-19-launch-readiness.md` (LR), `docs/content/schema-inventory.md`*

---

## Why now

Bernard starts filling in real content **this week**, and photographs the hotel shortly after. Everything below has to be in place first, or those uploads get done twice. **No photographs exist yet** — every surface keeps its designed empty state until real ones arrive (§F5).

**Decision, 20 Sept:** media lives on **Cloudflare R2**, not Vercel Blob. No egress charges, EU jurisdiction, and the S3 adapter supports browser-direct uploads.

---

## Kick-off prompt

```
Implement claude/HotelBerlin_ProductionFoundation_BuildBrief.md.

Order: F1 migrations → F2 R2 → F3 image sizes → F4 alt → F5 empty
states → F6 guards. One PR per step, F1 first and alone.

Before F1: merge the four fullpages branches to main in order
(capped-row, amenities-list, events-agenda, art-grid). F1 is generated
from the merged schema.

Report at each step; do not skip ahead. Nothing here invents content,
and no stock or stand-in photograph is introduced anywhere.
```

---

## F1 — Migrations (checklist 1.7)

1. Merge the four `fullpages` branches to `main` in order.
2. `PAYLOAD_DATABASE_PUSH=false` everywhere, including `.env.example`, all worktrees and the test setup. Remove the `push` branch from `payload.config.ts` or hard-code it off outside development.
3. Generate the **baseline migration** from the merged schema against a **fresh empty database**, not the drifted dev one. Then apply it to a copy of the current dev DB and report any diff — that diff is the drift (the hand-added `media.alt` column, the enum renames) and it has to be understood, not silently kept.
4. Delete the dummy `dev` row in `payload_migrations`.
5. Document in `doc/dev/DATABASE.md`: one DB per worktree, the `DATABASE_URL` convention, how to create a migration, how to reset a local DB.
6. Verify: fresh DB + migrate + seed → `/de`, `/de/hier`, `/de/ausstattung`, `/de/happenings`, `/de/hier/art`, `/admin` all 200.

**From here on, every schema change ships as a migration.** No more push mode in any branch.

## F2 — Cloudflare R2 (checklist 1.8)

1. `@payloadcms/storage-s3` configured for R2: endpoint `https://{account}.r2.cloudflarestorage.com`, `region: 'auto'`, `forcePathStyle` as R2 needs it, bucket from env.
2. **Browser-direct uploads** (the plugin's client-upload option), so large photos never pass through a serverless function.
3. **Public URL from config**, not stored per record: `NEXT_PUBLIC_MEDIA_URL`. Temporary Cloudflare address now, `media.hotel-berlin.de` later — a one-line change, no data migration. Add both to `next.config.ts` `images.remotePatterns`.
4. **Migration script** `scripts/media-to-r2.ts`: upload the 346 local files, verify each object exists and its size matches, report any mismatch, and **do not delete the local copies**. Idempotent, re-runnable.
5. Env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL`. All in `.env.example` with comments.
6. Verify: upload a 12 MB JPEG through the admin (would have failed at 4.5 MB), it appears on the site, and `/api/media/file/…` is no longer the serving path.

**Open item O-P1:** whether images are optimised by Vercel (`next/image`, the default) or by Cloudflare on the custom domain. Vercel for now; revisit if the image-optimisation usage gets expensive.

## F3 — Image sizes and focal point (checklist 1.9)

Define `imageSizes` on `media` **before any real photograph is uploaded**. Take the widths from `docs/content/schema-inventory.md` §3 (largest rendered width × 2), and name them for the slot, not the pixel count:

| Name | Purpose | Notes |
|---|---|---|
| `thumb` | admin list | small, square-ish |
| `card` | amenity, event, place, artwork cards | from the largest card width in the inventory |
| `portrait` | people, 1:1 | |
| `hero` | homepage and `/hier` heroes | the widest slot on the site |
| `og` | 1200 × 630 social images | `fit: cover`, used by checklist 2.7 |

- `focalPoint: true` and `crop: true`.
- WebP output with a sensible quality, originals kept.
- `withoutEnlargement: true`, so a small upload isn't blown up.
- **Regeneration script** `scripts/regenerate-sizes.ts` for the 346 existing files, and for any future change to this table. Report how many files were processed and how many failed.
- `admin.description` on the upload field stating the minimum width for a card photo (from the inventory) in DE and EN.

## F4 — Alt text in both languages (checklist 1.10)

`media.alt` localized, required. Check first whether the amenities branch already did this — the hand-added column suggests a half-finished attempt. Existing values become the English value; German stays empty and shows up in the *Needs attention* view later. No automatic copying of English into German: that's exactly the mess we're clearing elsewhere.

## F5 — Empty states, no stand-ins (the photo rule)

Bernard has no photographs yet. **Every surface must look deliberate while empty, and no stock, Unsplash, Wikimedia or borrowed photo may be introduced.** Audit every image slot in the inventory and report what each does when its source is null. Required behaviour:

| Surface | Empty state |
|---|---|
| Amenity card and row | Icon block on the warm ground (already built) |
| Art grid | Work without an image is not shown; no artworks at all → the page's line of copy |
| Person / portrait | The existing no-portrait state (Katja Morkel's quote-as-hero) |
| Place cards on the map | The name block, **not** the Wikimedia or Unsplash fallback — remove `teaserImageFallbacks.ts` and the Unsplash entry from `next.config.ts` |
| Event / spotlight card | Category-coloured flat ground with the category name, no photo |
| Hero (home and `/hier`) | The grey ground from the hero addendum, no Unsplash slides — remove the `fallbackHeroSlides` URLs |
| Venue bands (Lütze, dining) | Flat ground in the section's colour |
| OG image | The hotel's default OG image from the Hotel global; if that is empty, no `og:image` tag rather than a broken one |

Report anything else the audit finds. **Delete the fallback URL lists rather than leaving them unused.**

## F6 — Guards and documentation (checklist 1.11, 1.12)

- Seed scripts abort when `NODE_ENV === 'production'` unless `ALLOW_PRODUCTION_SEED=1`. Print what they would have done.
- `.env.example` complete: R2 keys, `NEXT_PUBLIC_MEDIA_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `PAYLOAD_DATABASE_PUSH=false`, and the soft-launch flags (checklist 1.14, not built here).
- `doc/dev/DATABASE.md` from F1, plus a short `doc/dev/MEDIA.md`: where files live, how to add a size, how to regenerate.

---

## Definition of done

- [ ] `main` carries the four merged branches plus a baseline migration generated from a **fresh** DB; drift against the old dev DB is reported
- [ ] Push mode is off everywhere; `doc/dev/DATABASE.md` explains one DB per worktree
- [ ] Media served from R2 via the public URL from config; a 12 MB upload through the admin succeeds
- [ ] `scripts/media-to-r2.ts` moved all 346 files with a verification report; local copies untouched
- [ ] `imageSizes` per the table, focal point and crop on, `scripts/regenerate-sizes.ts` run over the existing files
- [ ] `media.alt` localized and required; no English auto-copied into German
- [ ] No stock, Unsplash or Wikimedia photograph is reachable anywhere in the site; the fallback lists are deleted; every empty state renders as designed
- [ ] `.env.example` complete; seed scripts refuse to run against production
- [ ] `/de`, `/de/hier`, `/de/ausstattung`, `/de/happenings`, `/de/hier/art`, one room detail and `/admin` all 200 on a production build against a fresh DB
- [ ] `tsc --noEmit` clean; `test:int` green; axe unchanged on the pages touched

## Do not

- Do not introduce a placeholder photograph of any kind, including picsum, Unsplash, Wikimedia or a repurposed hotel photo.
- Do not copy English alt text into the German values.
- Do not delete the local `media/` folder after the R2 move.
- Do not re-enable push mode to "just get it working".
