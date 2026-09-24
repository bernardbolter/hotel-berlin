import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { EntityBand } from '@/components/entity/EntityBand'
import { EntityFacts } from '@/components/entity/EntityFacts'
import { PlaceEntityMap } from '@/components/entity/PlaceEntityMap'
import { PlaceNote } from '@/components/entity/PlaceNote'
import { PlaceRelatedStrip } from '@/components/entity/PlaceRelatedStrip'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { LineCta } from '@/components/primitives/LineCta'
import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'
import { getResolvedPlace } from '@/lib/aeo/resolve'
import { buildPlacePageGraph, defaultConfig } from '@/lib/aeo-schema/src/index'
import { entityMetadata, resolveLocale } from '@/lib/entity/canonical'
import {
  entityMapAvailable,
  formatDistance,
  formatStationValue,
  getTrip,
  nearestStation,
  stationRowLabel,
} from '@/lib/entity/computed'
import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { mapboxAttributionUrl } from '@/lib/map/mapbox'
import { mediaFileAlt, mediaFileUrl } from '@/lib/map/toMapPlace'
import { safeMediaUrl } from '@/lib/entity/mediaUrl'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { getPlaceSlugs } from '@/lib/payload/entities'
import {
  countPlacesByPerson,
  getRelatedPlacesBand,
} from '@/lib/entity/relatedBand'
import {
  categoryTokenForPersonType,
  resolveCategoryToken,
} from '@/lib/spotlight/categoryTokens'
import type { Person } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getPlaceSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const resolved = await getResolvedPlace(slug, locale)
  if (!resolved) return { title: 'Not found' }

  return entityMetadata({
    locale,
    pathname: '/neighbourhood/[slug]',
    slug,
    title: `${resolved.payload.name} | Hotel Berlin, Berlin`,
    description: resolved.payload.description ?? undefined,
  })
}

function formatAddress(place: {
  address?: {
    streetAddress?: string | null
    postalCode?: string | null
    addressLocality?: string | null
  }
}): string | null {
  const street = place.address?.streetAddress?.trim()
  const postal = place.address?.postalCode?.trim()
  const city = place.address?.addressLocality?.trim() || 'Berlin'
  const parts = [street, [postal, city].filter(Boolean).join(' ')].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function indoorLabel(
  value: string | null | undefined,
  t: (key: string) => string,
): string | null {
  if (value === 'indoor') return t('indoor')
  if (value === 'outdoor') return t('outdoor')
  if (value === 'both') return t('indoorOutdoorBoth')
  return null
}

function hostOnly(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
  }
}

