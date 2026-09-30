import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Art programme A1 (R1–R6). Database is empty of artworks/artists/exhibitions,
 * so columns are swapped without backfill.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_exhibitions_run_type" AS ENUM('dated', 'permanent');

    ALTER TABLE "exhibitions"
      ADD COLUMN IF NOT EXISTS "run_type" "enum_exhibitions_run_type" DEFAULT 'dated';

    UPDATE "exhibitions"
      SET "run_type" = 'permanent'
      WHERE "status" = 'permanent';

    ALTER TABLE "exhibitions"
      ALTER COLUMN "run_type" SET NOT NULL,
      ALTER COLUMN "start_date" SET NOT NULL;

    ALTER TABLE "exhibitions"
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "location";

    DROP TYPE IF EXISTS "public"."enum_exhibitions_status";

    ALTER TABLE "artists"
      ADD COLUMN IF NOT EXISTS "wikidata_id" varchar;

    CREATE TABLE IF NOT EXISTS "artists_same_as" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "url" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "artists_same_as"
        ADD CONSTRAINT "artists_same_as_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."artists"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "artists_same_as_order_idx"
      ON "artists_same_as" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "artists_same_as_parent_id_idx"
      ON "artists_same_as" USING btree ("_parent_id");

    ALTER TABLE "artworks"
      ADD COLUMN IF NOT EXISTS "pinned" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "context_image_id" integer;

    DO $$ BEGIN
      ALTER TABLE "artworks"
        ADD CONSTRAINT "artworks_context_image_id_media_id_fk"
        FOREIGN KEY ("context_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "artworks_context_image_idx"
      ON "artworks" USING btree ("context_image_id");

    CREATE TABLE IF NOT EXISTS "artworks_detail_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL,
      "alt" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "artworks_detail_images"
        ADD CONSTRAINT "artworks_detail_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "artworks_detail_images"
        ADD CONSTRAINT "artworks_detail_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "artworks_detail_images_order_idx"
      ON "artworks_detail_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "artworks_detail_images_parent_id_idx"
      ON "artworks_detail_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "artworks_detail_images_image_idx"
      ON "artworks_detail_images" USING btree ("image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "artworks_detail_images" CASCADE;

    ALTER TABLE "artworks"
      DROP CONSTRAINT IF EXISTS "artworks_context_image_id_media_id_fk";
    DROP INDEX IF EXISTS "artworks_context_image_idx";
    ALTER TABLE "artworks"
      DROP COLUMN IF EXISTS "context_image_id",
      DROP COLUMN IF EXISTS "pinned";

    DROP TABLE IF EXISTS "artists_same_as" CASCADE;
    ALTER TABLE "artists" DROP COLUMN IF EXISTS "wikidata_id";

    CREATE TYPE "public"."enum_exhibitions_status" AS ENUM('upcoming', 'current', 'permanent', 'past');

    ALTER TABLE "exhibitions"
      ADD COLUMN IF NOT EXISTS "status" "enum_exhibitions_status",
      ADD COLUMN IF NOT EXISTS "location" varchar;

    UPDATE "exhibitions"
      SET "status" = 'permanent'
      WHERE "run_type" = 'permanent';

    ALTER TABLE "exhibitions"
      ALTER COLUMN "start_date" DROP NOT NULL,
      DROP COLUMN IF EXISTS "run_type";

    DROP TYPE IF EXISTS "public"."enum_exhibitions_run_type";
  `)
}
