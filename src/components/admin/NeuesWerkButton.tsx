'use client'

import { useTranslation } from '@payloadcms/ui'

import { neuesWerkLocale } from './neuesWerkCopy'

const copy = {
  de: {
    title: 'Kunst im Haus',
    blurb: 'Foto hochladen und Werk anlegen — ohne Umweg über die Mediathek.',
    cta: 'Neues Werk',
  },
  en: {
    title: 'Art in the building',
    blurb: 'Upload a photo and create a work — without a detour through the media library.',
    cta: 'New work',
  },
} as const

function useNeuesWerkCopy() {
  const { i18n } = useTranslation()
  return copy[neuesWerkLocale(i18n?.language)]
}

/** List-view entry into the guided create flow. */
export function NeuesWerkListButton() {
  const t = useNeuesWerkCopy()
  return (
    <div style={{ marginBottom: 12 }}>
      <a
        className="btn btn--style-primary btn--size-medium"
        href="/admin/neues-werk"
        style={{ textDecoration: 'none' }}
      >
        {t.cta}
      </a>
    </div>
  )
}

/** Dashboard strip above the collection cards. */
export function NeuesWerkDashboardButton() {
  const t = useNeuesWerkCopy()
  return (
    <div
      style={{
        margin: '0 0 1.5rem',
        padding: '14px 16px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <strong style={{ display: 'block', marginBottom: 4 }}>{t.title}</strong>
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>{t.blurb}</span>
      </div>
      <a
        className="btn btn--style-primary btn--size-medium"
        href="/admin/neues-werk"
        style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        {t.cta}
      </a>
    </div>
  )
}

export default NeuesWerkListButton
