/**
 * Cloudflare R2 is enabled only when credentials are present.
 * Without them, Payload keeps media on local disk.
 *
 * Public URLs are built from NEXT_PUBLIC_MEDIA_URL (config, never stored
 * on the media record). Change that one env var to move from *.r2.dev to
 * media.hotel-berlin.de later — no data migration.
 */

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  )
}

export function r2Endpoint(): string {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
}

export function publicMediaBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_MEDIA_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/+$/, '')
}

export function publicMediaUrl(filename: string, prefix?: string | null): string | undefined {
  const base = publicMediaBase()
  if (!base || !filename) return undefined
  const key = [prefix, filename].filter(Boolean).join('/')
  return `${base}/${key}`
}

export function mediaRemotePatterns(): { protocol: 'http' | 'https'; hostname: string }[] {
  const patterns: { protocol: 'http' | 'https'; hostname: string }[] = [
    { protocol: 'https', hostname: '*.r2.dev' },
  ]

  const base = publicMediaBase()
  if (!base) return patterns

  try {
    const url = new URL(base)
    if (!url.hostname || url.hostname === '*.r2.dev') return patterns
    patterns.push({
      protocol: url.protocol === 'http:' ? 'http' : 'https',
      hostname: url.hostname,
    })
  } catch {
    // Invalid NEXT_PUBLIC_MEDIA_URL — keep the r2.dev pattern only.
  }

  return patterns
}
