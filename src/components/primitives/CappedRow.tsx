import { Children, type ReactNode } from 'react'

export const CAPPED_MAX = 6
export const CAPPED_EVENTS_MAX = 4

type MinCols = 1 | 2

type Props = {
  children: ReactNode
  ariaLabel: string
  className?: string
  /** Server-rendered cap. Default 6. */
  max?: number
  /** Events: 1 (tall cards). Amenities: 2 (short hub cards). */
  minCols?: MinCols
}

/**
 * One-row grid: as many columns as fit, never a partial last row.
 * Breakpoints (R1): &lt;520 → minCols · ≥520 → 2 · ≥760 → 3 · ≥920 → 4.
 * Extra items stay in the HTML and are hidden with CSS `:nth-child`.
 *
 * `data-count` / `data-min-cols` live on the list (the container-query
 * subject). The wrapper is the `@container` — queries cannot target it.
 */
export function CappedRow({
  children,
  ariaLabel,
  className = '',
  max = CAPPED_MAX,
  minCols = 1,
}: Props) {
  const items = Children.toArray(children).slice(0, Math.max(1, max))
  const count = items.length

  return (
    <div className={['capped-row', className].filter(Boolean).join(' ')}>
      <ul
        role="list"
        aria-label={ariaLabel}
        className="capped-row__list"
        data-count={count}
        data-min-cols={minCols}
      >
        {items}
      </ul>
    </div>
  )
}
