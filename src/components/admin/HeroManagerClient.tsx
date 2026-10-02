'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import { Gutter, useAuth, useTranslation } from '@payloadcms/ui'

import {
  canEnableHeroSlide,
  checkHeroSlideCompleteness,
  formatMissingList,
  type CompletenessIssue,
  type HeroSlideCompletenessInput,
} from '@/lib/completeness'
import {
  heroAiPrompt,
  heroTranslatePrompt,
  heroTranslateTarget,
  keywordsToField,
  matchVenueByName,
  parseHeroAiReply,
  parseHeroTranslateReply,
} from '@/lib/hero/combinedAiReply'
import { heroCopy, heroPhotoHelp, heroUiLocale, type HeroManagerCopy } from '@/lib/hero/copy'
import { EAT_AND_DRINK_VENUE_SLUGS, isEatAndDrinkVenueSlug } from '@/lib/hero/eatAndDrinkVenues'
import type { HeroSlideContext } from '@/lib/hero/slideContext'
import {
  compressImageForUpload,
} from '@/lib/media/compressImageForUpload'
import { isMediaFileTooLarge, MEDIA_MASTER_EDGE, MEDIA_MAX_FILE_SIZE_MB } from '@/lib/media/limits'
import { focalToPercent, percentToFocal } from '@/lib/media/focal'
import { HelpMore } from './HelpMore'
import { HeroStrip, type HeroStripItem } from './HeroStrip'
import { GuidedBackToDashboard } from './guided/GuidedBackToDashboard'
import { GuidedSection } from './guided/GuidedSection'
import { StickyMissingBar } from './guided/StickyMissingBar'

type Context = HeroSlideContext

type VenueOption = { id: number; name: string; slug?: string | null; location?: string | null }

type FormState = {
  id: number | null
  mediaId: number | null
  previewUrl: string | null
  adminTitle: string
  altDe: string
  altEn: string
  descriptionDe: string
  descriptionEn: string
  keywordsDe: string
  keywordsEn: string
  venueId: number | null
  captionOverrideDe: string
  captionOverrideEn: string
  credit: string
  aiNotesDe: string
  aiNotesEn: string
  enabled: boolean
  focalX: number
  focalY: number
}

const emptyForm = (): FormState => ({
  id: null,
  mediaId: null,
  previewUrl: null,
  adminTitle: '',
  altDe: '',
  altEn: '',
  descriptionDe: '',
  descriptionEn: '',
  keywordsDe: '',
  keywordsEn: '',
  venueId: null,
  captionOverrideDe: '',
  captionOverrideEn: '',
    credit: '',
    aiNotesDe: '',
    aiNotesEn: '',
    enabled: false,
  focalX: 50,
  focalY: 50,
})

type SlideDoc = {
  id: number
  adminTitle?: string | null
  order: number
  enabled?: boolean | null
  credit?: string | null
  aiNotes?: string | null
  altText?: string | null
  description?: string | null
  keywords?: string | null
  captionOverride?: string | null
  venue?: number | VenueOption | null
  image?:
    | number
    | {
        id: number
        url?: string | null
        focalX?: number | null
        focalY?: number | null
        sizes?: { hero?: { url?: string | null }; card?: { url?: string | null }; thumb?: { url?: string | null } }
      }
    | null
}

async function apiJson<T>(
  url: string,
  init?: RequestInit,
  token?: string | null,
): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  // DELETE / empty bodies
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

/** Turn Payload / network junk into a short human message. */
function friendlyError(err: unknown, fallback: string, sessionMsg?: string): string {
  const raw = err instanceof Error ? err.message : String(err || '')
  if (!raw) return fallback
  if (
    sessionMsg &&
    (/not allowed to perform this action/i.test(raw) ||
      /keine Berechtigung/i.test(raw) ||
      /"status"\s*:\s*403/.test(raw) ||
      /\b403\b/.test(raw) ||
      /\b401\b/.test(raw) ||
      /Unauthorized/i.test(raw))
  ) {
    return sessionMsg
  }
  try {
    const parsed = JSON.parse(raw) as {
      errors?: Array<{ message?: string; data?: { errors?: Array<{ message?: string; path?: string }> } }>
      message?: string
    }
    const top = parsed.errors?.[0]
    const field = top?.data?.errors?.[0]
    if (field?.message && field.path) return `${field.path}: ${field.message}`
    if (field?.message) return field.message
    if (top?.message && top.message !== 'Something went wrong.') {
      if (
        sessionMsg &&
        (/not allowed to perform this action/i.test(top.message) ||
          /keine Berechtigung/i.test(top.message))
      ) {
        return sessionMsg
      }
      return top.message
    }
    if (parsed.message && parsed.message !== 'Something went wrong.') return parsed.message
  } catch {
    // not JSON
  }
  if (/unexpected end of form/i.test(raw) || /body exceeded/i.test(raw)) {
    return fallback
  }
  if (raw === 'Something went wrong.' || raw.includes('"Something went wrong."')) {
    return fallback
  }
  // Avoid dumping giant JSON blobs into the UI
  if (raw.length > 180 || raw.trimStart().startsWith('{')) return fallback
  return raw
}

function mediaUrl(image: SlideDoc['image']): string | null {
  if (!image || typeof image === 'number') return null
  return image.sizes?.hero?.url || image.sizes?.card?.url || image.url || null
}

function venueCaption(venue: VenueOption | null | undefined): string {
  if (!venue?.name?.trim()) return ''
  const parts = [venue.name.trim().toUpperCase()]
  if (venue.location?.trim()) parts.push(venue.location.trim().toUpperCase())
  return parts.join(' · ')
}

/** Placeholders and DE clones count as empty so AI apply can fill real EN/DE alts. */
function isBlankAlt(value: string | null | undefined): boolean {
  const t = (value ?? '').trim().toLowerCase()
  if (!t) return true
  return (
    t === 'english alt pending' ||
    t === 'hero photo' ||
    t === 'hero-foto (alt folgt)' ||
    t === 'hero-foto (alt folgt)' ||
    t.startsWith('hero-foto') ||
    t.startsWith('hero photo')
  )
}

function completenessInput(form: FormState): HeroSlideCompletenessInput {
  return {
    image: form.mediaId,
    altTextLocales: {
      de: isBlankAlt(form.altDe) ? '' : form.altDe,
      en: isBlankAlt(form.altEn) ? '' : form.altEn,
    },
    venue: form.venueId,
    captionOverrideLocales: { de: form.captionOverrideDe, en: form.captionOverrideEn },
    credit: form.credit,
    descriptionLocales: { de: form.descriptionDe, en: form.descriptionEn },
    keywordsLocales: { de: form.keywordsDe, en: form.keywordsEn },
  }
}

