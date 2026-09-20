import { formatBerlinTime, getBerlinParts } from '@/lib/venue-time/berlin'
import { formatEventPrice, venueFloor } from '@/lib/spotlight/eventMeta'
import { categoryTokenForEventCategory } from '@/lib/spotlight/categoryTokens'
import type { EventOccurrence } from '@/lib/payload/getEventOccurrences'
import type { Exhibition, Venue } from '@/payload-types'

export const AGENDA_WINDOW_DAYS = 30
export const FEATURED_MAX = 3

export type AgendaFilter = 'all' | 'music' | 'sport' | 'art' | 'community'

export const AGENDA_FILTERS: { id: AgendaFilter; de: string; en: string }[] = [
  { id: 'all', de: 'alle', en: 'all' },
  { id: 'music', de: 'musik', en: 'music' },
  { id: 'sport', de: 'sport', en: 'sport' },
  { id: 'art', de: 'kunst', en: 'art' },
  { id: 'community', de: 'community', en: 'community' },
]

const FILTER_EVENT_CATEGORY: Record<Exclude<AgendaFilter, 'all'>, string> = {
  music: 'Music',
  sport: 'Sport',
  art: 'Art',
  community: 'Community',
}

export function parseAgendaFilter(raw: string | null | undefined): AgendaFilter {
  if (!raw) return 'all'
  const token = raw.trim().toLowerCase()
  const match = AGENDA_FILTERS.find((row) => row.de === token || row.en === token || row.id === token)
  return match?.id ?? 'all'
}

export function agendaFilterParam(locale: 'de' | 'en'): 'kategorie' | 'category' {
  return locale === 'de' ? 'kategorie' : 'category'
}

export function agendaFilterQuery(filter: AgendaFilter, locale: 'de' | 'en'): string {
  if (filter === 'all') return ''
  const row = AGENDA_FILTERS.find((item) => item.id === filter)
  const value = locale === 'de' ? row?.de : row?.en
  if (!value) return ''
  return `?${agendaFilterParam(locale)}=${value}`
}

export type AgendaRow = {
  kind: 'event' | 'exhibition'
  key: string
  slug: string
  href: string
  title: string
  timeLabel: string
  allDay: boolean
  category: string | null
  categoryToken: string
  venueShort: string | null
  floor: string | null
  price: string | null
  until: string | null
  dateKey: string
  start: Date
}

export type AgendaDay = {
  dateKey: string
  kind: 'today' | 'tomorrow' | 'weekday'
  weekday: string
  dateShort: string
  rows: AgendaRow[]
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function dateShort(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number)
  return `${day}.${month}.`
}

function weekdayLong(dateKey: string, locale: 'de' | 'en'): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date)
}

function venueName(occ: EventOccurrence): string | null {
  const venue = typeof occ.event.venue === 'object' && occ.event.venue ? occ.event.venue : null
  return venue?.name?.trim() || null
}

function eventMatchesFilter(category: string | null | undefined, filter: AgendaFilter): boolean {
  if (filter === 'all') return true
  return category === FILTER_EVENT_CATEGORY[filter]
}

const CATEGORY_TO_FILTER: Record<string, Exclude<AgendaFilter, 'all'>> = {
  Music: 'music',
  Sport: 'sport',
  Art: 'art',
  Community: 'community',
}

const CATEGORY_LABEL: Record<Exclude<AgendaFilter, 'all'>, { de: string; en: string }> = {
  music: { de: 'Musik', en: 'Music' },
  sport: { de: 'Sport', en: 'Sport' },
  art: { de: 'Kunst', en: 'Art' },
  community: { de: 'Community', en: 'Community' },
}

export function agendaCategoryLabel(category: string | null | undefined, locale: 'de' | 'en'): string | null {
  if (!category) return null
  const id = CATEGORY_TO_FILTER[category]
  if (!id) return category
  return CATEGORY_LABEL[id][locale]
}

