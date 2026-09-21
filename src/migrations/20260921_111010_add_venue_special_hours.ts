import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_venues_special_hours_kind" AS ENUM('closed', 'hours', 'on-request');
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
  
  ALTER TABLE "venues_special_hours" ADD CONSTRAINT "venues_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_special_hours_locales" ADD CONSTRAINT "venues_special_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_special_hours"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "venues_special_hours_order_idx" ON "venues_special_hours" USING btree ("_order");
  CREATE INDEX "venues_special_hours_parent_id_idx" ON "venues_special_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "venues_special_hours_locales_locale_parent_id_unique" ON "venues_special_hours_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "venues_special_hours" CASCADE;
  DROP TABLE "venues_special_hours_locales" CASCADE;
  DROP TYPE "public"."enum_venues_special_hours_kind";`)
}