type OverwriteKey =
  | 'altDe'
  | 'altEn'
  | 'descriptionDe'
  | 'descriptionEn'
  | 'keywordsDe'
  | 'keywordsEn'
  | 'venue'
  | 'focal'

type Props = { context: Context }

export function HeroManagerClient({ context }: Props) {
  const { i18n } = useTranslation()
  const { token } = useAuth()
  const tokenRef = useRef(token)
  tokenRef.current = token
  const lang = heroUiLocale(i18n?.language)
  const t = heroCopy(i18n?.language)
  const help = heroPhotoHelp[lang]

  const api = useCallback(<T,>(url: string, init?: RequestInit) => {
    return apiJson<T>(url, init, tokenRef.current)
  }, [])

  const errMsg = useCallback(
    (e: unknown, fallback: string) => friendlyError(e, fallback, t.sessionExpired),
    [t.sessionExpired],
  )

  const [slides, setSlides] = useState<SlideDoc[]>([])
  const [venues, setVenues] = useState<VenueOption[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const formRef = useRef<FormState>(form)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mode, setMode] = useState<'idle' | 'edit' | 'new'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiPaste, setAiPaste] = useState('')
  const [aiCopied, setAiCopied] = useState(false)
  const [translatePaste, setTranslatePaste] = useState('')
  const [translateCopied, setTranslateCopied] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [pendingOverwrite, setPendingOverwrite] = useState<
    Partial<Record<OverwriteKey, { old: string; next: string; checked: boolean }>>
  >({})
  const [pendingApply, setPendingApply] = useState<Partial<FormState> | null>(null)
  const [focalProposed, setFocalProposed] = useState(false)
  const [appendVisibleText, setAppendVisibleText] = useState<string | null>(null)
  const [hinweiseOpen, setHinweiseOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const stripSnapshot = useRef<SlideDoc[] | null>(null)
  /** Last bilingual EN fields from Apply — save prefers these over a stale/cloned form. */
  const appliedEnRef = useRef<{
    altEn: string
    descriptionEn: string
    keywordsEn: string
    captionOverrideEn: string
    aiNotesEn: string
  } | null>(null)

  useEffect(() => {
    formRef.current = form
  }, [form])

  const patch = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...partial }
      formRef.current = next
      return next
    })
  }, [])

  const load = useCallback(async () => {
    try {
      await api('/api/hero-slides/normalise-order', {
        method: 'POST',
        body: JSON.stringify({ context }),
      })
    } catch {
      // Non-fatal — list still loads
    }

    const [enRes, deRes, venueDe, venueEn] = await Promise.all([
      api<{ docs: SlideDoc[] }>(
        `/api/hero-slides?locale=en&depth=1&limit=100&sort=order&where[context][equals]=${context}`,
      ),
      api<{ docs: SlideDoc[] }>(
        `/api/hero-slides?locale=de&depth=1&limit=100&sort=order&where[context][equals]=${context}`,
      ),
      api<{ docs: VenueOption[] }>('/api/venues?locale=de&limit=100&depth=0&sort=displayOrder'),
      api<{ docs: VenueOption[] }>('/api/venues?locale=en&limit=100&depth=0&sort=displayOrder'),
    ])

    setSlides(mergeLocales(enRes.docs, deRes.docs))
    const enById = new Map(venueEn.docs.map((v) => [v.id, v]))
    const merged = venueDe.docs
      .map((v) => {
        const en = enById.get(v.id)
        const name = v.name?.trim() || en?.name?.trim() || ''
        const location = v.location?.trim() || en?.location?.trim() || null
        const slug = v.slug?.trim() || en?.slug?.trim() || null
        return { ...v, name, location, slug }
      })
      .filter((v) => Boolean(v.name))

    // Eat & Drink place picker: Lütze, Wundermart, Frühstück only.
    if (context === 'eat-and-drink') {
      const order = new Map<string, number>(EAT_AND_DRINK_VENUE_SLUGS.map((slug, i) => [slug, i]))
      setVenues(
        merged
          .filter((v) => isEatAndDrinkVenueSlug(v.slug))
          .sort((a, b) => (order.get(a.slug ?? '') ?? 99) - (order.get(b.slug ?? '') ?? 99)),
      )
    } else {
      setVenues(merged)
    }
  }, [api, context])

  useEffect(() => {
    void load().catch((e) => setError(errMsg(e, t.loadFailed)))
  }, [load, t.loadFailed, errMsg])

  const selectedVenue = venues.find((v) => v.id === form.venueId) ?? null
  const captionPreview =
    form.captionOverrideDe.trim() ||
    form.captionOverrideEn.trim() ||
    venueCaption(selectedVenue) ||
    ''

  const completeness = useMemo(
    () => checkHeroSlideCompleteness(completenessInput(form)),
    [form],
  )

  const stickyMissing =
    completeness.blocking.length > 0
      ? `${t.missingPrefix} ${formatMissingList(completeness.blocking, lang)}`
      : t.canEnable

  const stripItems: HeroStripItem[] = useMemo(() => {
    return slides.map((doc) => {
      const issues = issuesForDoc(doc)
      return {
        id: doc.id,
        order: doc.order,
        enabled: doc.enabled !== false,
        thumbUrl: mediaUrl(doc.image),
        caption: derivedCaption(doc),
        issues,
      }
    })
  }, [slides])

  const liveCount = stripItems.filter((i) => i.enabled).length
  const pausedCount = stripItems.length - liveCount

  const prompt = useMemo(
    () =>
      heroAiPrompt({
        context,
        locale: lang,
        venues: venues.map((v) => v.name).filter((n): n is string => Boolean(n?.trim())),
        captionOverrideDe: form.captionOverrideDe,
        captionOverrideEn: form.captionOverrideEn,
      }),
    [context, lang, venues, form.captionOverrideDe, form.captionOverrideEn],
  )

  const translateSource = useMemo(
    () => ({
      altDe: form.altDe,
      altEn: form.altEn,
      descriptionDe: form.descriptionDe,
      descriptionEn: form.descriptionEn,
      keywordsDe: form.keywordsDe,
      keywordsEn: form.keywordsEn,
      captionOverrideDe: form.captionOverrideDe,
      captionOverrideEn: form.captionOverrideEn,
      aiNotesDe: form.aiNotesDe ?? '',
      aiNotesEn: form.aiNotesEn ?? '',
    }),
    [form],
  )

  const translateDir = useMemo(() => heroTranslateTarget(translateSource), [translateSource])

  const translatePrompt = useMemo(
    () => (translateDir ? heroTranslatePrompt(translateSource, translateDir) : ''),
    [translateDir, translateSource],
  )

  const openNew = () => {
    setMode('new')
    setSelectedId(null)
    const blank = emptyForm()
    formRef.current = blank
    setForm(blank)
    appliedEnRef.current = null
    setPendingOverwrite({})
    setPendingApply(null)
    setError(null)
    setNotice(null)
    setAiPaste('')
    setFocalProposed(false)
    setAppendVisibleText(null)
  }

  const openEdit = async (id: number) => {
    setMode('edit')
    setSelectedId(id)
    setError(null)
    setNotice(null)
    setPendingOverwrite({})
    setPendingApply(null)
    setAiPaste('')
    setFocalProposed(false)
    setAppendVisibleText(null)
    const [deDoc, enDoc] = await Promise.all([
      api<SlideDoc>(`/api/hero-slides/${id}?locale=de&depth=1&fallback-locale=none`),
      api<SlideDoc>(`/api/hero-slides/${id}?locale=en&depth=1&fallback-locale=none`),
    ])
    const image = typeof deDoc.image === 'object' ? deDoc.image : null
    const venueId =
      typeof deDoc.venue === 'object' && deDoc.venue
        ? deDoc.venue.id
        : typeof deDoc.venue === 'number'
          ? deDoc.venue
          : null
    const deNotes = (deDoc.aiNotes ?? '').trim()
    const enNotesRaw = (enDoc.aiNotes ?? '').trim()
    const enAltRaw = (enDoc.altText ?? '').trim()
    const deAlt = (deDoc.altText ?? '').trim()
    const enDescRaw = (enDoc.description ?? '').trim()
    const deDesc = (deDoc.description ?? '').trim()
    const enKwRaw = (enDoc.keywords ?? '').trim()
    const deKw = (deDoc.keywords ?? '').trim()
    const enCapRaw = (enDoc.captionOverride ?? '').trim()
    const deCap = (deDoc.captionOverride ?? '').trim()
    // Drop EN values that are identical DE clones (create/fallback poison).
    const enOrEmpty = (en: string, de: string) => (en && en !== de ? en : '')

    const nextForm: FormState = {
      id,
      mediaId: image?.id ?? (typeof deDoc.image === 'number' ? deDoc.image : null),
      previewUrl: mediaUrl(deDoc.image),
      adminTitle: deDoc.adminTitle ?? '',
      altDe: deDoc.altText ?? '',
      altEn: (() => {
        const e = enOrEmpty(enAltRaw, deAlt)
        return isBlankAlt(e) ? '' : e
      })(),
      descriptionDe: deDoc.description ?? '',
      descriptionEn: enOrEmpty(enDescRaw, deDesc),
      keywordsDe: deDoc.keywords ?? '',
      keywordsEn: enOrEmpty(enKwRaw, deKw),
      venueId,
      captionOverrideDe: deDoc.captionOverride ?? '',
      captionOverrideEn: enOrEmpty(enCapRaw, deCap),
      credit: deDoc.credit ?? '',
      aiNotesDe: deDoc.aiNotes ?? '',
      aiNotesEn: enOrEmpty(enNotesRaw, deNotes),
      enabled: deDoc.enabled !== false,
      focalX: focalToPercent(image?.focalX),
      focalY: focalToPercent(image?.focalY),
    }
    formRef.current = nextForm
    setForm(nextForm)
    appliedEnRef.current =
      nextForm.altEn || nextForm.aiNotesEn || nextForm.descriptionEn
        ? {
            altEn: nextForm.altEn,
            descriptionEn: nextForm.descriptionEn,
            keywordsEn: nextForm.keywordsEn,
            captionOverrideEn: nextForm.captionOverrideEn,
            aiNotesEn: nextForm.aiNotesEn,
          }
        : null
  }

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t.uploadFailed)
      return
    }
    setUploading(true)
    setError(null)
    setNotice(null)
    try {
      // Hero: 2880 is ideal (2× of 1440 CSS), not a hard gate — smaller still works.
      const { file: prepared, longEdge } = await compressImageForUpload(file, {
        requireMasterEdge: false,
      })
      if (isMediaFileTooLarge(prepared.size)) {
        setError(t.fileTooLarge(MEDIA_MAX_FILE_SIZE_MB))
        return
      }
      const body = new FormData()
      body.append('file', prepared)
      // Payload multipart create reads fields from `_payload`, not bare form keys.
      const altForCreate = form.altDe.trim().slice(0, 120) || 'Hero-Foto (Alt folgt)'
      body.append('_payload', JSON.stringify({ alt: altForCreate }))
      const created = await api<{
        doc: {
          id: number
          url?: string
          sizes?: { hero?: { url?: string }; card?: { url?: string } }
          focalX?: number
          focalY?: number
        }
      }>('/api/media?locale=de', { method: 'POST', body })
      const url =
        created.doc.sizes?.hero?.url ||
        created.doc.sizes?.card?.url ||
        created.doc.url ||
        URL.createObjectURL(prepared)
      patch({
        mediaId: created.doc.id,
        previewUrl: url,
        focalX: focalToPercent(created.doc.focalX),
        focalY: focalToPercent(created.doc.focalY),
      })
      if (mode === 'idle') setMode('new')
      if (longEdge != null && longEdge < MEDIA_MASTER_EDGE) {
        setNotice(t.imageSmallHint(longEdge, MEDIA_MASTER_EDGE))
      }
    } catch (e) {
      setError(errMsg(e, t.uploadFailed))
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void uploadPhoto(file)
  }

  const saveFocal = async (xPct: number, yPct: number) => {
    if (!form.mediaId) return
    patch({ focalX: xPct, focalY: yPct })
    setFocalProposed(false)
    setNotice(t.focalConfirmed)
    await api(`/api/media/${form.mediaId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        focalX: percentToFocal(xPct),
        focalY: percentToFocal(yPct),
      }),
    })
  }

  const applyAiPaste = () => {
    const parsed = parseHeroAiReply(aiPaste)
    if (!parsed.ok) {
      setError(
        parsed.error === 'json'
          ? t.aiMalformedJson
          : parsed.error === 'schema'
            ? t.aiMalformedSchema
            : t.aiMalformed,
      )
      setNotice(null)
      return
    }
    setError(parsed.data.truncated.length ? t.aiTruncated : null)
    const d = parsed.data
    const next: Partial<FormState> = {}
    const overwrite: typeof pendingOverwrite = {}

    const consider = (key: OverwriteKey, current: string, value: string | null) => {
      if (!value) return
      const cur = current.trim()
      if (!cur) {
        if (key === 'altDe') next.altDe = value
        if (key === 'altEn') next.altEn = value
        if (key === 'descriptionDe') next.descriptionDe = value
        if (key === 'descriptionEn') next.descriptionEn = value
        if (key === 'keywordsDe') next.keywordsDe = value
        if (key === 'keywordsEn') next.keywordsEn = value
      } else if (cur !== value) {
        overwrite[key] = { old: current, next: value, checked: false }
      }
    }

    // Alt: placeholders count as empty. Always take distinct AI EN/DE alts when current is blank.
    if (d.altDe) {
      if (isBlankAlt(form.altDe)) next.altDe = d.altDe
      else if (form.altDe.trim() !== d.altDe) {
        overwrite.altDe = { old: form.altDe, next: d.altDe, checked: false }
      }
    }
    if (d.altEn && d.altEn !== d.altDe) {
      if (isBlankAlt(form.altEn)) next.altEn = d.altEn
      else if (form.altEn.trim() !== d.altEn) {
        overwrite.altEn = { old: form.altEn, next: d.altEn, checked: false }
      }
    }
    consider('descriptionDe', form.descriptionDe, d.beschreibungDe)
    consider(
      'descriptionEn',
      form.descriptionEn,
      d.beschreibungEn && d.beschreibungEn !== d.beschreibungDe ? d.beschreibungEn : null,
    )
    consider('keywordsDe', form.keywordsDe, d.stichworteDe.length ? keywordsToField(d.stichworteDe) : null)
    {
      const enKw = d.stichworteEn.length ? keywordsToField(d.stichworteEn) : null
      const deKw = d.stichworteDe.length ? keywordsToField(d.stichworteDe) : null
      consider('keywordsEn', form.keywordsEn, enKw && enKw !== deKw ? enKw : null)
    }

    // Custom caption: fill only empty sides (typed draft stays; AI supplies the translation).
    if (d.captionOverrideDe && !form.captionOverrideDe.trim()) {
      next.captionOverrideDe = d.captionOverrideDe
    }
    if (d.captionOverrideEn && !form.captionOverrideEn.trim()) {
      // Skip EN when it is identical to DE (model copied German into both).
      const deCap = (form.captionOverrideDe || next.captionOverrideDe || d.captionOverrideDe || '').trim()
      if (d.captionOverrideEn !== deCap) {
        next.captionOverrideEn = d.captionOverrideEn
      }
    }

    if (d.ortVorschlag) {
      const matched = matchVenueByName(d.ortVorschlag, venues)
      if (!matched) {
        setError(t.venueUnmatched(d.ortVorschlag))
      } else if (!form.venueId) {
        next.venueId = matched.id
      } else if (form.venueId !== matched.id) {
        overwrite.venue = {
          old: String(form.venueId),
          next: String(matched.id),
          checked: false,
        }
      }
    }

    if (d.fokuspunkt) {
      if (form.focalX === 50 && form.focalY === 50) {
        next.focalX = d.fokuspunkt.x
        next.focalY = d.fokuspunkt.y
        setFocalProposed(true)
      } else {
        overwrite.focal = {
          old: `${Math.round(form.focalX)},${Math.round(form.focalY)}`,
          next: `${Math.round(d.fokuspunkt.x)},${Math.round(d.fokuspunkt.y)}`,
          checked: false,
        }
        setFocalProposed(true)
      }
    }

    // Always take Hinweise from this reply (both languages when present).
    const deNotes = d.hinweiseDe.length ? d.hinweiseDe.join('\n') : null
    const enNotesRaw = d.hinweiseEn.length ? d.hinweiseEn.join('\n') : null
    const enNotes =
      enNotesRaw && deNotes && enNotesRaw === deNotes ? '' : enNotesRaw
    if (deNotes) next.aiNotesDe = deNotes
    if (enNotes !== null) next.aiNotesEn = enNotes

    // Keep a dedicated EN snapshot for save — survives form/clone glitches.
    appliedEnRef.current = {
      altEn: d.altEn && d.altEn !== d.altDe ? d.altEn : '',
      descriptionEn:
        d.beschreibungEn && d.beschreibungEn !== d.beschreibungDe ? d.beschreibungEn : '',
      keywordsEn: (() => {
        const enKw = d.stichworteEn.length ? keywordsToField(d.stichworteEn) : ''
        const deKw = d.stichworteDe.length ? keywordsToField(d.stichworteDe) : ''
        return enKw && enKw !== deKw ? enKw : ''
      })(),
      captionOverrideEn:
        d.captionOverrideEn && d.captionOverrideEn !== d.captionOverrideDe
          ? d.captionOverrideEn
          : '',
      aiNotesEn: enNotes && enNotes !== deNotes ? enNotes : '',
    }
    if (appliedEnRef.current.altEn && isBlankAlt(form.altEn)) {
      next.altEn = appliedEnRef.current.altEn
    }
    if (appliedEnRef.current.descriptionEn && !form.descriptionEn.trim()) {
      next.descriptionEn = appliedEnRef.current.descriptionEn
    }
    if (appliedEnRef.current.keywordsEn && !form.keywordsEn.trim()) {
      next.keywordsEn = appliedEnRef.current.keywordsEn
    }
    if (appliedEnRef.current.captionOverrideEn && !form.captionOverrideEn.trim()) {
      next.captionOverrideEn = appliedEnRef.current.captionOverrideEn
    }
    if (appliedEnRef.current.aiNotesEn) {
      next.aiNotesEn = appliedEnRef.current.aiNotesEn
    }

    const captionMissingAfterApply =
      (Boolean(form.captionOverrideEn.trim() || next.captionOverrideEn) &&
        !(form.captionOverrideDe.trim() || next.captionOverrideDe)) ||
      (Boolean(form.captionOverrideDe.trim() || next.captionOverrideDe) &&
        !(form.captionOverrideEn.trim() || next.captionOverrideEn))

    setAppendVisibleText(d.sichtbarerText)
    setPendingOverwrite(overwrite)
    setPendingApply(next)
    setForm((prev) => {
      const merged = { ...prev, ...next }
      formRef.current = merged
      return merged
    })
    if (Object.keys(overwrite).length === 0) {
      setPendingApply(null)
    }

    const enCount = appliedEnRef.current.aiNotesEn
      ? appliedEnRef.current.aiNotesEn.split('\n').filter(Boolean).length
      : 0
    const notesSummary = ` Hinweise: ${d.hinweiseDe.length} DE / ${enCount} EN.`
    const altSummary = appliedEnRef.current.altEn
      ? ` Alt EN gesetzt.`
      : d.altEn && d.altEn !== d.altDe && overwrite.altEn
        ? ` Alt EN wartet auf „Auswahl übernehmen“.`
        : ` Alt EN fehlt in der KI-Antwort.`
    if (captionMissingAfterApply) {
      setNotice(t.captionTranslateMissing)
    } else if (enCount === 0 && d.hinweiseDe.length) {
      setNotice(t.hinweiseMissingEn + notesSummary)
    } else if (d.hinweiseIncomplete && d.hinweiseEn.length && !d.hinweiseDe.length) {
      setNotice(t.hinweiseMissingDe)
    } else {
      setNotice(`${t.aiAppliedOk}${notesSummary}${altSummary}`)
    }
  }

  const applyTranslatePaste = () => {
    if (!translateDir) {
      setError(t.translateNothing)
      return
    }
    const parsed = parseHeroTranslateReply(translatePaste)
    if (!parsed.ok) {
      setError(t.aiMalformedJson)
      return
    }
    setError(parsed.data.truncated.length ? t.aiTruncated : null)
    const d = parsed.data
    const next: Partial<FormState> = {}
    if ((isBlankAlt(form.altDe) || !form.altDe.trim()) && d.altDe) next.altDe = d.altDe
    if ((isBlankAlt(form.altEn) || !form.altEn.trim()) && d.altEn) next.altEn = d.altEn
    if (!form.descriptionDe.trim() && d.beschreibungDe) next.descriptionDe = d.beschreibungDe
    if (!form.descriptionEn.trim() && d.beschreibungEn) next.descriptionEn = d.beschreibungEn
    if (!form.keywordsDe.trim() && d.stichworteDe.length) {
      next.keywordsDe = keywordsToField(d.stichworteDe)
    }
    if (!form.keywordsEn.trim() && d.stichworteEn.length) {
      next.keywordsEn = keywordsToField(d.stichworteEn)
    }
    if (!form.captionOverrideDe.trim() && d.captionOverrideDe) {
      next.captionOverrideDe = d.captionOverrideDe
    }
    if (!form.captionOverrideEn.trim() && d.captionOverrideEn) {
      next.captionOverrideEn = d.captionOverrideEn
    }
    if (!(form.aiNotesDe ?? '').trim() && d.hinweiseDe.length) {
      next.aiNotesDe = d.hinweiseDe.join('\n')
    }
    if (!(form.aiNotesEn ?? '').trim() && d.hinweiseEn.length) {
      const enJoined = d.hinweiseEn.join('\n')
      const deJoined = (form.aiNotesDe ?? '').trim() || d.hinweiseDe.join('\n')
      if (enJoined !== deJoined) next.aiNotesEn = enJoined
    }
    setForm((prev) => {
      const merged = { ...prev, ...next }
      formRef.current = merged
      return merged
    })
    if (next.altEn || next.descriptionEn || next.keywordsEn || next.captionOverrideEn || next.aiNotesEn) {
      appliedEnRef.current = {
        altEn: next.altEn ?? appliedEnRef.current?.altEn ?? '',
        descriptionEn: next.descriptionEn ?? appliedEnRef.current?.descriptionEn ?? '',
        keywordsEn: next.keywordsEn ?? appliedEnRef.current?.keywordsEn ?? '',
        captionOverrideEn: next.captionOverrideEn ?? appliedEnRef.current?.captionOverrideEn ?? '',
        aiNotesEn: next.aiNotesEn ?? appliedEnRef.current?.aiNotesEn ?? '',
      }
    }
    setNotice(t.translateApplied)
  }

  const confirmOverwrites = () => {
    if (!pendingApply && !Object.keys(pendingOverwrite).length) return
    const next: Partial<FormState> = { ...(pendingApply || {}) }
    for (const [key, row] of Object.entries(pendingOverwrite)) {
      if (!row?.checked) continue
      if (key === 'venue') next.venueId = Number(row.next)
      else if (key === 'focal') {
        const [x, y] = row.next.split(',').map(Number)
        next.focalX = x
        next.focalY = y
      } else {
        ;(next as Record<string, string>)[key] = row.next
      }
    }
    setForm((prev) => {
      const merged = { ...prev, ...next }
      formRef.current = merged
      return merged
    })
    setPendingOverwrite({})
    setPendingApply(null)
  }

  const save = async (goLive: boolean) => {
    const f = formRef.current
    if (!f.mediaId) {
      setError(t.photoFirst)
      return
    }
    if (goLive && !canEnableHeroSlide(completenessInput(f))) {
      setError(stickyMissing)
      return
    }
    setSaving(true)
    setError(null)
    /** Never persist DE text into the EN locale (model clone / fallback poison). */
    const enField = (en: string, de: string) => {
      const e = en.trim()
      const d = de.trim()
      if (!e || e === d) return ''
      return e
    }
    // Latest form including an Apply that just ran (avoid stale closure).
    const appliedEn = appliedEnRef.current
    try {
      const pickEn = (formVal: string, deVal: string, applied: string) => {
        const fromApplied = applied.trim()
        if (fromApplied && fromApplied !== deVal.trim()) return fromApplied
        return enField(formVal, deVal)
      }

      const enAlt = pickEn(f.altEn, f.altDe, appliedEn?.altEn ?? '')
      const enDesc = pickEn(f.descriptionEn, f.descriptionDe, appliedEn?.descriptionEn ?? '')
      const enKw = pickEn(f.keywordsEn, f.keywordsDe, appliedEn?.keywordsEn ?? '')
      const enCap = pickEn(
        f.captionOverrideEn,
        f.captionOverrideDe,
        appliedEn?.captionOverrideEn ?? '',
      )
      const enNotes = pickEn(f.aiNotesEn ?? '', f.aiNotesDe ?? '', appliedEn?.aiNotesEn ?? '')

      // Sync media alts
      await api(`/api/media/${f.mediaId}?locale=de`, {
        method: 'PATCH',
        body: JSON.stringify({
          alt: f.altDe.slice(0, 120),
          focalX: percentToFocal(f.focalX),
          focalY: percentToFocal(f.focalY),
        }),
      })
      await api(`/api/media/${f.mediaId}?locale=en`, {
        method: 'PATCH',
        body: JSON.stringify({
          alt: (enAlt || 'English alt pending').slice(0, 120),
        }),
      })

      const enabled = goLive ? true : f.enabled
      const base = {
        adminTitle: f.adminTitle.trim() || captionPreview || 'Hero',
        image: f.mediaId,
        venue: f.venueId,
        credit: f.credit.trim() || null,
        context,
        enabled,
      }

      const enPayload = {
        altText: (enAlt || 'English alt pending').slice(0, 120),
        description: enDesc.slice(0, 300),
        keywords: enKw,
        captionOverride: enCap,
        aiNotes: enNotes,
      }

      let id = f.id
      if (!id) {
        const maxOrder = slides.reduce((m, s) => Math.max(m, s.order), 0)
        // Create with DE only — omit optional localized fields so EN is not cloned from DE.
        const created = await api<{ doc: { id: number } }>('/api/hero-slides?locale=de', {
          method: 'POST',
          body: JSON.stringify({
            ...base,
            enabled: false,
            order: maxOrder + 1,
            altText: f.altDe.slice(0, 120),
          }),
        })
        id = created.doc.id
        await api(`/api/hero-slides/${id}?locale=de`, {
          method: 'PATCH',
          body: JSON.stringify({
            description: f.descriptionDe.slice(0, 300) || '',
            keywords: f.keywordsDe.trim() || '',
            captionOverride: f.captionOverrideDe.trim() || '',
            aiNotes: (f.aiNotesDe ?? '').trim() || '',
          }),
        })
        await api(`/api/hero-slides/${id}?locale=en`, {
          method: 'PATCH',
          body: JSON.stringify(enPayload),
        })
        if (goLive) {
          await api(`/api/hero-slides/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled: true }),
          })
        }
      } else {
        await api(`/api/hero-slides/${id}?locale=de`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...base,
            altText: f.altDe.slice(0, 120),
            description: f.descriptionDe.slice(0, 300) || '',
            keywords: f.keywordsDe.trim() || '',
            captionOverride: f.captionOverrideDe.trim() || '',
            aiNotes: (f.aiNotesDe ?? '').trim() || '',
          }),
        })
        await api(`/api/hero-slides/${id}?locale=en`, {
          method: 'PATCH',
          body: JSON.stringify(enPayload),
        })
      }

      // Verify EN was not left as a DE clone — retry once if needed.
      const enCheck = await api<{
        altText?: string | null
        aiNotes?: string | null
      }>(`/api/hero-slides/${id}?locale=en&depth=0&fallback-locale=none`)
      const deNotesNow = (f.aiNotesDe ?? '').trim()
      const enNotesNow = (enCheck.aiNotes ?? '').trim()
      if (enNotes && (!enNotesNow || enNotesNow === deNotesNow)) {
        await api(`/api/hero-slides/${id}?locale=en`, {
          method: 'PATCH',
          body: JSON.stringify(enPayload),
        })
      }
      if (enAlt && (enCheck.altText ?? '').trim() === f.altDe.trim()) {
        await api(`/api/hero-slides/${id}?locale=en`, {
          method: 'PATCH',
          body: JSON.stringify({ altText: enPayload.altText }),
        })
      }

      await load()
      if (id) await openEdit(id)
    } catch (e) {
      setError(errMsg(e, t.genericError))
    } finally {
      setSaving(false)
    }
  }

  const onReorder = async (liveIds: number[]) => {
    stripSnapshot.current = slides
    // Optimistic
    const byId = new Map(slides.map((s) => [s.id, s]))
    const live = liveIds.map((id, i) => ({ ...byId.get(id)!, order: i + 1, enabled: true }))
    const paused = slides
      .filter((s) => s.enabled === false)
      .map((s, i) => ({ ...s, order: live.length + i + 1 }))
    setSlides([...live, ...paused])
    try {
      await api('/api/hero-slides/reorder', {
        method: 'POST',
        body: JSON.stringify({ context, ids: liveIds }),
      })
      await load()
    } catch {
      if (stripSnapshot.current) setSlides(stripSnapshot.current)
      setError(t.reorderFailed)
    }
  }

  const onToggleEnabled = async (id: number, enabled: boolean) => {
    try {
      setError(null)
      await api(`/api/hero-slides/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      })
      await load()
      if (selectedId === id) patch({ enabled })
    } catch (e) {
      setError(errMsg(e, t.genericError))
    }
  }

  const removeSlide = async () => {
    if (!form.id) return
    if (!window.confirm(t.deleteConfirm)) return
    setSaving(true)
    setError(null)
    try {
      await api(`/api/hero-slides/${form.id}`, { method: 'DELETE' })
      setMode('idle')
      setSelectedId(null)
      setForm(emptyForm())
      setAiPaste('')
      setPendingOverwrite({})
      setPendingApply(null)
      await load()
    } catch (e) {
      // Doc may already be gone; refresh and show a clear message if reload still fails.
      try {
        await load()
        setMode('idle')
        setSelectedId(null)
        setForm(emptyForm())
      } catch {
        /* ignore */
      }
      setError(errMsg(e, t.deleteFailed))
    } finally {
      setSaving(false)
    }
  }

  const hasPhoto = Boolean(form.mediaId)
  const gated = !hasPhoto
  const title =
    context === 'here'
      ? t.hierTitle
      : context === 'eat-and-drink'
        ? t.essenTitle
        : t.startseiteTitle
  const kicker =
    context === 'here'
      ? t.hierKicker
      : context === 'eat-and-drink'
        ? t.essenKicker
        : t.startseiteKicker

  return (
    <Gutter>
      <div className="guided-admin">
      <div
        aria-live="polite"
        ref={liveRegionRef}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {announce}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 96 }}>
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
            <GuidedBackToDashboard style={{ marginBottom: 10 }} />
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {kicker}
            </p>
            <h1 style={{ margin: '4px 0 0', fontSize: 28 }}>{title}</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--theme-elevation-800)' }}>
              {t.livePaused(liveCount, pausedCount)}
            </p>
          </div>
          <button type="button" className="btn btn--style-primary" onClick={openNew}>
            {t.newPhoto}
          </button>
        </header>

        {error ? (
          <p role="alert" style={{ color: '#b42318', fontSize: 14 }}>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" style={{ color: 'var(--theme-elevation-800)', fontSize: 14 }}>
            {notice}
          </p>
        ) : null}

        {(() => {
          const deRaw = (form.aiNotesDe ?? '').trim()
          const enRaw = (form.aiNotesEn ?? '').trim()
          // Same German pasted into both locales → show as DE-only.
          const en = deRaw && enRaw && deRaw === enRaw ? '' : enRaw
          const de = deRaw
          if (!de && !en) return null
          const onlyDe = Boolean(de && !en)
          const onlyEn = Boolean(en && !de)
          return (
            <div
              style={{
                marginTop: 12,
                padding: hinweiseOpen ? '10px 12px' : '4px 10px',
                background: 'color-mix(in srgb, #b45309 14%, transparent)',
                border: '1px solid #b45309',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  minHeight: hinweiseOpen ? undefined : 28,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 0,
                    flexWrap: 'wrap',
                  }}
                >
                  <strong style={{ fontSize: hinweiseOpen ? 13 : 12 }}>{t.hinweiseTitle}</strong>
                  {!hinweiseOpen ? (
                    <span style={{ fontSize: 11, color: 'var(--theme-elevation-800)' }}>
                      {[de && t.hinweiseLangDe, en && t.hinweiseLangEn].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn--style-secondary btn--size-small"
                  onClick={() => setHinweiseOpen((o) => !o)}
                  aria-expanded={hinweiseOpen}
                >
                  {hinweiseOpen ? t.hinweiseCollapse : t.hinweiseExpand}
                </button>
              </div>
              {hinweiseOpen ? (
                <>
                  {onlyDe || onlyEn ? (
                    <p style={{ margin: '6px 0 0', fontSize: 12 }}>
                      {onlyDe ? t.hinweiseOnlyDe : t.hinweiseOnlyEn}
                    </p>
                  ) : null}
                  {de ? (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase' }}>
                        {t.hinweiseLangDe}
                      </p>
                      <pre
                        style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                      >
                        {de}
                      </pre>
                    </div>
                  ) : null}
                  {en ? (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase' }}>
                        {t.hinweiseLangEn}
                      </p>
                      <pre
                        style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                      >
                        {en}
                      </pre>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })()}

        <GuidedSection id="hm-order" title={t.orderHeading}>
          {stripItems.length === 0 ? (
            <p style={{ fontSize: 14 }}>
              {context === 'here'
                ? t.emptyHere
                : context === 'eat-and-drink'
                  ? t.emptyEssen
                  : t.emptyHomepage}
            </p>
          ) : (
            <HeroStrip
              items={stripItems}
              selectedId={selectedId}
              onSelect={(id) => void openEdit(id)}
              onReorder={onReorder}
              onToggleEnabled={(id, en) => void onToggleEnabled(id, en)}
              t={t}
              locale={lang}
              announce={(msg) => setAnnounce(msg)}
            />
          )}
        </GuidedSection>

        {(mode === 'edit' || mode === 'new') && hasPhoto ? (
          <GuidedSection id="hm-preview" title={t.previewHeading}>
            <FocalPreview
              src={form.previewUrl}
              focalX={form.focalX}
              focalY={form.focalY}
              caption={captionPreview}
              proposed={focalProposed}
              t={t}
              onCommit={(x, y) => void saveFocal(x, y)}
            />
          </GuidedSection>
        ) : null}

        {(mode === 'edit' || mode === 'new') && (
          <>
            <GuidedSection id="hm-photo" title={t.photoHeading}>
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{
                  display: 'block',
                  border: `2px dashed ${dragOver ? 'var(--theme-success-500, #1a7f4b)' : 'var(--theme-elevation-150)'}`,
                  borderRadius: 6,
                  padding: 16,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                {form.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.previewUrl}
                    alt=""
                    style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span>{uploading ? t.dropUploading : t.dropIdle}</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={uploading}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadPhoto(file)
                    e.target.value = ''
                  }}
                />
              </label>
              <div style={{ marginTop: 8 }}>
                <HelpMore
                  id="hm-photo-help"
                  lead={help.lead}
                  more={help.more}
                  moreLabel="Mehr"
                  lessLabel="Weniger"
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)', marginTop: 8 }}>
                {t.privacy}
              </p>
            </GuidedSection>

            <GuidedSection id="hm-place" title={t.placeHeading} disabled={gated}>
              <label style={{ display: 'block', fontSize: 13 }}>
                {t.venue}
                <select
                  value={form.venueId ?? ''}
                  onChange={(e) =>
                    patch({ venueId: e.target.value ? Number(e.target.value) : null })
                  }
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                >
                  <option value="">—</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <p style={{ fontSize: 12, marginTop: 8 }}>
                {t.captionPreview}: <strong>{captionPreview || '—'}</strong>
              </p>
              <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)' }}>
                {t.captionOverrideHelp}
              </p>
              <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)', marginTop: 4 }}>
                {t.captionOverrideHint}
              </p>
              <label style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                {t.captionOverrideDe}
                <input
                  value={form.captionOverrideDe}
                  onChange={(e) => patch({ captionOverrideDe: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
              <label style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                {t.captionOverrideEn}
                <input
                  value={form.captionOverrideEn}
                  onChange={(e) => patch({ captionOverrideEn: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
            </GuidedSection>

            <GuidedSection id="hm-ai" title={t.aiHeading} disabled={gated}>
              <p style={{ margin: '0 0 10px', fontSize: 13 }}>{t.aiExplanation}</p>
              <pre
                style={{
                  margin: '0 0 8px',
                  padding: 10,
                  borderRadius: 4,
                  background: 'var(--theme-elevation-0)',
                  border: '1px solid var(--theme-elevation-150)',
                  whiteSpace: 'pre-wrap',
                  fontSize: 11,
                  maxHeight: 160,
                  overflow: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
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
              {Object.keys(pendingOverwrite).length > 0 ? (
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  <p>{t.aiOverwriteHint}</p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(pendingOverwrite).map(([key, row]) =>
                      row ? (
                        <li key={key} style={{ marginBottom: 8 }}>
                          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <input
                              type="checkbox"
                              checked={row.checked}
                              onChange={(e) =>
                                setPendingOverwrite((prev) => ({
                                  ...prev,
                                  [key]: { ...row, checked: e.target.checked },
                                }))
                              }
                            />
                            <span>
                              <strong>
                                {t.overwriteLabels[key as keyof typeof t.overwriteLabels] ?? key}
                              </strong>
                              <br />
                              <span style={{ color: 'var(--theme-elevation-800)' }}>
                                {t.overwriteNow}: {row.old}
                              </span>
                              <br />
                              {t.overwriteNew}: {row.next}
                            </span>
                          </label>
                        </li>
                      ) : null,
                    )}
                  </ul>
                  <button
                    type="button"
                    className="btn btn--style-secondary btn--size-small"
                    onClick={confirmOverwrites}
                  >
                    {t.aiApplySelected}
                  </button>
                </div>
              ) : null}
              {appendVisibleText ? (
                <label style={{ display: 'block', marginTop: 10, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        patch({
                          descriptionDe: `${form.descriptionDe} ${appendVisibleText}`.trim().slice(0, 300),
                        })
                      }
                    }}
                  />{' '}
                  {t.appendVisibleText(appendVisibleText)}
                </label>
              ) : null}
            </GuidedSection>

            <GuidedSection id="hm-translate" title={t.translateHeading} disabled={gated}>
              <p style={{ margin: '0 0 10px', fontSize: 13 }}>{t.translateExplanation}</p>
              {translateDir ? (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--theme-elevation-800)' }}>
                    {translateDir === 'en' ? t.translateToEn : t.translateToDe}
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
                      maxHeight: 140,
                      overflow: 'auto',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {translatePrompt}
                  </pre>
                  <button
                    type="button"
                    className="btn btn--style-secondary btn--size-small"
                    onClick={() => {
                      void navigator.clipboard.writeText(translatePrompt).then(() => {
                        setTranslateCopied(true)
                        setTimeout(() => setTranslateCopied(false), 1500)
                      })
                    }}
                  >
                    {translateCopied ? t.translateCopied : t.translateCopy}
                  </button>
                  <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                    {t.translatePaste}
                    <textarea
                      value={translatePaste}
                      onChange={(e) => setTranslatePaste(e.target.value)}
                      rows={4}
                      style={{ display: 'block', width: '100%', marginTop: 4 }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn--style-primary btn--size-small"
                    style={{ marginTop: 8 }}
                    onClick={applyTranslatePaste}
                  >
                    {t.translateApply}
                  </button>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-800)' }}>
                  {t.translateNothing}
                </p>
              )}
            </GuidedSection>

            <GuidedSection id="hm-text" title={t.textHeading} disabled={gated}>
              <CharField
                label={t.altDe}
                value={form.altDe}
                max={120}
                t={t}
                onChange={(v) => patch({ altDe: v })}
              />
              <CharField
                label={t.altEn}
                value={form.altEn}
                max={120}
                t={t}
                onChange={(v) => patch({ altEn: v })}
              />
              <CharField
                label={t.descriptionDe}
                value={form.descriptionDe}
                max={300}
                t={t}
                textarea
                onChange={(v) => patch({ descriptionDe: v })}
              />
              <CharField
                label={t.descriptionEn}
                value={form.descriptionEn}
                max={300}
                t={t}
                textarea
                onChange={(v) => patch({ descriptionEn: v })}
              />
              <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                {t.keywordsDe}
                <input
                  value={form.keywordsDe}
                  onChange={(e) => patch({ keywordsDe: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
              <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                {t.keywordsEn}
                <input
                  value={form.keywordsEn}
                  onChange={(e) => patch({ keywordsEn: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
              <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                {t.adminTitle}
                <input
                  value={form.adminTitle}
                  onChange={(e) => patch({ adminTitle: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
            </GuidedSection>

            <GuidedSection id="hm-rights" title={t.rightsHeading} disabled={gated}>
              <label style={{ display: 'block', fontSize: 13 }}>
                {t.credit}
                <input
                  value={form.credit}
                  onChange={(e) => patch({ credit: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
            </GuidedSection>
          </>
        )}
      </div>

      {(mode === 'edit' || mode === 'new') && (
        <StickyMissingBar
          ariaLabel={t.missingPrefix}
          message={hasPhoto ? stickyMissing : t.photoFirst}
          complete={completeness.complete && hasPhoto}
        >
          {form.id ? (
            <button
              type="button"
              className="btn btn--style-secondary"
              disabled={saving}
              onClick={() => void removeSlide()}
              style={{ color: '#b42318', borderColor: 'color-mix(in srgb, #b42318 35%, transparent)' }}
            >
              {t.deleteSlide}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--style-secondary"
            disabled={saving || gated}
            onClick={() => void save(false)}
          >
            {saving ? t.saving : t.save}
          </button>
          <button
            type="button"
            className="btn btn--style-primary"
            disabled={saving || gated || !canEnableHeroSlide(completenessInput(form))}
            onClick={() => void save(true)}
          >
            {t.saveLive}
          </button>
        </StickyMissingBar>
      )}
      </div>
    </Gutter>
  )
}

function CharField({
  label,
  value,
  max,
  t,
  onChange,
  textarea,
}: {
  label: string
  value: string
  max: number
  t: HeroManagerCopy
  onChange: (v: string) => void
  textarea?: boolean
}) {
  const Comp = textarea ? 'textarea' : 'input'
  return (
    <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
      {label}{' '}
      <span style={{ color: 'var(--theme-elevation-800)' }}>{t.chars(value.length, max)}</span>
      <Comp
        value={value}
        maxLength={max}
        rows={textarea ? 3 : undefined}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'block', width: '100%', marginTop: 4 }}
      />
    </label>
  )
}

function FocalPreview({
  src,
  focalX,
  focalY,
  caption,
  proposed,
  t,
  onCommit,
}: {
  src: string | null
  focalX: number
  focalY: number
  caption: string
  proposed: boolean
  t: HeroManagerCopy
  onCommit: (x: number, y: number) => void
}) {
  const drag = useRef(false)

  const handle = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onCommit(x, y)
  }

  const frame = (ratioLabel: string, aspect: string) => (
    <div style={{ flex: '1 1 200px' }}>
      <p style={{ fontSize: 12, margin: '0 0 6px' }}>{ratioLabel}</p>
      <div
        role="presentation"
        style={{
          position: 'relative',
          aspectRatio: aspect,
          background: 'var(--theme-elevation-100)',
          borderRadius: 4,
          overflow: 'hidden',
          cursor: 'crosshair',
        }}
        onPointerDown={(e) => {
          drag.current = true
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          handle(e.currentTarget, e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          handle(e.currentTarget, e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          drag.current = false
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focalX}% ${focalY}%`,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: `${focalX}%`,
            top: `${focalY}%`,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: '50%',
            border: proposed ? '2px solid #fff' : '2px solid #1a7f4b',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
            background: proposed ? 'transparent' : 'rgba(26,127,75,0.35)',
          }}
        />
        {caption ? (
          <span
            style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              fontSize: 10,
              background: 'rgba(86,103,79,0.6)',
              color: '#fff',
              padding: '2px 6px',
            }}
          >
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: 12, marginBottom: 8 }}>
        {proposed ? t.focalProposed : t.focalHint}
      </p>
      {proposed ? (
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          style={{ marginBottom: 10 }}
          onClick={() => onCommit(focalX, focalY)}
        >
          {t.focalConfirm}
        </button>
      ) : null}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {frame(t.desktopCrop, '2 / 1')}
        {frame(t.mobileCrop, '1 / 0.75')}
      </div>
    </div>
  )
}