export function featuredSkipKeys(
  featured: Array<{ kind: 'event'; occurrence: EventOccurrence } | { kind: 'exhibition'; id: string | number }>,
  now: Date,
): Set<string> {
  const today = getBerlinParts(now).dateKey
  const keys = new Set<string>()
  for (const item of featured) {
    if (item.kind === 'exhibition') {
      keys.add(`exhibition:${item.id}:${today}`)
      continue
    }
    const dateKey = item.occurrence.alwaysOn ? today : getBerlinParts(item.occurrence.start).dateKey
    keys.add(`event:${item.occurrence.event.id}:${dateKey}`)
  }
  return keys
}

export function buildAgendaDays(args: {
  occurrences: EventOccurrence[]
  exhibition?: { id: string | number; title: string; slug: string; endDate?: string | null; venue: Venue | null } | null
  now: Date
  locale: 'de' | 'en'
  filter?: AgendaFilter
  skipKeys?: Set<string>
  exhibitionHref?: string
}): AgendaDay[] {
  const locale = args.locale
  const filter = args.filter ?? 'all'
  const skip = args.skipKeys ?? new Set<string>()
  const today = getBerlinParts(args.now).dateKey
  const tomorrow = addDaysToDateKey(today, 1)
  const windowEnd = addDaysToDateKey(today, AGENDA_WINDOW_DAYS - 1)
  const byDay = new Map<string, AgendaRow[]>()

  const seen = new Set<string>()
  const push = (row: AgendaRow) => {
    if (row.dateKey < today || row.dateKey > windowEnd) return
    if (skip.has(row.key) || seen.has(row.key)) return
    seen.add(row.key)
    const list = byDay.get(row.dateKey) ?? []
    list.push(row)
    byDay.set(row.dateKey, list)
  }

  for (const occ of args.occurrences) {
    if (!eventMatchesFilter(occ.event.category, filter)) continue
    const venue = typeof occ.event.venue === 'object' && occ.event.venue ? occ.event.venue : null
    const dateKey = occ.alwaysOn ? today : getBerlinParts(occ.start).dateKey
    const row: AgendaRow = {
      kind: 'event',
      key: `event:${occ.event.id}:${dateKey}`,
      slug: occ.event.slug,
      href: `/happenings/${occ.event.slug}`,
      title: occ.event.name,
      timeLabel: occ.alwaysOn ? '' : formatBerlinTime(occ.start),
      allDay: Boolean(occ.alwaysOn),
      category: agendaCategoryLabel(occ.event.category, locale),
      categoryToken: categoryTokenForEventCategory(occ.event.category),
      venueShort: venueName(occ),
      floor: venueFloor(venue, locale) || null,
      price: formatEventPrice(occ.event, locale) || null,
      until: null,
      dateKey,
      start: occ.start,
    }
    push(row)
  }

  if (args.exhibition && (filter === 'all' || filter === 'art')) {
    const exhibition = args.exhibition
    const until = exhibition.endDate ? formatUntil(exhibition.endDate, locale) : null
    push({
      kind: 'exhibition',
      key: `exhibition:${exhibition.id}:${today}`,
      slug: exhibition.slug,
      href: args.exhibitionHref ?? '/here/art',
      title: exhibition.title,
      timeLabel: '',
      allDay: true,
      category: agendaCategoryLabel('Art', locale),
      categoryToken: 'art',
      venueShort: exhibition.venue?.name?.trim() || 'FKKB',
      floor: venueFloor(exhibition.venue, locale) || null,
      price: until,
      until,
      dateKey: today,
      start: args.now,
    })
  }

  const days: AgendaDay[] = []
  const keys = [...byDay.keys()].sort()
  for (const dateKey of keys) {
    const rows = (byDay.get(dateKey) ?? []).sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1
      return a.start.getTime() - b.start.getTime()
    })
    days.push({
      dateKey,
      kind: dateKey === today ? 'today' : dateKey === tomorrow ? 'tomorrow' : 'weekday',
      weekday: weekdayLong(dateKey, locale),
      dateShort: dateShort(dateKey),
      rows,
    })
  }
  return days
}

function formatUntil(endDate: string, locale: 'de' | 'en'): string {
  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) return ''
  const formatted = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
  return locale === 'de' ? `bis ${formatted}` : `until ${formatted}`
}
