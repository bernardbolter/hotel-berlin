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
import { VideoEmbed } from '@/components/media/VideoEmbed'
import { PersonCard } from '@/components/neighbourhood/PersonCard'
import { EditorialBand } from '@/components/primitives/EditorialBand'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'
import { getResolvedPerson } from '@/lib/aeo/resolve'
import { buildPersonPageGraph, defaultConfig } from '@/lib/aeo-schema/src/index'
import { entityMetadata, resolveLocale } from '@/lib/entity/canonical'
import { safeMediaUrl } from '@/lib/entity/mediaUrl'
import { getMapSettings } from '@/lib/map/settings'
import { mapPlaceLabels, mediaFileAlt, mediaFileUrl, toMapViewPlace } from '@/lib/map/toMapPlace'
import { districtFromPostalCode } from '@/lib/places/district'
import { getPeopleSharingTags } from '@/lib/payload/borrow'
import { getPublishedPersonSlugs } from '@/lib/payload/entities'
import { lexicalToParagraphs } from '@/lib/richText/lexicalToPlain'
import { categoryTokenForPersonType } from '@/lib/spotlight/categoryTokens'
import type { NeighbourhoodPlaceDoc } from '@/lib/queries/neighbourhoodPlaces'
import type { NeighbourhoodPlace } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedPersonSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const resolved = await getResolvedPerson(slug, locale)
  if (!resolved) return { title: 'Not found' }

  return entityMetadata({
    locale,
    pathname: '/you-me-berlin/[slug]',
    slug,
    title: `${resolved.payload.name} | You, Me & Berlin | Hotel Berlin, Berlin`,
    description: resolved.payload.shortBio ?? undefined,
    index: resolved.payload.status === 'published',
  })
}

