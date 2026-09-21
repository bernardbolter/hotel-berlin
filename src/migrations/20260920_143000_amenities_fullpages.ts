import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_amenities_kind" AS ENUM('facility', 'service');
    CREATE TYPE "public"."enum_amenities_schema_type" AS ENUM('none', 'ExerciseGym', 'SportsActivityLocation', 'ParkingFacility');
    ALTER TABLE "amenities" ADD COLUMN "kind" "enum_amenities_kind" DEFAULT 'facility';
    ALTER TABLE "amenities" ADD COLUMN "schema_type" "enum_amenities_schema_type" DEFAULT 'none';
    ALTER TABLE "amenities" ADD COLUMN "show_in_hub" boolean DEFAULT true;
    ALTER TABLE "amenities_locales" ADD COLUMN "summary" varchar;
    ALTER TABLE "amenities_locales" ADD COLUMN "details" jsonb;
    ALTER TABLE "amenities_locales" ADD COLUMN "access" varchar;
    UPDATE "amenities" SET "kind" = 'facility' WHERE "kind" IS NULL;
    UPDATE "amenities" SET "schema_type" = 'none' WHERE "schema_type" IS NULL;
    UPDATE "amenities" SET "show_in_hub" = true WHERE "show_in_hub" IS NULL;
    UPDATE "amenities_locales" SET "summary" = LEFT("subline", 90) WHERE "summary" IS NULL AND "subline" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "amenities_locales" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "amenities_locales" DROP COLUMN IF EXISTS "details";
    ALTER TABLE "amenities_locales" DROP COLUMN IF EXISTS "access";
    ALTER TABLE "amenities" DROP COLUMN IF EXISTS "kind";
    ALTER TABLE "amenities" DROP COLUMN IF EXISTS "schema_type";
    ALTER TABLE "amenities" DROP COLUMN IF EXISTS "show_in_hub";
    DROP TYPE IF EXISTS "public"."enum_amenities_kind";
    DROP TYPE IF EXISTS "public"."enum_amenities_schema_type";
  `)
}
