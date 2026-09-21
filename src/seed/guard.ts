/**
 * Seed scripts must never run against production unless someone opts in.
 * Checklist 1.11 — DEPLOY.md used to tell operators to seed on first boot.
 */
export function assertSeedAllowed(): void {
  if (process.env.NODE_ENV !== 'production') return
  if (process.env.ALLOW_PRODUCTION_SEED === 'true') return

  console.error(
    'Refusing to seed: NODE_ENV=production. Set ALLOW_PRODUCTION_SEED=true to override.',
  )
  process.exit(1)
}

assertSeedAllowed()
