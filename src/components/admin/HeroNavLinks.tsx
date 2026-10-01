'use client'

import { Link } from '@payloadcms/ui'

/**
 * Extra admin nav entries for the two hero managers.
 * Payload renders this via admin.components.afterNavLinks.
 */
export function HeroNavLinks() {
  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Link
        href="/admin/hero-startseite"
        style={{
          display: 'block',
          padding: '6px 16px',
          fontSize: 13,
          textDecoration: 'none',
          color: 'var(--theme-text)',
        }}
      >
        Hero Startseite
      </Link>
      <Link
        href="/admin/hero-hier"
        style={{
          display: 'block',
          padding: '6px 16px',
          fontSize: 13,
          textDecoration: 'none',
          color: 'var(--theme-text)',
        }}
      >
        Hero Hier
      </Link>
    </div>
  )
}

export default HeroNavLinks
