'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Gutter, useTranslation } from '@payloadcms/ui'

import { SortableList } from '@/components/admin/SortableList'
import { GuidedBackToDashboard } from '@/components/admin/guided/GuidedBackToDashboard'
import { RoomsManagerPanel } from '@/components/admin/RoomsManagerPanel'
import { mediaSizedUrl, mediaUrl } from '@/lib/media/url'
import { formatRoomPrice } from '@/lib/rooms/roomHero'
import {
  isRoomComplete,
  roomCompletenessIssues,
  type CompletenessImage,
} from '@/lib/rooms/roomCompleteness'
import { roomsManagerCopy } from '@/lib/rooms/roomsManagerCopy'

const SLIDE_SECONDS = 7
const SLIDER_WARN_MAX = 6

type RoomDoc = {
  id: number
  name?: string | null
  slug: string
  floorSizeM2?: number | null
  fromPrice?: number | null
  displayOrder?: number | null
  visibleOnSite?: boolean | null
  occupancy?: { maxTotal?: number | null; maxAdults?: number | null } | null
  homepageTeaser?: { enabled?: boolean | null; order?: number | null } | null
  images?: Array<{
    alt?: string | null
    shotType?: string | null
    image?:
      | number
      | {
          url?: string | null
          focalX?: number | null
          focalY?: number | null
          sizes?: { card?: { url?: string | null } | null }
        }
      | null
  }> | null
}

export type ManagerRoom = {
  id: number
  name: string
  slug: string
  sizeLabel: string
  guestsLabel: string
  priceLabel: string
  thumbUrl: string | null
  hasImages: boolean
  displayOrder: number
  sliderOrder: number | null
  inSlider: boolean
  visibleOnSite: boolean
  completenessImages: CompletenessImage[]
  complete: boolean
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function coverUrl(room: RoomDoc): string | null {
  const first = room.images?.[0]?.image
  if (!first || typeof first === 'number') return null
  return mediaSizedUrl(first, 'card') ?? mediaUrl(first)
}

function mapRoom(doc: RoomDoc, deAlts: Map<number, CompletenessImage[]>): ManagerRoom {
  const guests = doc.occupancy?.maxTotal ?? doc.occupancy?.maxAdults
  const deImgs = deAlts.get(doc.id) ?? []
  const completenessImages: CompletenessImage[] = (doc.images ?? []).map((row, i) => {
    const media = row.image && typeof row.image === 'object' ? row.image : null
    return {
      altEn: row.alt,
      altDe: deImgs[i]?.altDe ?? null,
      shotType: row.shotType,
      focalX: media?.focalX,
      focalY: media?.focalY,
    }
  })
  return {
    id: doc.id,
    name: doc.name?.trim() || doc.slug,
    slug: doc.slug,
    sizeLabel: doc.floorSizeM2 != null ? `${doc.floorSizeM2} m²` : '–',
    guestsLabel: guests != null ? String(guests) : '–',
    priceLabel: formatRoomPrice(doc.fromPrice, 'en'),
    thumbUrl: coverUrl(doc),
    hasImages: Boolean(doc.images?.length),
    displayOrder: doc.displayOrder ?? 9999,
    sliderOrder: doc.homepageTeaser?.order ?? null,
    inSlider: Boolean(doc.homepageTeaser?.enabled),
    visibleOnSite: doc.visibleOnSite !== false,
    completenessImages,
    complete: isRoomComplete(completenessImages),
  }
}

async function postReorder(
  path: '/api/rooms/reorder-page' | '/api/rooms/reorder-slider',
  ids: number[],
): Promise<boolean> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  return res.ok
}

function CompletenessDot({
  complete,
  issues,
  completeLabel,
  incompleteLabel,
}: {
  complete: boolean
  issues: string[]
  completeLabel: string
  incompleteLabel: string
}) {
  const title = complete ? completeLabel : issues.join('\n')
  return (
    <span
      title={title}
      aria-label={complete ? completeLabel : `${incompleteLabel}: ${issues.join('; ')}`}
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        flex: '0 0 auto',
        background: complete
          ? 'var(--theme-success-500, #1a7f4b)'
          : 'var(--theme-warning-500, #c47d0e)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
      }}
    />
  )
}

