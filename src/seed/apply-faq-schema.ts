/**
 * Migrate legacy FAQ rows + finish enum column types so Payload/Drizzle
 * does not need to ALTER category/context (avoids the check-in cast failure).
 *
 * Safe to re-run. Stop `npm run dev` first, then:
 *   npm run apply:faq-schema
 *   npm run dev
 */
import 'dotenv/config'
import pg from 'pg'

const { Client } = pg

/** Old taxonomy (Payload brief v1) → new FAQ brief categories. */
const CATEGORY_MAP: Record<string, string> = {
  'check-in': 'checkin-checkout',
  cancellation: 'rooms-booking',
  payment: 'rooms-booking',
  parking: 'pets-parking',
  pets: 'pets-parking',
  transport: 'getting-here',
  dining: 'dining',
  amenities: 'guest-services',
  accessibility: 'accessibility',
  local: 'neighbourhood-guest',
  events: 'general',
}

const ALLOWED_CATEGORIES = [
  'rooms-booking',
  'checkin-checkout',
  'dining',
  'meetings',
  'accessibility',
  'getting-here',
  'pets-parking',
  'general',
  'wifi-tech',
  'guest-services',
  'neighbourhood-guest',
] as const

async function columnExists(client: pg.Client, table: string, column: string) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return rows.length > 0
}

