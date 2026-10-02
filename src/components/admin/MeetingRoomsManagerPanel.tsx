'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

import { SortableList } from '@/components/admin/SortableList'
import { focalToPercent } from '@/lib/media/focal'
import { mediaSizedUrl, mediaUrl } from '@/lib/media/url'
import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'
import {
  MEETING_AREA_OPTIONS,
  meetingRoomsManagerCopy,
  type MeetingAreaValue,
} from '@/lib/meetings/meetingRoomsManagerCopy'

export type MeetingImageItem = {
  id: number
  rowId?: string | null
  index: number
  url: string | null
  width: number | null
  filename: string | null
  altDe: string
  altEn: string
  focalX: number
  focalY: number
}

type DetailsState = {
  nameDe: string
  nameEn: string
  descriptionDe: string
  descriptionEn: string
  floorSizeM2: string
  area: MeetingAreaValue | ''
  hasDaylight: boolean
  hasScreen: boolean
  hasProjector: boolean
  visibleOnSite: boolean
}

type Props = {
  roomId: number
  roomName: string
  roomSlug: string
  onClose: () => void
  onRoomUpdated: () => void
}

type Tab = 'photos' | 'details'

async function api<T>(url: string, init?: RequestInit, lang?: string): Promise<T> {
  const locale = lang?.toLowerCase().startsWith('en') ? 'en' : 'de'
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept-Language': locale,
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

type MediaDoc = {
  id: number
  url?: string | null
  width?: number | null
  filename?: string | null
  focalX?: number | null
  focalY?: number | null
  sizes?: { card?: { url?: string | null } | null }
}

type MeetingImageRow = {
  id?: string | null
  alt?: string | null
  image?: number | MediaDoc | null
}

function mediaOf(row: MeetingImageRow): MediaDoc | null {
  if (!row.image || typeof row.image === 'number') return null
  return row.image
}

function mergeImages(enRows: MeetingImageRow[], deRows: MeetingImageRow[]): MeetingImageItem[] {
  return enRows.map((en, index) => {
    const de = deRows[index]
    const media = mediaOf(en) ?? mediaOf(de ?? {})
    const mid = media?.id ?? (typeof en.image === 'number' ? en.image : null)
    return {
      id: mid ?? index + 1_000_000,
      rowId: en.id,
      index,
      url: media ? (mediaSizedUrl(media, 'card') ?? mediaUrl(media)) : null,
      width: media?.width ?? null,
      filename: media?.filename ?? null,
      altDe: de?.alt ?? '',
      altEn: en.alt ?? '',
      focalX: focalToPercent(media?.focalX),
      focalY: focalToPercent(media?.focalY),
    }
  })
}

function isPlaceholderAlt(alt: string): boolean {
  const t = alt.trim().toLowerCase()
  return (
    !t ||
    t.includes('alt pending') ||
    t.includes('alt text missing') ||
    t.includes('bildbeschreibung fehlt') ||
    t.includes('alt folgt')
  )
}

export function MeetingRoomsManagerPanel({
  roomId,
  roomName,
  roomSlug,
  onClose,
  onRoomUpdated,
}: Props) {
  const { i18n } = useTranslation()
  const t = meetingRoomsManagerCopy(i18n?.language)
  const lang = i18n?.language

  const callApi = useCallback(
    <T,>(url: string, init?: RequestInit) => api<T>(url, init, lang),
    [lang],
  )
  const [tab, setTab] = useState<Tab>('photos')
  const [images, setImages] = useState<MeetingImageItem[]>([])
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [savingImage, setSavingImage] = useState(false)
  const [draft, setDraft] = useState<MeetingImageItem | null>(null)
  const [details, setDetails] = useState<DetailsState | null>(null)
  const [savingDetails, setSavingDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const dragFocal = useRef(false)

  const selected = useMemo(
    () => images.find((img) => img.id === selectedMediaId) ?? null,
    [images, selectedMediaId],
  )

  const loadImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [enRes, deRes] = await Promise.all([
        fetch(`/api/meeting-rooms/${roomId}?depth=2&locale=en`, { credentials: 'include' }),
        fetch(`/api/meeting-rooms/${roomId}?depth=2&locale=de`, { credentials: 'include' }),
      ])
      if (!enRes.ok || !deRes.ok) throw new Error(t.errGeneric)
      const en = (await enRes.json()) as { images?: MeetingImageRow[] }
      const de = (await deRes.json()) as { images?: MeetingImageRow[] }
      const merged = mergeImages(en.images ?? [], de.images ?? [])
      setImages(merged)
      setSelectedMediaId((prev) => {
        if (prev && merged.some((m) => m.id === prev)) return prev
        return merged[0]?.id ?? null
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setLoading(false)
    }
  }, [roomId, t.errGeneric])

  const loadDetails = useCallback(async () => {
    try {
      const [enRes, deRes] = await Promise.all([
        fetch(`/api/meeting-rooms/${roomId}?depth=0&locale=en`, { credentials: 'include' }),
        fetch(`/api/meeting-rooms/${roomId}?depth=0&locale=de`, { credentials: 'include' }),
      ])
      if (!enRes.ok || !deRes.ok) throw new Error(t.errGeneric)
      const en = (await enRes.json()) as {
        name?: string | null
        description?: unknown
        shortDescription?: string | null
        floorSizeM2?: number | null
        area?: MeetingAreaValue | null
        hasDaylight?: boolean | null
        hasScreen?: boolean | null
        hasProjector?: boolean | null
        visibleOnSite?: boolean | null
      }
      const de = (await deRes.json()) as {
        name?: string | null
        description?: unknown
        shortDescription?: string | null
      }
      setDetails({
        nameDe: de.name ?? '',
        nameEn: en.name ?? '',
        descriptionDe:
          lexicalToPlain(de.description, { preserveParagraphs: true }) ||
          (de.shortDescription ?? ''),
        descriptionEn:
          lexicalToPlain(en.description, { preserveParagraphs: true }) ||
          (en.shortDescription ?? ''),
        floorSizeM2: en.floorSizeM2 != null ? String(en.floorSizeM2) : '',
        area: en.area ?? '',
        hasDaylight: Boolean(en.hasDaylight),
        hasScreen: Boolean(en.hasScreen),
        hasProjector: Boolean(en.hasProjector),
        visibleOnSite: en.visibleOnSite !== false,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    }
  }, [roomId, t.errGeneric])

  useEffect(() => {
    void loadImages()
    void loadDetails()
  }, [loadImages, loadDetails])

  useEffect(() => {
    if (selected) {
      setDraft({ ...selected })
    } else {
      setDraft(null)
    }
    // Reset draft only when selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMediaId])

  const qualityWarnings = useMemo(() => {
    const list: string[] = []
    if (images.length < 2) list.push(t.missingPhotos(images.length))
    for (const img of images) {
      if (isPlaceholderAlt(img.altDe) || isPlaceholderAlt(img.altEn)) {
        list.push(t.missingAlt(img.index + 1))
      }
      if (img.width != null && img.width < 2000) {
        list.push(t.narrowImage(img.index + 1, img.width))
      }
    }
    return list
  }, [images, t])

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 2200)
  }

  const onReorderImages = async (mediaIds: number[]) => {
    const previous = images
    setImages((current) => {
      const byId = new Map(current.map((i) => [i.id, i]))
      return mediaIds
        .map((id, index) => {
          const item = byId.get(id)
          return item ? { ...item, index } : null
        })
        .filter(Boolean) as MeetingImageItem[]
    })
    try {
      await callApi(`/api/meeting-rooms/${roomId}/images/reorder`, {
        method: 'POST',
        body: JSON.stringify({ mediaIds }),
      })
      flash(t.saved)
      onRoomUpdated()
      await loadImages()
    } catch (e) {
      setImages(previous)
      setError(e instanceof Error ? e.message : t.errGeneric)
    }
  }

  const makeCover = async (mediaId: number) => {
    const ids = images.map((i) => i.id)
    if (ids.indexOf(mediaId) <= 0) return
    await onReorderImages([mediaId, ...ids.filter((id) => id !== mediaId)])
  }

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploading(true)
    setError(null)
    setWarnings([])
    try {
      const body = new FormData()
      for (const file of list) body.append('files', file)
      const result = await callApi<{ warnings?: string[] }>(
        `/api/meeting-rooms/${roomId}/images`,
        { method: 'POST', body },
      )
      if (result.warnings?.length) setWarnings(result.warnings)
      flash(t.saved)
      onRoomUpdated()
      await loadImages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setUploading(false)
    }
  }

  const replaceFile = async (file: File) => {
    if (selectedMediaId == null) return
    const index = images.findIndex((i) => i.id === selectedMediaId)
    if (index < 0) return
    setUploading(true)
    setError(null)
    setWarnings([])
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('index', String(index))
      const result = await callApi<{ warnings?: string[]; mediaId?: number }>(
        `/api/meeting-rooms/${roomId}/images/replace`,
        { method: 'POST', body },
      )
      if (result.warnings?.length) setWarnings(result.warnings)
      if (result.mediaId) setSelectedMediaId(result.mediaId)
      flash(t.saved)
      onRoomUpdated()
      await loadImages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setUploading(false)
    }
  }

  const saveImageDraft = async () => {
    if (!draft || selectedMediaId == null) return
    const index = images.findIndex((i) => i.id === selectedMediaId)
    if (index < 0) return
    setSavingImage(true)
    setError(null)
    try {
      await callApi(`/api/meeting-rooms/${roomId}/images/${index}`, {
        method: 'PATCH',
        body: JSON.stringify({
          altDe: draft.altDe,
          altEn: draft.altEn,
          focalX: draft.focalX,
          focalY: draft.focalY,
        }),
      })
      flash(t.saved)
      onRoomUpdated()
      await loadImages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setSavingImage(false)
    }
  }

  const removeFromRoom = async () => {
    if (selectedMediaId == null) return
    const index = images.findIndex((i) => i.id === selectedMediaId)
    if (index < 0) return
    if (!window.confirm(t.removeConfirm)) return
    setSavingImage(true)
    try {
      await callApi(`/api/meeting-rooms/${roomId}/images/${index}`, {
        method: 'PATCH',
        body: JSON.stringify({ remove: true }),
      })
      flash(t.saved)
      onRoomUpdated()
      await loadImages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setSavingImage(false)
    }
  }

  const saveDetails = async () => {
    if (!details) return
    setSavingDetails(true)
    setError(null)
    try {
      await callApi(`/api/meeting-rooms/${roomId}/quick-update`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: { de: details.nameDe, en: details.nameEn },
          description: {
            de: details.descriptionDe,
            en: details.descriptionEn,
          },
          floorSizeM2: details.floorSizeM2 === '' ? null : Number(details.floorSizeM2),
          ...(details.area ? { area: details.area } : {}),
          hasDaylight: details.hasDaylight,
          hasScreen: details.hasScreen,
          hasProjector: details.hasProjector,
          visibleOnSite: details.visibleOnSite,
        }),
      })
      flash(t.saved)
      onRoomUpdated()
      await loadDetails()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setSavingDetails(false)
    }
  }

  const setFocalFromEvent = (el: HTMLElement, clientX: number, clientY: number) => {
    if (!draft) return
    const rect = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    setDraft({ ...draft, focalX: x, focalY: y })
  }

  const siteUrl = `/de/tagungen/${roomSlug}`
  const versionsUrl = `/admin/collections/meeting-rooms/${roomId}/versions`
  const fullEditorUrl = `/admin/collections/meeting-rooms/${roomId}`

  return (
    <aside
      style={{
        width: 420,
        flex: '0 0 420px',
        borderLeft: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-0)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 100px)',
        position: 'sticky',
        top: 12,
        alignSelf: 'flex-start',
      }}
      aria-label={roomName}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderBottom: '1px solid var(--theme-elevation-150)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong
            style={{
              fontSize: 14,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {roomName}
          </strong>
          <span style={{ fontSize: 11, color: 'var(--theme-elevation-800)' }}>{roomSlug}</span>
        </div>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={onClose}
          aria-label={t.close}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--theme-elevation-150)' }}>
        {(
          [
            ['photos', t.tabPhotos],
            ['details', t.tabDetails],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              background: tab === key ? 'var(--theme-elevation-50)' : 'transparent',
              borderBottom:
                tab === key ? '2px solid var(--theme-elevation-800)' : '2px solid transparent',
              fontWeight: tab === key ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {error ? (
          <p style={{ color: 'var(--theme-error-500, #b30d0d)', fontSize: 13, margin: '0 0 10px' }}>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            style={{
              color: 'var(--theme-success-500, #1a7f4b)',
              fontSize: 13,
              margin: '0 0 10px',
            }}
          >
            {notice}
          </p>
        ) : null}
        {warnings.length > 0 ? (
          <div
            role="status"
            style={{
              marginBottom: 10,
              padding: '8px 10px',
              background: 'var(--theme-warning-50, #fff8e6)',
              border: '1px solid var(--theme-warning-200, #f0d78c)',
              fontSize: 12,
            }}
          >
            {warnings.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
        ) : null}

        {tab === 'photos' ? (
          <>
            {qualityWarnings.length > 0 ? (
              <div
                role="status"
                style={{
                  marginBottom: 10,
                  padding: '8px 10px',
                  background: 'var(--theme-warning-50, #fff8e6)',
                  border: '1px solid var(--theme-warning-200, #f0d78c)',
                  fontSize: 12,
                }}
              >
                <strong style={{ display: 'block', marginBottom: 4 }}>{t.warnings}</strong>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {qualityWarnings.slice(0, 8).map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files)
              }}
              style={{
                border: '1px dashed var(--theme-elevation-250)',
                borderRadius: 4,
                padding: '14px 12px',
                textAlign: 'center',
                fontSize: 13,
                marginBottom: 12,
                background: 'var(--theme-elevation-50)',
              }}
            >
              {uploading ? (
                t.uploading
              ) : (
                <>
                  {t.dropPhotos}{' '}
                  <button
                    type="button"
                    className="btn btn--style-secondary btn--size-small"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.browse}
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files?.length) void uploadFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>

            {loading ? (
              <p style={{ fontSize: 13 }}>{t.loadingPhotos}</p>
            ) : images.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>{t.noPhotos}</p>
            ) : (
              <SortableList
                layout="grid"
                items={images}
                onReorder={onReorderImages}
                ariaLabel={t.tabPhotos}
                style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
                renderItem={(item, controls) => (
                  <div
                    role="listitem"
                    style={{
                      position: 'relative',
                      border:
                        item.id === selectedMediaId
                          ? '2px solid var(--theme-elevation-800)'
                          : '1px solid var(--theme-elevation-150)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'var(--theme-elevation-100)',
                      aspectRatio: '3 / 2',
                    }}
                  >
                    <button
                      type="button"
                      {...controls.dragHandleProps}
                      aria-label="Drag"
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        zIndex: 2,
                        border: 'none',
                        background: 'rgba(255,255,255,0.85)',
                        fontSize: 12,
                        padding: '1px 4px',
                        lineHeight: 1,
                        ...(controls.dragHandleProps.style as object | undefined),
                      }}
                    >
                      ⠿
                    </button>
                    {item.index === 0 ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          zIndex: 2,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: 'rgba(26,127,75,0.9)',
                          color: '#fff',
                          padding: '2px 5px',
                        }}
                      >
                        {t.cover}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setSelectedMediaId(item.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: `${item.focalX}% ${item.focalY}%`,
                            pointerEvents: 'none',
                          }}
                        />
                      ) : null}
                    </button>
                  </div>
                )}
              />
            )}

            {draft ? (
              <div
                style={{
                  marginTop: 14,
                  borderTop: '1px solid var(--theme-elevation-150)',
                  paddingTop: 12,
                }}
              >
                <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>{t.photoEditHeading}</h3>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: 12,
                    color: 'var(--theme-elevation-800)',
                    lineHeight: 1.4,
                  }}
                >
                  {t.photoEditHelp}
                </p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {draft.index !== 0 ? (
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() => void makeCover(draft.id)}
                    >
                      {t.makeCover}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn--style-secondary btn--size-small"
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {t.replacePhoto}
                  </button>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void replaceFile(file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--style-secondary btn--size-small"
                    onClick={() => void removeFromRoom()}
                    disabled={savingImage}
                  >
                    {t.removeFromRoom}
                  </button>
                </div>

                <div
                  role="presentation"
                  style={{
                    position: 'relative',
                    aspectRatio: '3 / 2',
                    background: 'var(--theme-elevation-100)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'crosshair',
                    marginBottom: 10,
                  }}
                  onPointerDown={(e) => {
                    dragFocal.current = true
                    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                    setFocalFromEvent(e.currentTarget, e.clientX, e.clientY)
                  }}
                  onPointerMove={(e) => {
                    if (!dragFocal.current) return
                    setFocalFromEvent(e.currentTarget, e.clientX, e.clientY)
                  }}
                  onPointerUp={() => {
                    dragFocal.current = false
                  }}
                >
                  {draft.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.url}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: `${draft.focalX}% ${draft.focalY}%`,
                        pointerEvents: 'none',
                      }}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: `${draft.focalX}%`,
                      top: `${draft.focalY}%`,
                      width: 12,
                      height: 12,
                      marginLeft: -6,
                      marginTop: -6,
                      borderRadius: '50%',
                      border: '2px solid #1a7f4b',
                      background: 'rgba(26,127,75,0.35)',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
                    }}
                  />
                </div>
                <p style={{ fontSize: 11, margin: '0 0 10px', color: 'var(--theme-elevation-800)' }}>
                  {t.focalHint(Math.round(draft.focalX), Math.round(draft.focalY))}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <label style={{ fontSize: 12 }}>
                    {t.altDe}
                    <input
                      value={draft.altDe}
                      maxLength={120}
                      onChange={(e) => setDraft({ ...draft, altDe: e.target.value })}
                      style={{ display: 'block', width: '100%', marginTop: 2 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    {t.altEn}
                    <input
                      value={draft.altEn}
                      maxLength={120}
                      onChange={(e) => setDraft({ ...draft, altEn: e.target.value })}
                      style={{ display: 'block', width: '100%', marginTop: 2 }}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn--style-primary btn--size-small"
                  onClick={() => void saveImageDraft()}
                  disabled={savingImage}
                >
                  {savingImage ? t.saving : t.saveImage}
                </button>
              </div>
            ) : null}
          </>
        ) : !details ? (
          <p style={{ fontSize: 13 }}>{t.loading}</p>
        ) : (
          <>
            <label
              style={{
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                padding: '8px 10px',
                border: '1px solid var(--theme-elevation-150)',
                background: 'var(--theme-elevation-50)',
              }}
            >
              <input
                type="checkbox"
                checked={details.visibleOnSite}
                onChange={(e) => setDetails({ ...details, visibleOnSite: e.target.checked })}
              />
              <span>
                <strong style={{ display: 'block' }}>{t.visibleOnSite}</strong>
                <span style={{ fontSize: 11, color: 'var(--theme-elevation-800)' }}>
                  {t.visibleHint}
                </span>
              </span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <label style={{ fontSize: 12 }}>
                {t.nameDe}
                <input
                  value={details.nameDe}
                  onChange={(e) => setDetails({ ...details, nameDe: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                />
              </label>
              <label style={{ fontSize: 12 }}>
                {t.nameEn}
                <input
                  value={details.nameEn}
                  onChange={(e) => setDetails({ ...details, nameEn: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                />
              </label>
              <label style={{ fontSize: 12, gridColumn: '1 / -1' }}>
                {t.shortDe}
                <textarea
                  value={details.descriptionDe}
                  rows={5}
                  onChange={(e) => setDetails({ ...details, descriptionDe: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                />
              </label>
              <label style={{ fontSize: 12, gridColumn: '1 / -1' }}>
                {t.shortEn}
                <textarea
                  value={details.descriptionEn}
                  rows={5}
                  onChange={(e) => setDetails({ ...details, descriptionEn: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                />
              </label>
              <label style={{ fontSize: 12 }}>
                {t.size}
                <input
                  type="number"
                  value={details.floorSizeM2}
                  onChange={(e) => setDetails({ ...details, floorSizeM2: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                />
              </label>
              <label style={{ fontSize: 12 }}>
                {t.area}
                <select
                  value={details.area}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      area: (e.target.value || '') as MeetingAreaValue | '',
                    })
                  }
                  style={{ display: 'block', width: '100%', marginTop: 2 }}
                >
                  <option value="">—</option>
                  {MEETING_AREA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset
              style={{
                border: '1px solid var(--theme-elevation-150)',
                padding: 8,
                margin: '0 0 12px',
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <label style={{ fontSize: 12, display: 'flex', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={details.hasDaylight}
                  onChange={(e) => setDetails({ ...details, hasDaylight: e.target.checked })}
                />
                {t.hasDaylight}
              </label>
              <label style={{ fontSize: 12, display: 'flex', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={details.hasScreen}
                  onChange={(e) => setDetails({ ...details, hasScreen: e.target.checked })}
                />
                {t.hasScreen}
              </label>
              <label style={{ fontSize: 12, display: 'flex', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={details.hasProjector}
                  onChange={(e) => setDetails({ ...details, hasProjector: e.target.checked })}
                />
                {t.hasProjector}
              </label>
            </fieldset>

            <p style={{ fontSize: 11, color: 'var(--theme-elevation-800)', margin: '0 0 10px' }}>
              {t.richTextHint}
            </p>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--style-primary btn--size-small"
                onClick={() => void saveDetails()}
                disabled={savingDetails}
              >
                {savingDetails ? t.saving : t.save}
              </button>
              <a href={versionsUrl} style={{ fontSize: 13 }}>
                {t.versions}
              </a>
              <a href={siteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                {t.viewOnSite}
              </a>
              <a href={fullEditorUrl} style={{ fontSize: 13 }}>
                {t.openFull}
              </a>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

export default MeetingRoomsManagerPanel
