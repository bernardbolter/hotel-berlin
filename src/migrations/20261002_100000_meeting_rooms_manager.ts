import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Meeting Rooms Manager: visible_on_site + homepage teaser columns.
 * The legacy `featured` flag seeds the teaser rotation.
 * Versions tables for meeting-rooms are created via Payload push / generate
 * migration when versions are enabled on the collection (same as rooms).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "meeting_rooms"
      ADD COLUMN IF NOT EXISTS "visible_on_site" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "homepage_teaser_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "homepage_teaser_order" numeric;

    UPDATE "meeting_rooms" SET "visible_on_site" = true WHERE "visible_on_site" IS NULL;

    -- Backfill the teaser rotation from the legacy featured flag.
    UPDATE "meeting_rooms"
      SET "homepage_teaser_enabled" = true
      WHERE "featured" = true AND "homepage_teaser_enabled" IS NOT TRUE;

    UPDATE "meeting_rooms" AS mr
      SET "homepage_teaser_order" = ranked."position"
      FROM (
        SELECT "id", ROW_NUMBER() OVER (ORDER BY "display_order", "id") AS "position"
        FROM "meeting_rooms"
        WHERE "homepage_teaser_enabled" = true
      ) AS ranked
      WHERE mr."id" = ranked."id" AND mr."homepage_teaser_order" IS NULL;

    UPDATE "meeting_rooms"
      SET "homepage_teaser_enabled" = false
      WHERE "homepage_teaser_enabled" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "meeting_rooms"
      DROP COLUMN IF EXISTS "visible_on_site",
      DROP COLUMN IF EXISTS "homepage_teaser_enabled",
      DROP COLUMN IF EXISTS "homepage_teaser_order";
  `)
}
