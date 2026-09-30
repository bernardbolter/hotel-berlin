'use client'

import { useTranslation } from '@payloadcms/ui'

import { neuesWerkLocale } from './neuesWerkCopy'

const LANGS = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
] as const

/**
 * Compact DE/EN admin UI language toggle in the AppHeader actions
 * (next to the Dashboard step nav). Distinct from the content locale switcher.
 */
export function AdminLanguageSwitcher() {
  const { i18n, switchLanguage } = useTranslation()
  const active = neuesWerkLocale(i18n?.language)

  return (
    <div
      role="group"
      aria-label={active === 'en' ? 'Admin language' : 'Admin-Sprache'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: 2,
        background: 'var(--theme-elevation-0)',
      }}
    >
      {LANGS.map(({ code, label }) => {
        const isActive = active === code
        return (
          <button
            key={code}
            type="button"
            aria-pressed={isActive}
            disabled={isActive || !switchLanguage}
            onClick={() => {
              void switchLanguage?.(code)
            }}
            style={{
              appearance: 'none',
              border: 0,
              borderRadius: 3,
              padding: '4px 8px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              cursor: isActive ? 'default' : 'pointer',
              background: isActive ? 'var(--theme-elevation-150)' : 'transparent',
              color: 'var(--theme-text)',
              lineHeight: 1.2,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default AdminLanguageSwitcher
