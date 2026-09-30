'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation.js'
import { Gutter, useConfig, useTranslation } from '@payloadcms/ui'

import { ART_ARTFORM_OPTIONS, ART_FLOORS, ART_PERMISSION_OPTIONS } from '@/lib/art/types'
import {
  ARTIST_IDENTITY_DEFAULT_CHECKED,
  ARTIST_IDENTITY_GATED,
  combinedArtAiPrompt,
  matchSubjectSuggestions,
  normalizeArtformSuggestion,
  parseCombinedAiReply,
  resolvePromptMode,
  routeCombinedMediums,
  type ArtistIdentityFieldKey,
  type SubjectTagOption,
} from '@/lib/art/combinedAiReply'
import {
  normalizeInstagramHandle,
  normalizeWebsite,
  normalizeWikidataId,
  stripTrackingParams,
} from '@/lib/art/artistIdentity'
import {
  canPublishArtwork,
  checkArtworkCompleteness,
  formatMissingList,
} from '@/lib/completeness'
import { artPhotoHelp } from '@/lib/art/photoHelp'
import { isMediaFileTooLarge, MEDIA_MASTER_EDGE, MEDIA_MAX_FILE_SIZE_MB } from '@/lib/media/limits'
import {
  compressImageForUpload,
  MediaImageTooSmallError,
} from '@/lib/media/compressImageForUpload'
import type { ExifGps } from '@/lib/media/exifGps'
import { HelpMore } from './HelpMore'
import { OutdoorLocationPanel, type GeoPoint } from './OutdoorLocationPanel'
import { neuesWerkCopy, neuesWerkLocale } from './neuesWerkCopy'

type ArtistOption = {
  id: number
  name: string
  slug: string
  instagram?: string | null
  website?: string | null
  wikidataId?: string | null
  realName?: string | null
  nationality?: string | null
  basedIn?: string | null
  medium?: string | null
  shortBio?: string | null
}

type SessionCarry = {
  artistId: number | null
  artistName: string
  floor: string
}

type SuggestedKey =
  | 'altDe'
  | 'altEn'
  | 'artform'
  | 'medium'
  | 'surface'
  | 'subjects'

type FormState = {
  mediaId: number | null
  previewUrl: string | null
  altDe: string
  altEn: string
  contextMediaId: number | null
  contextPreviewUrl: string | null
  artistId: number | null
  artistName: string
  floor: string
  spot: string
  geo: GeoPoint | null
  title: string
  year: string
  mediumDe: string
  mediumEn: string
  artform: string
  surfaceDe: string
  surfaceEn: string
  subjectIds: number[]
  permission: 'granted' | 'open' | 'denied'
  permissionNote: string
  creditText: string
  dimensions: string
  descriptionDe: string
  exhibitionId: number | null
}

type IdentityProposal = {
  key: ArtistIdentityFieldKey
  value: string
  source: string | null
  checked: boolean
  opened: boolean
}

type NameSuggestion = {
  value: string
  source: string
  opened: boolean
}

type NewSubjectProposal = {
  label: string
  checked: boolean
}

const emptyForm = (carry?: SessionCarry): FormState => ({
  mediaId: null,
  previewUrl: null,
  altDe: '',
  altEn: '',
  contextMediaId: null,
  contextPreviewUrl: null,
  artistId: carry?.artistId ?? null,
  artistName: carry?.artistName ?? '',
  floor: carry?.floor ?? '',
  spot: '',
  geo: null,
  title: '',
  year: '',
  mediumDe: '',
  mediumEn: '',
  artform: '',
  surfaceDe: '',
  surfaceEn: '',
  subjectIds: [],
  permission: 'open',
  permissionNote: '',
  creditText: '',
  dimensions: '',
  descriptionDe: '',
  exhibitionId: null,
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

type ApiErrorBody = {
  message?: string
  errors?: Array<{
    message?: string
    data?: {
      errors?: Array<{ message?: string; path?: string; field?: string; label?: string }>
    }
  }>
}

function formatApiError(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') return `Request failed (${status})`
  const body = data as ApiErrorBody
  const parts: string[] = []
  if (Array.isArray(body.errors)) {
    for (const err of body.errors) {
      const nested = err.data?.errors
      if (Array.isArray(nested) && nested.length > 0) {
        for (const fieldErr of nested) {
          const label = fieldErr.label || fieldErr.path || fieldErr.field
          const msg = fieldErr.message || 'invalid'
          parts.push(label ? `${label}: ${msg}` : msg)
        }
      } else if (err.message) {
        parts.push(err.message)
      }
    }
  }
  if (parts.length === 0 && body.message) parts.push(body.message)
  return parts.length ? parts.join(' · ') : `Request failed (${status})`
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  })
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody
  if (!res.ok) throw new Error(formatApiError(data, res.status))
  return data
}

