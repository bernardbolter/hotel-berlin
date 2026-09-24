import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { Link } from '@/i18n/routing'
import type { HeroQuote } from '@/lib/entity/personHero'
import { personInitials } from '@/lib/people/initials'
import {
  categoryTokenForPersonType,
  resolveCategoryToken,
} from '@/lib/spotlight/categoryTokens'

type Props = {
  name: string
  personType: string
  jobTitle?: string | null
  basedIn?: string | null
  roomLine?: string | null
  placesCount: number
  placesLabel: string
  heroQuote: HeroQuote | null
  portraitUrl?: string | null
  portraitAlt?: string
  personSlug: string
  mapCta: string
  onPlaceLabel: string
  /** When bio is absent, website/instagram move into the sub line */
  extraLinks?: Array<{ href: string; label: string }>
}

/**
 * Direction C person hero — quote-led, portrait states from C3.2 / R4.
 */
export function PersonHero({
  name,
  personType,
  jobTitle,
  basedIn,
  roomLine,
  placesCount,
  placesLabel,
  heroQuote,
  portraitUrl,
  portraitAlt = '',
  personSlug,
  mapCta,
  onPlaceLabel,
  extraLinks,
}: Props) {
  const token = resolveCategoryToken(categoryTokenForPersonType(personType))
  const hasPortrait = Boolean(portraitUrl)
  const hasQuote = Boolean(heroQuote?.text)
  const quoteIsBorrowed = Boolean(heroQuote?.placeSlug && heroQuote.placeName)

  const quoteAsLead = hasQuote
  const bigName = !hasQuote
  const showRing = !hasPortrait && hasQuote
  const showInitialsHero = !hasPortrait && !hasQuote

  const subParts = [jobTitle, basedIn, placesCount > 0 ? placesLabel : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <header className="person-c-hero">
      {quoteAsLead ? (
        <blockquote className="person-c-hero__quote">
          <p>{heroQuote!.text}</p>
          <cite className="sr-only">{name}</cite>
        </blockquote>
      ) : null}

      {quoteIsBorrowed && heroQuote?.placeSlug ? (
        <p className="person-c-hero__on-place">
          {onPlaceLabel}{' '}
          <Link
            href={{
              pathname: '/neighbourhood/[slug]',
              params: { slug: heroQuote.placeSlug },
            }}
            className="underline-offset-2 hover:underline"
          >
            {heroQuote.placeName}
          </Link>
        </p>
      ) : null}

      <div
        className={`person-c-hero__identity ${hasPortrait ? 'person-c-hero__identity--with-portrait' : ''}`}
      >
        {hasPortrait && portraitUrl ? (
          <div className="person-c-hero__portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portraitUrl}
              alt={portraitAlt || name}
              width={112}
              height={112}
              className="person-c-hero__portrait-img"
            />
          </div>
        ) : null}

        {showInitialsHero ? (
          <InitialsAvatar
            name={name}
            initials={personInitials(name)}
            fill={token.fill}
            className="person-c-hero__initials"
            style={{ width: 104, height: 104, fontSize: 28 }}
          />
        ) : null}

        <div className="person-c-hero__text">
          <h1
            className={`person-c-hero__name ${bigName ? 'person-c-hero__name--lead' : ''}`}
          >
            {name}
          </h1>

          <p className="person-c-hero__sub">
            {showRing ? (
              <span
                className="person-c-hero__ring"
                style={{ borderColor: token.fill }}
                aria-hidden="true"
              >
                <span style={{ backgroundColor: token.fill }} />
              </span>
            ) : null}
            <span>
              {subParts}
              {roomLine ? (subParts ? ` · ${roomLine}` : roomLine) : ''}
            </span>
          </p>

          {extraLinks && extraLinks.length > 0 ? (
            <p className="person-c-hero__links">
              {extraLinks.map((link, i) => (
                <span key={link.href}>
                  {i > 0 ? ' · ' : null}
                  <a
                    href={link.href}
                    className="underline-offset-2 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </span>
              ))}
            </p>
          ) : null}

          <Link
            // next-intl localizes the path; query matches the hub person filter.
            href={`/you-me-berlin?person=${encodeURIComponent(personSlug)}` as '/you-me-berlin'}
            className="line-cta person-c-hero__map-cta mt-4 text-ui-sm"
          >
            <span className="line-cta__label">{mapCta}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
