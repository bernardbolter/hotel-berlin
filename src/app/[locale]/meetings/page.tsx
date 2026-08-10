import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { DocumentCard } from '@/components/meetings/DocumentCard'
import { EventTypeTile } from '@/components/meetings/EventTypeTile'
import { FacilityTile } from '@/components/meetings/FacilityTile'
import { MeetingInquirySection } from '@/components/meetings/MeetingInquirySection'
import { MeetingRoomFinder } from '@/components/meetings/MeetingRoomFinder'
import type { MeetingRoomSummaryCard } from '@/components/meetings/RoomFinderCard'
import { MeetingsHero } from '@/components/meetings/MeetingsHero'
import { MeetingsTeaserSplit } from '@/components/meetings/MeetingsTeaserSplit'
import {
  buildMeetingsListGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { mapMeetingRoomToAeo } from '@/lib/meetings/mapMeetingToAeo'
import {
  AREA_LABELS,
  areaLabel,
  combinableRoomNames,
  maxCapacity,
  mediaFileUrl,
  meetingCanonicalPath,
  meetingTeaserImage,
  resolveLocale,
  topCapacities,
} from '@/lib/meetings/meetingPage'
import { getMeetingRooms } from '@/lib/payload/meetingRooms'
import {
  getHybridDocument,
  getMeetingDocumentByPageRole,
  getMeetingDocuments,
  getMeetingsGlobal,
} from '@/lib/payload/meetings'
import type { MeetingRoom } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations({ locale, namespace: 'meetingsPage' })
  const path = meetingCanonicalPath(locale)

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: `https://hotel-berlin.de${meetingCanonicalPath('de')}`,
        en: `https://hotel-berlin.de${meetingCanonicalPath('en')}`,
        'x-default': `https://hotel-berlin.de${meetingCanonicalPath('de')}`,
      },
    },
  }
}

function toFinderCard(
  room: MeetingRoom,
  locale: 'de' | 'en',
  capacityLabel: (key: string) => string,
): MeetingRoomSummaryCard {
  const tops = topCapacities(room, 3)
  const c = room.capacity ?? {}
  const layoutKeys = (
    ['theater', 'classroom', 'banquet', 'uShape', 'cabaret', 'reception', 'block'] as const
  ).filter((key) => typeof c[key] === 'number' && (c[key] as number) > 0)

  return {
    slug: room.slug,
    name: room.name,
    areaValue: room.area,
    areaLabel: areaLabel(room.area, locale),
    sizeM2: room.floorSizeM2,
    teaserImage: meetingTeaserImage(room),
    capacityLines: tops.map((row) => ({
      label: capacityLabel(row.key),
      labelKey: row.key,
      value: row.value,
    })),
    layoutKeys,
    maxGuests: maxCapacity(room) ?? 0,
    hasDaylight: Boolean(room.hasDaylight),
    isDivisible: Boolean(room.isDivisible),
    hasScreen: Boolean(room.hasScreen),
    hasProjector: Boolean(room.hasProjector),
    combinableWithNames: combinableRoomNames(room, locale).map((r) => r.name),
  }
}

