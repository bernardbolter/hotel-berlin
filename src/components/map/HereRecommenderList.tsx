import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { Link } from '@/i18n/routing'

export type HereRecommender = {
  placeId: string
  placeName: string
  placeMeta: string
  person: {
    name: string
    givenName: string
    slug: string
    initials: string
    portraitUrl: string | null
  }
}

type Props = {
  items: HereRecommender[]
  recommendsLabel: (name: string) => string
  ariaLabel: string
}

/**
 * Compact /here map list — recommender leads (avatar + “[name] recommends”),
 * then place, then walk/category. Condensed vs EndorsementChipList.
 */
export function HereRecommenderList({ items, recommendsLabel, ariaLabel }: Props) {
  if (items.length === 0) return null

  return (
    <ul role="list" aria-label={ariaLabel} className="divide-y divide-[#D8DCE0] px-3.5 py-1">
      {items.map((item) => (
        <li key={`${item.placeId}-${item.person.slug}`}>
          <Link
            href={{
              pathname: '/you-me-berlin/[slug]',
              params: { slug: item.person.slug },
            }}
            className="flex items-center gap-2.5 py-2.5 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctx-accent-text"
          >
            <InitialsAvatar
              name={item.person.name}
              initials={item.person.initials}
              portraitUrl={item.person.portraitUrl}
              size="md"
            />
            <span className="min-w-0">
              <span className="block font-ui text-[10px] font-bold uppercase tracking-[0.03em] text-ctx-accent-text">
                {recommendsLabel(item.person.givenName)}
              </span>
              <span className="block font-ui text-[13px] font-bold text-[#1A2B4A]">
                {item.placeName}
              </span>
              {item.placeMeta ? (
                <span className="block font-ui text-[11px] text-[#6B7C8D]">{item.placeMeta}</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
