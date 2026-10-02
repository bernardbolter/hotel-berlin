import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Meeting rooms versions tables — versions were enabled on the collection
 * but the `_meeting_rooms_v*` tables were never pushed. Without them, any
 * update (including photo upload) fails on version insert.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum__meeting_rooms_v_version_area" AS ENUM(
        'saal',
        'bereich-a',
        'bereich-b',
        'bereich-c',
        'sonderflaeche'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "_meeting_rooms_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar NOT NULL,
      "version_visible_on_site" boolean DEFAULT true,
      "version_area" "enum__meeting_rooms_v_version_area" NOT NULL,
      "version_display_order" numeric NOT NULL,
      "version_floor_size_m2" numeric NOT NULL,
      "version_ceiling_height_m" numeric,
      "version_has_daylight" boolean DEFAULT false,
      "version_is_divisible" boolean DEFAULT false,
      "version_has_screen" boolean DEFAULT false,
      "version_has_projector" boolean DEFAULT false,
      "version_capacity_theater" numeric,
      "version_capacity_classroom" numeric,
      "version_capacity_banquet" numeric,
      "version_capacity_u_shape" numeric,
      "version_capacity_cabaret" numeric,
      "version_capacity_reception" numeric,
      "version_capacity_block" numeric,
      "version_teaser_image_id" integer,
      "version_featured" boolean DEFAULT false,
      "version_homepage_teaser_enabled" boolean DEFAULT false,
      "version_homepage_teaser_order" numeric,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v"
        ADD CONSTRAINT "_meeting_rooms_v_parent_id_meeting_rooms_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."meeting_rooms"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v"
        ADD CONSTRAINT "_meeting_rooms_v_version_teaser_image_id_media_id_fk"
        FOREIGN KEY ("version_teaser_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_parent_idx"
      ON "_meeting_rooms_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_version_slug_idx"
      ON "_meeting_rooms_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_version_teaser_image_idx"
      ON "_meeting_rooms_v" USING btree ("version_teaser_image_id");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_version_updated_at_idx"
      ON "_meeting_rooms_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_version_created_at_idx"
      ON "_meeting_rooms_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_created_at_idx"
      ON "_meeting_rooms_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_updated_at_idx"
      ON "_meeting_rooms_v" USING btree ("updated_at");

    CREATE TABLE IF NOT EXISTS "_meeting_rooms_v_locales" (
      "version_name" varchar NOT NULL,
      "version_short_description" varchar NOT NULL,
      "version_description" jsonb,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_locales"
        ADD CONSTRAINT "_meeting_rooms_v_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_meeting_rooms_v"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "_meeting_rooms_v_locales_locale_parent_id_unique"
      ON "_meeting_rooms_v_locales" USING btree ("_locale", "_parent_id");

    CREATE TABLE IF NOT EXISTS "_meeting_rooms_v_version_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL,
      "_uuid" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_version_images"
        ADD CONSTRAINT "_meeting_rooms_v_version_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_meeting_rooms_v"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_version_images"
        ADD CONSTRAINT "_meeting_rooms_v_version_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_images_order_idx"
      ON "_meeting_rooms_v_version_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_images_parent_id_idx"
      ON "_meeting_rooms_v_version_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_version_images_image_idx"
      ON "_meeting_rooms_v_version_images" USING btree ("image_id");

    CREATE TABLE IF NOT EXISTS "_meeting_rooms_v_version_images_locales" (
      "alt" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_version_images_locales"
        ADD CONSTRAINT "_meeting_rooms_v_version_images_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_meeting_rooms_v_version_images"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "_meeting_rooms_v_version_images_locales_locale_parent_id_uni"
      ON "_meeting_rooms_v_version_images_locales" USING btree ("_locale", "_parent_id");

    CREATE TABLE IF NOT EXISTS "_meeting_rooms_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "meeting_rooms_id" integer
    );

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_rels"
        ADD CONSTRAINT "_meeting_rooms_v_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."_meeting_rooms_v"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_meeting_rooms_v_rels"
        ADD CONSTRAINT "_meeting_rooms_v_rels_meeting_rooms_fk"
        FOREIGN KEY ("meeting_rooms_id") REFERENCES "public"."meeting_rooms"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_rels_order_idx"
      ON "_meeting_rooms_v_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_rels_parent_idx"
      ON "_meeting_rooms_v_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_rels_path_idx"
      ON "_meeting_rooms_v_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_meeting_rooms_v_rels_meeting_rooms_id_idx"
      ON "_meeting_rooms_v_rels" USING btree ("meeting_rooms_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_meeting_rooms_v_rels" CASCADE;
    DROP TABLE IF EXISTS "_meeting_rooms_v_version_images_locales" CASCADE;
    DROP TABLE IF EXISTS "_meeting_rooms_v_version_images" CASCADE;
    DROP TABLE IF EXISTS "_meeting_rooms_v_locales" CASCADE;
    DROP TABLE IF EXISTS "_meeting_rooms_v" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__meeting_rooms_v_version_area";
  `)
}
