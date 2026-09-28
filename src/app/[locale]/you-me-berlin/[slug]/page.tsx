import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { BorrowedRow } from '@/components/entity/BorrowedRow'
import { EntityBand } from '@/components/entity/EntityBand'
import { PersonHero } from '@/components/entity/PersonHero'
import {
  PersonWalk,
  type AlsoRecommendView,
  type WalkStopView,
} from '@/components/entity/PersonWalk'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { VideoEmbed } from '@/components/media/VideoEmbed'
import { PersonCard } from '@/components/neighbourhood/PersonCard'
import { EditorialBand } from '@/components/primitives/EditorialBand'
import { LineCta } from '@/components/primitives/LineCta'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'
import { getResolvedPerson } from '@/lib/aeo/resolve'
import { buildPersonPageGraph, defaultConfig } from '@/lib/aeo-schema/src/index'
import { entityMetadata, resolveLocale } from '@/lib/entity/canonical'
import { getTrip, orderPicks } from '@/lib/entity/computed'
import type { LngLat, TripPick } from '@/lib/entity/computed/types'
import { DEFAULT_HOTEL_COORDS } from '@/lib/map/config'
import { safeMediaUrl } from '@/lib/entity/mediaUrl'
import { mediaFileAlt, mediaFileUrl } from '@/lib/map/toMapPlace'
import {
  firstName,
  personWalkHeading,
  resolveHeroQuote,
} from '@/lib/entity/personHero'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { getPeopleSharingTags } from '@/lib/payload/borrow'
import { getPublishedPersonSlugs } from '@/lib/payload/entities'
import { lexicalToParagraphs } from '@/lib/richText/lexicalToPlain'
import type { NeighbourhoodPlace } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const WALK_MAX = 5

type PickWithGeo = TripPick & {
  place: NeighbourhoodPlace
  point: LngLat
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

function hostOnly(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
  }
}

function igHandle(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')
}

function quoteForPerson(
  place: NeighbourhoodPlace,
  personId: string | number,
): string | null {
  const entry = place.endorsements?.find((e) => {
    const id = typeof e.person === 'object' ? e.person?.id : e.person
    return id === personId
  })
  return entry?.quote?.trim() || null
}

