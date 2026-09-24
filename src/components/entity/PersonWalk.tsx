import { Link } from '@/i18n/routing'
import { tripLegCopy, tripMetaLine } from '@/lib/entity/computed/formatTrip'
import { nearestStation } from '@/lib/entity/computed/nearestStation'
import type { Trip } from '@/lib/entity/computed/types'
import { HOTEL_PIN_FILL, pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type WalkStopView = {
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel: string
  editorIndex: number
  quote: string | null
  leg: Trip
  lng: number
  lat: number
}

export type AlsoRecommendView = {
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel: string
  editorIndex: number
  trip: Trip | null
}

type Props = {
  locale: 'de' | 'en'
  heading: string
  subLine: string
  hotelName: string
  startLabel: string
  stops: WalkStopView[]
  returnLeg: Trip | null
  also: AlsoRecommendView[]
  alsoHeading: string
}

/**
 * Direction C walk timeline — hotel → ordered stops → hotel.
 * List count equals stops + start; legs live inside each stop `<li>`.
 * When `stops` is empty, only the compact "also recommends" list renders.
 */
export function PersonWalk({
  locale,
  heading,
  subLine,
  hotelName,
  startLabel,
  stops,
  returnLeg,
  also,
  alsoHeading,
}: Props) {
  const showTimeline = stops.length > 0
  const returnCopy = returnLeg
    ? tripLegCopy(returnLeg, { locale, returning: true, station: null })
    : null

  return (
    <section className="person-c-walk" aria-labelledby="person-walk-heading">
      {showTimeline ? (
        <>
          <h2 id="person-walk-heading" className="person-c-walk__heading">
            {heading}
          </h2>
          <p className="person-c-walk__sub">{subLine}</p>

          <ol className="person-c-walk__list">
            <li className="person-c-walk__stop person-c-walk__stop--hotel">
              <span
                className="person-c-walk__pin"
                style={{ backgroundColor: HOTEL_PIN_FILL }}
                aria-hidden="true"
              />
              <p className="person-c-walk__kicker">{startLabel}</p>
              <h3 className="person-c-walk__stop-title">{hotelName}</h3>
            </li>

            {stops.map((stop) => {
              const station = nearestStation({ lng: stop.lng, lat: stop.lat })
              const leg = tripLegCopy(stop.leg, { locale, station })
              const pin = pinColorForCategory(stop.category)
              const num = String(stop.editorIndex).padStart(2, '0')

              return (
                <li key={stop.slug} className="person-c-walk__stop">
                  <p className="person-c-walk__leg">
                    <span aria-hidden="true">{leg.short}</span>
                    <span className="sr-only">{leg.accessible}</span>
                  </p>
                  <span
                    className="person-c-walk__pin"
                    style={{ backgroundColor: pin }}
                    aria-hidden="true"
                  />
                  <p className="person-c-walk__kicker">
                    {num} · {stop.categoryLabel}
                  </p>
                  <h3 className="person-c-walk__stop-title">
                    <Link
                      href={{
                        pathname: '/neighbourhood/[slug]',
                        params: { slug: stop.slug },
                      }}
                      className="hover:underline"
                    >
                      {stop.name}
                    </Link>
                  </h3>
                  {stop.quote ? (
                    <blockquote className="person-c-walk__quote">
                      <p>{stop.quote}</p>
                    </blockquote>
                  ) : null}
                </li>
              )
            })}
          </ol>

          {returnCopy ? (
            <p className="person-c-walk__return">
              <span aria-hidden="true">{returnCopy.short}</span>
              <span className="sr-only">{returnCopy.accessible}</span>
            </p>
          ) : null}
        </>
      ) : null}

      {also.length > 0 ? (
        <div className={`person-c-also ${showTimeline ? '' : 'person-c-also--solo'}`}>
          <h3
            className="person-c-also__heading"
            id={showTimeline ? undefined : 'person-walk-heading'}
          >
            {alsoHeading}
          </h3>
          <ul className="person-c-also__list">
            {also.map((item) => {
              const meta = item.trip
                ? tripMetaLine(item.trip, item.categoryLabel, locale)
                : item.categoryLabel
              const num = String(item.editorIndex).padStart(2, '0')
              return (
                <li key={item.slug} className="person-c-also__row">
                  <span className="person-c-also__num">{num}</span>
                  <div>
                    <Link
                      href={{
                        pathname: '/neighbourhood/[slug]',
                        params: { slug: item.slug },
                      }}
                      className="person-c-also__name hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="person-c-also__meta">{meta}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
