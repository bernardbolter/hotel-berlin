import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { MeetingInquirySection } from '@/components/meetings/MeetingInquirySection'
import { Link } from '@/i18n/routing'
import {
  meetingRequestStandalonePath,
  resolveLocale,
} from '@/lib/meetings/meetingPage'
import { getMeetingRooms } from '@/lib/payload/meetingRooms'
import { getMeetingsGlobal } from '@/lib/payload/meetings'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ room?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations({ locale, namespace: 'meetingsPage' })
  const path = meetingRequestStandalonePath(locale)

  return {
    title: t('request.metaTitle'),
    description: t('request.metaDescription'),
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: 'https://hotel-berlin.de/de/tagungen/anfrage',
        en: 'https://hotel-berlin.de/en/meetings/request',
        'x-default': 'https://hotel-berlin.de/de/tagungen/anfrage',
      },
    },
  }
}

/** Standalone inquiry URL kept for SEO / bookmarks; same form as on /meetings. */
export default async function MeetingRequestPage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params
  const { room: roomSlug } = await searchParams
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('meetingsPage')

  const [rooms, meetings] = await Promise.all([
    getMeetingRooms(locale),
    getMeetingsGlobal(locale),
  ])

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

  const roomOptions = rooms.map((room) => ({
    id: room.id,
    slug: room.slug,
    name: room.name,
  }))

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="mx-auto max-w-2xl px-section-sm pt-section-y md:px-section-x">
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
                {t('request.breadcrumb')}
              </li>
            </ol>
          </nav>
        </div>

        <MeetingInquirySection
          locale={locale}
          headingLevel="h1"
          contactPhone={meetings.contactPhone}
          contactEmail={meetings.contactEmail}
          eventTypeOptions={eventTypeOptions}
          roomOptions={roomOptions}
          preselectedRoomSlug={roomSlug}
        />
      </main>
      <SiteFooter showBookDirectStrip={false} />
    </>
  )
}
