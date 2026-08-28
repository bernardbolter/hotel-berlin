'use client'

import { useEffect, useRef, useState } from 'react'

import { SpotlightCard } from '@/components/spotlight/SpotlightCard'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

/** Design min for 1–3 cards. */
const MIN_CARD_PX = 250
/** Floor gap between cards (not at the row ends). */
const MIN_GAP_PX = 20
/** Share of leftover width that grows gaps vs cards (rest goes to card growth via 1fr). */
const GAP_SHARE = 0.28
const MAX_GAP_PX = 48
const MAX_COLS = 4

/** Measured row width → column count. Padding lives on the section, not this list. */
const COL_BREAKPOINTS = [
  { cols: 2, minWidth: 520 },
  { cols: 3, minWidth: 760 },
  { cols: 4, minWidth: 920 },
] as const

type Props = {
  items: SpotlightCardProps[]
  ariaLabel: string
  className?: string
}

function columnCount(width: number, itemCount: number): number {
  if (width <= 0 || itemCount <= 0) return 1
  const max = Math.min(itemCount, MAX_COLS)
  let n = 1
  for (const step of COL_BREAKPOINTS) {
    if (width >= step.minWidth) n = step.cols
  }
  return Math.min(max, n)
}

function gapForRow(width: number, cols: number): number {
  if (cols <= 1) return 0
  const free = Math.max(0, width - cols * MIN_CARD_PX - (cols - 1) * MIN_GAP_PX)
  const boost = (free * GAP_SHARE) / (cols - 1)
  return Math.min(MAX_GAP_PX, MIN_GAP_PX + boost)
}

/**
 * One-row SpotlightCards that fill the container width.
 * Adds columns 1 → 2 → 3 → 4 as soon as another card fits; extras stay hidden.
 */
export function EventsRow({ items, ariaLabel, className = '' }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const [cols, setCols] = useState(1)
  const [gapPx, setGapPx] = useState(MIN_GAP_PX)

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const update = (width: number) => {
      const nextCols = columnCount(width, items.length)
      setCols(nextCols)
      setGapPx(gapForRow(width, nextCols))
    }

    update(el.clientWidth)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      update(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [items.length])

  const visible = items.slice(0, cols)
  const minTrack = cols >= 4 ? 0 : MIN_CARD_PX

  return (
    <ul
      ref={listRef}
      role="list"
      aria-label={ariaLabel}
      className={['grid w-full items-start', className].filter(Boolean).join(' ')}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(${minTrack}px, 1fr))`,
        columnGap: `${gapPx}px`,
      }}
    >
      {visible.map((item, index) => (
        <li key={`${item.image.src}-${item.primaryMeta}-${index}`} className="min-w-0">
          <SpotlightCard {...item} className="w-full min-w-0!" />
        </li>
      ))}
    </ul>
  )
}
