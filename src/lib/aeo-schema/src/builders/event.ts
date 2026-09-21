import type { HotelEvent, JsonLdGraph, JsonLdNode, SiteConfig } from '../types'
import { eventNodeId, eventUrl, happeningsListUrl, hotelNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

const BYDAY_SCHEMA: Record<string, string> = {
  SU: 'https://schema.org/Sunday',
  MO: 'https://schema.org/Monday',
  TU: 'https://schema.org/Tuesday',
  WE: 'https://schema.org/Wednesday',
  TH: 'https://schema.org/Thursday',
  FR: 'https://schema.org/Friday',
  SA: 'https://schema.org/Saturday',
}

const FREQ_DURATION: Record<string, string> = {
  DAILY: 'P1D',
  WEEKLY: 'P1W',
  MONTHLY: 'P1M',
}

function berlinTime(iso: string): string | undefined {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const hour = parts.find((p) => p.type === 'hour')?.value
  const minute = parts.find((p) => p.type === 'minute')?.value
  if (hour == null || minute == null) return undefined
  return `${hour}:${minute}`
}

function parseRrule(rule: string | null | undefined): { freq: string; byDay: string[] } | null {
  if (!rule?.trim()) return null
  const parts = Object.fromEntries(
    rule
      .trim()
      .split(';')
      .map((pair) => {
        const [k, v] = pair.split('=')
        return [k?.toUpperCase(), v]
      })
      .filter(([k, v]) => k && v),
  ) as Record<string, string>

  const freq = parts.FREQ?.toUpperCase()
  if (!freq || !FREQ_DURATION[freq]) return null

  const byDay =
    parts.BYDAY?.split(',')
      .map((token) => {
        const m = /(-?\d)?(SU|MO|TU|WE|TH|FR|SA)/i.exec(token.trim())
        return m?.[2]?.toUpperCase() ?? null
      })
      .filter((d): d is string => Boolean(d)) ?? []

  return { freq, byDay }
}

/** RRULE → schema.org Schedule. Returns undefined for non-recurring events. */
export function rruleToSchedule(
  event: Pick<HotelEvent, 'isRecurring' | 'recurrenceRule' | 'startDate' | 'endDate'>,
): JsonLdNode | undefined {
  if (!event.isRecurring || !event.recurrenceRule) return undefined
  const parsed = parseRrule(event.recurrenceRule)
  if (!parsed) return undefined

  const byDay =
    parsed.byDay.length === 1
      ? BYDAY_SCHEMA[parsed.byDay[0]!]
      : parsed.byDay.length > 1
        ? parsed.byDay.map((d) => BYDAY_SCHEMA[d]).filter(Boolean)
        : undefined

  return prune({
    '@type': 'Schedule',
    repeatFrequency: FREQ_DURATION[parsed.freq],
    byDay,
    startTime: berlinTime(event.startDate),
    endTime: event.endDate ? berlinTime(event.endDate) : undefined,
    scheduleTimezone: 'Europe/Berlin',
  })
}

function buildOffer(event: HotelEvent): JsonLdNode | undefined {
  if (event.isFree) {
    return prune({
      '@type': 'Offer',
      price: '0',
      priceCurrency: event.priceCurrency ?? 'EUR',
    })
  }
  if (event.price == null) return undefined
  return prune({
    '@type': 'Offer',
    price: event.price,
    priceCurrency: event.priceCurrency ?? 'EUR',
  })
}

function buildLocation(event: HotelEvent, config: SiteConfig): JsonLdNode | undefined {
  if (!event.venue) return undefined
  return prune({
    '@type': 'Place',
    name: event.venue.name,
    address: event.venue.location,
    containedInPlace: { '@id': hotelNodeId(config) },
  })
}

export function buildEventNode(event: HotelEvent, config: SiteConfig): JsonLdNode {
  const schedule = rruleToSchedule(event)
  return prune({
    '@type': 'Event',
    '@id': eventNodeId(event.slug, config),
    name: event.name,
    description: event.description,
    url: eventUrl(event.slug, config),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    startDate: schedule ? undefined : event.startDate,
    endDate: schedule ? undefined : event.endDate,
    eventSchedule: schedule,
    location: buildLocation(event, config),
    organizer: { '@id': hotelNodeId(config) },
    offers: buildOffer(event),
    isAccessibleForFree: event.isFree ? true : undefined,
  })
}

export function buildEventBreadcrumbList(
  event: HotelEvent,
  config: SiteConfig,
  labels: { home: string; happenings: string } = {
    home: 'Home',
    happenings: 'Happenings',
  },
): JsonLdNode {
  return prune({
    '@type': 'BreadcrumbList',
    '@id': `${eventUrl(event.slug, config)}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: labels.home,
        item: config.baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: labels.happenings,
        item: happeningsListUrl(config),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: event.name,
        item: eventUrl(event.slug, config),
      },
    ],
  })
}

export function buildEventPageGraph(
  event: HotelEvent,
  config: SiteConfig,
  breadcrumbLabels?: { home: string; happenings: string },
): JsonLdGraph {
  const eventNode = buildEventNode(event, config)
  const page: JsonLdNode = prune({
    '@type': 'WebPage',
    '@id': eventUrl(event.slug, config),
    url: eventUrl(event.slug, config),
    name: event.name,
    mainEntity: { '@id': eventNodeId(event.slug, config) },
  })
  return {
    '@context': 'https://schema.org',
    '@graph': [eventNode, page, buildEventBreadcrumbList(event, config, breadcrumbLabels)].filter(
      (n) => Object.keys(n).length > 0,
    ),
  }
}
