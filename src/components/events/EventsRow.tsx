import { CappedRow, CAPPED_EVENTS_MAX } from '@/components/primitives/CappedRow'
import { SpotlightCard } from '@/components/spotlight/SpotlightCard'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

type Props = {
  items: SpotlightCardProps[]
  ariaLabel: string
  className?: string
}

/**
 * One-row SpotlightCards. Column count lives on `CappedRow` (R1).
 * Tall 5:6 cards stay one column below 520 px.
 */
export function EventsRow({ items, ariaLabel, className = '' }: Props) {
  return (
    <CappedRow ariaLabel={ariaLabel} className={className} max={CAPPED_EVENTS_MAX} minCols={1}>
      {items.map((item, index) => (
        <li key={`${item.image.src}-${item.primaryMeta}-${index}`} className="min-w-0">
          <SpotlightCard {...item} className="w-full min-w-0!" />
        </li>
      ))}
    </CappedRow>
  )
}
