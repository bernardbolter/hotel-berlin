import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Move hero-slides aiNotes onto locales so DE/EN admin UI can show matching notes.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "hero_slides_locales"
      ADD COLUMN IF NOT EXISTS "ai_notes" varchar;

    UPDATE "hero_slides_locales" AS loc
    SET "ai_notes" = hs."ai_notes"
    FROM "hero_slides" AS hs
    WHERE loc."_parent_id" = hs."id"
      AND hs."ai_notes" IS NOT NULL
      AND (loc."ai_notes" IS NULL OR loc."ai_notes" = '');

    ALTER TABLE "hero_slides"
      DROP COLUMN IF EXISTS "ai_notes";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "hero_slides"
      ADD COLUMN IF NOT EXISTS "ai_notes" varchar;

    UPDATE "hero_slides" AS hs
    SET "ai_notes" = loc."ai_notes"
    FROM "hero_slides_locales" AS loc
    WHERE loc."_parent_id" = hs."id"
      AND loc."_locale" = 'de'
      AND loc."ai_notes" IS NOT NULL;

    ALTER TABLE "hero_slides_locales"
      DROP COLUMN IF EXISTS "ai_notes";
  `)
}
