/**
 * Seed scripts must never run against production unless someone opts in.
 * Checklist 1.11 / F6 — print what would have run, then exit.
 */
export function assertSeedAllowed(): void {
  if (process.env.NODE_ENV !== 'production') return
  if (process.env.ALLOW_PRODUCTION_SEED === '1') return

  const invoked = process.argv.slice(1).join(' ') || '(unknown seed script)'
  console.error('Refusing to seed: NODE_ENV=production.')
  console.error(`Would have run: ${invoked}`)
  console.error('Set ALLOW_PRODUCTION_SEED=1 to override.')
  process.exit(1)
}

assertSeedAllowed()
