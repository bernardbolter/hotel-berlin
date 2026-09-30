'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

import {
  ARTIST_IDENTITY_DEFAULT_CHECKED,
  ARTIST_IDENTITY_GATED,
  artistIdentityPrompt,
  artistIdentityStatus,
  type ArtistIdentityFieldKey,
  normalizeInstagramHandle,
  normalizeWebsite,
  normalizeWikidataId,
  parseArtistAiReply,
  stripTrackingParams,
} from '@/lib/art/artistIdentity'
import { neuesWerkLocale } from './neuesWerkCopy'

type ArtistDoc = {
  id: number
  name: string
  instagram?: string | null
  website?: string | null
  wikidataId?: string | null
  realName?: string | null
  nationality?: string | null
  basedIn?: string | null
  medium?: string | null
  shortBio?: string | null
}

type ProposalRow = {
  key: ArtistIdentityFieldKey
  value: string
  source: string | null
  checked: boolean
  opened: boolean
}

const FIELD_LABEL = {
  de: {
    instagram: 'Instagram',
    website: 'Website',
    wikidataId: 'Wikidata',
    realName: 'Bürgerlicher Name',
    nationality: 'Kommt aus',
    basedIn: 'Arbeitet in',
    medium: 'Technik',
    shortBio: 'Ein Satz',
    missing: 'fehlt',
    present: 'da',
    expand: 'Daten ergänzen',
    collapse: 'Schließen',
    explanation:
      'Du kannst die Angaben von einem KI-Chat suchen lassen. Text kopieren, in den Chat einfügen, die Antwort zurückkopieren. Bitte jede Angabe über den Link prüfen – KI-Antworten erfinden Profile und Wikidata-Nummern, die es nicht gibt. Was sich nicht prüfen lässt, bleibt leer. Das ist völlig in Ordnung: Die meisten Street-Art-Künstler:innen haben keinen Wikidata-Eintrag.',
    copy: 'Prompt kopieren',
    copied: 'Kopiert',
    paste: 'Antwort hier einfügen',
    apply: 'Übernehmen',
    noSource: 'ohne Quelle',
    malformed: 'Die Antwort ließ sich nicht lesen. Bitte nur das JSON einfügen.',
    realNameHelp: 'Optional — nur wenn die Person ihn selbst veröffentlicht.',
    saved: 'Gespeichert',
    optional: 'optional',
  },
  en: {
    instagram: 'Instagram',
    website: 'Website',
    wikidataId: 'Wikidata',
    realName: 'Legal / real name',
    nationality: 'From',
    basedIn: 'Based in',
    medium: 'Technique',
    shortBio: 'One line',
    missing: 'missing',
    present: 'set',
    expand: 'Add details',
    collapse: 'Close',
    explanation:
      'You can have an AI chat look these up. Copy the prompt, paste it into the chat, copy the answer back. Please check every claim via its link — models invent profiles and Wikidata IDs. Leave blanks when you cannot verify. That is fine: most street artists have no Wikidata entry.',
    copy: 'Copy prompt',
    copied: 'Copied',
    paste: 'Paste the answer here',
    apply: 'Apply checked',
    noSource: 'no source',
    malformed: 'Could not read that reply. Paste the JSON only.',
    realNameHelp: 'Optional — only when the artist publishes it themselves.',
    saved: 'Saved',
    optional: 'optional',
  },
} as const

type Props = {
  artist: ArtistDoc
  onUpdated: (artist: ArtistDoc) => void
}

