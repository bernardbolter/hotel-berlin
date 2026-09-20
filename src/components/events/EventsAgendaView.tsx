import { getTranslations } from 'next-intl/server'

import { AgendaRow } from '@/components/events/AgendaRow'
import { EventsRow } from '@/components/events/EventsRow'
import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import {
  AGENDA_FILTERS,
  AGENDA_WINDOW_DAYS,
  FEATURED_MAX,
  agendaFilterQuery,
  buildAgendaDays,
  featuredSkipKeys,
  parseAgendaFilter,
  type AgendaFilter,
} from '@/lib/events/agenda'
import { pickHubStrip } from '@/lib/here/pickHubStrip'
import { exhibitionAlwaysOnCard } from '@/lib/here/getHubStripCards'
import { getEventOccurrences } from '@/lib/payload/getEventOccurrences'
import { getVenueBySlug } from '@/lib/payload/venues'
import { getBerlinNow } from '@/lib/venue-time/berlin'
import { getCurrentExhibitionForVenue } from '@/lib/venue-time/queries'
import { resolveEventSpotlight } from '@/lib/spotlight/resolvers'
import type { SpotlightFraming, SpotlightCardProps } from '@/lib/spotlight/types'
import type { Exhibition, Venue } from '@/payload-types'

type Props = {
  locale: string
  framing: SpotlightFraming
  filterRaw?: string
  pathname: '/happenings' | '/here/events'
}

export async function EventsAgendaView({ locale, framing, filterRaw, pathname }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const t = await getTranslations('events.agenda')
  const filter = parseAgendaFilter(filterRaw)
  const now = getBerlinNow()
  const to = new Date(now.getTime() + AGENDA_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const [occurrences, fkkb] = await Promise.all([
    getEventOccurrences({ from: now, to, locale: loc, includeAlwaysOn: true }).catch((error) => {
      console.error('[EventsAgendaView] occurrences failed', error)
      return []
    }),
    getVenueBySlug('fkkb', loc).catch((error) => {
      console.error('[EventsAgendaView] venue failed', error)
      return null
    }),
  ])
  const exhibition = fkkb
    ? await getCurrentExhibitionForVenue(fkkb.id, now).catch(() => null)
    : null

  const slots = pickHubStrip(occurrences, Boolean(exhibition && fkkb), now, FEATURED_MAX)
  const skip = featuredSkipKeys(
    slots.map((slot) =>
      slot.kind === 'exhibition'
        ? { kind: 'exhibition' as const, id: (exhibition as Exhibition).id }
        : { kind: 'event' as const, occurrence: slot.occurrence },
    ),
    now,
  )

  const featured: SpotlightCardProps[] = []
  for (const slot of slots) {
    if (slot.kind === 'exhibition') {
      if (!fkkb || !exhibition) continue
      const card = exhibitionAlwaysOnCard({
        venue: fkkb,
        exhibition: exhibition as Exhibition,
        locale: loc,
        framing,
      })
      if (card) featured.push(card)
      continue
    }
    const card = await resolveEventSpotlight(slot.occurrence.event, {
      locale: loc,
      now,
      framing,
      occurrence: { start: slot.occurrence.start, end: slot.occurrence.end },
      alwaysOn: slot.occurrence.alwaysOn,
    })
    if (card) featured.push(card)
  }

  const days = buildAgendaDays({
    occurrences,
    exhibition:
      exhibition && fkkb
        ? {
            id: exhibition.id,
            title: exhibition.title,
            slug: exhibition.slug,
            endDate: exhibition.endDate,
            venue: fkkb as Venue,
          }
        : null,
    now,
    locale: loc,
    filter,
    skipKeys: skip,
    exhibitionHref: framing === 'guest' ? '/here/art' : '/happenings',
  })

  const emptyOverall = featured.length === 0 && days.length === 0 && filter === 'all'
  const emptyFilter = filter !== 'all' && days.length === 0
  const filterHref = (id: AgendaFilter) => `${pathname}${agendaFilterQuery(id, loc)}`

  return (
    <div className="events-agenda">
      {featured.length > 0 ? (
        <EventsRow items={featured} ariaLabel={t('featuredAria')} max={FEATURED_MAX} />
      ) : null}

      <nav className="events-agenda-filters" aria-label={t('filtersAria')}>
        {AGENDA_FILTERS.map((row) => {
          const id = row.id
          const href = filterHref(id)
          const current = filter === id
          return (
            <Link
              key={id}
              href={toAppHref(href)}
              className={current ? 'is-active' : undefined}
              aria-current={current ? 'page' : undefined}
            >
              {t(id)}
            </Link>
          )
        })}
      </nav>

      {emptyOverall ? (
        <p className="events-agenda-empty">
          {t('emptyWindow')}{' '}
          <Link href="/amenities" className="underline-offset-2 hover:underline">
            {t('amenitiesLink')}
          </Link>
        </p>
      ) : null}

      {emptyFilter ? (
        <p className="events-agenda-empty">
          {t('emptyFilter')}{' '}
          <Link href={pathname} className="underline-offset-2 hover:underline">
            {t('all')}
          </Link>
        </p>
      ) : null}

      {days.map((day) => (
        <section key={day.dateKey} className="events-agenda-day" aria-labelledby={`agenda-${day.dateKey}`}>
          <h2 id={`agenda-${day.dateKey}`} className="events-agenda-day__h">
            {day.kind === 'today' ? t('today') : day.kind === 'tomorrow' ? t('tomorrow') : day.weekday}
            <span> {day.dateShort}</span>
          </h2>
          <ul className="events-agenda-list">
            {day.rows.map((row) => (
              <li key={row.key}>
                <AgendaRow row={row} copy={{ allDay: t('allDay'), details: t('details') }} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function agendaCanonicalPath(locale: 'de' | 'en', pathname: '/happenings' | '/here/events'): string {
  if (pathname === '/happenings') {
    return locale === 'de' ? 'https://hotel-berlin.de/de/happenings' : 'https://hotel-berlin.de/en/happenings'
  }
  return locale === 'de' ? 'https://hotel-berlin.de/de/hier/events' : 'https://hotel-berlin.de/en/here/events'
}
