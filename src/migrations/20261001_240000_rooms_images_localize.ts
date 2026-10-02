import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Localize rooms.images[].alt and caption (DE/EN); add optional shotType.
 * Existing non-localized alt/caption values move to the EN locale row.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_rooms_images_shot_type" AS ENUM('wide', 'bed', 'bath', 'detail', 'view');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "rooms_images"
      ADD COLUMN IF NOT EXISTS "shot_type" "enum_rooms_images_shot_type";

    CREATE TABLE IF NOT EXISTS "rooms_images_locales" (
      "alt" varchar,
      "caption" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "rooms_images_locales"
        ADD CONSTRAINT "rooms_images_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms_images"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "rooms_images_locales_locale_parent_id_unique"
      ON "rooms_images_locales" USING btree ("_locale", "_parent_id");

    -- Move existing alt/caption onto EN (create row if missing).
    INSERT INTO "rooms_images_locales" ("alt", "caption", "_locale", "_parent_id")
    SELECT ri."alt", ri."caption", 'en', ri."id"
    FROM "rooms_images" AS ri
    WHERE NOT EXISTS (
      SELECT 1 FROM "rooms_images_locales" AS en
      WHERE en."_parent_id" = ri."id" AND en."_locale" = 'en'
    );

    -- Ensure DE rows exist (empty — editors fill later; site falls back to EN).
    INSERT INTO "rooms_images_locales" ("alt", "caption", "_locale", "_parent_id")
    SELECT '', NULL, 'de', ri."id"
    FROM "rooms_images" AS ri
    WHERE NOT EXISTS (
      SELECT 1 FROM "rooms_images_locales" AS de
      WHERE de."_parent_id" = ri."id" AND de."_locale" = 'de'
    );

    ALTER TABLE "rooms_images"
      DROP COLUMN IF EXISTS "alt",
      DROP COLUMN IF EXISTS "caption";

    -- Payload expects localized required alt to be NOT NULL on locale rows that exist.
    UPDATE "rooms_images_locales"
      SET "alt" = COALESCE("alt", '')
      WHERE "alt" IS NULL;

    ALTER TABLE "rooms_images_locales"
      ALTER COLUMN "alt" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rooms_images"
      ADD COLUMN IF NOT EXISTS "alt" varchar,
      ADD COLUMN IF NOT EXISTS "caption" varchar;

    UPDATE "rooms_images" AS ri
      SET
        "alt" = COALESCE(en."alt", ''),
        "caption" = en."caption"
      FROM "rooms_images_locales" AS en
      WHERE en."_parent_id" = ri."id"
        AND en."_locale" = 'en';

    UPDATE "rooms_images"
      SET "alt" = COALESCE("alt", '')
      WHERE "alt" IS NULL;

    ALTER TABLE "rooms_images"
      ALTER COLUMN "alt" SET NOT NULL;

    DROP TABLE IF EXISTS "rooms_images_locales" CASCADE;

    ALTER TABLE "rooms_images"
      DROP COLUMN IF EXISTS "shot_type";

    DROP TYPE IF EXISTS "public"."enum_rooms_images_shot_type";
  `)
}