export default async function NeighbourhoodPlacePage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('neighbourhood')
  const te = await getTranslations('entity')

  const resolved = await getResolvedPlace(slug, locale)
  if (!resolved) notFound()

  const { payload: place, aeo, district } = resolved
  const graph = buildPlacePageGraph(aeo, defaultConfig)
  const category = place.category as PlaceCategory
  const categoryLabel = t(`categories.${category}`)

  const endorsements =
    place.endorsements
      ?.map((entry) => {
        const person = entry.person
        if (!person || typeof person !== 'object' || typeof person.slug !== 'string') {
          return null
        }
        return {
          quote: entry.quote?.trim() ? entry.quote.trim() : null,
          person: person as Person,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e != null) ?? []

  const leadPerson = endorsements[0]?.person ?? null

  const hotel = {
    lng: DEFAULT_HOTEL_COORDS.lng,
    lat: DEFAULT_HOTEL_COORDS.lat,
  }
  const placeGeo =
    place.geo?.latitude != null && place.geo?.longitude != null
      ? { lat: Number(place.geo.latitude), lng: Number(place.geo.longitude) }
      : null

  const [trip, relatedBand, leadPickCount] = await Promise.all([
    placeGeo
      ? getTrip(hotel, placeGeo, { storedMinutes: place.walkingMinutes })
      : Promise.resolve(null),
    getRelatedPlacesBand({
      excludeSlug: slug,
      category,
      district,
      leadEndorser: leadPerson,
      locale,
      hotel,
    }),
    leadPerson ? countPlacesByPerson(leadPerson.id, locale) : Promise.resolve(0),
  ])

  const station = placeGeo ? nearestStation(placeGeo) : null
  const showBasemap = Boolean(placeGeo && entityMapAvailable())

  const stripItems = relatedBand
    ? await Promise.all(
        relatedBand.items.map(async (item) => {
          let itemTrip
          if (item.geo) {
            itemTrip = await getTrip(hotel, item.geo, {
              storedMinutes: item.walkingMinutes,
            })
          } else {
            const minutes = Math.max(1, item.walkingMinutes ?? 1)
            itemTrip = {
              minutes,
              meters: 0,
              geometry: null as null,
              source: item.walkingMinutes != null ? ('stored' as const) : ('estimate' as const),
              mode: minutes > 30 ? ('far' as const) : ('walk' as const),
            }
          }
          return {
            ...item,
            trip: itemTrip,
            categoryLabel: t(`categories.${item.category}`),
          }
        }),
      )
    : []
  const address = formatAddress(place)
  const website = place.website?.trim()
  const indoor = indoorLabel(place.indoorOutdoor, t)
  const imageUrl = safeMediaUrl(mediaFileUrl(place.image))
  const imageAlt = mediaFileAlt(place.image, place.name)

  const walkSentence = (() => {
    if (!trip) return null
    if (trip.mode === 'far') {
      const dist = formatDistance(trip.meters, locale)
      const approx = trip.source === 'estimate' ? (locale === 'de' ? `Ca. ${dist}` : `About ${dist}`) : dist
      return locale === 'de'
        ? `${approx} vom Hotel.`
        : `${approx} from the hotel.`
    }
    return trip.source === 'estimate'
      ? te('walkSentenceApprox', { minutes: trip.minutes })
      : te('walkSentence', { minutes: trip.minutes })
  })()

  const mapAlt =
    trip && placeGeo
      ? trip.mode === 'walk'
        ? te('mapAltWalk', {
            name: place.name,
            minutes: trip.minutes,
            distance: formatDistance(trip.meters, locale),
          })
        : te('mapAltFar', {
            name: place.name,
            distance: formatDistance(trip.meters, locale),
          })
      : ''

  const districtValue = [district, indoor].filter(Boolean).join(' · ') || null

  let bandHeading: string | null = null
  let bandHref: string | null = null
  let bandCta: string | null = null
  let personTokenFill: string | undefined
  if (relatedBand) {
    if (relatedBand.source === 'endorser' && relatedBand.endorser) {
      bandHeading = te('whereElseGoes', { name: relatedBand.endorser.firstName })
      bandHref = `/you-me-and-berlin/${relatedBand.endorser.slug}`
      bandCta = te('toProfile')
      personTokenFill = resolveCategoryToken(
        categoryTokenForPersonType(leadPerson?.type ?? 'local'),
      ).fill
    } else if (relatedBand.source === 'district' && relatedBand.district) {
      bandHeading = te('moreInDistrict', { district: relatedBand.district })
      bandHref = '/neighbourhood'
      bandCta = te('allPlaces')
    } else {
      bandHeading = te('moreInNeighbourhood')
      bandHref = '/neighbourhood'
      bandCta = te('allPlaces')
    }
  }

  const crumbDistrict = district

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="place-c-page bg-hbb-page pb-section-y">
        <div className="pt-section-y">
          <nav className="place-c-crumb px-section-sm md:px-section-x" aria-label="Breadcrumb">
            <Link href="/neighbourhood">{t('label')}</Link>
            {crumbDistrict ? (
              <>
                <span className="place-c-crumb__sep" aria-hidden="true">
                  /
                </span>
                <span>{crumbDistrict}</span>
              </>
            ) : null}
            <span className="place-c-crumb__sep" aria-hidden="true">
              /
            </span>
            <span>{place.name}</span>
          </nav>
        </div>

        <div className="place-c-top px-section-sm md:px-section-x">
          <PlaceNote
            locale={locale}
            placeName={place.name}
            category={category}
            categoryLabel={categoryLabel}
            endorsements={endorsements}
            leadPickCount={leadPickCount || endorsements.length}
            walkSentence={walkSentence}
            description={place.description}
            labels={{
              recommends: te('recommends'),
              fromHotel: te('fromHotel'),
              alsoRecommendedBy: te('alsoRecommendedBy'),
              andMore: (n) => te('andMore', { count: n }),
              recommendsPlaces: (count) => te('recommendsPlaces', { count }),
            }}
          />

          <div className="place-map-card">
            {placeGeo && trip ? (
              <PlaceEntityMap
                slug={slug}
                placeName={place.name}
                hotel={hotel}
                place={placeGeo}
                trip={trip}
                placePinColor={pinColorForCategory(category)}
                station={station}
                locale={locale}
                showBasemap={showBasemap}
                alt={mapAlt}
                imageUrl={imageUrl}
                imageAlt={imageAlt}
              />
            ) : null}

            <div
              className={`place-map-card__body ${!placeGeo || !trip ? 'border-t border-[#E3DED6]' : ''}`}
            >
              <EntityFacts
                rows={[
                  address ? { term: t('addressLabel'), value: address } : null,
                  station
                    ? {
                        term: stationRowLabel(station.mode, locale) === 'U-Bahn'
                          ? te('ubahn')
                          : te('sbahn'),
                        value: formatStationValue(station),
                      }
                    : null,
                  districtValue
                    ? { term: te('district'), value: districtValue }
                    : null,
                  place.openingHours
                    ? { term: te('hours'), value: place.openingHours }
                    : null,
                  website
                    ? {
                        term: te('website'),
                        value: (
                          <a
                            href={website}
                            className="underline-offset-2 hover:underline"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {hostOnly(website)}
                          </a>
                        ),
                      }
                    : null,
                  place.priceRange
                    ? { term: te('price'), value: place.priceRange }
                    : null,
                ]}
              />

              {placeGeo ? (
                <div className="place-map-card__cta">
                  <LineCta
                    href={`https://www.google.com/maps/dir/?api=1&destination=${placeGeo.lat},${placeGeo.lng}&travelmode=walking`}
                    external
                    className="text-ui-sm"
                  >
                    {te('directions')} ↗
                    <span className="sr-only"> {te('opensNewTab')}</span>
                  </LineCta>
                </div>
              ) : null}

              {placeGeo && showBasemap ? (
                <p className="place-map-card__attr">
                  <a
                    href={mapboxAttributionUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {te('mapAttribution')}
                  </a>
                </p>
              ) : placeGeo && !showBasemap ? (
                <p className="place-map-card__attr">
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    © OpenStreetMap
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {relatedBand && bandHeading && stripItems.length === 3 ? (
          <EntityBand
            heading={bandHeading}
            href={bandHref ?? undefined}
            ctaLabel={bandCta ?? undefined}
            className="mt-16"
            id="related"
          >
            <PlaceRelatedStrip
              items={stripItems}
              source={relatedBand.source}
              locale={locale}
              personTokenFill={personTokenFill}
            />
          </EntityBand>
        ) : null}

        <div className="px-section-sm pt-16 md:px-section-x">
          <div className="place-c-onward">
            <p className="place-c-onward__line">{te('onwardHasEndorsers')}</p>
            <SweepCta href="/neighbourhood" color="ctx" edge="right">
              {t('label')}
            </SweepCta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
