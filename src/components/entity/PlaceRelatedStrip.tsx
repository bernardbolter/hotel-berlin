import { Link } from '@/i18n/routing'
import { tripMetaLine } from '@/lib/entity/computed/formatTrip'
import type { Trip } from '@/lib/entity/computed/types'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { RelatedBandSource, RelatedStripItem } from '@/lib/entity/relatedBand'

type Props = {
  items: Array<RelatedStripItem & { trip: Trip; categoryLabel: string }>
  source: RelatedBandSource
  locale: 'de' | 'en'
  personTokenFill?: string
}

export function PlaceRelatedStrip({ items, source, locale, personTokenFill }: Props) {
  return (
    <ul className="place-c-strip">
      {items.map((item) => {
        const meta = tripMetaLine(item.trip, item.categoryLabel, locale)
        const num =
          source === 'endorser' && item.editorIndex != null
            ? String(item.editorIndex).padStart(2, '0')
            : null

        return (
          <li key={item.slug} className="place-c-strip__cell">
            {num ? (
              <span
                className="place-c-strip__num"
                style={personTokenFill ? { color: personTokenFill } : undefined}
              >
                {num}
              </span>
            ) : (
              <span
                className="place-c-strip__chip"
                style={{ backgroundColor: pinColorForCategory(item.category) }}
              >
                {item.categoryLabel}
              </span>
            )}
            <h3 className="place-c-strip__title">
              <Link
                href={{ pathname: '/neighbourhood/[slug]', params: { slug: item.slug } }}
                className="hover:underline"
              >
                {item.name}
              </Link>
            </h3>
            {item.quote ? (
              <p className="place-c-strip__quote">{item.quote}</p>
            ) : null}
            {item.quoteByName ? (
              <p className="place-c-strip__by">{item.quoteByName}</p>
            ) : null}
            <p className="place-c-strip__meta">{meta}</p>
          </li>
        )
      })}
    </ul>
  )
}