function RoomRow({
  room,
  badge,
  dragHandleProps,
  moveUp,
  moveDown,
  action,
  selected,
  onSelect,
  t,
}: {
  room: ManagerRoom
  badge?: string | null
  dragHandleProps: Record<string, unknown>
  moveUp: () => void
  moveDown: () => void
  action?: ReactNode
  selected?: boolean
  onSelect?: () => void
  t: ReturnType<typeof roomsManagerCopy>
}) {
  const issues = roomCompletenessIssues(room.completenessImages, t)
  return (
    <div
      role="listitem"
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('button, a')) return
        onSelect?.()
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 64,
        padding: '0 8px',
        border: selected
          ? '1px solid var(--theme-elevation-800)'
          : '1px solid var(--theme-elevation-150)',
        borderRadius: 3,
        background: selected ? 'var(--theme-elevation-50)' : 'var(--theme-elevation-0)',
        cursor: onSelect ? 'pointer' : undefined,
      }}
    >
      <button
        type="button"
        aria-label={`Drag ${room.name}`}
        {...dragHandleProps}
        style={{
          border: 'none',
          background: 'transparent',
          padding: '2px 4px',
          fontSize: 14,
          lineHeight: 1,
          ...(dragHandleProps.style as object | undefined),
        }}
      >
        ⠿
      </button>
      <div style={{ display: 'flex', gap: 2 }}>
        <button
          type="button"
          aria-label={`Move ${room.name} up`}
          onClick={moveUp}
          className="btn btn--style-secondary btn--size-small"
          style={{ padding: '0 5px', minWidth: 22, height: 22, fontSize: 11 }}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Move ${room.name} down`}
          onClick={moveDown}
          className="btn btn--style-secondary btn--size-small"
          style={{ padding: '0 5px', minWidth: 22, height: 22, fontSize: 11 }}
        >
          ↓
        </button>
      </div>
      <div
        style={{
          width: 64,
          height: 48,
          borderRadius: 2,
          overflow: 'hidden',
          background: 'var(--theme-elevation-100)',
          flex: '0 0 auto',
        }}
      >
        {room.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.thumbUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      <CompletenessDot
        complete={room.complete}
        issues={issues}
        completeLabel={t.complete}
        incompleteLabel={t.incomplete}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'nowrap',
          overflow: 'hidden',
          fontSize: 13,
        }}
      >
        <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {room.name}
        </strong>
        <span style={{ color: 'var(--theme-elevation-800)', whiteSpace: 'nowrap' }}>
          {room.sizeLabel} · {room.guestsLabel} {t.guests} · {t.from} {room.priceLabel}
        </span>
        {badge ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '1px 5px',
              borderRadius: 2,
              background: 'var(--theme-elevation-100)',
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        ) : null}
        {!room.hasImages ? (
          <span style={{ fontSize: 12, color: 'var(--theme-error-500, #b30d0d)', whiteSpace: 'nowrap' }}>
            {t.noImages}
          </span>
        ) : null}
        {!room.visibleOnSite ? (
          <span style={{ fontSize: 11, color: 'var(--theme-elevation-800)', whiteSpace: 'nowrap' }}>
            hidden
          </span>
        ) : null}
      </div>
      {action}
    </div>
  )
}

function SaveIndicator({
  state,
  t,
}: {
  state: SaveState
  t: ReturnType<typeof roomsManagerCopy>
}) {
  if (state === 'idle') return null
  const label =
    state === 'saving' ? t.saving : state === 'saved' ? t.saved : t.saveError
  const color =
    state === 'error'
      ? 'var(--theme-error-500, #b30d0d)'
      : state === 'saved'
        ? 'var(--theme-success-500, #1a7f4b)'
        : 'var(--theme-elevation-800)'
  return (
    <span style={{ fontSize: 12, color, marginLeft: 8 }} aria-live="polite">
      {label}
    </span>
  )
}

export function RoomsManagerClient() {
  const { i18n } = useTranslation()
  const t = roomsManagerCopy(i18n?.language)
  const [rooms, setRooms] = useState<ManagerRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sliderSave, setSliderSave] = useState<SaveState>('idle')
  const [pageSave, setPageSave] = useState<SaveState>('idle')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [enRes, deRes] = await Promise.all([
        fetch('/api/rooms?limit=100&depth=2&locale=en&sort=displayOrder', {
          credentials: 'include',
        }),
        fetch('/api/rooms?limit=100&depth=1&locale=de&sort=displayOrder', {
          credentials: 'include',
        }),
      ])
      if (!enRes.ok) throw new Error(`Failed to load rooms (${enRes.status})`)
      const enData = (await enRes.json()) as { docs: RoomDoc[] }
      const deData = deRes.ok
        ? ((await deRes.json()) as { docs: RoomDoc[] })
        : { docs: [] as RoomDoc[] }
      const deAlts = new Map<number, CompletenessImage[]>()
      for (const doc of deData.docs) {
        deAlts.set(
          doc.id,
          (doc.images ?? []).map((row) => ({ altDe: row.alt })),
        )
      }
      setRooms(enData.docs.map((d) => mapRoom(d, deAlts)))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t.errGeneric)
    } finally {
      setLoading(false)
    }
  }, [t.errGeneric])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => rooms.find((r) => r.id === selectedId) ?? null,
    [rooms, selectedId],
  )

  const sliderRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.inSlider)
        .sort((a, b) => (a.sliderOrder ?? 0) - (b.sliderOrder ?? 0) || a.id - b.id),
    [rooms],
  )

  const availableRooms = useMemo(
    () => rooms.filter((r) => !r.inSlider).sort((a, b) => a.displayOrder - b.displayOrder),
    [rooms],
  )

  const pageRooms = useMemo(
    () => [...rooms].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id),
    [rooms],
  )

  const flash = (set: (s: SaveState) => void, next: SaveState) => {
    set(next)
    if (next === 'saved') {
      window.setTimeout(() => set('idle'), 1600)
    }
  }

  const persistSlider = async (ids: number[], previous: ManagerRoom[]) => {
    flash(setSliderSave, 'saving')
    const ok = await postReorder('/api/rooms/reorder-slider', ids)
    if (!ok) {
      setRooms(previous)
      flash(setSliderSave, 'error')
      return
    }
    setRooms((current) =>
      current.map((room) => {
        const index = ids.indexOf(room.id)
        if (index >= 0) {
          return { ...room, inSlider: true, sliderOrder: index + 1 }
        }
        return { ...room, inSlider: false, sliderOrder: null }
      }),
    )
    flash(setSliderSave, 'saved')
  }

  const persistPage = async (ids: number[], previous: ManagerRoom[]) => {
    flash(setPageSave, 'saving')
    const ok = await postReorder('/api/rooms/reorder-page', ids)
    if (!ok) {
      setRooms(previous)
      flash(setPageSave, 'error')
      return
    }
    setRooms((current) =>
      current.map((room) => {
        const index = ids.indexOf(room.id)
        if (index < 0) return room
        return { ...room, displayOrder: (index + 1) * 10 }
      }),
    )
    flash(setPageSave, 'saved')
  }

  const onSliderReorder = async (ids: number[]) => {
    const previous = rooms
    setRooms((current) =>
      current.map((room) => {
        const index = ids.indexOf(room.id)
        if (index >= 0) return { ...room, inSlider: true, sliderOrder: index + 1 }
        if (room.inSlider) return { ...room, inSlider: false, sliderOrder: null }
        return room
      }),
    )
    await persistSlider(ids, previous)
  }

  const addToSlider = async (id: number) => {
    const previous = rooms
    const nextIds = [...sliderRooms.map((r) => r.id), id]
    setRooms((current) =>
      current.map((room) =>
        room.id === id ? { ...room, inSlider: true, sliderOrder: nextIds.length } : room,
      ),
    )
    await persistSlider(nextIds, previous)
  }

  const removeFromSlider = async (id: number) => {
    const previous = rooms
    const nextIds = sliderRooms.filter((r) => r.id !== id).map((r) => r.id)
    setRooms((current) =>
      current.map((room) =>
        room.id === id ? { ...room, inSlider: false, sliderOrder: null } : room,
      ),
    )
    await persistSlider(nextIds, previous)
  }

  const onPageReorder = async (ids: number[]) => {
    const previous = rooms
    setRooms((current) =>
      current.map((room) => {
        const index = ids.indexOf(room.id)
        if (index < 0) return room
        return { ...room, displayOrder: (index + 1) * 10 }
      }),
    )
    await persistPage(ids, previous)
  }

  const loopSeconds = sliderRooms.length * SLIDE_SECONDS

  if (loading) {
    return <p style={{ padding: '24px 0' }}>{t.loading}</p>
  }

  if (loadError) {
    return (
      <p style={{ padding: '24px 0', color: 'var(--theme-error-500, #b30d0d)' }}>
        {loadError}{' '}
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={() => void load()}
        >
          {t.retry}
        </button>
      </p>
    )
  }

  return (
    <Gutter>
      <div
        style={{
          padding: '16px 0 32px',
          display: 'flex',
          gap: 0,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, maxWidth: selected ? undefined : 920 }}>
          <header style={{ marginBottom: 16 }}>
            <GuidedBackToDashboard />
            <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>{t.title}</h1>
            <p style={{ margin: 0, color: 'var(--theme-elevation-800)', fontSize: 13 }}>
              {t.intro}
            </p>
          </header>

          <section style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{t.sliderHeading}</h2>
              <SaveIndicator state={sliderSave} t={t} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--theme-elevation-800)' }}>
              {t.sliderCount(sliderRooms.length, loopSeconds)}
            </p>
            {sliderRooms.length === 0 ? (
              <p
                role="status"
                style={{
                  margin: '0 0 8px',
                  padding: '8px 10px',
                  background: 'var(--theme-warning-50, #fff8e6)',
                  border: '1px solid var(--theme-warning-200, #f0d78c)',
                  fontSize: 12,
                }}
              >
                {t.sliderEmpty}
              </p>
            ) : null}
            {sliderRooms.length > SLIDER_WARN_MAX ? (
              <p
                role="status"
                style={{
                  margin: '0 0 8px',
                  padding: '8px 10px',
                  background: 'var(--theme-warning-50, #fff8e6)',
                  border: '1px solid var(--theme-warning-200, #f0d78c)',
                  fontSize: 12,
                }}
              >
                {t.sliderWarn(SLIDER_WARN_MAX)}
              </p>
            ) : null}

            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => {
                e.preventDefault()
                const id = Number(e.dataTransfer.getData('application/x-room-id'))
                if (!Number.isFinite(id)) return
                if (sliderRooms.some((r) => r.id === id)) return
                void addToSlider(id)
              }}
            >
              <SortableList
                items={sliderRooms}
                onReorder={onSliderReorder}
                ariaLabel={t.sliderHeading}
                style={{ gap: 4 }}
                renderItem={(room, controls) => (
                  <RoomRow
                    room={room}
                    t={t}
                    selected={selectedId === room.id}
                    onSelect={() => setSelectedId(room.id)}
                    dragHandleProps={controls.dragHandleProps}
                    moveUp={controls.moveUp}
                    moveDown={controls.moveDown}
                    action={
                      <button
                        type="button"
                        className="btn btn--style-secondary btn--size-small"
                        onClick={() => void removeFromSlider(room.id)}
                      >
                        {t.remove}
                      </button>
                    }
                  />
                )}
              />
              {sliderRooms.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)', padding: '8px 0' }}>
                  {t.dropHint}
                </p>
              ) : null}
            </div>

            <h3 style={{ margin: '14px 0 4px', fontSize: 13 }}>{t.availableHeading}</h3>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--theme-elevation-800)' }}>
              {t.availableHint}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} role="list">
              {availableRooms.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--theme-elevation-800)' }}>
                  {t.allInSlider}
                </p>
              ) : (
                availableRooms.map((room) => (
                  <div
                    key={room.id}
                    role="listitem"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-room-id', String(room.id))
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('button')) return
                      setSelectedId(room.id)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 64,
                      padding: '0 8px',
                      border:
                        selectedId === room.id
                          ? '1px solid var(--theme-elevation-800)'
                          : '1px dashed var(--theme-elevation-150)',
                      borderRadius: 3,
                      cursor: 'grab',
                      background:
                        selectedId === room.id
                          ? 'var(--theme-elevation-50)'
                          : 'transparent',
                    }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 14, padding: '0 2px' }}>
                      ⠿
                    </span>
                    <div
                      style={{
                        width: 64,
                        height: 48,
                        borderRadius: 2,
                        overflow: 'hidden',
                        background: 'var(--theme-elevation-100)',
                        flex: '0 0 auto',
                      }}
                    >
                      {room.thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={room.thumbUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>
                    <CompletenessDot
                      complete={room.complete}
                      issues={roomCompletenessIssues(room.completenessImages, t)}
                      completeLabel={t.complete}
                      incompleteLabel={t.incomplete}
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <strong
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {room.name}
                      </strong>
                      {!room.hasImages ? (
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--theme-error-500, #b30d0d)',
                          }}
                        >
                          {t.noImages}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn btn--style-primary btn--size-small"
                      onClick={() => void addToSlider(room.id)}
                    >
                      {t.add}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{t.pageHeading}</h2>
              <SaveIndicator state={pageSave} t={t} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--theme-elevation-800)' }}>
              {t.pageHint}
            </p>
            <SortableList
              items={pageRooms}
              onReorder={onPageReorder}
              ariaLabel={t.pageHeading}
              style={{ gap: 4 }}
              renderItem={(room, controls) => (
                <RoomRow
                  room={room}
                  t={t}
                  badge={room.inSlider ? t.inSlider : null}
                  selected={selectedId === room.id}
                  onSelect={() => setSelectedId(room.id)}
                  dragHandleProps={controls.dragHandleProps}
                  moveUp={controls.moveUp}
                  moveDown={controls.moveDown}
                />
              )}
            />
          </section>
        </div>

        {selected ? (
          <RoomsManagerPanel
            roomId={selected.id}
            roomName={selected.name}
            roomSlug={selected.slug}
            onClose={() => setSelectedId(null)}
            onRoomUpdated={() => void load()}
          />
        ) : null}
      </div>
    </Gutter>
  )
}

export default RoomsManagerClient
