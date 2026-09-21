# Local databases

Schema changes ship as Payload migrations. Do not turn push mode back on.

## One database per worktree

Each git worktree has its own Postgres database. Migrating or seeding one branch must not rewrite tables another branch is reading.

`PAYLOAD_DATABASE_PUSH` is `false` in `.env.example`, in every worktree `.env`, and in the Vitest setup. `payload.config.ts` only enables Drizzle push when `NODE_ENV` is not `production` **and** `PAYLOAD_DATABASE_PUSH=true` (emergency hatch). Leave it unset or `false`.

## `DATABASE_URL` convention

```
postgresql://USER@localhost:5432/hotelberlin            # main / default local
postgresql://USER@localhost:5432/hotelberlin_<suffix>   # worktrees
```

Suffix matches the worktree, for example:

| Database | Worktree / branch |
|---|---|
| `hotelberlin` | default checkout |
| `hotelberlin_capped` | `feat/fullpages-capped-row` |
| `hotelberlin_amenities` | `feat/fullpages-amenities-list` |
| `hotelberlin_events` | `feat/fullpages-events-agenda` |
| `hotelberlin_art` | `feat/fullpages-art-grid` |

Create a database:

```bash
createdb hotelberlin_myfeature
```

Point that worktree’s `.env` at it, then:

```bash
npm run migrate
npm run seed
```

## Creating a migration

After a collection or global field change:

```bash
npm run migrate:create <name>
npm run migrate
```

Commit the new files under `src/migrations/` (`*.ts`, `*.json`, and `index.ts`). Empty and production databases apply the same files with `npm run migrate` (run it on deploy before `npm run build`).

`payload migrate:create` diffs the Payload schema against the last snapshot. It does not need a drifted dev database. Generate against an empty database if you are replacing the baseline.

## Resetting a local database

```bash
dropdb hotelberlin_myfeature
createdb hotelberlin_myfeature
npm run migrate
npm run seed
```

Do not run `payload migrate:fresh` against a database that holds real content. Do not run the baseline `CREATE` against a database that already has tables.

## Existing (push-built) databases

The baseline migration is a full `CREATE` for empty databases. Applying it to a database that was built with Drizzle push fails (`type already exists`).

On a copy of such a database:

1. Confirm the schema matches, or understand the drift (below).
2. Delete the dummy `dev` / batch `-1` row in `payload_migrations` if it is still there.
3. Record the baseline as already applied, for example:

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
INSERT INTO payload_migrations (name, batch, updated_at, created_at)
VALUES ('20260921_090837_baseline', 1, now(), now());
```

If an older baseline name is already recorded, rename that row to `20260921_090837_baseline` instead of inserting a second row.

## Drift vs this baseline (21 September 2026)

Generated `20260921_090837_baseline` against empty `hotelberlin_f1`. SQL matches yesterday’s snapshot; only the Drizzle snapshot id changed.

Applied the baseline to `hotelberlin_f1` successfully. Applied it to a copy of `hotelberlin` (`hotelberlin_f1_copy`): **failed** as expected (`CREATE TYPE "_locales" … already exists`).

The dummy `dev` row is gone on `hotelberlin`. The copy still had `20260920_172150_baseline` recorded.

Schema diff, copy of current `hotelberlin` minus the fresh migrated database — extras only, nothing missing:

| Extra on `hotelberlin` | Source |
|---|---|
| `legal_documents`, `legal_documents_locales`, `enum_legal_documents_slug`, `payload_locked_documents_rels.legal_documents_id` | Uncommitted map-section / legal work (`:3000` still uses `push` in development) |
| `media.sizes_{card,hero,portrait,og}_*` | Uncommitted `imageSizes` (checklist 1.9 / F3) pushed onto the live dev DB |
| `users.role`, `enum_users_role` | Uncommitted editor role (checklist 1.16) |
| `venues_special_hours`, `venues_special_hours_locales`, `enum_venues_special_hours_kind` | Uncommitted venue hours |
| `amenities_rels.venues_id` | Extra has-many leftover; merged schema stores the link as `amenities.link_venue_id` |

`media.alt` is **not** on `media` in either database. It lives on `media_locales` (localized), which is what the merged schema expects. The old unlocalized `media.alt` column is gone.

No shared enum labels differ. Do not keep those extras as the baseline — F3/F4/F6 will add image sizes, localized alt requirements, and roles as real migrations. Extra tables on `hotelberlin` can stay until that worktree is merged; they are a superset and do not block `main` with push off.
