-- FAQ placements global + hotel/amenity fact columns (Step 2 schema).
-- Idempotent enough for re-apply on a DB that already has these objects.

DO $$ BEGIN
  CREATE TYPE "public"."enum_faq_placements_placements_route" AS ENUM('home', 'rooms', 'room-detail', 'meetings', 'amenities', 'sustainability', 'offers', 'contact', 'faq', 'here', 'here-dining', 'here-getting-around', 'here-faq', 'policy-checkin', 'policy-cancellation', 'policy-pets', 'policy-fees', 'policy-payment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faq_placements_placements_audience" AS ENUM('prospect', 'guest', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "faq_placements_placements" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"route" "enum_faq_placements_placements_route" NOT NULL,
	"audience" "enum_faq_placements_placements_audience" NOT NULL,
	"show_all" boolean DEFAULT false,
	"cap" numeric
);

CREATE TABLE IF NOT EXISTS "faq_placements_placements_locales" (
	"heading" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "faq_placements" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "faq_placements_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"faq_topics_id" integer
);

ALTER TABLE "amenities" ADD COLUMN IF NOT EXISTS "notice_minutes" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "reception_phone" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "emails_reservations" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "emails_sustainability" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "emails_careers" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "lost_property_url" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "early_checkin_from" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "early_checkin_fee" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "late_checkout_until" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "late_checkout_fee" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "parking_spaces" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "parking_hourly" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "parking_daily_max" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "parking_max_height" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "pet_fee" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "rate_policy_flexible_cancel_until" varchar;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "rate_policy_no_show_percent" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "smoking_fee" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "room_phone_rates_domestic" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "room_phone_rates_intl_min" numeric;
ALTER TABLE "hotel" ADD COLUMN IF NOT EXISTS "room_phone_rates_intl_max" numeric;

DO $$ BEGIN
  ALTER TABLE "faq_placements_placements" ADD CONSTRAINT "faq_placements_placements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_placements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faq_placements_placements_locales" ADD CONSTRAINT "faq_placements_placements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_placements_placements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faq_placements_rels" ADD CONSTRAINT "faq_placements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_placements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faq_placements_rels" ADD CONSTRAINT "faq_placements_rels_faq_topics_fk" FOREIGN KEY ("faq_topics_id") REFERENCES "public"."faq_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "faq_placements_placements_order_idx" ON "faq_placements_placements" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "faq_placements_placements_parent_id_idx" ON "faq_placements_placements" USING btree ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "faq_placements_placements_route_idx" ON "faq_placements_placements" USING btree ("route");
CREATE UNIQUE INDEX IF NOT EXISTS "faq_placements_placements_locales_locale_parent_id_unique" ON "faq_placements_placements_locales" USING btree ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "faq_placements_rels_order_idx" ON "faq_placements_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "faq_placements_rels_parent_idx" ON "faq_placements_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "faq_placements_rels_path_idx" ON "faq_placements_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "faq_placements_rels_faq_topics_id_idx" ON "faq_placements_rels" USING btree ("faq_topics_id");
