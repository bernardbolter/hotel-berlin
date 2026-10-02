import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Third hero-slides context for the homepage Eat & Drink teaser slider.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_hero_slides_context" ADD VALUE IF NOT EXISTS 'eat-and-drink';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres cannot remove a single enum value safely; leave 'eat-and-drink' in place.
}
