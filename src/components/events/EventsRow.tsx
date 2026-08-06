'use client'

import { useEffect, useRef, useState } from 'react'

import { SpotlightCard } from '@/components/spotlight/SpotlightCard'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

/** Design min — cards never shrink below the original SpotlightCard width. */
const MIN_CARD_PX = 250
/** Floor gap between cards (not at the row ends). */
const MIN_GAP_PX = 20
/** Share of leftover width that grows gaps vs cards (rest goes to card growth via 1fr). */
const GAP_SHARE = 0.28
const MAX_GAP_PX = 48

type Props = {
  items: SpotlightCardProps[]
  ariaLabel: string
  className?: string
}

function columnCount(width: number, itemCount: number): number {
  if (width <= 0 || itemCount <= 0) return 1
  // n * minCard + (n - 1) * minGap <= width
  const n = Math.floor((width + MIN_GAP_PX) / (MIN_CARD_PX + MIN_GAP_PX))
  return Math.min(itemCount, Math.max(1, n))
}

function gapForRow(width: number, cols: number): number {
  if (cols <= 1) return 0
  const free = Math.max(0, width - cols * MIN_CARD_PX - (cols - 1) * MIN_GAP_PX)
  const boost = (free * GAP_SHARE) / (cols - 1)
  return Math.min(MAX_GAP_PX, MIN_GAP_PX + boost)
}

/**
 * One-row SpotlightCards that fill the container width.
 * 250px is the minimum card width; cards and inter-card gaps grow until
 * another card fits at that minimum, then a new column is added.
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

  return (
    <ul
      ref={listRef}
      role="list"
      aria-label={ariaLabel}
      className={['grid w-full', className].filter(Boolean).join(' ')}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(${MIN_CARD_PX}px, 1fr))`,
        columnGap: `${gapPx}px`,
      }}
    >
      {visible.map((item, index) => (
        <li key={`${item.image.src}-${item.primaryMeta}-${index}`} className="min-w-0">
          <SpotlightCard {...item} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
