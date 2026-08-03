import { EventCard, type EventCardProps } from './EventCard'

type Props = {
  items: EventCardProps[]
  ariaLabel: string
  className?: string
}

/**
 * Masonry-style grid stub for the future happenings page.
 * Columns only for now — refine column spans / packing later.
 */
export function EventsMasonry({ items, ariaLabel, className = '' }: Props) {
  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={[
        'columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <li key={`${item.href}-${item.title}`} className="mb-4 break-inside-avoid">
          <EventCard {...item} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
