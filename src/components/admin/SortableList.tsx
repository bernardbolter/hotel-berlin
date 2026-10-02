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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'

export type SortableListItem = {
  id: number
}

type RenderControls = {
  dragHandleProps: Record<string, unknown>
  moveUp: () => void
  moveDown: () => void
  index: number
  isDragging: boolean
}

type Props<T extends SortableListItem> = {
  items: T[]
  onReorder: (ids: number[]) => void | Promise<void>
  renderItem: (item: T, controls: RenderControls) => ReactNode
  /** Accessible name for the list region. */
  ariaLabel?: string
  className?: string
  disabled?: boolean
  /** Vertical list (default) or wrapping thumbnail grid. */
  layout?: 'list' | 'grid'
  style?: CSSProperties
}

function SortableRow<T extends SortableListItem>({
  item,
  index,
  total,
  disabled,
  onMove,
  renderItem,
}: {
  item: T
  index: number
  total: number
  disabled: boolean
  onMove: (from: number, to: number) => void
  renderItem: (item: T, controls: RenderControls) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  }

  const dragHandleProps = disabled
    ? {}
    : {
        ...attributes,
        ...listeners,
        style: { cursor: 'grab' as const },
      }

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, {
        dragHandleProps,
        moveUp: () => {
          if (index > 0) onMove(index, index - 1)
        },
        moveDown: () => {
          if (index < total - 1) onMove(index, index + 1)
        },
        index,
        isDragging,
      })}
    </div>
  )
}

/**
 * Sortable list (dnd-kit) with up/down keyboard/touch alternatives.
 * `layout="grid"` uses rect sorting for thumbnail strips.
 */
export function SortableList<T extends SortableListItem>({
  items,
  onReorder,
  renderItem,
  ariaLabel,
  className,
  disabled = false,
  layout = 'list',
  style,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const applyReorder = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return
    const next = arrayMove(items, from, to)
    await onReorder(next.map((i) => i.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    await applyReorder(oldIndex, newIndex)
  }

  const listStyle: CSSProperties =
    layout === 'grid'
      ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
          ...style,
        }
      : { display: 'flex', flexDirection: 'column', gap: 4, ...style }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className} role="list" aria-label={ariaLabel} style={listStyle}>
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              disabled={disabled}
              onMove={(from, to) => void applyReorder(from, to)}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default SortableList