function Mark({ show, mark }: { show: boolean; mark: string }) {
  if (!show) return null
  return (
    <span aria-hidden="true" style={{ marginLeft: 4, color: 'var(--theme-elevation-600)' }}>
      {mark}
    </span>
  )
}

function Section({
  id,
  title,
  disabled,
  children,
}: {
  id: string
  title: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      style={{
        marginTop: 28,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <h2 id={id} style={{ fontSize: 18, margin: '0 0 12px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

async function createSubjectTag(label: string): Promise<number> {
  let slug = slugify(label) || `tag-${Date.now()}`
  const found = await apiJson<{ docs: Array<{ id: number; type?: string }> }>(
    `/api/tags?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`,
  )
  const existing = found.docs[0]
  if (existing?.type === 'subject') return existing.id
  if (existing) slug = `${slug}-motif`

  const created = await apiJson<{ doc: { id: number } }>('/api/tags', {
    method: 'POST',
    body: JSON.stringify({ name: label, slug, type: 'subject' }),
  })
  return created.doc.id
}

export function NeuesWerkClient() {
  const router = useRouter()
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const { i18n } = useTranslation()
  const lang = neuesWerkLocale(i18n?.language)
  const t = neuesWerkCopy[lang]
  const help = artPhotoHelp[lang]
  const topRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormState>(() => emptyForm())
  const [carry, setCarry] = useState<SessionCarry>({
    artistId: null,
    artistName: '',
    floor: '',
  })
  const [sessionCount, setSessionCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState<'main' | 'context' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artistQuery, setArtistQuery] = useState(() => '')
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([])
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null)
  const [exhibitions, setExhibitions] = useState<Array<{ id: number; title: string }>>([])
  const [subjectTags, setSubjectTags] = useState<SubjectTagOption[]>([])
  const [suggested, setSuggested] = useState<Set<SuggestedKey>>(new Set())
  const [pendingExif, setPendingExif] = useState<ExifGps | null>(null)
  const [aiPaste, setAiPaste] = useState('')
  const [aiCopied, setAiCopied] = useState(false)
  const [identityRows, setIdentityRows] = useState<IdentityProposal[]>([])
  const [signatureNote, setSignatureNote] = useState<string | null>(null)
  const [nameSuggestion, setNameSuggestion] = useState<NameSuggestion | null>(null)
  const [newSubjects, setNewSubjects] = useState<NewSubjectProposal[]>([])

  const hasPhoto = Boolean(form.mediaId)
  const gated = !hasPhoto
  const knownArtistName = (form.artistName || artistQuery).trim()
  const promptMode = resolvePromptMode(knownArtistName)

  const patch = useCallback((partial: Partial<FormState>, touch?: SuggestedKey[]) => {
    setForm((prev) => ({ ...prev, ...partial }))
    setError(null)
    if (touch?.length) {
      setSuggested((prev) => {
        const next = new Set(prev)
        for (const k of touch) next.delete(k)
        return next
      })
    }
  }, [])

  const markSuggested = useCallback((keys: SuggestedKey[]) => {
    setSuggested((prev) => {
      const next = new Set(prev)
      for (const k of keys) next.add(k)
      return next
    })
  }, [])

  const completenessInput = useMemo(
    () => ({
      artist: form.artistId,
      locationInBuilding: { floor: form.floor || null, spot: form.spot || null },
      images: form.mediaId ? [{ image: form.mediaId, alt: form.altDe }] : [],
      photoAlt: { de: form.altDe, en: form.altEn },
      permission: form.permission,
    }),
    [form],
  )

  const completeness = useMemo(
    () => checkArtworkCompleteness(completenessInput),
    [completenessInput],
  )

  const prompt = useMemo(
    () => combinedArtAiPrompt({ artistName: knownArtistName, subjectTags }),
    [knownArtistName, subjectTags],
  )

  useEffect(() => {
    void apiJson<{ docs: Array<{ id: number; title: string }> }>(
      '/api/exhibitions?limit=50&depth=0&sort=-startDate',
    ).then((data) => setExhibitions(data.docs))

    void apiJson<{
      docs: Array<{ id: number; slug: string; name?: string | null }>
    }>(
      `/api/tags?limit=200&depth=0&locale=de&where[type][equals]=subject&sort=slug`,
    ).then((data) => {
      setSubjectTags(
        (data.docs ?? []).map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name?.trim() || d.slug,
        })),
      )
    })
  }, [])

  useEffect(() => {
    if (carry.artistName && !artistQuery && form.artistName === carry.artistName) {
      setArtistQuery(carry.artistName)
    }
  }, [carry.artistName, artistQuery, form.artistName])

  const searchArtists = useCallback(async (q: string) => {
    setArtistQuery(q)
    if (!q.trim()) {
      setArtistOptions([])
      return
    }
    const params = new URLSearchParams({
      limit: '8',
      depth: '0',
      'where[or][0][name][contains]': q,
      'where[or][1][alias][contains]': q,
    })
    const data = await apiJson<{ docs: ArtistOption[] }>(`/api/artists?${params}`)
    setArtistOptions(data.docs)
  }, [])

  const uploadPhoto = useCallback(
    async (file: File, kind: 'main' | 'context') => {
      if (!file.type.startsWith('image/')) {
        setError(t.uploadFailed)
        return
      }
      setUploading(true)
      setError(null)
      try {
        const { file: prepared, gps } = await compressImageForUpload(file, {
          requireMasterEdge: kind === 'main',
        })
        if (isMediaFileTooLarge(prepared.size)) {
          setError(t.fileTooLarge(MEDIA_MAX_FILE_SIZE_MB))
          return
        }
        const altForCreate = form.altDe.trim() || t.altPlaceholder
        const body = new FormData()
        body.append('file', prepared)
        body.append('_payload', JSON.stringify({ alt: altForCreate }))
        const created = await apiJson<{
          doc: { id: number; url?: string; sizes?: { card?: { url?: string } } }
        }>('/api/media?locale=de', { method: 'POST', body })

        const preview =
          created.doc.sizes?.card?.url || created.doc.url || URL.createObjectURL(prepared)

        if (kind === 'main') {
          patch({ mediaId: created.doc.id, previewUrl: preview })
          if (gps && (form.floor === 'outside' || !form.floor)) {
            setPendingExif(gps)
          } else {
            setPendingExif(null)
          }
        } else {
          patch({ contextMediaId: created.doc.id, contextPreviewUrl: preview })
        }
      } catch (err) {
        if (err instanceof MediaImageTooSmallError) {
          setError(t.imageTooSmall(err.longEdge, MEDIA_MASTER_EDGE))
        } else {
          setError(err instanceof Error ? err.message : t.uploadFailed)
        }
      } finally {
        setUploading(false)
        setDragOver(null)
      }
    },
    [form.altDe, form.floor, patch, t],
  )

  const createArtistInline = useCallback(
    async (name: string) => {
      const created = await apiJson<{ doc: ArtistOption }>('/api/artists', {
        method: 'POST',
        body: JSON.stringify({ name, slug: slugify(name) || `artist-${Date.now()}` }),
      })
      patch({ artistId: created.doc.id, artistName: created.doc.name })
      setSelectedArtist(created.doc)
      setArtistQuery(created.doc.name)
      setArtistOptions([])
      setNameSuggestion(null)
      return created.doc
    },
    [patch],
  )

  const applyAiPaste = useCallback(() => {
    const parsed = parseCombinedAiReply(aiPaste)
    if (!parsed.ok) {
      setError(t.aiMalformed)
      return
    }
    setError(null)
    const { gesehen, recherchiert } = parsed.data
    const touched: SuggestedKey[] = []
    const next: Partial<FormState> = {}

    if (gesehen?.altDe?.trim()) {
      next.altDe = gesehen.altDe.trim().slice(0, 120)
      touched.push('altDe')
    }
    if (gesehen?.altEn?.trim()) {
      next.altEn = gesehen.altEn.trim().slice(0, 120)
      touched.push('altEn')
    }
    const artform = normalizeArtformSuggestion(gesehen?.artform)
    if (artform) {
      next.artform = artform
      touched.push('artform')
    }
    const routed = routeCombinedMediums(parsed.data)
    if (routed.artwork) {
      next.mediumDe = routed.artwork.de
      next.mediumEn = routed.artwork.en
      touched.push('medium')
    }
    if (gesehen?.surface?.de?.trim() || gesehen?.surface?.en?.trim()) {
      next.surfaceDe = gesehen.surface?.de?.trim() || ''
      next.surfaceEn = gesehen.surface?.en?.trim() || ''
      touched.push('surface')
    }

    const matched = matchSubjectSuggestions(gesehen?.subjects ?? [], subjectTags)
    const existingIds = matched
      .filter((m): m is { kind: 'existing'; tag: SubjectTagOption } => m.kind === 'existing')
      .map((m) => m.tag.id)
    const news = matched
      .filter((m): m is { kind: 'new'; label: string } => m.kind === 'new')
      .map((m) => ({ label: m.label, checked: false }))
    if (existingIds.length || news.length) {
      next.subjectIds = existingIds
      setNewSubjects(news)
      touched.push('subjects')
    }

    if (gesehen?.signatur?.trim()) {
      setSignatureNote(gesehen.signatur.trim())
    } else {
      setSignatureNote(null)
    }

    if (Object.keys(next).length) {
      setForm((prev) => ({ ...prev, ...next }))
      markSuggested(touched)
    }

    // Name offer — only when artist empty; never from signatur.
    const artistEmpty = !form.artistId && !form.artistName.trim() && !artistQuery.trim()
    const researchedName = recherchiert?.name?.value?.trim()
    const researchedSource = recherchiert?.name?.source?.trim()
    if (artistEmpty && researchedName && researchedSource) {
      setNameSuggestion({ value: researchedName, source: researchedSource, opened: false })
    } else {
      setNameSuggestion(null)
    }

    const rows: IdentityProposal[] = []
    const push = (
      key: ArtistIdentityFieldKey,
      value: string | null | undefined,
      source: string | null | undefined,
    ) => {
      if (!value?.trim()) return
      const src = source?.trim() || null
      const gatedField = (ARTIST_IDENTITY_GATED as string[]).includes(key)
      rows.push({
        key,
        value: value.trim(),
        source: src,
        checked:
          Boolean(src) &&
          !gatedField &&
          (ARTIST_IDENTITY_DEFAULT_CHECKED as string[]).includes(key),
        opened: false,
      })
    }

    if (recherchiert) {
      push('instagram', recherchiert.instagram?.value, recherchiert.instagram?.source)
      push('website', recherchiert.website?.value, recherchiert.website?.source)
      push('wikidataId', recherchiert.wikidataId?.value, recherchiert.wikidataId?.source)
      push('realName', recherchiert.realName?.value, recherchiert.realName?.source)
      push('nationality', recherchiert.nationality?.value, recherchiert.nationality?.source)
      push('basedIn', recherchiert.basedIn?.value, recherchiert.basedIn?.source)
      if (routed.artist) {
        push('medium', routed.artist.value, routed.artist.source)
      }
      const bio = recherchiert.shortBio?.de?.trim() || recherchiert.shortBio?.en?.trim()
      if (bio) push('shortBio', bio, recherchiert.shortBio?.source)
    }
    setIdentityRows(rows)
  }, [aiPaste, artistQuery, form.artistId, form.artistName, markSuggested, subjectTags, t.aiMalformed])

  const applyIdentityRows = useCallback(async () => {
    if (!form.artistId) {
      setError(
        lang === 'de'
          ? 'Zuerst eine Künstler:in wählen oder anlegen.'
          : 'Pick or create an artist first.',
      )
      return
    }
    const patchBody: Record<string, string> = {}
    for (const row of identityRows) {
      if (!row.checked || !row.source) continue
      if ((ARTIST_IDENTITY_GATED as string[]).includes(row.key) && !row.opened) continue
      if (row.key === 'instagram') {
        const handle = normalizeInstagramHandle(row.value)
        if (handle) patchBody.instagram = handle
      } else if (row.key === 'website') {
        const url = normalizeWebsite(row.value)
        if (url) patchBody.website = stripTrackingParams(url)
      } else if (row.key === 'wikidataId') {
        const id = normalizeWikidataId(row.value)
        if (id) patchBody.wikidataId = id
      } else if (row.key === 'shortBio') {
        patchBody.shortBio = row.value.slice(0, 140)
      } else {
        patchBody[row.key] = row.value
      }
    }
    if (Object.keys(patchBody).length === 0) return
    const data = await apiJson<{ doc: ArtistOption }>(`/api/artists/${form.artistId}?locale=de`, {
      method: 'PATCH',
      body: JSON.stringify(patchBody),
    })
    setSelectedArtist((prev) =>
      prev ? { ...prev, ...data.doc, ...patchBody, slug: prev.slug } : data.doc,
    )
    setIdentityRows([])
  }, [form.artistId, identityRows, lang])

  const acceptNameSuggestion = useCallback(async () => {
    if (!nameSuggestion?.opened) return
    await createArtistInline(nameSuggestion.value)
  }, [createArtistInline, nameSuggestion])

  const buildArtworkPayload = useCallback(
    async (visibility: 'live' | 'hidden') => {
      const yearNum = form.year.trim() ? Number(form.year) : null
      const subjectIds = [...form.subjectIds]
      for (const neu of newSubjects) {
        if (!neu.checked) continue
        subjectIds.push(await createSubjectTag(neu.label))
      }

      return {
        title: form.title.trim(),
        slug: slugify(form.title.trim() || form.artistName || `werk-${Date.now()}`),
        artworkType: 'mural',
        visibility,
        artist: form.artistId,
        medium: form.mediumDe.trim() || null,
        artform: form.artform || null,
        surface: form.surfaceDe.trim() || null,
        subjects: subjectIds,
        permission: form.permission,
        permissionNote: form.permissionNote.trim() || null,
        creditText: form.creditText.trim() || null,
        dimensions: form.dimensions.trim() || null,
        year: Number.isFinite(yearNum) ? yearNum : null,
        description: form.descriptionDe.trim()
          ? {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [{ type: 'text', text: form.descriptionDe.trim(), version: 1 }],
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            }
          : null,
        locationInBuilding: {
          floor: form.floor,
          spot: form.spot.trim(),
        },
        geo:
          form.floor === 'outside' && form.geo
            ? { latitude: form.geo.latitude, longitude: form.geo.longitude }
            : null,
        images: form.mediaId ? [{ image: form.mediaId, alt: form.altDe.trim() }] : [],
        contextImage: form.contextMediaId,
        status: 'not-for-sale',
      }
    },
    [form, newSubjects],
  )

  const saveArtwork = useCallback(
    async (mode: 'next' | 'publish') => {
      if (mode === 'publish' && !canPublishArtwork(completenessInput)) {
        setError(`${t.incomplete} ${formatMissingList(completeness.blocking, lang)}`)
        return
      }
      if (!form.mediaId || !form.altDe.trim()) {
        setError(!form.mediaId ? t.needPhoto : t.needAltDe)
        return
      }

      setSaving(true)
      setError(null)
      try {
        await apiJson(`/api/media/${form.mediaId}?locale=de`, {
          method: 'PATCH',
          body: JSON.stringify({ alt: form.altDe.trim() }),
        })
        if (form.altEn.trim()) {
          await apiJson(`/api/media/${form.mediaId}?locale=en`, {
            method: 'PATCH',
            body: JSON.stringify({ alt: form.altEn.trim() }),
          })
        }

        const visibility = mode === 'publish' ? 'live' : 'hidden'
        const payload = await buildArtworkPayload(visibility)
        const created = await apiJson<{ doc: { id: number } }>('/api/artworks?locale=de', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        // EN locale for medium / surface
        if (form.mediumEn.trim() || form.surfaceEn.trim()) {
          await apiJson(`/api/artworks/${created.doc.id}?locale=en`, {
            method: 'PATCH',
            body: JSON.stringify({
              medium: form.mediumEn.trim() || null,
              surface: form.surfaceEn.trim() || null,
            }),
          })
        }

        if (form.exhibitionId) {
          const show = await apiJson<{ id: number; artworks?: Array<number | { id: number }> }>(
            `/api/exhibitions/${form.exhibitionId}?depth=0`,
          )
          const existing = (show.artworks ?? []).map((w) => (typeof w === 'number' ? w : w.id))
          await apiJson(`/api/exhibitions/${form.exhibitionId}`, {
            method: 'PATCH',
            body: JSON.stringify({ artworks: [...existing, created.doc.id] }),
          })
        }

        // Refresh vocabulary with any accepted neu: tags
        if (newSubjects.some((n) => n.checked)) {
          const data = await apiJson<{
            docs: Array<{ id: number; slug: string; name?: string | null }>
          }>(
            `/api/tags?limit=200&depth=0&locale=de&where[type][equals]=subject&sort=slug`,
          )
          setSubjectTags(
            (data.docs ?? []).map((d) => ({
              id: d.id,
              slug: d.slug,
              name: d.name?.trim() || d.slug,
            })),
          )
        }

        setSessionCount((n) => n + 1)
        const nextCarry: SessionCarry = {
          artistId: form.artistId,
          artistName: form.artistName,
          floor: form.floor,
        }
        setCarry(nextCarry)

        if (mode === 'next') {
          setForm(emptyForm(nextCarry))
          setArtistQuery(nextCarry.artistName)
          setSelectedArtist(null)
          setSuggested(new Set())
          setPendingExif(null)
          setAiPaste('')
          setIdentityRows([])
          setSignatureNote(null)
          setNameSuggestion(null)
          setNewSubjects([])
          topRef.current?.scrollIntoView({ behavior: 'smooth' })
        } else {
          router.push(`${adminRoute}/collections/artworks/${created.doc.id}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed)
      } finally {
        setSaving(false)
      }
    },
    [
      adminRoute,
      buildArtworkPayload,
      completeness.blocking,
      completenessInput,
      form,
      lang,
      newSubjects,
      router,
      t,
    ],
  )

  const artistField = (
    <div style={{ marginTop: 16 }}>
      {carry.artistName && form.artistName === carry.artistName ? (
        <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)', margin: '0 0 6px' }}>
          {t.carried}
        </p>
      ) : null}
      <label style={{ display: 'block', fontSize: 13 }}>
        {t.artist}
        <input
          value={artistQuery || form.artistName}
          onChange={(e) => {
            patch({ artistId: null, artistName: e.target.value })
            setSelectedArtist(null)
            setNameSuggestion(null)
            void searchArtists(e.target.value)
          }}
          placeholder={t.artistPlaceholder}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
      {nameSuggestion && !form.artistId ? (
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            fontSize: 13,
            background: 'var(--theme-elevation-50)',
          }}
        >
          <p style={{ margin: '0 0 6px' }}>{t.nameSuggestion(nameSuggestion.value)}</p>
          <a
            href={nameSuggestion.source}
            target="_blank"
            rel="noreferrer"
            onClick={() => setNameSuggestion((s) => (s ? { ...s, opened: true } : s))}
          >
            {t.nameSuggestionOpenSource}
          </a>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              disabled={!nameSuggestion.opened}
              onClick={() => void acceptNameSuggestion()}
            >
              {t.nameSuggestionAccept}
            </button>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              onClick={() => setNameSuggestion(null)}
            >
              {t.nameSuggestionDismiss}
            </button>
          </div>
        </div>
      ) : null}
      {artistOptions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0' }}>
          {artistOptions.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => {
                  patch({ artistId: opt.id, artistName: opt.name })
                  setSelectedArtist(opt)
                  setArtistQuery(opt.name)
                  setArtistOptions([])
                  setNameSuggestion(null)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: '1px solid var(--theme-elevation-150)',
                  background: 'var(--theme-elevation-0)',
                  cursor: 'pointer',
                }}
              >
                {opt.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {artistQuery.trim() && !form.artistId ? (
        <button
          type="button"
          onClick={() => void createArtistInline(artistQuery.trim())}
          style={{ marginTop: 8, fontSize: 13 }}
        >
          {t.createArtist(artistQuery.trim())}
        </button>
      ) : null}
      {selectedArtist ? (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--theme-elevation-800)' }}>
          {selectedArtist.name}
          {selectedArtist.instagram ? ` · @${selectedArtist.instagram}` : ''}
          {selectedArtist.wikidataId ? ` · ${selectedArtist.wikidataId}` : ''}
        </p>
      ) : null}
    </div>
  )

  const dropZone = (kind: 'main' | 'context') => {
    const isMain = kind === 'main'
    const preview = isMain ? form.previewUrl : form.contextPreviewUrl
    const over = dragOver === kind
    return (
      <label
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!uploading) setDragOver(kind)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(null)
        }}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(null)
          const file = e.dataTransfer.files?.[0]
          if (file) void uploadPhoto(file, kind)
        }}
        style={{
          display: 'block',
          border: `2px dashed ${over ? '#1a7f4b' : 'var(--theme-elevation-200)'}`,
          borderRadius: 6,
          minHeight: preview ? undefined : 140,
          padding: 12,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: over
            ? 'color-mix(in srgb, #1a7f4b 10%, var(--theme-elevation-50))'
            : 'var(--theme-elevation-50)',
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={isMain ? t.previewAlt : t.contextPreviewAlt}
            style={{
              width: '100%',
              maxHeight: isMain ? 360 : 240,
              objectFit: 'cover',
              borderRadius: 4,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <span style={{ display: 'block', padding: '36px 8px', fontSize: 14 }}>
            {uploading ? t.dropUploading : isMain ? t.dropIdle : t.contextDrop}
          </span>
        )}
        {preview ? (
          <span style={{ display: 'block', marginTop: 8, fontSize: 12 }}>{t.contextReplace}</span>
        ) : null}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={uploading}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void uploadPhoto(file, kind)
            e.target.value = ''
          }}
        />
      </label>
    )
  }

  const stickyMissing =
    completeness.blocking.length > 0
      ? `${t.missingPrefix} ${formatMissingList(completeness.blocking, lang)}`
      : t.canPublish

  return (
    <Gutter>
      <div
        ref={topRef}
        className="neues-werk"
        style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 96 }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            margin: '24px 0 8px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {t.kicker}
            </p>
            <h1 style={{ margin: '4px 0 0', fontSize: 28 }}>{t.title}</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-800)' }}>
            {sessionCount} {sessionCount === 1 ? t.sessionOne : t.sessionMany}
          </p>
        </header>

        {error ? (
          <p role="alert" style={{ color: '#b42318', fontSize: 14 }}>
            {error}
          </p>
        ) : null}

        <Section id="nw-photo" title={t.photoHeading}>
          {dropZone('main')}
          <div style={{ marginTop: 8 }}>
            <HelpMore
              id="nw-photo"
              lead={help.photo.lead}
              more={help.photo.more}
              moreLabel={help.moreLabel}
              lessLabel={help.lessLabel}
            />
          </div>
          {artistField}
          <p style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 600 }}>{t.contextPhoto}</p>
          {dropZone('context')}
        </Section>

        {!hasPhoto ? (
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--theme-elevation-800)' }}>
            {t.photoFirst}
          </p>
        ) : null}

        <Section id="nw-ai" title={t.aiHeading} disabled={gated}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--theme-elevation-800)' }}>
            {t.aiExplanation}
          </p>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: 'var(--theme-elevation-800)',
            }}
          >
            {promptMode === 'with-research'
              ? t.promptBadgeResearch(knownArtistName)
              : t.promptBadgePhotoOnly}
          </p>
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
              maxHeight: 180,
              overflow: 'auto',
            }}
          >
            {prompt}
          </pre>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={() => {
              void navigator.clipboard.writeText(prompt).then(() => {
                setAiCopied(true)
                setTimeout(() => setAiCopied(false), 1500)
              })
            }}
          >
            {aiCopied ? t.aiCopied : t.aiCopy}
          </button>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.aiPaste}
            <textarea
              value={aiPaste}
              onChange={(e) => setAiPaste(e.target.value)}
              rows={5}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <button
            type="button"
            className="btn btn--style-primary btn--size-small"
            style={{ marginTop: 8 }}
            onClick={applyAiPaste}
          >
            {t.aiApply}
          </button>
          {signatureNote ? (
            <p style={{ marginTop: 10, fontSize: 13, fontStyle: 'italic' }}>
              {t.signatureNote(signatureNote)}
            </p>
          ) : null}
          {identityRows.length > 0 ? (
            <div style={{ marginTop: 14, fontSize: 13 }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {identityRows.map((row) => {
                  const gatedRow = (ARTIST_IDENTITY_GATED as string[]).includes(row.key)
                  const canCheck = Boolean(row.source) && (!gatedRow || row.opened)
                  return (
                    <li
                      key={row.key}
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                        marginBottom: 8,
                        opacity: row.source ? 1 : 0.5,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={row.checked && canCheck}
                        disabled={!canCheck}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setIdentityRows((prev) =>
                            prev.map((r) => (r.key === row.key ? { ...r, checked } : r)),
                          )
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>{row.key}</strong>: {row.value}
                        {row.source ? (
                          <div>
                            <a
                              href={row.source}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                setIdentityRows((prev) =>
                                  prev.map((r) =>
                                    r.key === row.key ? { ...r, opened: true } : r,
                                  ),
                                )
                              }}
                            >
                              {row.source}
                            </a>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--theme-elevation-600)' }}>{t.noSource}</div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                className="btn btn--style-secondary btn--size-small"
                onClick={() => void applyIdentityRows()}
              >
                {t.identityAccept}
              </button>
            </div>
          ) : null}
        </Section>

        <Section id="nw-work" title={t.workHeading} disabled={gated}>
          <label style={{ display: 'block', fontSize: 13 }}>
            {t.altDe}
            <Mark show={suggested.has('altDe')} mark={t.suggestedMark} />
            <input
              value={form.altDe}
              maxLength={120}
              onChange={(e) => patch({ altDe: e.target.value }, ['altDe'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
            <HelpMore
              id="nw-alt"
              lead={help.alt.lead}
              more={help.alt.more}
              moreLabel={help.moreLabel}
              lessLabel={help.lessLabel}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.altEn}
            <Mark show={suggested.has('altEn')} mark={t.suggestedMark} />
            <input
              value={form.altEn}
              maxLength={120}
              onChange={(e) => patch({ altEn: e.target.value }, ['altEn'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.workTitle}
            <input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.year}
            <input
              value={form.year}
              inputMode="numeric"
              onChange={(e) => patch({ year: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.mediumDe}
            <Mark show={suggested.has('medium')} mark={t.suggestedMark} />
            <input
              value={form.mediumDe}
              onChange={(e) => patch({ mediumDe: e.target.value }, ['medium'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.mediumEn}
            <input
              value={form.mediumEn}
              onChange={(e) => patch({ mediumEn: e.target.value }, ['medium'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
            <span style={{ color: 'var(--theme-elevation-800)' }}>{t.mediumHelp}</span>
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.surfaceDe}
            <Mark show={suggested.has('surface')} mark={t.suggestedMark} />
            <input
              value={form.surfaceDe}
              onChange={(e) => patch({ surfaceDe: e.target.value }, ['surface'])}
              placeholder={t.surfacePlaceholder}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.surfaceEn}
            <input
              value={form.surfaceEn}
              onChange={(e) => patch({ surfaceEn: e.target.value }, ['surface'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.artform}
            <Mark show={suggested.has('artform')} mark={t.suggestedMark} />
            <select
              value={form.artform}
              onChange={(e) => patch({ artform: e.target.value }, ['artform'])}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              <option value="">—</option>
              {ART_ARTFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label[lang]} ({opt.value})
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.size}
            <input
              value={form.dimensions}
              onChange={(e) => patch({ dimensions: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <fieldset style={{ marginTop: 12, border: 0, padding: 0, fontSize: 13 }}>
            <legend style={{ fontSize: 13 }}>
              {t.subjects}
              <Mark show={suggested.has('subjects')} mark={t.suggestedMark} />
            </legend>
            <p style={{ margin: '4px 0 8px', color: 'var(--theme-elevation-800)' }}>
              {t.subjectsHelp}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subjectTags.map((tag) => {
                const on = form.subjectIds.includes(tag.id)
                return (
                  <label
                    key={tag.id}
                    style={{
                      display: 'inline-flex',
                      gap: 4,
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: `1px solid ${on ? '#1a7f4b' : 'var(--theme-elevation-150)'}`,
                      background: on
                        ? 'color-mix(in srgb, #1a7f4b 12%, transparent)'
                        : 'var(--theme-elevation-0)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        patch(
                          {
                            subjectIds: on
                              ? form.subjectIds.filter((id) => id !== tag.id)
                              : [...form.subjectIds, tag.id],
                          },
                          ['subjects'],
                        )
                      }}
                    />
                    {tag.name}
                  </label>
                )
              })}
            </div>
            {newSubjects.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
                {newSubjects.map((neu, idx) => (
                  <li key={`${neu.label}-${idx}`} style={{ marginBottom: 6 }}>
                    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={neu.checked}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setNewSubjects((prev) =>
                            prev.map((n, i) => (i === idx ? { ...n, checked } : n)),
                          )
                        }}
                      />
                      <span>
                        neu:{neu.label}{' '}
                        <em style={{ color: 'var(--theme-elevation-800)' }}>
                          ({t.subjectsNewNote})
                        </em>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </fieldset>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.story}
            <textarea
              value={form.descriptionDe}
              onChange={(e) => patch({ descriptionDe: e.target.value })}
              rows={4}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
            <span style={{ color: 'var(--theme-elevation-800)' }}>{t.storyHelp}</span>
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.exhibition}
            <select
              value={form.exhibitionId ?? ''}
              onChange={(e) =>
                patch({ exhibitionId: e.target.value ? Number(e.target.value) : null })
              }
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              <option value="">—</option>
              {exhibitions.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </label>
        </Section>

        <Section id="nw-where" title={t.whereHeading} disabled={gated}>
          {carry.floor && form.floor === carry.floor ? (
            <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)' }}>{t.carried}</p>
          ) : null}
          <label style={{ display: 'block', fontSize: 13 }}>
            {t.floor}
            <select
              value={form.floor}
              onChange={(e) => {
                const floor = e.target.value
                patch({
                  floor,
                  geo: floor === 'outside' ? form.geo : null,
                })
                if (floor && floor !== 'outside') setPendingExif(null)
              }}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              <option value="">—</option>
              {ART_FLOORS.map((f) => (
                <option key={f} value={f}>
                  {t.floorLabel(f)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.spot}
            <input
              value={form.spot}
              onChange={(e) => patch({ spot: e.target.value })}
              maxLength={40}
              placeholder={
                form.floor === 'outside' ? 'Fassade zur Straße' : t.spotPlaceholder
              }
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
            <span style={{ color: 'var(--theme-elevation-800)' }}>
              {form.floor === 'outside' ? t.spotHelpOutside : t.spotHelp}
            </span>
          </label>
          <OutdoorLocationPanel
            floor={form.floor}
            value={form.geo}
            pendingExif={pendingExif}
            onChange={(geo) => patch({ geo })}
            onDismissExif={() => setPendingExif(null)}
            disabled={gated}
            copy={{
              exifOffer: t.exifOffer,
              exifAccept: t.exifAccept,
              exifDismiss: t.exifDismiss,
              captureNow: t.captureNow,
              captureTooInaccurate: t.captureTooInaccurate,
              captureDenied: t.captureDenied,
              mapHint: t.mapHint,
              clear: t.clearGeo,
            }}
          />
        </Section>

        <Section id="nw-rights" title={t.rightsHeading} disabled={gated}>
          <label style={{ display: 'block', fontSize: 13 }}>
            {t.permission}
            <select
              value={form.permission}
              onChange={(e) =>
                patch({ permission: e.target.value as FormState['permission'] })
              }
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              {ART_PERMISSION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label[lang]}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.permissionNote}
            <textarea
              value={form.permissionNote}
              onChange={(e) => patch({ permissionNote: e.target.value })}
              rows={2}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            {t.creditText}
            <input
              value={form.creditText}
              onChange={(e) => patch({ creditText: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
        </Section>
      </div>

      <div
        role="region"
        aria-label={t.missingPrefix}
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 20,
          borderTop: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-bg)',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            flex: '1 1 200px',
            color: completeness.complete ? '#1a7f4b' : 'var(--theme-text)',
          }}
        >
          {stickyMissing}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--style-secondary"
            disabled={saving || gated}
            onClick={() => void saveArtwork('next')}
          >
            {t.saveNext}
          </button>
          <button
            type="button"
            className="btn btn--style-primary"
            disabled={saving || gated || !canPublishArtwork(completenessInput)}
            onClick={() => void saveArtwork('publish')}
          >
            {t.savePublish}
          </button>
        </div>
      </div>
    </Gutter>
  )
}

export default NeuesWerkClient
