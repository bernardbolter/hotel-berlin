import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add `subject` to enum_tags_type for artwork depiction vocabulary.
 * Themes (skateboarding, urban-art, …) stay as type=theme.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_tags_type" ADD VALUE IF NOT EXISTS 'subject';
  `)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // Postgres cannot remove an enum value safely; leave `subject` in place.
}
