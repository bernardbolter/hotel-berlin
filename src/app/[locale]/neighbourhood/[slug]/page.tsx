import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { BorrowedRow } from '@/components/entity/BorrowedRow'
import { EntityBand } from '@/components/entity/EntityBand'
import { EntityFacts } from '@/components/entity/EntityFacts'
import { EntityIdentity } from '@/components/entity/EntityIdentity'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { PlacesMapView } from '@/components/map/PlacesMapView'
import { PlaceCard } from '@/components/neighbourhood/PlaceCard'
import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { LineCta } from '@/components/primitives/LineCta'
import { SweepCta } from '@/components/primitives/SweepCta'
import { getResolvedPlace } from '@/lib/aeo/resolve'
import { buildPlacePageGraph, defaultConfig } from '@/lib/aeo-schema/src/index'
import { entityMetadata, resolveLocale } from '@/lib/entity/canonical'
import { getMapSettings } from '@/lib/map/settings'
import { mapPlaceLabels, mediaFileUrl, toMapViewPlace } from '@/lib/map/toMapPlace'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { getPlaceSlugs } from '@/lib/payload/entities'
import { getPlacesByPerson, getPlacesInDistrict } from '@/lib/payload/borrow'
import { personInitials } from '@/lib/people/initials'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'
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
  address?: { streetAddress?: string | null; postalCode?: string | null; addressLocality?: string | null }
}): string | null {
  const street = place.address?.streetAddress?.trim()
  const postal = place.address?.postalCode?.trim()
  const city = place.address?.addressLocality?.trim()
  const parts = [street, [postal, city].filter(Boolean).join(' ')].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function indoorLabel(value: string | null | undefined, t: (key: string) => string): string | null {
  if (value === 'indoor') return t('indoor')
  if (value === 'outdoor') return t('outdoor')
  if (value === 'both') return t('indoorOutdoorBoth')
  return null
}

export default async function NeighbourhoodPlacePage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('neighbourhood')
  const te = await getTranslations('entity')
  const [resolved, mapSettings] = await Promise.all([
    getResolvedPlace(slug, locale),
    getMapSettings(),
  ])

  if (!resolved) notFound()

  const { payload: place, aeo, district } = resolved
  const graph = buildPlacePageGraph(aeo, defaultConfig)
  const category = place.category as PlaceCategory
  const walkingLabel =
    place.walkingMinutes != null ? t('walkingMinutes', { minutes: place.walkingMinutes }) : null
  const transit = place.transit
  const transitLabel =
    transit?.minutes != null && transit.station && transit.line
      ? t('transitLine', {
          minutes: transit.minutes,
          line: transit.line,
          station: transit.station,
        })
      : null

  const endorsements =
    place.endorsements
      ?.map((entry) => {
        const person = entry.person
        if (!person || typeof person !== 'object' || typeof person.slug !== 'string') return null
        return { quote: entry.quote, person }
      })
      .filter((e): e is NonNullable<typeof e> => e != null) ?? []

  const leadPerson = endorsements[0]?.person
  const [alsoByPerson, moreInDistrict] = await Promise.all([
    leadPerson ? getPlacesByPerson(leadPerson.id, slug, locale) : Promise.resolve([]),
    district ? getPlacesInDistrict(district, slug, locale) : Promise.resolve([]),
  ])

  const mapPlace = toMapViewPlace(
    place as unknown as NeighbourhoodPlaceDoc,
    mapPlaceLabels(place as unknown as NeighbourhoodPlaceDoc, {
      category: (value) => t(`categories.${value}`),
      walking: (minutes) => t('walkingMinutes', { minutes }),
      transit: (args) => t('transitLine', args),
    }),
  )

  const address = formatAddress(place)
  const website = place.website?.trim()
  const indoor = indoorLabel(place.indoorOutdoor, t)
  const audience = place.targetAudience
    ?.map((row) => row.label)
    .filter((label): label is string => Boolean(label))
  const identifiers = place.authority?.identifier?.filter((id) => id.propertyID && id.value) ?? []

  const meta = [
    { chip: t(`categories.${category}`), color: pinColorForCategory(category) },
    district,
    walkingLabel,
    indoor,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const mapCaption = [walkingLabel, transitLabel].filter(Boolean).join(' · ')

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page pb-section-y">
        <div className="pt-section-y">
          <EntityIdentity
            breadcrumb={{ label: t('label'), href: '/neighbourhood' }}
            title={place.name}
            meta={meta}
          />
        </div>

        {endorsements.length > 0 ? (
          <EntityBand className="mt-12">
            <div className="flex max-w-2xl flex-col gap-12">
              {endorsements.map((entry) => (
                <EndorsementLead
                  key={entry.person.slug}
                  person={entry.person}
                  quote={entry.quote}
                  recommendsLabel={te('recommendsPlaces', { count: alsoByPerson.length + 1 })}
                  profileLabel={te('toProfile')}
                />
              ))}
            </div>
          </EntityBand>
        ) : null}

        {mapSettings.accessToken && mapPlace ? (
          <section className="mt-12" aria-labelledby="place-map-heading">
            <h2 id="place-map-heading" className="sr-only">
              {t('mapAria')}
            </h2>
            <PlacesMapView
              accessToken={mapSettings.accessToken}
              bounds={mapSettings.bounds}
              center={{ lat: mapPlace.latitude, lng: mapPlace.longitude }}
              places={[mapPlace]}
              hotelName={mapSettings.hotelName}
              ariaLabel={t('mapAria')}
              noscriptHtml={t.raw('mapNoscript') as string}
              pinVariant="category"
              cardEmphasis="place"
              showCard={false}
              compact
              autoSelectFirst
            />
            {mapCaption ? (
              <p className="px-section-sm pt-3 font-ui text-ui-sm text-[var(--dim)] md:px-section-x">
                {mapCaption}
              </p>
            ) : null}
          </section>
        ) : null}

        <EntityBand className="mt-12">
          <EntityFacts
            rows={[
              address ? { term: t('addressLabel'), value: address } : null,
              place.openingHours ? { term: te('hours'), value: place.openingHours } : null,
              website
                ? {
                    term: te('website'),
                    value: (
                      <a href={website} className="underline-offset-2 hover:underline" rel="noopener noreferrer">
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    ),
                  }
                : null,
              indoor ? { term: te('setting'), value: indoor } : null,
              place.priceRange ? { term: te('price'), value: place.priceRange } : null,
              audience && audience.length > 0
                ? { term: te('audience'), value: audience.join(' · ') }
                : null,
            ]}
          />
        </EntityBand>

        {identifiers.length > 0 ? (
          <EntityBand label={te('alsoListedAs')} className="mt-10">
            <ul className="mt-3 flex flex-wrap gap-2">
              {identifiers.map((id) => (
                <li
                  key={`${id.propertyID}-${id.value}`}
                  className="border border-[var(--cardline)] bg-white px-2 py-1 font-mono text-[11px] text-[var(--dim)]"
                >
                  {id.propertyID} {id.value}
                </li>
              ))}
            </ul>
          </EntityBand>
        ) : null}

        {alsoByPerson.length === 3 && leadPerson ? (
          <EntityBand
            heading={te('alsoRecommends', { name: leadPerson.name })}
            href={`/you-me-and-berlin/${leadPerson.slug}`}
            ctaLabel={te('toProfile')}
            className="mt-16"
            id="also-by"
          >
            <BorrowedRow
              items={alsoByPerson}
              render={(item) => (
                <PlaceCard
                  name={item.name}
                  slug={item.slug}
                  category={item.category}
                  categoryLabel={t(`categories.${item.category}`)}
                  walkingMinutes={item.walkingMinutes}
                  walkingLabel={
                    item.walkingMinutes != null
                      ? t('walkingMinutes', { minutes: item.walkingMinutes })
                      : undefined
                  }
                  description={item.description}
                  imageUrl={item.imageUrl}
                  imageAlt={item.imageAlt}
                  endorsements={item.endorsements}
                />
              )}
            />
          </EntityBand>
        ) : null}

        {moreInDistrict.length === 3 && district ? (
          <EntityBand heading={te('moreInDistrict', { district })} className="mt-16" id="more-in">
            <BorrowedRow
              items={moreInDistrict}
              render={(item) => (
                <PlaceCard
                  name={item.name}
                  slug={item.slug}
                  category={item.category}
                  categoryLabel={t(`categories.${item.category}`)}
                  walkingMinutes={item.walkingMinutes}
                  walkingLabel={
                    item.walkingMinutes != null
                      ? t('walkingMinutes', { minutes: item.walkingMinutes })
                      : undefined
                  }
                  description={item.description}
                  imageUrl={item.imageUrl}
                  imageAlt={item.imageAlt}
                  endorsements={item.endorsements}
                />
              )}
            />
          </EntityBand>
        ) : null}

        <div className="px-section-sm pt-16 md:px-section-x">
          <SweepCta href="/neighbourhood" color="ctx">
            {t('backToList')}
          </SweepCta>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function EndorsementLead({
  person,
  quote,
  recommendsLabel,
  profileLabel,
}: {
  person: Person
  quote: string
  recommendsLabel: string
  profileLabel: string
}) {
  const portraitUrl = mediaFileUrl(person.portrait)

  return (
    <figure className="flex gap-5">
      <div className="shrink-0">
        <InitialsAvatar
          name={person.name}
          initials={personInitials(person.name)}
          portraitUrl={portraitUrl}
          portraitAlt={person.name}
          size="lg"
        />
      </div>
      <div className="min-w-0">
        <blockquote className="entity-pullquote">
          <p>{quote}</p>
        </blockquote>
        <figcaption className="mt-4">
          <cite className="not-italic">
            <span className="font-ui text-ui-sm font-medium text-hbb-black">{person.name}</span>
            {person.jobTitle ? (
              <span className="font-ui text-ui-sm text-[var(--dim)]"> · {person.jobTitle}</span>
            ) : null}
          </cite>
          <p className="mt-1 font-ui text-ui-xs text-[var(--dim)]">{recommendsLabel}</p>
          <LineCta href={`/you-me-and-berlin/${person.slug}`} className="mt-3 text-ui-sm">
            {profileLabel}
          </LineCta>
        </figcaption>
      </div>
    </figure>
  )
}
