import { EventCard, type EventCardProps } from './EventCard'

type Props = {
  items: EventCardProps[]
  ariaLabel: string
  className?: string
}

/** Horizontal scrolling row of event cards — homepage scaffold. */
export function EventsRow({ items, ariaLabel, className = '' }: Props) {
  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={[
        'flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <li key={`${item.href}-${item.title}`} className="shrink-0">
          <EventCard {...item} />
        </li>
      ))}
    </ul>
  )
}
