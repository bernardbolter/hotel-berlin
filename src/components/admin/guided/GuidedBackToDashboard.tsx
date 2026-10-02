'use client'

import type { CSSProperties } from 'react'
import { Link, useConfig, useTranslation } from '@payloadcms/ui'

const copy = {
  de: '← Zum Dashboard',
  en: '← Back to dashboard',
} as const

/**
 * Breadcrumb-style link back to the Payload admin dashboard.
 * Use at the top of guided custom views (Hero, Rooms, Neues Werk, Standorte).
 */
export function GuidedBackToDashboard({ style }: { style?: CSSProperties }) {
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const adminRoute = config.routes?.admin || '/admin'
  const lang = i18n?.language?.toLowerCase().startsWith('en') ? 'en' : 'de'

  return (
    <Link
      href={adminRoute}
      style={{
        display: 'inline-block',
        marginBottom: 8,
        fontSize: 13,
        textDecoration: 'none',
        color: 'var(--theme-elevation-800)',
        ...style,
      }}
    >
      {copy[lang]}
    </Link>
  )
}

export default GuidedBackToDashboard
