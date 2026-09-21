import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { BorrowedRow } from '@/components/entity/BorrowedRow'
import { EntityBand } from '@/components/entity/EntityBand'
import { EntityEventCard } from '@/components/entity/EntityEventCard'
import { EntityFacts } from '@/components/entity/EntityFacts'
import { EntityIdentity } from '@/components/entity/EntityIdentity'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { LineCta } from '@/components/primitives/LineCta'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { toAeoEvent } from '@/lib/aeo/mapToSchema'
import { buildEventPageGraph, defaultConfig } from '@/lib/aeo-schema/src/index'
import { entityMetadata, resolveLocale, venuePublicHref } from '@/lib/entity/canonical'
import {
  datetimeAttr,
  expandSchedule,
  formatPastOneOffLine,
  formatScheduleDate,
  isPastOneOff,
  scheduleSummary,
} from '@/lib/events/schedule'
import { getEventBySlug, getEventSlugs } from '@/lib/payload/entities'
import { getEventsInWindow } from '@/lib/payload/borrow'
import { categoryTokenForEventCategory } from '@/lib/spotlight/categoryTokens'
import { formatEventPrice, formatPracticalLine, venueFloor } from '@/lib/spotlight/eventMeta'
import { formatBerlinTime, getBerlinNow, isAlwaysOnDailyRecurring } from '@/lib/venue-time'
import { lexicalToParagraphs } from '@/lib/richText/lexicalToPlain'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getEventSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const event = await getEventBySlug(slug, locale)
  if (!event) return { title: 'Not found' }

  return entityMetadata({
    locale,
    pathname: '/happenings/[slug]',
    slug,
    title: `${event.name} | Hotel Berlin, Berlin`,
    description: event.shortDescription ?? undefined,
  })
}

export default async function HappeningDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('happenings')
  const te = await getTranslations('entity')
  const now = getBerlinNow()
  const event = await getEventBySlug(slug, locale)

  if (!event) notFound()

  const graph = buildEventPageGraph(toAeoEvent(event), defaultConfig)
  const venue = typeof event.venue === 'object' && event.venue ? event.venue : null
  const floor = venueFloor(venue, locale)
  const venueLine = [venue?.name, floor].filter(Boolean).join(' · ')
  const past = isPastOneOff(event, now)
  const alwaysOn = isAlwaysOnDailyRecurring(event.isRecurring, event.recurrenceRule)
  const summary = past
    ? formatPastOneOffLine(new Date(event.startDate), locale)
    : scheduleSummary(event, locale)
  const occurrences = alwaysOn || past ? [] : expandSchedule(event, { from: now, count: 8 })
  const borrowed = await getEventsInWindow(slug, locale, 3, now)
  const hasDescription = lexicalToParagraphs(event.description).length > 0
  const priceLine = formatPracticalLine(event, locale) || formatEventPrice(event, locale)
  const category = event.category

  const duration =
    event.startDate && event.endDate
      ? formatDuration(new Date(event.startDate), new Date(event.endDate), locale)
      : null

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page pb-section-y">
        <div className="pt-section-y">
          <EntityIdentity
            breadcrumb={{ label: t('title'), href: '/happenings' }}
            title={event.name}
            meta={[
              category
                ? { chip: category, token: categoryTokenForEventCategory(category) }
                : null,
              venueLine,
            ].filter((item): item is NonNullable<typeof item> => Boolean(item))}
          />
        </div>

        <div className="mt-8 px-section-sm md:px-section-x">
          <p
            className={`max-w-2xl font-ui text-ui-md ${past ? 'text-[var(--dim)]' : 'text-hbb-black'}`}
          >
            {priceLine || te('unpriced')}
          </p>
        </div>

        <EntityBand heading={te('schedule')} className="mt-12" id="schedule">
          {summary ? (
            <p className="mb-4 font-serif text-serif-sm text-gray-700">{summary}</p>
          ) : null}
          {alwaysOn ? null : past ? null : occurrences.length > 0 ? (
            <ol className="entity-schedule max-w-xl">
              {occurrences.map((occ) => (
                <li key={occ.start.toISOString()}>
                  <time dateTime={datetimeAttr(occ.start)} className="text-hbb-black">
                    {formatScheduleDate(occ.start, locale)}
                  </time>
                  <span className="tabular-nums text-[var(--dim)]">{formatBerlinTime(occ.start)}</span>
                </li>
              ))}
            </ol>
          ) : !event.isRecurring ? (
            <p>
              <time dateTime={datetimeAttr(new Date(event.startDate))} className="font-ui text-ui-md">
                {formatScheduleDate(new Date(event.startDate), locale)}
                {' · '}
                {formatBerlinTime(new Date(event.startDate))}
              </time>
            </p>
          ) : null}
        </EntityBand>

        {hasDescription ? (
          <EntityBand className="mt-12">
            <RichTextParagraphs
              value={event.description}
              className="max-w-[62ch]"
              paragraphClassName="font-serif text-serif-sm text-gray-700"
            />
          </EntityBand>
        ) : null}

        {venue ? (
          <EntityBand heading={venue.name} className="mt-12" id="venue">
            {floor ? <p className="mb-4 font-ui text-ui-sm text-[var(--dim)]">{floor}</p> : null}
            <LineCta href={venuePublicHref(venue.slug)} className="text-ui-sm">
              {te('toVenue')}
            </LineCta>
            <div className="mt-8">
              <EntityFacts
                rows={[
                  venue.location ? { term: te('address'), value: venue.location } : null,
                  { term: te('organiser'), value: 'Hotel Berlin, Berlin' },
                  duration ? { term: te('duration'), value: duration } : null,
                ]}
              />
            </div>
          </EntityBand>
        ) : null}

        {borrowed.length === 3 ? (
          <EntityBand
            heading={past ? te('whatNext') : te('thisWeek')}
            href="/happenings"
            ctaLabel={t('title')}
            className="mt-16"
            id="this-week"
          >
            <BorrowedRow
              items={borrowed}
              render={(item) => (
                <EntityEventCard
                  name={item.name}
                  slug={item.slug}
                  category={item.category}
                  meta={
                    item.alwaysOn
                      ? locale === 'de'
                        ? 'Täglich'
                        : 'Daily'
                      : formatScheduleDate(item.start, locale)
                  }
                />
              )}
            />
          </EntityBand>
        ) : null}

        <div className="px-section-sm pt-16 md:px-section-x">
          <SweepCta href="/here" color="ctx">
            {te('toGuestHub')}
          </SweepCta>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function formatDuration(start: Date, end: Date, locale: 'de' | 'en'): string | null {
  const ms = end.getTime() - start.getTime()
  if (!Number.isFinite(ms) || ms <= 0) return null
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return locale === 'de' ? `${minutes} Min.` : `${minutes} min`
  const hours = Math.round(minutes / 60)
  return locale === 'de' ? `${hours} Std.` : `${hours} h`
}
