/**
 * Pre-empt interactive drizzle rename prompts by aligning the people table
 * with the new collection fields before Payload's pushDevSchema runs.
 */
import 'dotenv/config'
import pg from 'pg'

const sql = `
ALTER TABLE people ADD COLUMN IF NOT EXISTS job_title varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS quote varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS video varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS room_number varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS based_in varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS type varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS status varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS related_venue_id integer;

-- Copy legacy role → job_title where empty, then drop legacy stub columns
UPDATE people SET job_title = role WHERE job_title IS NULL AND role IS NOT NULL;
ALTER TABLE people DROP COLUMN IF EXISTS role;
ALTER TABLE people DROP COLUMN IF EXISTS is_insider;

UPDATE people SET status = 'draft' WHERE status IS NULL;
`

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    await client.query(sql)
    console.log('People table aligned for neighbourhood schema.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