function mergeLocales(enDocs: SlideDoc[], deDocs: SlideDoc[]): SlideDoc[] {
  const deById = new Map(deDocs.map((d) => [d.id, d]))
  return enDocs.map((en) => {
    const de = deById.get(en.id)
    return {
      ...en,
      // Keep EN as base; DE caption/alt used for strip via derivedCaption preferring DE venue names
      _de: de,
    } as SlideDoc & { _de?: SlideDoc }
  })
}

function derivedCaption(doc: SlideDoc): string {
  const de = (doc as SlideDoc & { _de?: SlideDoc })._de
  const override = de?.captionOverride?.trim() || doc.captionOverride?.trim()
  if (override) return override
  const venue =
    typeof doc.venue === 'object' && doc.venue
      ? doc.venue
      : typeof de?.venue === 'object' && de.venue
        ? de.venue
        : null
  return venueCaption(venue)
}

function issuesForDoc(doc: SlideDoc): CompletenessIssue[] {
  const de = (doc as SlideDoc & { _de?: SlideDoc })._de
  return checkHeroSlideCompleteness({
    image: doc.image,
    altTextLocales: { de: de?.altText ?? '', en: doc.altText ?? '' },
    venue: doc.venue,
    captionOverrideLocales: {
      de: de?.captionOverride ?? '',
      en: doc.captionOverride ?? '',
    },
    credit: doc.credit,
    descriptionLocales: { de: de?.description ?? '', en: doc.description ?? '' },
    keywordsLocales: { de: de?.keywords ?? '', en: doc.keywords ?? '' },
  }).issues
}

export default HeroManagerClient
