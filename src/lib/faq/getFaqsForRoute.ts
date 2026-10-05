import type { Faq, FaqTopic } from '@/payload-types'

import { getPayloadClient } from '@/lib/payload/client'
import { getFaqs } from '@/lib/faqs/getFaqs'

import {
  DEFAULT_FAQ_PLACEMENT_BY_ROUTE,
  type DefaultPlacement,
} from './defaultPlacements'
import {
  applyRouteCap,
  selectFaqsForRoute,
  type FaqEntityRef,
  type RoutePlacement,
} from './selectFaqsForRoute'
import type { FaqRouteKey } from './routes'
import {
  resolveFaqTokens,
  type FaqLocale,
  type TokenContext,
} from './tokens'

export type FaqForRoute = {
  id: number
  slug: string
  question: string
  answer: string
  category: Faq['category']
  order: number
  audience: Faq['audience']
  aliasSlugs?: { slug: string; id?: string | null }[] | null
  /** Original FAQ doc (pre-token text available via unresolved check already applied) */
  source: Faq
}

export type GetFaqsForRouteResult = {
  items: FaqForRoute[]
  trimmedCount: number
}

function asLocale(locale: string): FaqLocale {
  return locale === 'de' ? 'de' : 'en'
}

function topicSlugsFromPlacement(
  topics: (number | FaqTopic)[] | null | undefined,
): string[] {
  if (!Array.isArray(topics)) return []
  return topics
    .map((t) => (typeof t === 'object' && t && 'slug' in t ? t.slug : null))
    .filter((s): s is string => Boolean(s))
}

function fromDefault(d: DefaultPlacement): RoutePlacement {
  return {
    route: d.route,
    audience: d.audience,
    topics: [...d.topics],
    cap: d.cap,
    showAll: d.showAll,
  }
}

async function loadPlacement(routeKey: FaqRouteKey): Promise<RoutePlacement | null> {
  try {
    const payload = await getPayloadClient()
    const global = await payload.findGlobal({
      slug: 'faq-placements',
      depth: 1,
      overrideAccess: true,
    })
    const rows = global?.placements
    if (!Array.isArray(rows) || rows.length === 0) {
      const fallback = DEFAULT_FAQ_PLACEMENT_BY_ROUTE[routeKey]
      return fallback ? fromDefault(fallback) : null
    }
    const row = rows.find((r) => r?.route === routeKey)
    if (!row) {
      // Missing row for this key → []
      return null
    }
    return {
      route: routeKey,
      audience: row.audience,
      topics: topicSlugsFromPlacement(row.topics as (number | FaqTopic)[] | null),
      cap: typeof row.cap === 'number' ? row.cap : row.cap == null ? null : Number(row.cap),
      showAll: Boolean(row.showAll),
    }
  } catch (err) {
    console.warn('[getFAQsForRoute] faq-placements unreachable; using defaults', err)
    const fallback = DEFAULT_FAQ_PLACEMENT_BY_ROUTE[routeKey]
    return fallback ? fromDefault(fallback) : null
  }
}

async function loadTokenContext(): Promise<TokenContext> {
  const payload = await getPayloadClient()
  const hotel = await payload
    .findGlobal({ slug: 'hotel', depth: 0, overrideAccess: true })
    .catch(() => null)

  const amenities = await payload
    .find({
      collection: 'amenities',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as never[] }))

  const rooms = await payload
    .find({
      collection: 'rooms',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as never[] }))

  const meetings = await payload
    .findGlobal({ slug: 'meetings', depth: 0, overrideAccess: true })
    .catch(() => null)

  const amenitiesBySlug = new Map(
    (amenities.docs as { slug?: string }[]).map((a) => [a.slug ?? '', a as never]),
  )
  const roomsBySlug = new Map(
    (rooms.docs as { slug?: string }[]).map((r) => [r.slug ?? '', r as never]),
  )

  return {
    hotel: hotel as TokenContext['hotel'],
    amenitiesBySlug,
    roomsBySlug,
    meetingsContactEmail:
      (meetings as { contactEmail?: string | null } | null)?.contactEmail ?? null,
  }
}

function resolveFaqOrDrop(
  faq: Faq,
  locale: FaqLocale,
  ctx: TokenContext,
): FaqForRoute | null {
  const q = resolveFaqTokens(faq.question ?? '', locale, ctx)
  const a = resolveFaqTokens(faq.answer ?? '', locale, ctx)
  const unresolved = [...q.unresolved, ...a.unresolved]
  if (unresolved.length > 0) {
    console.warn(
      `[getFAQsForRoute] dropping FAQ ${faq.slug} — unresolved tokens: ${unresolved.join(', ')}`,
    )
    return null
  }
  return {
    id: faq.id as number,
    slug: faq.slug,
    question: q.text,
    answer: a.text,
    category: faq.category,
    order: faq.order ?? 0,
    audience: faq.audience,
    aliasSlugs: faq.aliasSlugs,
    source: faq,
  }
}

/**
 * Route-aware FAQ selection. Built on getFaqs (single Payload query path for FAQs).
 * Token resolution runs before cap so hidden FAQs do not steal slots.
 */
export async function getFAQsForRoute(
  routeKey: FaqRouteKey,
  locale: string,
  opts: { entity?: FaqEntityRef } = {},
): Promise<GetFaqsForRouteResult> {
  const placement = await loadPlacement(routeKey)
  if (!placement) return { items: [], trimmedCount: 0 }

  const faqs = await getFaqs({ locale, allPublished: true })
  const selected = selectFaqsForRoute(faqs, placement, { entity: opts.entity })
  const tokenCtx = await loadTokenContext()
  const loc = asLocale(locale)

  const pinnedResolved = selected.pinned
    .map((f) => resolveFaqOrDrop(f, loc, tokenCtx))
    .filter((f): f is FaqForRoute => f != null)

  const fillResolved = selected.fillBeforeCap
    .map((f) => resolveFaqOrDrop(f, loc, tokenCtx))
    .filter((f): f is FaqForRoute => f != null)

  return applyRouteCap(pinnedResolved, fillResolved, placement)
}
