import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { Link } from '@/i18n/routing'
import { safeMediaUrl } from '@/lib/entity/mediaUrl'
import { mediaFileUrl } from '@/lib/map/toMapPlace'
import { personInitials } from '@/lib/people/initials'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import {
  categoryTokenForPersonType,
  resolveCategoryToken,
} from '@/lib/spotlight/categoryTokens'
import type { Person } from '@/payload-types'

export type PlaceEndorsement = {
  person: Person
  quote: string | null
}

type Props = {
  locale: 'de' | 'en'
  placeName: string
  category: PlaceCategory
  categoryLabel: string
  endorsements: PlaceEndorsement[]
  /** Total places the lead endorser recommends */
  leadPickCount: number
  /** Walk sentence for no-quote / no-endorser fallbacks */
  walkSentence: string | null
  description?: string | null
  labels: {
    recommends: string
    fromHotel: string
    alsoRecommendedBy: string
    andMore: (n: number) => string
    recommendsPlaces: (count: number) => string
  }
}

/**
 * Direction C note: person-first recommendation with the place as the object.
 */
export function PlaceNote({
  placeName,
  category,
  categoryLabel,
  endorsements,
  leadPickCount,
  walkSentence,
  description,
  labels,
}: Props) {
  const lead = endorsements[0] ?? null
  const others = endorsements.slice(1)
  const shownOthers = others.slice(0, 3)
  const moreCount = Math.max(0, others.length - 3)

  const personToken = lead
    ? resolveCategoryToken(categoryTokenForPersonType(lead.person.type))
    : null
  const placeColor = pinColorForCategory(category)
  const hasQuote = Boolean(lead?.quote?.trim())
  const bigText = hasQuote ? lead!.quote!.trim() : walkSentence

  const portraitUrl = lead ? safeMediaUrl(mediaFileUrl(lead.person.portrait)) : null

  return (
    <aside className="place-note">
      {lead ? (
        <Link
          href={{ pathname: '/you-me-berlin/[slug]', params: { slug: lead.person.slug } }}
          className="place-note__who"
        >
          <InitialsAvatar
            name={lead.person.name}
            initials={personInitials(lead.person.name)}
            portraitUrl={portraitUrl}
            portraitAlt={lead.person.name}
            fill={personToken?.fill}
            className="place-note__avatar"
            style={{ width: 58, height: 58, fontSize: 16 }}
          />
          <span className="place-note__who-text">
            <span className="place-note__who-name">{lead.person.name}</span>
            <span className="place-note__who-meta">
              {[lead.person.jobTitle, labels.recommendsPlaces(leadPickCount)]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
        </Link>
      ) : null}

      <p
        className="place-note__label"
        style={personToken ? { color: personToken.fill } : undefined}
      >
        {lead ? labels.recommends : labels.fromHotel}
      </p>

      {bigText ? (
        <blockquote className="place-note__quote">
          <p>{bigText}</p>
          {lead && hasQuote ? (
            <cite className="sr-only">{lead.person.name}</cite>
          ) : null}
        </blockquote>
      ) : null}

      <div className="place-note__object">
        <span className="place-note__chip" style={{ backgroundColor: placeColor }}>
          {categoryLabel}
        </span>
        <h1 className="place-note__title">{placeName}</h1>
      </div>

      {!lead && description ? (
        <p className="place-note__desc">{description}</p>
      ) : null}

      {shownOthers.length > 0 ? (
        <div className="place-note__also">
          <p className="place-note__also-label">{labels.alsoRecommendedBy}</p>
          <ul className="place-note__also-list">
            {shownOthers.map((entry) => {
              const token = resolveCategoryToken(categoryTokenForPersonType(entry.person.type))
              const url = safeMediaUrl(mediaFileUrl(entry.person.portrait))
              return (
                <li key={entry.person.slug} className="place-note__also-row">
                  <InitialsAvatar
                    name={entry.person.name}
                    initials={personInitials(entry.person.name)}
                    portraitUrl={url}
                    portraitAlt={entry.person.name}
                    fill={token.fill}
                    style={{ width: 32, height: 32, fontSize: 11 }}
                  />
                  <div className="min-w-0">
                    <Link
                      href={{
                        pathname: '/you-me-berlin/[slug]',
                        params: { slug: entry.person.slug },
                      }}
                      className="place-note__also-name"
                    >
                      {entry.person.name}
                    </Link>
                    {entry.quote?.trim() ? (
                      <p className="place-note__also-quote">{entry.quote.trim()}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
          {moreCount > 0 ? (
            <p className="place-note__also-more">{labels.andMore(moreCount)}</p>
          ) : null}
        </div>
      ) : null}
    </aside>
  )
}
