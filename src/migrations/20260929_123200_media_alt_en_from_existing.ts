import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * F4 — media.alt is already localized (amenities / baseline: `media_locales`).
 * Existing values were stored under `de` only. Move them to `en` and leave
 * `de` empty so German alt shows up in Needs attention. Never copy EN → DE.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Insert English rows from current German values (skip if en already exists).
  await db.execute(sql`
    INSERT INTO "media_locales" ("alt", "_locale", "_parent_id")
    SELECT ml."alt", 'en', ml."_parent_id"
    FROM "media_locales" ml
    WHERE ml."_locale" = 'de'
      AND NOT EXISTS (
        SELECT 1 FROM "media_locales" en
        WHERE en."_parent_id" = ml."_parent_id" AND en."_locale" = 'en'
      )
  `)

  // Clear German — empty string satisfies NOT NULL; never copy English back.
  await db.execute(sql`
    UPDATE "media_locales"
    SET "alt" = ''
    WHERE "_locale" = 'de'
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore de from en where de is empty, then drop en rows created by up.
  await db.execute(sql`
    UPDATE "media_locales" AS de
    SET "alt" = en."alt"
    FROM "media_locales" AS en
    WHERE de."_parent_id" = en."_parent_id"
      AND de."_locale" = 'de'
      AND en."_locale" = 'en'
      AND (de."alt" IS NULL OR de."alt" = '')
  `)

  await db.execute(sql`
    DELETE FROM "media_locales" WHERE "_locale" = 'en'
  `)
}