export function ArtistIdentityPanel({ artist, onUpdated }: Props) {
  const { i18n } = useTranslation()
  const lang = neuesWerkLocale(i18n?.language)
  const t = FIELD_LABEL[lang]
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paste, setPaste] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ProposalRow[]>([])
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const status = useMemo(() => artistIdentityStatus(artist), [artist])
  const prompt = artistIdentityPrompt(artist.name)

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const onPasteParse = (raw: string) => {
    setPaste(raw)
    setError(null)
    setNotice(null)
    if (!raw.trim()) {
      setRows([])
      return
    }
    const parsed = parseArtistAiReply(raw)
    if (!parsed.ok) {
      setRows([])
      setError(t.malformed)
      return
    }
    const data = parsed.data
    const next: ProposalRow[] = []
    const push = (key: ArtistIdentityFieldKey, value: string | null | undefined, source: string | null | undefined) => {
      const v = value?.trim()
      if (!v) return
      next.push({
        key,
        value: v,
        source: source?.trim() || null,
        checked: ARTIST_IDENTITY_DEFAULT_CHECKED.includes(key),
        opened: false,
      })
    }
    push('instagram', data.instagram?.value, data.instagram?.source)
    push('website', data.website?.value, data.website?.source)
    push('wikidataId', data.wikidataId?.value, data.wikidataId?.source)
    push('realName', data.realName?.value, data.realName?.source)
    push('nationality', data.nationality?.value, data.nationality?.source)
    push('basedIn', data.basedIn?.value, data.basedIn?.source)
    push('medium', data.medium?.value, data.medium?.source)
    const bio = data.shortBio?.de?.trim() || data.shortBio?.en?.trim()
    if (bio) push('shortBio', bio, data.shortBio?.source)
    setRows(next)
  }

  const canCheck = (row: ProposalRow) => {
    if (!row.source) return false
    if (ARTIST_IDENTITY_GATED.includes(row.key) && !row.opened) return false
    return true
  }

  const applyChecked = async () => {
    const patch: Record<string, string> = {}
    for (const row of rows) {
      if (!row.checked || !canCheck(row)) continue
      if (row.key === 'instagram') {
        const handle = normalizeInstagramHandle(row.value)
        if (!handle) continue
        patch.instagram = handle
      } else if (row.key === 'website') {
        const url = normalizeWebsite(row.source ? stripTrackingParams(row.value) : row.value)
        if (!url) continue
        patch.website = url
      } else if (row.key === 'wikidataId') {
        const id = normalizeWikidataId(row.value)
        if (!id) continue
        patch.wikidataId = id
      } else if (row.key === 'shortBio') {
        patch.shortBio = row.value.slice(0, 140)
      } else {
        patch[row.key] = row.value
      }
    }
    if (Object.keys(patch).length === 0) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/artists/${artist.id}?locale=de`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = (await res.json()) as { doc?: ArtistDoc; message?: string }
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      if (data.doc) onUpdated({ ...artist, ...data.doc, ...patch })
      else onUpdated({ ...artist, ...patch })
      setNotice(t.saved)
      setRows([])
      setPaste('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        marginTop: 12,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '10px 12px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <strong style={{ fontSize: 13 }}>
          {lang === 'de' ? 'Künstler:in' : 'Artist'} · {artist.name}
        </strong>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ fontSize: 13, fontWeight: 600, background: 'none', border: 0, cursor: 'pointer' }}
        >
          {open ? t.collapse : `${t.expand} ▾`}
        </button>
      </div>

      <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, fontSize: 12, lineHeight: 1.5 }}>
        {status.map((row) => (
          <li key={row.key} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ minWidth: 120 }}>{t[row.key]}</span>
            <span style={{ color: row.missing ? 'var(--theme-elevation-600)' : '#1a7f4b' }}>
              ○ {row.missing ? t.missing : t.present}
              {row.key === 'realName' ? ` (${t.optional})` : ''}
            </span>
          </li>
        ))}
      </ul>

      {open ? (
        <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.45 }}>
          <p style={{ margin: '0 0 10px', color: 'var(--theme-elevation-800)' }}>{t.explanation}</p>
          <p style={{ margin: '0 0 8px', color: 'var(--theme-elevation-800)' }}>{t.realNameHelp}</p>
          <pre
            style={{
              margin: '0 0 8px',
              padding: 10,
              borderRadius: 4,
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              whiteSpace: 'pre-wrap',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {prompt}
          </pre>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={() => void copyPrompt()}
          >
            {copied ? t.copied : t.copy}
          </button>

          <label style={{ display: 'block', marginTop: 14, fontSize: 13 }}>
            {t.paste}
            <textarea
              value={paste}
              onChange={(e) => onPasteParse(e.target.value)}
              rows={5}
              style={{ display: 'block', width: '100%', marginTop: 4, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </label>

          {error ? (
            <p role="alert" style={{ color: '#b00020', fontSize: 12 }}>
              {error}
            </p>
          ) : null}
          {notice ? (
            <p style={{ color: '#1a7f4b', fontSize: 12 }}>{notice}</p>
          ) : null}

          {rows.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
              {rows.map((row) => {
                const gated = ARTIST_IDENTITY_GATED.includes(row.key)
                const disabled = !canCheck(row)
                return (
                  <li
                    key={row.key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: 8,
                      padding: '8px 0',
                      borderTop: '1px solid var(--theme-elevation-100)',
                      opacity: row.source ? 1 : 0.55,
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={row.checked && !disabled}
                      disabled={disabled}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setRows((prev) =>
                          prev.map((r) => (r.key === row.key ? { ...r, checked } : r)),
                        )
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{t[row.key]}</div>
                      <div>{row.value}</div>
                      {row.source ? (
                        <a
                          href={row.source}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() =>
                            setRows((prev) =>
                              prev.map((r) => (r.key === row.key ? { ...r, opened: true } : r)),
                            )
                          }
                        >
                          {row.source}
                          {gated && !row.opened ? ' ←' : ''}
                        </a>
                      ) : (
                        <em>{t.noSource}</em>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {rows.some((r) => r.checked && canCheck(r)) ? (
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              style={{ marginTop: 10 }}
              disabled={saving}
              onClick={() => void applyChecked()}
            >
              {t.apply}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default ArtistIdentityPanel
