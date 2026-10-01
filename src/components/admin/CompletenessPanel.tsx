'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDocumentInfo, useFormFields, useTranslation } from '@payloadcms/ui'

import {
  checkArtworkCompleteness,
  checkHeroSlideCompleteness,
  type ArtworkCompletenessInput,
  type CompletenessLocale,
  type CompletenessResult,
  type HeroSlideCompletenessInput,
} from '@/lib/completeness'
import { neuesWerkLocale } from './neuesWerkCopy'

type MediaAlt = { de?: string | null; en?: string | null }

function Panel({
  result,
  uiLocale,
}: {
  result: CompletenessResult
  uiLocale: CompletenessLocale
}) {
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
        background: result.complete
          ? 'color-mix(in srgb, #1a7f4b 12%, transparent)'
          : 'var(--theme-elevation-50)',
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

/**
 * Edit-view sidebar: live completeness from the same rules the guided
 * entry and publish gate use. One definition of complete.
 * Hooks always run; which rules apply depends on collectionSlug.
 */
export function CompletenessPanel() {
  const { i18n } = useTranslation()
  const uiLocale: CompletenessLocale = neuesWerkLocale(i18n?.language)
  const docInfo = useDocumentInfo()
  const collectionSlug = docInfo?.collectionSlug
  const isHero = collectionSlug === 'hero-slides'

  const artist = useFormFields(([fields]) => fields.artist?.value)
  const floor = useFormFields(([fields]) => fields['locationInBuilding.floor']?.value)
  const spot = useFormFields(([fields]) => fields['locationInBuilding.spot']?.value)
  const images = useFormFields(([fields]) => fields.images?.value) as
    | Array<{ image?: number | { id?: number }; alt?: string } | null>
    | undefined
  const permission = useFormFields(([fields]) => fields.permission?.value)

  const image = useFormFields(([fields]) => fields.image?.value)
  const altText = useFormFields(([fields]) => fields.altText?.value)
  const venue = useFormFields(([fields]) => fields.venue?.value)
  const captionOverride = useFormFields(([fields]) => fields.captionOverride?.value)
  const credit = useFormFields(([fields]) => fields.credit?.value)
  const description = useFormFields(([fields]) => fields.description?.value)
  const keywords = useFormFields(([fields]) => fields.keywords?.value)

  const leadImageId = useMemo(() => {
    const row = images?.find((r) => r != null)
    if (!row?.image) return null
    return typeof row.image === 'number' ? row.image : row.image.id ?? null
  }, [images])

  const [photoAlt, setPhotoAlt] = useState<MediaAlt | null>(null)
  const [heroLocales, setHeroLocales] = useState<{
    alt: MediaAlt
    caption: MediaAlt
    description: MediaAlt
    keywords: MediaAlt
  } | null>(null)

  useEffect(() => {
    if (isHero || leadImageId == null) {
      if (!isHero) setPhotoAlt(null)
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
  }, [isHero, leadImageId])

  const heroId = docInfo?.id
  useEffect(() => {
    if (!isHero || heroId == null) {
      setHeroLocales(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [deRes, enRes] = await Promise.all([
          fetch(`/api/hero-slides/${heroId}?locale=de&depth=0`, { credentials: 'include' }),
          fetch(`/api/hero-slides/${heroId}?locale=en&depth=0`, { credentials: 'include' }),
        ])
        if (!deRes.ok || cancelled) return
        const deDoc = (await deRes.json()) as Record<string, string | null>
        const enDoc = enRes.ok
          ? ((await enRes.json()) as Record<string, string | null>)
          : ({} as Record<string, string | null>)
        if (cancelled) return
        setHeroLocales({
          alt: { de: deDoc.altText, en: enDoc.altText },
          caption: { de: deDoc.captionOverride, en: enDoc.captionOverride },
          description: { de: deDoc.description, en: enDoc.description },
          keywords: { de: deDoc.keywords, en: enDoc.keywords },
        })
      } catch {
        if (!cancelled) setHeroLocales(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isHero, heroId, altText, captionOverride, description, keywords])

  const artworkResult = useMemo(() => {
    const input: ArtworkCompletenessInput = {
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
    }
    return checkArtworkCompleteness(input)
  }, [artist, floor, spot, images, photoAlt, permission])

  const heroResult = useMemo(() => {
    const input: HeroSlideCompletenessInput = {
      image: image as HeroSlideCompletenessInput['image'],
      altTextLocales: {
        de: heroLocales?.alt.de ?? (typeof altText === 'string' ? altText : ''),
        en: heroLocales?.alt.en ?? '',
      },
      venue: venue as HeroSlideCompletenessInput['venue'],
      captionOverrideLocales: {
        de:
          heroLocales?.caption.de ??
          (typeof captionOverride === 'string' ? captionOverride : ''),
        en: heroLocales?.caption.en ?? '',
      },
      credit: typeof credit === 'string' ? credit : null,
      descriptionLocales: {
        de:
          heroLocales?.description.de ??
          (typeof description === 'string' ? description : ''),
        en: heroLocales?.description.en ?? '',
      },
      keywordsLocales: {
        de: heroLocales?.keywords.de ?? (typeof keywords === 'string' ? keywords : ''),
        en: heroLocales?.keywords.en ?? '',
      },
    }
    return checkHeroSlideCompleteness(input)
  }, [
    image,
    altText,
    venue,
    captionOverride,
    credit,
    description,
    keywords,
    heroLocales,
  ])

  return <Panel result={isHero ? heroResult : artworkResult} uiLocale={uiLocale} />
}

export default CompletenessPanel
