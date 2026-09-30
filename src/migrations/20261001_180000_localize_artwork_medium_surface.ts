import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Localize artworks.medium and artworks.surface (DE/EN) for guided entry AEO.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "artworks_locales"
      ADD COLUMN IF NOT EXISTS "medium" varchar,
      ADD COLUMN IF NOT EXISTS "surface" varchar;

    -- Copy legacy non-localized values onto DE locale rows when present.
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'artworks' AND column_name = 'medium'
      ) THEN
        UPDATE "artworks_locales" AS al
          SET "medium" = a."medium"
          FROM "artworks" AS a
          WHERE al."_parent_id" = a."id"
            AND al."_locale" = 'de'
            AND a."medium" IS NOT NULL
            AND (al."medium" IS NULL OR al."medium" = '');

        INSERT INTO "artworks_locales" ("description", "location_in_building_spot", "medium", "surface", "_locale", "_parent_id")
        SELECT NULL, NULL, a."medium", NULL, 'de', a."id"
        FROM "artworks" AS a
        WHERE a."medium" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "artworks_locales" AS al
            WHERE al."_parent_id" = a."id" AND al."_locale" = 'de'
          );

        ALTER TABLE "artworks" DROP COLUMN "medium";
      END IF;
    END $$;

    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'artworks' AND column_name = 'surface'
      ) THEN
        UPDATE "artworks_locales" AS al
          SET "surface" = a."surface"
          FROM "artworks" AS a
          WHERE al."_parent_id" = a."id"
            AND al."_locale" = 'de'
            AND a."surface" IS NOT NULL
            AND (al."surface" IS NULL OR al."surface" = '');

        INSERT INTO "artworks_locales" ("description", "location_in_building_spot", "medium", "surface", "_locale", "_parent_id")
        SELECT NULL, NULL, NULL, a."surface", 'de', a."id"
        FROM "artworks" AS a
        WHERE a."surface" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "artworks_locales" AS al
            WHERE al."_parent_id" = a."id" AND al."_locale" = 'de'
          );

        -- For rows that already got a DE locale from medium copy, fill surface.
        UPDATE "artworks_locales" AS al
          SET "surface" = a."surface"
          FROM "artworks" AS a
          WHERE al."_parent_id" = a."id"
            AND al."_locale" = 'de'
            AND a."surface" IS NOT NULL
            AND (al."surface" IS NULL OR al."surface" = '');

        ALTER TABLE "artworks" DROP COLUMN "surface";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "artworks"
      ADD COLUMN IF NOT EXISTS "medium" varchar,
      ADD COLUMN IF NOT EXISTS "surface" varchar;

    UPDATE "artworks" AS a
      SET
        "medium" = al."medium",
        "surface" = al."surface"
      FROM "artworks_locales" AS al
      WHERE al."_parent_id" = a."id"
        AND al."_locale" = 'de';

    ALTER TABLE "artworks_locales"
      DROP COLUMN IF EXISTS "medium",
      DROP COLUMN IF EXISTS "surface";
  `)
}
