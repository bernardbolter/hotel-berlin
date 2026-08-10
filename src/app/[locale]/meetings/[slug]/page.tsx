import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { CapacityTable } from '@/components/meetings/CapacityTable'
import { DocumentCard } from '@/components/meetings/DocumentCard'
import { MeetingInquirySection } from '@/components/meetings/MeetingInquirySection'
import { MeetingRoomFeatureIcons } from '@/components/meetings/MeetingRoomFeatureIcons'
import { MeetingSpecStrip } from '@/components/meetings/MeetingSpecStrip'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { RoomGallery } from '@/components/rooms/RoomGallery'
import { Link } from '@/i18n/routing'
import {
  buildMeetingRoomPageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { mapMeetingRoomToAeo } from '@/lib/meetings/mapMeetingToAeo'
import {
  areaLabel,
  combinableRoomNames,
  MEETING_INQUIRY_ANCHOR,
  meetingCanonicalPath,
  meetingGalleryImages,
  mediaFileUrl,
  resolveLocale,
} from '@/lib/meetings/meetingPage'
import { getMeetingRoomBySlug, getMeetingRoomSlugs, getMeetingRooms } from '@/lib/payload/meetingRooms'
import { getMeetingsGlobal, getRelatedFloorPlan } from '@/lib/payload/meetings'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getMeetingRoomSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const room = await getMeetingRoomBySlug(slug, locale)
  if (!room) return { title: 'Not found' }

  const path = meetingCanonicalPath(locale, slug)

  return {
    title: `${room.name} | Hotel Berlin, Berlin`,
    description: room.shortDescription ?? undefined,
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: `https://hotel-berlin.de${meetingCanonicalPath('de', slug)}`,
        en: `https://hotel-berlin.de${meetingCanonicalPath('en', slug)}`,
        'x-default': `https://hotel-berlin.de${meetingCanonicalPath('de', slug)}`,
      },
    },
  }
}

