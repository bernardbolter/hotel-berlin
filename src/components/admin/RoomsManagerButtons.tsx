'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

import { roomsManagerCopy } from '@/lib/rooms/roomsManagerCopy'

export function RoomsManagerListLink() {
  const { i18n } = useTranslation()
  const t = roomsManagerCopy(i18n?.language)
  return (
    <div style={{ marginBottom: 12 }}>
      <a className="btn btn--style-secondary btn--size-small" href="/admin/rooms-manager">
        {t.title}
      </a>
    </div>
  )
}

export function RoomsManagerDashCard() {
  const { i18n } = useTranslation()
  const t = roomsManagerCopy(i18n?.language)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    void fetch('/api/rooms?limit=100&depth=0', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { docs?: Array<{ homepageTeaser?: { enabled?: boolean | null } }> } | null) => {
        if (!data?.docs) return
        setCount(data.docs.filter((d) => d.homepageTeaser?.enabled).length)
      })
      .catch(() => setCount(null))
  }, [])

  return (
    <div
      style={{
        flex: '1 1 280px',
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
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>{t.pageHint}</span>
        {count != null ? (
          <span style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            {t.sliderCount(count, count * 7)}
          </span>
        ) : null}
      </div>
      <a
        className="btn btn--style-primary btn--size-medium"
        href="/admin/rooms-manager"
        style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        {t.title}
      </a>
    </div>
  )
}

export default RoomsManagerDashCard