export default async function PersonPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('youMeBerlin')
  const tPlaces = await getTranslations('neighbourhood')
  const te = await getTranslations('entity')
  const [resolved, mapSettings] = await Promise.all([
    getResolvedPerson(slug, locale),
    getMapSettings(),
  ])

  if (!resolved) notFound()

  const { payload: person, aeo, picks } = resolved
  const graph = buildPersonPageGraph(aeo, picks, defaultConfig)

  const portraitUrl = safeMediaUrl(mediaFileUrl(person.portrait))
  const portraitAlt = mediaFileAlt(person.portrait, person.name)
  const bioParagraphs = lexicalToParagraphs(person.bio)
  const hasBio = bioParagraphs.length > 0
  const quote = person.quote?.trim()
  const videoUrl = person.video?.trim()
  const room =
    person.roomConfirmed && person.roomNumber?.trim()
      ? t('letterInRoom', { room: person.roomNumber.trim() })
      : null

  const payloadPicks = (person.picks?.docs ?? []).filter(
    (doc): doc is NeighbourhoodPlace =>
      typeof doc === 'object' && doc != null && doc.status === 'active',
  )

  const labelFn = {
    category: (category: string) => tPlaces(`categories.${category}`),
    walking: (minutes: number) => tPlaces('walkingMinutes', { minutes }),
    transit: (args: { minutes: number; line: string; station: string }) =>
      tPlaces('transitLine', args),
  }

  const mapPlaces = payloadPicks
    .map((doc) =>
      toMapViewPlace(
        doc as unknown as NeighbourhoodPlaceDoc,
        mapPlaceLabels(doc as unknown as NeighbourhoodPlaceDoc, labelFn),
        { leadPersonSlug: typeof person.slug === 'string' ? person.slug : null },
      ),
    )
    .filter((p): p is NonNullable<typeof p> => p != null)

  const similar = await getPeopleSharingTags(person.id, locale)

  const meta = [
    { chip: person.jobTitle || person.type, token: categoryTokenForPersonType(person.type) },
    person.basedIn,
    room,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const website = person.website?.trim()
  const instagram = person.instagram?.trim()

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page pb-section-y">
        <div className="pt-section-y">
          <EntityIdentity
            breadcrumb={{ label: t('label'), href: '/you-me-berlin' }}
            title={person.name}
            meta={meta}
            lead={!portraitUrl ? quote : undefined}
            portrait={portraitUrl ? { src: portraitUrl, alt: portraitAlt } : null}
            fallback="quote"
          />
        </div>

        {mapSettings.accessToken && mapPlaces.length > 0 ? (
          <section className="mt-12" aria-labelledby="picks-map-heading">
            <h2 id="picks-map-heading" className="sr-only">
              {t('mapAria')}
            </h2>
            <PlacesMapView
              accessToken={mapSettings.accessToken}
              bounds={mapSettings.bounds}
              center={mapSettings.center}
              places={mapPlaces}
              hotelName={mapSettings.hotelName}
              ariaLabel={t('mapAria')}
              noscriptHtml={t.raw('mapNoscript') as string}
              pinVariant="person"
              cardEmphasis="person"
              compact
              autoSelectFirst
            />
          </section>
        ) : null}

        {payloadPicks.length > 0 ? (
          <EntityBand heading={t('picksHeading', { name: person.name })} className="mt-12" id="picks">
            <ol className="entity-picks">
              {payloadPicks.map((place) => {
                const endorsement = place.endorsements?.find((entry) => {
                  const id = typeof entry.person === 'object' ? entry.person?.id : entry.person
                  return id === person.id
                })
                const district = districtFromPostalCode(place.address?.postalCode)
                const walking =
                  place.walkingMinutes != null
                    ? tPlaces('walkingMinutes', { minutes: place.walkingMinutes })
                    : null
                const line = [
                  tPlaces(`categories.${place.category}`),
                  district,
                  walking,
                ]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <li key={place.slug}>
                    <div>
                      <h3 className="font-ui text-ui-md font-medium text-hbb-black">
                        <Link
                          href={{ pathname: '/neighbourhood/[slug]', params: { slug: place.slug } }}
                          className="hover:text-[var(--ctx-accent-text)]"
                        >
                          {place.name}
                        </Link>
                      </h3>
                      <p className="mt-1 font-ui text-ui-xs text-[var(--dim)]">{line}</p>
                      {endorsement?.quote ? (
                        <blockquote className="mt-3 max-w-[62ch] font-serif text-serif-sm italic text-gray-700">
                          <p>{endorsement.quote}</p>
                          <cite className="mt-1 block not-italic font-ui text-ui-xs text-[var(--dim)]">
                            {person.name}
                          </cite>
                        </blockquote>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </EntityBand>
        ) : null}

        {portraitUrl && hasBio ? (
          <div className="mt-16 px-section-sm md:px-section-x">
            <EditorialBand
              ratio="1:2"
              image={{ src: portraitUrl, alt: portraitAlt }}
              heading={te('letterHeading')}
              id="letter"
            >
              <RichTextParagraphs
                value={person.bio}
                className="mt-4 max-w-prose"
                paragraphClassName="font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a]"
              />
            </EditorialBand>
          </div>
        ) : null}

        <EntityBand className="mt-12">
          <EntityFacts
            rows={[
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
              instagram
                ? {
                    term: te('instagram'),
                    value: (
                      <a href={instagram} className="underline-offset-2 hover:underline" rel="noopener noreferrer">
                        {instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@')}
                      </a>
                    ),
                  }
                : null,
            ]}
          />
        </EntityBand>

        {videoUrl ? (
          <div className="mt-10 px-section-sm md:px-section-x">
            <VideoEmbed url={videoUrl} title={t('videoTitle', { name: person.name })} className="max-w-2xl" />
          </div>
        ) : null}

        {similar.length === 3 ? (
          <EntityBand heading={te('similarLook')} className="mt-16" id="similar">
            <BorrowedRow
              items={similar}
              render={(item) => (
                <PersonCard
                  name={item.name}
                  slug={item.slug}
                  jobTitle={item.jobTitle}
                  roomNumber={item.roomNumber}
                  roomLabel={t('room')}
                  shortBio={item.shortBio}
                  portraitUrl={item.portraitUrl}
                  portraitAlt={item.portraitAlt}
                />
              )}
            />
          </EntityBand>
        ) : null}

        <div className="px-section-sm pt-16 md:px-section-x">
          <SweepCta href="/you-me-berlin" color="ctx">
            {t('backToList')}
          </SweepCta>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