export default async function MeetingRoomDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('meetingsPage')
  const room = await getMeetingRoomBySlug(slug, locale)

  if (!room) notFound()

  const gallery = meetingGalleryImages(room)
  const combinable = combinableRoomNames(room, locale)
  const [floorPlan, allRooms, meetings] = await Promise.all([
    room.area ? getRelatedFloorPlan(room.area, locale) : Promise.resolve(null),
    getMeetingRooms(locale),
    getMeetingsGlobal(locale),
  ])
  const floorPlanUrl = floorPlan ? mediaFileUrl(floorPlan.file) : null
  const graph = buildMeetingRoomPageGraph(mapMeetingRoomToAeo(room), defaultConfig, {
    home: t('breadcrumbHome'),
    meetings: t('breadcrumbMeetings'),
  })
  const area = areaLabel(room.area, locale)
  const eventTypeOptions =
    meetings.eventTypes?.length
      ? meetings.eventTypes.map((item) => ({
          value: item.label,
          label: item.label,
        }))
      : (t.raw('request.fallbackEvents') as string[]).map((label) => ({
          value: label,
          label,
        }))
  const roomOptions = allRooms.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
  }))

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="meetings" />
      <main id="main-content" className="bg-hbb-page">
        <div className="mx-auto max-w-5xl px-section-sm pt-section-y md:px-section-x">
          <nav aria-label="Breadcrumb" className="font-ui text-ui-sm text-gray-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:underline">
                  {t('breadcrumbHome')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/meetings" className="hover:underline">
                  {t('breadcrumbMeetings')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-500" aria-current="page">
                {room.name}
              </li>
            </ol>
          </nav>

          <h1 className="mt-6 font-ui text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.15] text-hbb-black">
            {room.name}
            {area ? (
              <span className="mt-1 block font-ui text-base font-medium text-hbb-teal md:mt-0 md:ml-3 md:inline">
                · {area}
              </span>
            ) : null}
          </h1>
        </div>

        {gallery.length > 0 ? (
          <RoomGallery
            className="mt-8"
            images={gallery}
            ariaLabel={t('galleryAria')}
            prevLabel={t('prevImage')}
            nextLabel={t('nextImage')}
            counterTemplate="{current} / {total}"
          />
        ) : null}

        <div className="mx-auto max-w-5xl px-section-sm pb-section-y md:px-section-x">
          <MeetingSpecStrip
            className="mt-10"
            items={[
              {
                icon: 'size',
                label: t('specSize'),
                value: `${room.floorSizeM2} m²`,
              },
              {
                icon: 'daylight',
                label: t('specDaylight'),
                value: room.hasDaylight ? t('yes') : t('no'),
              },
              {
                icon: 'ceiling',
                label: t('specCeiling'),
                value: room.ceilingHeightM ? `${room.ceilingHeightM} m` : '–',
              },
              {
                icon: 'combinable',
                label: t('specCombinable'),
                value:
                  combinable.length > 0
                    ? combinable.map((r) => r.name).join(', ')
                    : '–',
              },
            ]}
          />

          {combinable.length > 0 ? (
            <p className="mt-4 font-ui text-ui-sm text-[var(--dim)]">
              {t('combinableWith')}{' '}
              {combinable.map((r, i) => (
                <span key={r.slug}>
                  {i > 0 ? ', ' : null}
                  <Link
                    href={{ pathname: '/meetings/[slug]', params: { slug: r.slug } }}
                    className="text-hbb-teal underline-offset-2 hover:underline"
                  >
                    {r.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}

          {room.shortDescription && !room.description ? (
            <p className="mt-10 max-w-2xl font-serif text-serif-md text-gray-700">
              {room.shortDescription}
            </p>
          ) : null}

          <RichTextParagraphs
            value={room.description}
            className="mt-10 max-w-2xl"
            paragraphClassName="font-serif text-serif-md text-gray-700"
          />

          <h2 className="mt-10 font-ui text-xl font-bold text-hbb-black">{t('capacityHeading')}</h2>
          <CapacityTable
            className="mt-4"
            capacities={room.capacity ?? {}}
            labels={{
              theater: t('capacity.theater'),
              classroom: t('capacity.classroom'),
              banquet: t('capacity.banquet'),
              uShape: t('capacity.uShape'),
              cabaret: t('capacity.cabaret'),
              reception: t('capacity.reception'),
              block: t('capacity.block'),
            }}
            features={{
              isDivisible: room.isDivisible,
              hasScreen: room.hasScreen,
              hasProjector: room.hasProjector,
              labels: {
                divisible: t('featureDivisible'),
                screen: t('featureScreen'),
                projector: t('featureProjector'),
              },
            }}
          />

          {room.hasDaylight ? (
            <MeetingRoomFeatureIcons
              className="mt-6"
              hasDaylight={room.hasDaylight}
              labels={{
                daylight: t('featureDaylight'),
                divisible: t('featureDivisible'),
                screen: t('featureScreen'),
                projector: t('featureProjector'),
              }}
            />
          ) : null}

          {floorPlan && floorPlanUrl ? (
            <div className="mt-12">
              <h2 className="font-ui text-xl font-bold text-hbb-black">{t('relatedDocs')}</h2>
              <div className="mt-4 max-w-md">
                <DocumentCard
                  title={floorPlan.title}
                  categoryLabel={t('categories.floor-plan')}
                  fileUrl={floorPlanUrl}
                />
              </div>
            </div>
          ) : null}

          <SweepCta
            href={`#${MEETING_INQUIRY_ANCHOR}`}
            unlocalized
            color="meet-work"
            className="mt-10"
          >
            {t('requestRoom')}
          </SweepCta>

          <div className="mt-14 border-t border-gray-200 pt-10">
            <SweepCta href="/meetings" color="ink">
              {t('allMeetingRooms')}
            </SweepCta>
          </div>
        </div>

        <MeetingInquirySection
          className="mt-4"
          locale={locale}
          contactPhone={meetings.contactPhone}
          contactEmail={meetings.contactEmail}
          eventTypeOptions={eventTypeOptions}
          roomOptions={roomOptions}
          preselectedRoomSlug={room.slug}
        />
      </main>
      <SiteFooter showBookDirectStrip={false} />
    </>
  )
}
