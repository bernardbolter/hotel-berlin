/**
 * Snapshot the local Postgres database and `media/` tree into a
 * timestamped folder under LOCAL_BACKUP_DIR (or BACKUP_DIR).
 *
 * Usage:
 *   LOCAL_BACKUP_DIR=~/Backups/hotel-berlin npm run backup:local
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import 'dotenv/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '..')
const mediaDir = path.join(repoRoot, 'media')

function stamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  )
}

function expandHome(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return path.join(process.env.HOME || '', p.slice(1))
  }
  return p
}

/** Resolve pg_dump even when Homebrew Postgres is not on PATH. */
function resolvePgDump(): string {
  const fromEnv = process.env.PG_DUMP
  if (fromEnv && existsSync(fromEnv)) return fromEnv

  const which = spawnSync('which', ['pg_dump'], { encoding: 'utf8' })
  const fromWhich = which.stdout?.trim()
  if (which.status === 0 && fromWhich && existsSync(fromWhich)) return fromWhich

  const candidates = [
    '/usr/local/opt/postgresql@16/bin/pg_dump',
    '/opt/homebrew/opt/postgresql@16/bin/pg_dump',
    '/usr/local/opt/libpq/bin/pg_dump',
    '/opt/homebrew/opt/libpq/bin/pg_dump',
    '/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump',
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  console.error(
    'pg_dump not found. Install PostgreSQL client tools, or set PG_DUMP to the binary path.',
  )
  process.exit(1)
}

function main() {
  const backupRoot = process.env.LOCAL_BACKUP_DIR || process.env.BACKUP_DIR
  if (!backupRoot) {
    console.error(
      'Set LOCAL_BACKUP_DIR (or BACKUP_DIR) to the parent folder for backups, e.g.\n' +
        '  LOCAL_BACKUP_DIR=~/Backups/hotel-berlin npm run backup:local',
    )
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required for pg_dump.')
    process.exit(1)
  }

  const pgDump = resolvePgDump()
  const outDir = path.resolve(expandHome(backupRoot), `hotelberlin-${stamp()}`)
  mkdirSync(outDir, { recursive: true })

  const dumpPath = path.join(outDir, 'database.dump')
  console.log(`pg_dump (${pgDump}) → ${dumpPath}`)
  const dump = spawnSync(pgDump, ['--format=custom', '--file', dumpPath, databaseUrl], {
    stdio: 'inherit',
  })
  if (dump.status !== 0) {
    console.error('pg_dump failed.')
    process.exit(dump.status ?? 1)
  }

  const mediaDest = path.join(outDir, 'media')
  if (existsSync(mediaDir)) {
    console.log(`Copying media/ → ${mediaDest}`)
    cpSync(mediaDir, mediaDest, { recursive: true })
  } else {
    console.warn(`No media/ at ${mediaDir} — skipped.`)
  }

  console.log(`Backup complete: ${outDir}`)
  console.log('Contains: database.dump (pg_dump -Fc) and media/')
}

main()
