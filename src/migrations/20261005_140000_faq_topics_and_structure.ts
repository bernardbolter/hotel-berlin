import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql as drizzleSql } from 'drizzle-orm'

const dir = path.dirname(fileURLToPath(import.meta.url))

/**
 * FAQ System Part B Step 1 — structure only:
 * - faq-topics (+ locales)
 * - faqs: audience, topic, secondaryTopics (via rels), priority, pinnedRoutes,
 *   pinnedEntities (via rels), aliasSlugs, mergedInto, internalNote, source,
 *   lastReviewed, drafts (_status + _faqs_v*)
 * - Existing 47 rows set to _status = published
 *
 * Does not change question/answer text or run merges.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const body = fs.readFileSync(
    path.join(dir, '20261005_140000_faq_topics_and_structure.up.sql'),
    'utf8',
  )
  await db.execute(drizzleSql.raw(body))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const body = fs.readFileSync(
    path.join(dir, '20261005_140000_faq_topics_and_structure.down.sql'),
    'utf8',
  )
  await db.execute(drizzleSql.raw(body))
}
