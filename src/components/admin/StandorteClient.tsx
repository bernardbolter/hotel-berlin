'use client'

import { useCallback, useEffect, useState } from 'react'
import { Gutter, useTranslation } from '@payloadcms/ui'

import { GuidedBackToDashboard } from './guided/GuidedBackToDashboard'
import { neuesWerkLocale } from './neuesWerkCopy'

type Row = {
  id: number
  title: string
  spot: string | null
  thumb: string | null
}

const copy = {
  de: {
    title: 'Standorte nachtragen',
    intro:
      'Außenwerke ohne Koordinaten. Auf dem Telefon öffnen, einmal ums Haus gehen, Liste leeren.',
    empty: 'Alles geführt — keine offenen Außen-Standorte.',
    capture: 'Standort jetzt erfassen',
    tooInaccurate: 'Zu ungenau — noch einmal versuchen.',
    denied: 'Standort nicht verfügbar.',
    saved: 'Gespeichert',
    untitled: 'Ohne Titel',
  },
  en: {
    title: 'Catch up locations',
    intro:
      'Outdoor works without coordinates. Open on the phone, walk the building once, clear the list.',
    empty: 'All clear — no outdoor works missing coordinates.',
    capture: 'Capture location now',
    tooInaccurate: 'Too inaccurate — try again.',
    denied: 'Location unavailable.',
    saved: 'Saved',
    untitled: 'Untitled',
  },
} as const

const MAX_ACCURACY_M = 50

/**
 * Phone catch-up queue: outdoor artworks missing geo.
 */
export function StandorteClient() {
  const { i18n } = useTranslation()
  const lang = neuesWerkLocale(i18n?.language)
  const t = copy[lang]
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: '100',
        depth: '1',
        locale: 'de',
        'where[and][0][locationInBuilding.floor][equals]': 'outside',
        'where[and][1][or][0][geo.latitude][exists]': 'false',
        'where[and][1][or][1][geo.longitude][exists]': 'false',
      })
      const res = await fetch(`/api/artworks?${params}`, { credentials: 'include' })
      const data = (await res.json()) as {
        docs?: Array<{
          id: number
          title?: string | null
          locationInBuilding?: { spot?: string | null }
          images?: Array<{ image?: { url?: string; sizes?: { thumb?: { url?: string } } } | number }>
        }>
      }
      if (!res.ok) throw new Error('load failed')
      setRows(
        (data.docs ?? []).map((doc) => {
          const img = doc.images?.[0]?.image
          const thumb =
            typeof img === 'object' && img
              ? img.sizes?.thumb?.url || img.url || null
              : null
          return {
            id: doc.id,
            title: doc.title?.trim() || t.untitled,
            spot: doc.locationInBuilding?.spot?.trim() || null,
            thumb,
          }
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [t.untitled])

  useEffect(() => {
    void load()
  }, [load])

  const capture = async (id: number) => {
    setBusyId(id)
    setError(null)
    setNotice(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error(t.denied))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error(t.denied)), {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })
      if (pos.coords.accuracy > MAX_ACCURACY_M) {
        setError(t.tooInaccurate)
        return
      }
      const res = await fetch(`/api/artworks/${id}?locale=de`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geo: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }),
      })
      if (!res.ok) throw new Error('save failed')
      setNotice(t.saved)
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : t.denied)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 0 48px' }}>
        <GuidedBackToDashboard />
        <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>{t.title}</h1>
        <p style={{ margin: '0 0 20px', color: 'var(--theme-elevation-800)', fontSize: 14 }}>
          {t.intro}
        </p>
        {loading ? <p>…</p> : null}
        {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
        {notice ? <p style={{ color: '#1a7f4b' }}>{notice}</p> : null}
        {!loading && rows.length === 0 ? (
          <p>{t.empty}</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {rows.map((row) => (
              <li
                key={row.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--theme-elevation-150)',
                }}
              >
                {row.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.thumb}
                    alt=""
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: 'var(--theme-elevation-100)',
                      borderRadius: 4,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 14 }}>{row.title}</strong>
                  {row.spot ? (
                    <span style={{ fontSize: 12, color: 'var(--theme-elevation-800)' }}>
                      {row.spot}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn--style-primary btn--size-small"
                  disabled={busyId === row.id}
                  onClick={() => void capture(row.id)}
                >
                  {t.capture}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Gutter>
  )
}

export default StandorteClient
