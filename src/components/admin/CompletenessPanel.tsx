'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormFields, useTranslation } from '@payloadcms/ui'

import {
  checkArtworkCompleteness,
  type ArtworkCompletenessInput,
  type CompletenessLocale,
} from '@/lib/completeness'
import { neuesWerkLocale } from './neuesWerkCopy'

type MediaAlt = { de?: string | null; en?: string | null }

/**
 * Edit-view sidebar: live completeness from the same rules the guided
 * entry and publish gate use. One definition of complete.
 */
export function CompletenessPanel() {
  const { i18n } = useTranslation()
  const uiLocale: CompletenessLocale = neuesWerkLocale(i18n?.language)

  const artist = useFormFields(([fields]) => fields.artist?.value)
  const floor = useFormFields(([fields]) => fields['locationInBuilding.floor']?.value)
  const spot = useFormFields(([fields]) => fields['locationInBuilding.spot']?.value)
  const images = useFormFields(([fields]) => fields.images?.value) as
    | Array<{ image?: number | { id?: number }; alt?: string } | null>
    | undefined

  const leadImageId = useMemo(() => {
    const row = images?.find((r) => r != null)
    if (!row?.image) return null
    return typeof row.image === 'number' ? row.image : row.image.id ?? null
  }, [images])

  const [photoAlt, setPhotoAlt] = useState<MediaAlt | null>(null)

  useEffect(() => {
    if (leadImageId == null) {
      setPhotoAlt(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [deRes, enRes] = await Promise.all([
          fetch(`/api/media/${leadImageId}?locale=de&depth=0`, { credentials: 'include' }),
          fetch(`/api/media/${leadImageId}?locale=en&depth=0`, { credentials: 'include' }),
        ])
        if (!deRes.ok || cancelled) return
        const deDoc = (await deRes.json()) as { alt?: string }
        const enDoc = enRes.ok ? ((await enRes.json()) as { alt?: string }) : { alt: '' }
        if (cancelled) return
        setPhotoAlt({ de: deDoc.alt ?? null, en: enDoc.alt ?? null })
      } catch {
        if (!cancelled) setPhotoAlt(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [leadImageId])

  const permission = useFormFields(([fields]) => fields.permission?.value)

  const input: ArtworkCompletenessInput = useMemo(
    () => ({
      artist: artist as ArtworkCompletenessInput['artist'],
      locationInBuilding: {
        floor: typeof floor === 'string' ? floor : null,
        spot: typeof spot === 'string' ? spot : null,
      },
      images: images ?? null,
      photoAlt,
      permission:
        permission === 'granted' || permission === 'open' || permission === 'denied'
          ? permission
          : 'open',
    }),
    [artist, floor, spot, images, photoAlt, permission],
  )

  const result = useMemo(() => checkArtworkCompleteness(input), [input])

  const title =
    uiLocale === 'de'
      ? result.complete
        ? 'Kann veröffentlicht werden'
        : 'Noch nicht vollständig'
      : result.complete
        ? 'Ready to publish'
        : 'Not complete yet'

  return (
    <aside
      className="completeness-panel"
      aria-live="polite"
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '12px 14px',
        background: result.complete ? 'color-mix(in srgb, #1a7f4b 12%, transparent)' : 'var(--theme-elevation-50)',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontWeight: 600,
          fontSize: 13,
          color: result.complete ? '#1a7f4b' : 'var(--theme-text)',
        }}
      >
        {title}
      </p>
      {result.blocking.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.45 }}>
          {result.blocking.map((issue) => (
            <li key={issue.code}>{issue.message[uiLocale]}</li>
          ))}
        </ul>
      ) : null}
      {result.warnings.length > 0 ? (
        <ul
          style={{
            margin: result.blocking.length ? '8px 0 0' : 0,
            paddingLeft: 18,
            fontSize: 12,
            lineHeight: 1.45,
            color: 'var(--theme-elevation-800)',
          }}
        >
          {result.warnings.map((issue) => (
            <li key={issue.code}>{issue.message[uiLocale]}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}

export default CompletenessPanel
