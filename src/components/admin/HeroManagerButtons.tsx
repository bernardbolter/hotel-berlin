'use client'

import { useEffect, useState } from 'react'
import { useAuth, useTranslation } from '@payloadcms/ui'

import { heroCopy, heroUiLocale } from '@/lib/hero/copy'
import type { HeroSlideContext } from '@/lib/hero/slideContext'
import { MeetingRoomsManagerDashCard } from '@/components/admin/MeetingRoomsManagerButtons'
import { RoomsManagerDashCard } from '@/components/admin/RoomsManagerButtons'

type Counts = { live: number; paused: number }

async function fetchCounts(context: HeroSlideContext): Promise<Counts> {
  const res = await fetch(
    `/api/hero-slides?limit=100&depth=0&where[context][equals]=${context}`,
    { credentials: 'include' },
  )
  if (!res.ok) return { live: 0, paused: 0 }
  const data = (await res.json()) as { docs: Array<{ enabled?: boolean | null }> }
  const live = data.docs.filter((d) => d.enabled !== false).length
  return { live, paused: data.docs.length - live }
}

function HeroDashCard({
  href,
  title,
  blurb,
  context,
}: {
  href: string
  title: string
  blurb: string
  context: HeroSlideContext
}) {
  const { i18n } = useTranslation()
  const t = heroCopy(i18n?.language)
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    void fetchCounts(context).then(setCounts)
  }, [context])

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
        <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>{blurb}</span>
        {counts ? (
          <span style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            {t.livePaused(counts.live, counts.paused)}
          </span>
        ) : null}
      </div>
      <a
        className="btn btn--style-primary btn--size-medium"
        href={href}
        style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        {title}
      </a>
    </div>
  )
}

/** Dashboard strip: art + both hero managers (hidden for hotel-staff). */
export function GuidedAdminDashboard() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const lang = heroUiLocale(i18n?.language)
  const t = heroCopy(i18n?.language)
  const hotelStaffOnly = (user as { role?: string } | null)?.role === 'hotel-staff'
  const art =
    lang === 'de'
      ? {
          title: 'Kunst im Haus',
          blurb: 'Foto hochladen und Werk anlegen — ohne Umweg über die Mediathek.',
          cta: 'Neues Werk',
        }
      : {
          title: 'Art in the building',
          blurb: 'Upload a photo and create a work — without a detour through the media library.',
          cta: 'New work',
        }

  if (hotelStaffOnly) {
    return (
      <div style={{ margin: '0 0 1.5rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <RoomsManagerDashCard />
        <MeetingRoomsManagerDashCard />
      </div>
    )
  }

  return (
    <div style={{ margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
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
          <strong style={{ display: 'block', marginBottom: 4 }}>{art.title}</strong>
          <span style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>{art.blurb}</span>
        </div>
        <a
          className="btn btn--style-primary btn--size-medium"
          href="/admin/neues-werk"
          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {art.cta}
        </a>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <HeroDashCard
          href="/admin/hero-startseite"
          title={t.startseiteTitle}
          blurb={t.dashboardBlurbStartseite}
          context="homepage"
        />
        <HeroDashCard
          href="/admin/hero-hier"
          title={t.hierTitle}
          blurb={t.dashboardBlurbHier}
          context="here"
        />
        <HeroDashCard
          href="/admin/hero-essen"
          title={t.essenTitle}
          blurb={t.dashboardBlurbEssen}
          context="eat-and-drink"
        />
        <RoomsManagerDashCard />
        <MeetingRoomsManagerDashCard />
      </div>
    </div>
  )
}

export function HeroManagerListLinks() {
  const { i18n } = useTranslation()
  const t = heroCopy(i18n?.language)
  return (
    <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <a className="btn btn--style-secondary btn--size-small" href="/admin/hero-startseite">
        {t.listLinkStartseite}
      </a>
      <a className="btn btn--style-secondary btn--size-small" href="/admin/hero-hier">
        {t.listLinkHier}
      </a>
      <a className="btn btn--style-secondary btn--size-small" href="/admin/hero-essen">
        {t.listLinkEssen}
      </a>
    </div>
  )
}

export default GuidedAdminDashboard
