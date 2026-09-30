import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Guided entry step 2: place-in-building levels (outside/basement/lobby),
 * AEO artwork fields, artist identity fields, photo permission.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Place levels: remap legacy enum values, then replace the type.
    ALTER TABLE "artworks"
      ALTER COLUMN "location_in_building_floor" TYPE text
      USING (
        CASE "location_in_building_floor"::text
          WHEN 'EG' THEN 'lobby'
          WHEN 'B1' THEN 'basement'
          WHEN 'B2' THEN 'basement'
          WHEN 'Dach' THEN 'outside'
          ELSE "location_in_building_floor"::text
        END
      );

    DROP TYPE IF EXISTS "public"."enum_artworks_location_in_building_floor";

    CREATE TYPE "public"."enum_artworks_location_in_building_floor" AS ENUM(
      'outside', 'basement', 'lobby', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
    );

    ALTER TABLE "artworks"
      ALTER COLUMN "location_in_building_floor"
      TYPE "public"."enum_artworks_location_in_building_floor"
      USING "location_in_building_floor"::"public"."enum_artworks_location_in_building_floor";

    DO $$ BEGIN
      CREATE TYPE "public"."enum_artworks_artform" AS ENUM(
        'mural', 'graffiti', 'print', 'photo', 'painting', 'installation', 'sculpture'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_artworks_permission" AS ENUM('granted', 'open', 'denied');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "artworks"
      ADD COLUMN IF NOT EXISTS "artform" "public"."enum_artworks_artform",
      ADD COLUMN IF NOT EXISTS "surface" varchar,
      ADD COLUMN IF NOT EXISTS "permission" "public"."enum_artworks_permission" DEFAULT 'open',
      ADD COLUMN IF NOT EXISTS "permission_note" varchar,
      ADD COLUMN IF NOT EXISTS "credit_text" varchar,
      ADD COLUMN IF NOT EXISTS "geo_latitude" numeric,
      ADD COLUMN IF NOT EXISTS "geo_longitude" numeric;

    ALTER TABLE "artists"
      ADD COLUMN IF NOT EXISTS "real_name" varchar;

    ALTER TABLE "artists_locales"
      ADD COLUMN IF NOT EXISTS "short_bio" varchar;

    -- Move legacy non-localized short_bio onto DE locale rows when present.
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'artists' AND column_name = 'short_bio'
      ) THEN
        UPDATE "artists_locales" AS al
          SET "short_bio" = a."short_bio"
          FROM "artists" AS a
          WHERE al."_parent_id" = a."id"
            AND al."_locale" = 'de'
            AND a."short_bio" IS NOT NULL
            AND (al."short_bio" IS NULL OR al."short_bio" = '');

        INSERT INTO "artists_locales" ("bio", "short_bio", "_locale", "_parent_id")
        SELECT NULL, a."short_bio", 'de', a."id"
        FROM "artists" AS a
        WHERE a."short_bio" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "artists_locales" AS al
            WHERE al."_parent_id" = a."id" AND al."_locale" = 'de'
          );

        ALTER TABLE "artists" DROP COLUMN "short_bio";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "short_bio" varchar;

    UPDATE "artists" AS a
      SET "short_bio" = al."short_bio"
      FROM "artists_locales" AS al
      WHERE al."_parent_id" = a."id"
        AND al."_locale" = 'de'
        AND al."short_bio" IS NOT NULL;

    ALTER TABLE "artists_locales" DROP COLUMN IF EXISTS "short_bio";
    ALTER TABLE "artists" DROP COLUMN IF EXISTS "real_name";

    ALTER TABLE "artworks"
      DROP COLUMN IF EXISTS "geo_longitude",
      DROP COLUMN IF EXISTS "geo_latitude",
      DROP COLUMN IF EXISTS "credit_text",
      DROP COLUMN IF EXISTS "permission_note",
      DROP COLUMN IF EXISTS "permission",
      DROP COLUMN IF EXISTS "surface",
      DROP COLUMN IF EXISTS "artform";

    DROP TYPE IF EXISTS "public"."enum_artworks_permission";
    DROP TYPE IF EXISTS "public"."enum_artworks_artform";

    ALTER TABLE "artworks"
      ALTER COLUMN "location_in_building_floor" TYPE text
      USING (
        CASE "location_in_building_floor"::text
          WHEN 'lobby' THEN 'EG'
          WHEN 'basement' THEN 'B1'
          WHEN 'outside' THEN 'Dach'
          ELSE "location_in_building_floor"::text
        END
      );

    DROP TYPE IF EXISTS "public"."enum_artworks_location_in_building_floor";

    CREATE TYPE "public"."enum_artworks_location_in_building_floor" AS ENUM(
      'B2', 'B1', 'EG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Dach'
    );

    ALTER TABLE "artworks"
      ALTER COLUMN "location_in_building_floor"
      TYPE "public"."enum_artworks_location_in_building_floor"
      USING "location_in_building_floor"::"public"."enum_artworks_location_in_building_floor";
  `)
}
