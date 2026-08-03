'use client'

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

const ROW_UNIT = 8
const GAP = 16

type SpotlightGridProps = {
  children: ReactNode
  className?: string
}

/**
 * CSS Grid masonry that preserves DOM order == visual order.
 * Row span is measured from real card height after fonts/images settle.
 */
export function SpotlightGrid({ children, className = '' }: SpotlightGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = () =>
      Array.from(grid.querySelectorAll<HTMLElement>(':scope > .spotlight-grid__item'))

    const setRowSpan = (item: HTMLElement) => {
      item.style.gridRowEnd = 'auto'
      const height = item.getBoundingClientRect().height
      const span = Math.max(1, Math.ceil((height + GAP) / (ROW_UNIT + GAP)))
      item.style.gridRowEnd = `span ${span}`
    }

    const pack = () => {
      items().forEach(setRowSpan)
    }

    const observers: ResizeObserver[] = []
    const imageCleanups: Array<() => void> = []

    const watch = () => {
      observers.forEach((o) => o.disconnect())
      observers.length = 0
      imageCleanups.forEach((fn) => fn())
      imageCleanups.length = 0

      for (const item of items()) {
        const ro = new ResizeObserver(() => setRowSpan(item))
        ro.observe(item)
        observers.push(ro)

        for (const img of item.querySelectorAll('img')) {
          if (!img.complete) {
            const onLoad = () => pack()
            img.addEventListener('load', onLoad)
            imageCleanups.push(() => img.removeEventListener('load', onLoad))
          }
        }
      }
      pack()
    }

    watch()
    void document.fonts?.ready.then(pack)

    const mo = new MutationObserver(watch)
    mo.observe(grid, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      observers.forEach((o) => o.disconnect())
      imageCleanups.forEach((fn) => fn())
    }
  }, [children])

  return (
    <div
      ref={gridRef}
      className={`spotlight-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gridAutoRows: `${ROW_UNIT}px`,
        gap: `${GAP}px`,
      }}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child
        return (
          <div className="spotlight-grid__item min-w-0" style={{ gridRowEnd: 'span 1' }}>
            {child}
          </div>
        )
      })}
    </div>
  )
}