export default async function MeetingsIndexPage({ params }: Props) {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('meetingsPage')

  const [rooms, documents, meetings, hybridDoc, banquetDoc] = await Promise.all([
    getMeetingRooms(locale),
    getMeetingDocuments(locale),
    getMeetingsGlobal(locale),
    getHybridDocument(locale),
    getMeetingDocumentByPageRole('banquet-teaser', locale),
  ])

  const capacityLabel = (key: string) => t(`capacity.${key}` as 'capacity.theater')
  const finderRooms = rooms.map((room) => toFinderCard(room, locale, capacityLabel))
  const graph = buildMeetingsListGraph(
    rooms.map(mapMeetingRoomToAeo),
    defaultConfig,
  )

  const heroImages =
    meetings.heroSlides
      ?.map((slide) => {
        const media = slide.image
        if (!media || typeof media === 'number' || !media.url) return null
        return {
          src: media.url,
          alt: slide.alt || media.alt || meetings.heroHeadline || 'Meeting room',
        }
      })
      .filter((img): img is { src: string; alt: string } => img !== null) ?? []

  const hybridImage =
    meetings.hybridTeaser?.image &&
    typeof meetings.hybridTeaser.image === 'object' &&
    meetings.hybridTeaser.image.url
      ? {
          src: meetings.hybridTeaser.image.url,
          alt: meetings.hybridTeaser.image.alt || meetings.hybridTeaser.headline || '',
        }
      : null

  const foodImage =
    meetings.foodDrinkTeaser?.image &&
    typeof meetings.foodDrinkTeaser.image === 'object' &&
    meetings.foodDrinkTeaser.image.url
      ? {
          src: meetings.foodDrinkTeaser.image.url,
          alt:
            meetings.foodDrinkTeaser.image.alt ||
            meetings.foodDrinkTeaser.headline ||
            '',
        }
      : null

  const hybridUrl = hybridDoc ? mediaFileUrl(hybridDoc.file) : null
  const banquetUrl = banquetDoc ? mediaFileUrl(banquetDoc.file) : null

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="meetings" />
      <main id="main-content" className="bg-hbb-page">
        <MeetingsHero
          kicker={meetings.heroKicker}
          headline={meetings.heroHeadline || t('metaTitle')}
          intro={meetings.heroIntro || t('metaDescription')}
          contactLabel={meetings.heroContactLabel}
          contactPhone={meetings.contactPhone || '+49 30 2605 2700'}
          contactEmail={meetings.contactEmail || 'meetings@hotel-berlin.de'}
          ctaLabel={t('heroCta')}
          images={heroImages}
          galleryAriaLabel={t('galleryAria')}
        />

        <div className="mx-auto max-w-6xl px-section-sm md:px-section-x">
          <section aria-labelledby="docs-heading" className="py-section-y">
            <h2 id="docs-heading" className="font-ui text-2xl font-bold text-hbb-black">
              {t('documentsHeading')}
            </h2>
            <p className="mt-2 max-w-2xl font-serif text-serif-md text-[var(--body-text)]">
              {t('documentsIntro')}
            </p>
            <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => {
                const url = mediaFileUrl(doc.file)
                if (!url) return null
                return (
                  <li key={doc.id}>
                    <DocumentCard
                      title={doc.title}
                      categoryLabel={t(`categories.${doc.category}`)}
                      fileUrl={url}
                    />
                  </li>
                )
              })}
            </ul>
          </section>

          <Suspense fallback={null}>
            <MeetingRoomFinder
              rooms={finderRooms}
              areaOptions={Object.entries(AREA_LABELS).map(([value, labels]) => ({
                value,
                label: labels[locale],
              }))}
              sizeOptions={[
                { value: '0-50', label: t('sizes.0-50') },
                { value: '51-100', label: t('sizes.51-100') },
                { value: '101-200', label: t('sizes.101-200') },
                { value: '201+', label: t('sizes.201+') },
              ]}
              layoutOptions={[
                { value: 'theater', label: t('capacity.theater') },
                { value: 'classroom', label: t('capacity.classroom') },
                { value: 'banquet', label: t('capacity.banquet') },
                { value: 'uShape', label: t('capacity.uShape') },
                { value: 'block', label: t('capacity.block') },
              ]}
              guestOptions={[
                { value: '1-20', label: t('guests.1-20') },
                { value: '21-50', label: t('guests.21-50') },
                { value: '51-100', label: t('guests.51-100') },
                { value: '101+', label: t('guests.101+') },
              ]}
              featureOptions={[
                { value: 'screen', label: t('featureScreen') },
                { value: 'projector', label: t('featureProjector') },
                { value: 'daylight', label: t('featureDaylight') },
                { value: 'divisible', label: t('featureDivisible') },
              ]}
              sizeMetaLabel={t('sizeMeta')}
              combinableLabel={t('combinableWith')}
              featureLabels={{
                daylight: t('featureDaylight'),
                divisible: t('featureDivisible'),
                screen: t('featureScreen'),
                projector: t('featureProjector'),
              }}
            />
          </Suspense>

          {(meetings.eventTypes?.length ?? 0) > 0 ? (
            <section
              aria-labelledby={
                meetings.eventTypesHeading || t('eventTypesHeading')
                  ? 'event-types-heading'
                  : undefined
              }
              className="py-section-y"
            >
              {meetings.eventTypesHeading || t('eventTypesHeading') ? (
                <h2 id="event-types-heading" className="font-ui text-2xl font-bold text-hbb-black">
                  {meetings.eventTypesHeading || t('eventTypesHeading')}
                </h2>
              ) : null}
              <ul
                role="list"
                className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${
                  meetings.eventTypesHeading || t('eventTypesHeading') ? 'mt-8' : ''
                }`}
              >
                {meetings.eventTypes?.map((item, index) => {
                  const media =
                    item.image && typeof item.image === 'object' && item.image.url
                      ? {
                          src: item.image.url,
                          alt: item.image.alt || item.label,
                        }
                      : null
                  return (
                    <li key={item.id ?? item.key ?? index} className="h-full">
                      <EventTypeTile
                        icon={item.lucideIcon}
                        label={item.label}
                        description={item.description}
                        image={media}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </div>

        {meetings.hybridTeaser?.headline && hybridUrl ? (
          <MeetingsTeaserSplit
            kicker={meetings.hybridTeaser.kicker || t('hybridKicker')}
            headline={meetings.hybridTeaser.headline}
            body={meetings.hybridTeaser.body || ''}
            ctaLabel={meetings.hybridTeaser.ctaLabel || t('hybridCta')}
            ctaHref={hybridUrl}
            image={hybridImage}
            external
          />
        ) : meetings.hybridTeaser?.headline ? (
          <MeetingsTeaserSplit
            kicker={meetings.hybridTeaser.kicker || t('hybridKicker')}
            headline={meetings.hybridTeaser.headline}
            body={meetings.hybridTeaser.body || ''}
            ctaLabel={meetings.hybridTeaser.ctaLabel || t('hybridCta')}
            ctaHref="#anfrage"
            image={hybridImage}
          />
        ) : null}

        {meetings.foodDrinkTeaser?.headline ? (
          <MeetingsTeaserSplit
            reverse
            kicker={meetings.foodDrinkTeaser.kicker || t('foodKicker')}
            headline={meetings.foodDrinkTeaser.headline}
            body={meetings.foodDrinkTeaser.body || ''}
            ctaLabel={meetings.foodDrinkTeaser.ctaLabel || t('foodCta')}
            ctaHref={banquetUrl || '/restaurant'}
            image={foodImage}
            external={Boolean(banquetUrl)}
          />
        ) : null}

        <div className="mx-auto max-w-6xl px-section-sm md:px-section-x">
          {(meetings.facilities?.length ?? 0) > 0 ? (
            <section aria-labelledby="facilities-heading" className="py-section-y">
              <h2 id="facilities-heading" className="font-ui text-2xl font-bold text-hbb-black">
                {t('facilitiesHeading')}
              </h2>
              <ul role="list" className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {meetings.facilities?.map((item, index) => (
                  <li key={item.id ?? index}>
                    <FacilityTile
                      icon={item.lucideIcon}
                      label={item.label}
                      description={item.description}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <MeetingInquirySection
          locale={locale}
          contactPhone={meetings.contactPhone}
          contactEmail={meetings.contactEmail}
          eventTypeOptions={
            (meetings.eventTypes?.length
              ? meetings.eventTypes.map((item) => ({
                  value: item.label,
                  label: item.label,
                }))
              : (t.raw('request.fallbackEvents') as string[]).map((label) => ({
                  value: label,
                  label,
                })))
          }
          roomOptions={rooms.map((room) => ({
            id: room.id,
            slug: room.slug,
            name: room.name,
          }))}
        />
      </main>
      <SiteFooter showBookDirectStrip={false} />
    </>
  )
}