async function columnUdt(client: pg.Client, table: string, column: string) {
  const { rows } = await client.query<{ udt_name: string }>(
    `SELECT udt_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return rows[0]?.udt_name ?? null
}

async function ensureEnum(
  client: pg.Client,
  name: string,
  labels: readonly string[],
) {
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE ${name} AS ENUM (${labels.map((l) => `'${l}'`).join(', ')});
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = new Client({ connectionString: url })
  await client.connect()

  try {
    const hasFaqs = await columnExists(client, 'faqs', 'id')
    if (!hasFaqs) {
      console.log('No faqs table yet — nothing to migrate.')
      return
    }

    await ensureEnum(client, 'enum_faqs_category', ALLOWED_CATEGORIES)
    await ensureEnum(client, 'enum_faqs_context', ['prospect', 'guest'])

    // —— category text / old values → enum_faqs_category ——
    if (await columnExists(client, 'faqs', 'category')) {
      console.log('--- Remapping legacy FAQ categories ---')
      // Work on text so remaps always succeed regardless of current udt
      const udt = await columnUdt(client, 'faqs', 'category')
      if (udt && udt !== 'text' && udt !== 'varchar') {
        await client.query(
          `ALTER TABLE faqs ALTER COLUMN category TYPE text USING category::text`,
        )
        console.log(`✓ category temporarily cast ${udt} → text`)
      }

      for (const [from, to] of Object.entries(CATEGORY_MAP)) {
        const { rowCount } = await client.query(
          `UPDATE faqs SET category = $1 WHERE category = $2`,
          [to, from],
        )
        if (rowCount && rowCount > 0) {
          console.log(`✓ ${from} → ${to} (${rowCount} row(s))`)
        }
      }

      const { rows: unknown } = await client.query<{ category: string }>(
        `SELECT DISTINCT category AS category FROM faqs ORDER BY 1`,
      )
      const allowed = new Set<string>(ALLOWED_CATEGORIES)
      const leftovers = unknown.map((r) => r.category).filter((c) => !allowed.has(c))
      if (leftovers.length > 0) {
        console.warn('⚠ Unmapped category values → general:', leftovers.join(', '))
        for (const value of leftovers) {
          await client.query(`UPDATE faqs SET category = 'general' WHERE category = $1`, [value])
        }
      }

      const afterUdt = await columnUdt(client, 'faqs', 'category')
      if (afterUdt !== 'enum_faqs_category') {
        await client.query(`
          ALTER TABLE faqs
          ALTER COLUMN category SET DATA TYPE enum_faqs_category
          USING category::enum_faqs_category
        `)
        console.log('✓ category → enum_faqs_category')
      } else {
        console.log('✓ category already enum_faqs_category')
      }
    }

    // —— audience / context → enum_faqs_context ——
    const hasAudience = await columnExists(client, 'faqs', 'audience')
    const hasContext = await columnExists(client, 'faqs', 'context')

    if (hasAudience && !hasContext) {
      await client.query(`ALTER TABLE faqs RENAME COLUMN audience TO context`)
      console.log('✓ audience renamed → context')
    }

    if (await columnExists(client, 'faqs', 'context')) {
      const ctxUdt = await columnUdt(client, 'faqs', 'context')
      if (ctxUdt !== 'text' && ctxUdt !== 'varchar') {
        await client.query(
          `ALTER TABLE faqs ALTER COLUMN context TYPE text USING context::text`,
        )
        console.log(`✓ context temporarily cast ${ctxUdt} → text`)
      }
      await client.query(`UPDATE faqs SET context = 'prospect' WHERE context = 'both'`)
      const { rowCount } = await client.query(
        `UPDATE faqs SET context = 'prospect' WHERE context IS NULL OR context = ''`,
      )
      if (rowCount) console.log(`✓ null context → prospect (${rowCount})`)

      const after = await columnUdt(client, 'faqs', 'context')
      if (after !== 'enum_faqs_context') {
        await client.query(`
          ALTER TABLE faqs
          ALTER COLUMN context SET DATA TYPE enum_faqs_context
          USING context::enum_faqs_context
        `)
        console.log('✓ context → enum_faqs_context')
      } else {
        console.log('✓ context already enum_faqs_context')
      }
    }

    // —— priority → order ——
    const hasPriority = await columnExists(client, 'faqs', 'priority')
    const hasOrder = await columnExists(client, 'faqs', 'order')
    if (hasPriority && hasOrder) {
      await client.query(`
        UPDATE faqs SET "order" = priority
        WHERE priority IS NOT NULL AND ("order" IS NULL OR "order" = 0)
      `)
    } else if (hasPriority && !hasOrder) {
      await client.query(`ALTER TABLE faqs RENAME COLUMN priority TO "order"`)
      console.log('✓ priority renamed → order')
    }

    // —— slug (required by new schema) ——
    if (!(await columnExists(client, 'faqs', 'slug'))) {
      await client.query(`ALTER TABLE faqs ADD COLUMN slug varchar`)
      // Derive from first locale question or id
      await client.query(`
        UPDATE faqs f SET slug = COALESCE(
          (
            SELECT lower(regexp_replace(left(fl.question, 48), '[^a-zA-Z0-9]+', '-', 'g'))
            FROM faqs_locales fl WHERE fl._parent_id = f.id AND fl._locale = 'en' LIMIT 1
          ),
          'faq-' || f.id::text
        )
        WHERE slug IS NULL
      `)
      // Ensure uniqueness
      await client.query(`
        UPDATE faqs f SET slug = slug || '-' || id::text
        WHERE EXISTS (
          SELECT 1 FROM faqs f2 WHERE f2.slug = f.slug AND f2.id < f.id
        )
      `)
      await client.query(`ALTER TABLE faqs ALTER COLUMN slug SET NOT NULL`)
      await client.query(`
        DO $$ BEGIN
          ALTER TABLE faqs ADD CONSTRAINT faqs_slug_unique UNIQUE (slug);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `)
      console.log('✓ slug column added')
    }

    // Drop obsolete published_at if still present (not in new schema)
    if (await columnExists(client, 'faqs', 'published_at')) {
      await client.query(`ALTER TABLE faqs DROP COLUMN published_at`)
      console.log('✓ dropped published_at')
    }

    const finalCats = await client.query(
      `SELECT DISTINCT category::text AS c FROM faqs ORDER BY 1`,
    )
    const finalCtx = await client.query(
      `SELECT DISTINCT context::text AS c FROM faqs ORDER BY 1`,
    )
    console.log('categories now:', finalCats.rows.map((r) => r.c).join(', '))
    console.log('contexts now:', finalCtx.rows.map((r) => r.c).join(', '))
    console.log('Done. Restart npm run dev (create enum only if still prompted).')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
