import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * hotel-staff role + rooms.visible_on_site.
 * Versions tables for rooms are created via Payload push / generate migration
 * when versions are enabled on the collection.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'hotel-staff';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "visible_on_site" boolean DEFAULT true;
    UPDATE "rooms" SET "visible_on_site" = true WHERE "visible_on_site" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rooms" DROP COLUMN IF EXISTS "visible_on_site";
  `)
  // Postgres cannot easily remove an enum value; leave hotel-staff in place on down.
}
