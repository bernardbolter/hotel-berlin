import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Hero manager: description + keywords (localized), aiNotes (admin-only).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "hero_slides"
      ADD COLUMN IF NOT EXISTS "ai_notes" varchar;

    ALTER TABLE "hero_slides_locales"
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "keywords" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "hero_slides_locales"
      DROP COLUMN IF EXISTS "keywords",
      DROP COLUMN IF EXISTS "description";

    ALTER TABLE "hero_slides"
      DROP COLUMN IF EXISTS "ai_notes";
  `)
}
