import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_faq_placements_placements_route" AS ENUM('home', 'rooms', 'room-detail', 'meetings', 'amenities', 'sustainability', 'offers', 'contact', 'faq', 'here', 'here-dining', 'here-getting-around', 'here-faq', 'policy-checkin', 'policy-cancellation', 'policy-pets', 'policy-fees', 'policy-payment');
  CREATE TYPE "public"."enum_faq_placements_placements_audience" AS ENUM('prospect', 'guest', 'both');
  CREATE TABLE "faq_placements_placements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"route" "enum_faq_placements_placements_route" NOT NULL,
  	"audience" "enum_faq_placements_placements_audience" NOT NULL,
  	"show_all" boolean DEFAULT false,
  	"cap" numeric
  );
  
  CREATE TABLE "faq_placements_placements_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "faq_placements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "faq_placements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faq_topics_id" integer
  );
  
  ALTER TABLE "amenities" ADD COLUMN "notice_minutes" numeric;
  ALTER TABLE "hotel" ADD COLUMN "reception_phone" varchar;
  ALTER TABLE "hotel" ADD COLUMN "emails_reservations" varchar;
  ALTER TABLE "hotel" ADD COLUMN "emails_sustainability" varchar;
  ALTER TABLE "hotel" ADD COLUMN "emails_careers" varchar;
  ALTER TABLE "hotel" ADD COLUMN "lost_property_url" varchar;
  ALTER TABLE "hotel" ADD COLUMN "early_checkin_from" varchar;
  ALTER TABLE "hotel" ADD COLUMN "early_checkin_fee" numeric;
  ALTER TABLE "hotel" ADD COLUMN "late_checkout_until" varchar;
  ALTER TABLE "hotel" ADD COLUMN "late_checkout_fee" numeric;
  ALTER TABLE "hotel" ADD COLUMN "parking_spaces" numeric;
  ALTER TABLE "hotel" ADD COLUMN "parking_hourly" numeric;
  ALTER TABLE "hotel" ADD COLUMN "parking_daily_max" numeric;
  ALTER TABLE "hotel" ADD COLUMN "parking_max_height" numeric;
  ALTER TABLE "hotel" ADD COLUMN "pet_fee" numeric;
  ALTER TABLE "hotel" ADD COLUMN "rate_policy_flexible_cancel_until" varchar;
  ALTER TABLE "hotel" ADD COLUMN "rate_policy_no_show_percent" numeric;
  ALTER TABLE "hotel" ADD COLUMN "smoking_fee" numeric;
  ALTER TABLE "hotel" ADD COLUMN "room_phone_rates_domestic" numeric;
  ALTER TABLE "hotel" ADD COLUMN "room_phone_rates_intl_min" numeric;
  ALTER TABLE "hotel" ADD COLUMN "room_phone_rates_intl_max" numeric;
  ALTER TABLE "faq_placements_placements" ADD CONSTRAINT "faq_placements_placements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_placements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_placements_placements_locales" ADD CONSTRAINT "faq_placements_placements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_placements_placements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_placements_rels" ADD CONSTRAINT "faq_placements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_placements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_placements_rels" ADD CONSTRAINT "faq_placements_rels_faq_topics_fk" FOREIGN KEY ("faq_topics_id") REFERENCES "public"."faq_topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "faq_placements_placements_order_idx" ON "faq_placements_placements" USING btree ("_order");
  CREATE INDEX "faq_placements_placements_parent_id_idx" ON "faq_placements_placements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "faq_placements_placements_route_idx" ON "faq_placements_placements" USING btree ("route");
  CREATE UNIQUE INDEX "faq_placements_placements_locales_locale_parent_id_unique" ON "faq_placements_placements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_placements_rels_order_idx" ON "faq_placements_rels" USING btree ("order");
  CREATE INDEX "faq_placements_rels_parent_idx" ON "faq_placements_rels" USING btree ("parent_id");
  CREATE INDEX "faq_placements_rels_path_idx" ON "faq_placements_rels" USING btree ("path");
  CREATE INDEX "faq_placements_rels_faq_topics_id_idx" ON "faq_placements_rels" USING btree ("faq_topics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "faq_placements_placements" CASCADE;
  DROP TABLE "faq_placements_placements_locales" CASCADE;
  DROP TABLE "faq_placements" CASCADE;
  DROP TABLE "faq_placements_rels" CASCADE;
  ALTER TABLE "amenities" DROP COLUMN "notice_minutes";
  ALTER TABLE "hotel" DROP COLUMN "reception_phone";
  ALTER TABLE "hotel" DROP COLUMN "emails_reservations";
  ALTER TABLE "hotel" DROP COLUMN "emails_sustainability";
  ALTER TABLE "hotel" DROP COLUMN "emails_careers";
  ALTER TABLE "hotel" DROP COLUMN "lost_property_url";
  ALTER TABLE "hotel" DROP COLUMN "early_checkin_from";
  ALTER TABLE "hotel" DROP COLUMN "early_checkin_fee";
  ALTER TABLE "hotel" DROP COLUMN "late_checkout_until";
  ALTER TABLE "hotel" DROP COLUMN "late_checkout_fee";
  ALTER TABLE "hotel" DROP COLUMN "parking_spaces";
  ALTER TABLE "hotel" DROP COLUMN "parking_hourly";
  ALTER TABLE "hotel" DROP COLUMN "parking_daily_max";
  ALTER TABLE "hotel" DROP COLUMN "parking_max_height";
  ALTER TABLE "hotel" DROP COLUMN "pet_fee";
  ALTER TABLE "hotel" DROP COLUMN "rate_policy_flexible_cancel_until";
  ALTER TABLE "hotel" DROP COLUMN "rate_policy_no_show_percent";
  ALTER TABLE "hotel" DROP COLUMN "smoking_fee";
  ALTER TABLE "hotel" DROP COLUMN "room_phone_rates_domestic";
  ALTER TABLE "hotel" DROP COLUMN "room_phone_rates_intl_min";
  ALTER TABLE "hotel" DROP COLUMN "room_phone_rates_intl_max";
  DROP TYPE "public"."enum_faq_placements_placements_route";
  DROP TYPE "public"."enum_faq_placements_placements_audience";`)
}
