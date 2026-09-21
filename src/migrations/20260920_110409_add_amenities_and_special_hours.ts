import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_venues_special_hours_kind" AS ENUM('closed', 'hours', 'on-request');
  CREATE TYPE "public"."enum_amenities_special_hours_kind" AS ENUM('closed', 'hours', 'on-request');
  CREATE TABLE "venues_special_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"valid_through" timestamp(3) with time zone,
  	"kind" "enum_venues_special_hours_kind" DEFAULT 'closed' NOT NULL,
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "venues_special_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "amenities_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"is_open_ended" boolean DEFAULT false,
  	"segment" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "amenities_special_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"valid_through" timestamp(3) with time zone,
  	"kind" "enum_amenities_special_hours_kind" DEFAULT 'closed' NOT NULL,
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "amenities_special_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "amenities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"slug" varchar NOT NULL,
  	"lucide_icon" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"pending" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"include_in_schema" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "amenities_locales" (
  	"title" varchar NOT NULL,
  	"location" varchar,
  	"hours_override" varchar,
  	"price" varchar,
  	"what" varchar,
  	"subline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "amenities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "amenities_id" integer;
  ALTER TABLE "venues_special_hours" ADD CONSTRAINT "venues_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_special_hours_locales" ADD CONSTRAINT "venues_special_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_special_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_opening_hours" ADD CONSTRAINT "amenities_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_special_hours" ADD CONSTRAINT "amenities_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_special_hours_locales" ADD CONSTRAINT "amenities_special_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities_special_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities" ADD CONSTRAINT "amenities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "amenities_locales" ADD CONSTRAINT "amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "venues_special_hours_order_idx" ON "venues_special_hours" USING btree ("_order");
  CREATE INDEX "venues_special_hours_parent_id_idx" ON "venues_special_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "venues_special_hours_locales_locale_parent_id_unique" ON "venues_special_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_opening_hours_order_idx" ON "amenities_opening_hours" USING btree ("_order");
  CREATE INDEX "amenities_opening_hours_parent_id_idx" ON "amenities_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "amenities_special_hours_order_idx" ON "amenities_special_hours" USING btree ("_order");
  CREATE INDEX "amenities_special_hours_parent_id_idx" ON "amenities_special_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "amenities_special_hours_locales_locale_parent_id_unique" ON "amenities_special_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities__order_idx" ON "amenities" USING btree ("_order");
  CREATE UNIQUE INDEX "amenities_slug_idx" ON "amenities" USING btree ("slug");
  CREATE INDEX "amenities_image_idx" ON "amenities" USING btree ("image_id");
  CREATE INDEX "amenities_updated_at_idx" ON "amenities" USING btree ("updated_at");
  CREATE INDEX "amenities_created_at_idx" ON "amenities" USING btree ("created_at");
  CREATE UNIQUE INDEX "amenities_locales_locale_parent_id_unique" ON "amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_rels_order_idx" ON "amenities_rels" USING btree ("order");
  CREATE INDEX "amenities_rels_parent_idx" ON "amenities_rels" USING btree ("parent_id");
  CREATE INDEX "amenities_rels_path_idx" ON "amenities_rels" USING btree ("path");
  CREATE INDEX "amenities_rels_faqs_id_idx" ON "amenities_rels" USING btree ("faqs_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_amenities_id_idx" ON "payload_locked_documents_rels" USING btree ("amenities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "venues_special_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_special_hours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_opening_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_special_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_special_hours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "venues_special_hours" CASCADE;
  DROP TABLE "venues_special_hours_locales" CASCADE;
  DROP TABLE "amenities_opening_hours" CASCADE;
  DROP TABLE "amenities_special_hours" CASCADE;
  DROP TABLE "amenities_special_hours_locales" CASCADE;
  DROP TABLE "amenities" CASCADE;
  DROP TABLE "amenities_locales" CASCADE;
  DROP TABLE "amenities_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_amenities_fk";
  
  DROP INDEX "payload_locked_documents_rels_amenities_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "amenities_id";
  DROP TYPE "public"."enum_venues_special_hours_kind";
  DROP TYPE "public"."enum_amenities_special_hours_kind";`)
}