export default async function PersonPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('youMeBerlin')
  const tPlaces = await getTranslations('neighbourhood')
  const te = await getTranslations('entity')

  const resolved = await getResolvedPerson(slug, locale)
  if (!resolved) notFound()

  const { payload: person, aeo, picks } = resolved
  const graph = buildPersonPageGraph(aeo, picks, defaultConfig)

  const portraitUrl = safeMediaUrl(mediaFileUrl(person.portrait))
  const portraitAlt = mediaFileAlt(person.portrait, person.name)
  const bioParagraphs = lexicalToParagraphs(person.bio)
  const hasBio = bioParagraphs.length > 0
  const videoUrl = person.video?.trim()
  const room =
    person.roomConfirmed && person.roomNumber?.trim()
      ? t('letterInRoom', { room: person.roomNumber.trim() })
      : null

  const payloadPicks = (person.picks?.docs ?? []).filter(
    (doc): doc is NeighbourhoodPlace =>
      typeof doc === 'object' && doc != null && doc.status === 'active',
  )

  const editorIndexBySlug = new Map(
    payloadPicks.map((place, i) => [place.slug, i + 1]),
  )

  const heroQuote = resolveHeroQuote(person.quote, person.id, payloadPicks)

  const withGeo: PickWithGeo[] = []
  const withoutGeo: NeighbourhoodPlace[] = []

  for (const place of payloadPicks) {
    const lat = place.geo?.latitude
    const lng = place.geo?.longitude
    if (lat == null || lng == null) {
      withoutGeo.push(place)
      continue
    }
    withGeo.push({
      id: place.id,
      editorIndex: editorIndexBySlug.get(place.slug) ?? withGeo.length + 1,
      point: { lat: Number(lat), lng: Number(lng) },
      place,
    })
  }

  const hotel = {
    lng: DEFAULT_HOTEL_COORDS.lng,
    lat: DEFAULT_HOTEL_COORDS.lat,
  }

  const ordered =
    withGeo.length > 0 ? await orderPicks(withGeo, { hotel }) : null

  const walkPicks = ordered?.stops.slice(0, WALK_MAX) ?? []
  const overflowPicks = ordered?.stops.slice(WALK_MAX) ?? []

  const walkStops: WalkStopView[] = walkPicks.map(({ pick, leg }) => ({
    slug: pick.place.slug,
    name: pick.place.name,
    category: pick.place.category as PlaceCategory,
    categoryLabel: tPlaces(`categories.${pick.place.category}`),
    editorIndex: pick.editorIndex,
    quote: quoteForPerson(pick.place, person.id),
    leg,
    lng: pick.point.lng,
    lat: pick.point.lat,
  }))

  const also: AlsoRecommendView[] = []

  for (const { pick } of overflowPicks) {
    const trip = await getTrip(hotel, pick.point, {
      storedMinutes: pick.place.walkingMinutes,
    })
    also.push({
      slug: pick.place.slug,
      name: pick.place.name,
      category: pick.place.category as PlaceCategory,
      categoryLabel: tPlaces(`categories.${pick.place.category}`),
      editorIndex: pick.editorIndex,
      trip,
    })
  }

  for (const place of withoutGeo) {
    also.push({
      slug: place.slug,
      name: place.name,
      category: place.category as PlaceCategory,
      categoryLabel: tPlaces(`categories.${place.category}`),
      editorIndex: editorIndexBySlug.get(place.slug) ?? 0,
      trip: null,
    })
  }

  const showWalk = walkStops.length > 0 && ordered?.returnLeg != null
  const showAlsoOnly = !showWalk && also.length > 0

  const similar = await getPeopleSharingTags(person.id, locale)

  const website = person.website?.trim()
  const instagram = person.instagram?.trim()
  const extraLinks = !hasBio
    ? [
        website ? { href: website, label: hostOnly(website) } : null,
        instagram ? { href: instagram, label: igHandle(instagram) } : null,
      ].filter((l): l is { href: string; label: string } => l != null)
    : undefined

  const vorname = firstName(person.name)

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page pb-section-y">
        <div className="pt-section-y">
          <nav
            className="person-c-crumb px-section-sm md:px-section-x"
            aria-label="Breadcrumb"
          >
            <Link href="/you-me-berlin">{t('label')}</Link>
            <span className="person-c-crumb__sep" aria-hidden="true">
              /
            </span>
            <span>{person.name}</span>
          </nav>
        </div>

        <div
          className={`person-c-top px-section-sm md:px-section-x ${showWalk || showAlsoOnly ? '' : 'person-c-top--solo'}`}
        >
          <PersonHero
            name={person.name}
            personType={person.type}
            jobTitle={person.jobTitle}
            basedIn={person.basedIn}
            roomLine={room}
            placesCount={payloadPicks.length}
            placesLabel={t('placesCount', { count: payloadPicks.length })}
            heroQuote={heroQuote}
            portraitUrl={portraitUrl}
            portraitAlt={portraitAlt}
            personSlug={person.slug}
            mapCta={`${t('onBigMap')} →`}
            onPlaceLabel={t('onPlace')}
            extraLinks={extraLinks}
          />

          {showWalk && ordered?.returnLeg ? (
            <PersonWalk
              locale={locale}
              heading={personWalkHeading(person.name, locale)}
              subLine={t('walkOrderNote')}
              hotelName={t('hotelName')}
              startLabel={t('walkStart')}
              stops={walkStops}
              returnLeg={ordered.returnLeg}
              also={also}
              alsoHeading={t('alsoRecommends', { name: vorname })}
            />
          ) : showAlsoOnly ? (
            <PersonWalk
              locale={locale}
              heading={personWalkHeading(person.name, locale)}
              subLine={t('walkOrderNote')}
              hotelName={t('hotelName')}
              startLabel={t('walkStart')}
              stops={[]}
              returnLeg={null}
              also={also}
              alsoHeading={t('alsoRecommends', { name: vorname })}
            />
          ) : null}
        </div>

        {hasBio ? (
          <div className="mt-16 px-section-sm md:px-section-x">
            <EditorialBand
              ratio="1:2"
              image={portraitUrl ? { src: portraitUrl, alt: portraitAlt } : null}
              heading={te('letterHeading')}
              id="letter"
            >
              <RichTextParagraphs
                value={person.bio}
                className="mt-4 max-w-prose"
                paragraphClassName="font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a]"
              />
              {(website || instagram) && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {website ? (
                    <LineCta href={website} external className="text-ui-sm">
                      {hostOnly(website)}
                    </LineCta>
                  ) : null}
                  {instagram ? (
                    <LineCta href={instagram} external className="text-ui-sm">
                      {igHandle(instagram)}
                    </LineCta>
                  ) : null}
                </div>
              )}
            </EditorialBand>
          </div>
        ) : null}

        {videoUrl ? (
          <div className="mt-10 px-section-sm md:px-section-x">
            <VideoEmbed
              url={videoUrl}
              title={t('videoTitle', { name: person.name })}
              className="max-w-2xl"
            />
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
          <div className="place-c-onward">
            <p className="place-c-onward__line">{t('bridgeIntro')}</p>
            <SweepCta href="/you-me-berlin" color="ctx" edge="right">
              {t('backToList')}
            </SweepCta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
