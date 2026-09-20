import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import { CATEGORY_TOKENS, type CategoryToken } from '@/lib/spotlight/categoryTokens'
import type { AgendaRow } from '@/lib/events/agenda'

type Copy = {
  allDay: string
  details: string
}

type Props = {
  row: AgendaRow
  copy: Copy
}

export function AgendaRow({ row, copy }: Props) {
  const token = CATEGORY_TOKENS[(row.categoryToken as CategoryToken) ?? 'other'] ?? CATEGORY_TOKENS.other
  const time = row.allDay ? copy.allDay : row.timeLabel
  const venue = [row.venueShort, row.floor].filter(Boolean).join(' · ')
  const price = row.price

  return (
    <Link href={toAppHref(row.href)} className="events-agenda-row">
      <time className="events-agenda-row__time" dateTime={row.allDay ? row.dateKey : undefined}>
        {time}
      </time>
      {row.category ? (
        <span className="events-agenda-row__chip" style={{ background: token.fill, color: token.onFill }}>
          {row.category}
        </span>
      ) : (
        <span className="events-agenda-row__chip events-agenda-row__chip--empty" />
      )}
      <span className="events-agenda-row__title">{row.title}</span>
      <span className="events-agenda-row__venue">{venue}</span>
      <span className="events-agenda-row__price">{price}</span>
      <span className="events-agenda-row__cta">{copy.details}</span>
    </Link>
  )
}
