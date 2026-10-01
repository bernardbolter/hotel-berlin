'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { CompletenessIssue, CompletenessLocale } from '@/lib/completeness'
import type { HeroManagerCopy } from '@/lib/hero/copy'

export type HeroStripItem = {
  id: number
  order: number
  enabled: boolean
  thumbUrl: string | null
  caption: string
  issues: CompletenessIssue[]
}

type Props = {
  items: HeroStripItem[]
  selectedId: number | null
  onSelect: (id: number) => void
  onReorder: (liveIds: number[]) => Promise<void>
  onToggleEnabled: (id: number, enabled: boolean) => void
  t: HeroManagerCopy
  locale: CompletenessLocale
  announce: (msg: string) => void
}

function flagLabel(
  item: HeroStripItem,
  t: HeroManagerCopy,
  locale: CompletenessLocale,
): { mark: string; title: string } {
  const blocking = item.issues.filter((i) => i.severity === 'blocking')
  const warnings = item.issues.filter((i) => i.severity === 'warning')
  if (blocking.length) {
    return {
      mark: '✕',
      title: blocking.map((i) => i.message[locale]).join(' · '),
    }
  }
  if (warnings.length) {
    return {
      mark: '⚠',
      title: warnings.map((i) => i.message[locale]).join(' · '),
    }
  }
  return { mark: '✓', title: t.canEnable }
}

function SortableCard({
  item,
  selected,
  onSelect,
  onToggle,
  t,
  locale,
  draggable,
}: {
  item: HeroStripItem
  selected: boolean
  onSelect: () => void
  onToggle: () => void
  t: HeroManagerCopy
  locale: CompletenessLocale
  draggable: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !draggable,
  })
  const flag = flagLabel(item, t, locale)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : item.enabled ? 1 : 0.55,
    filter: item.enabled ? undefined : 'grayscale(0.6)',
    border: selected ? '2px solid var(--theme-success-500, #1a7f4b)' : '1px solid var(--theme-elevation-150)',
    borderRadius: 6,
    padding: 8,
    width: 120,
    flex: '0 0 auto',
    background: 'var(--theme-elevation-0)',
    cursor: 'pointer',
  }

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          fontSize: 11,
        }}
      >
        <button
          type="button"
          {...(draggable ? { ...attributes, ...listeners } : {})}
          aria-label={draggable ? `Ziehen, Position ${item.order}` : t.paused}
          style={{
            cursor: draggable ? 'grab' : 'default',
            border: 'none',
            background: 'transparent',
            padding: '0 4px',
            fontSize: 14,
            lineHeight: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <span>{item.enabled ? item.order : t.paused}</span>
      </div>
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: 'var(--theme-elevation-100)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        {item.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      <p
        style={{
          margin: '0 0 4px',
          fontSize: 10,
          lineHeight: 1.3,
          minHeight: 26,
          overflow: 'hidden',
        }}
      >
        {item.caption || '—'}
      </p>
      <p
        style={{ margin: '0 0 6px', fontSize: 12 }}
        title={flag.title}
        aria-label={flag.title}
      >
        {flag.mark}{' '}
        <span style={{ fontSize: 10, color: 'var(--theme-elevation-800)' }}>
          {flag.title.split(' · ')[0]}
        </span>
      </p>
      <label
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
        onClick={(e) => e.stopPropagation()}
      >
        <input type="checkbox" checked={item.enabled} onChange={onToggle} />
        {item.enabled ? t.live : t.paused}
      </label>
    </div>
  )
}

export function HeroStrip({
  items,
  selectedId,
  onSelect,
  onReorder,
  onToggleEnabled,
  t,
  locale,
  announce,
}: Props) {
  const live = items.filter((i) => i.enabled)
  const paused = items.filter((i) => !i.enabled)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = live.findIndex((i) => i.id === active.id)
    const newIndex = live.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(live, oldIndex, newIndex)
    announce(t.reorderLive(oldIndex + 1, newIndex + 1))
    await onReorder(next.map((i) => i.id))
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void handleDragEnd(e)}>
        <SortableContext items={live.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {live.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                selected={selectedId === item.id}
                onSelect={() => onSelect(item.id)}
                onToggle={() => onToggleEnabled(item.id, false)}
                t={t}
                locale={locale}
                draggable
              />
            ))}
            {paused.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                selected={selectedId === item.id}
                onSelect={() => onSelect(item.id)}
                onToggle={() => onToggleEnabled(item.id, true)}
                t={t}
                locale={locale}
                draggable={false}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default HeroStrip
