import type { Faq, FaqTopic } from '@/payload-types'

import type { FaqRouteKey } from './routes'

export type RoutePlacement = {
  route: FaqRouteKey
  audience: 'prospect' | 'guest' | 'both'
  /** Topic slugs */
  topics: string[]
  cap: number | null
  showAll: boolean
}

export type FaqEntityRef = {
  relationTo: 'rooms' | 'meeting-rooms' | 'venues' | 'pages'
  value: number | string
}

export type SelectFaqsForRouteResult = {
  /** Ordered FAQs before token resolution */
  candidates: Faq[]
  /** Fill candidates that will be trimmed after token drops (pre-drop count) */
  fillBeforeCap: Faq[]
  pinned: Faq[]
  placement: RoutePlacement
}

function topicSlug(topic: number | FaqTopic | null | undefined): string | null {
  if (topic == null) return null
  if (typeof topic === 'object' && 'slug' in topic && typeof topic.slug === 'string') {
    return topic.slug
  }
  return null
}

function topicSortOrder(topic: number | FaqTopic | null | undefined): number {
  if (topic != null && typeof topic === 'object' && typeof topic.sortOrder === 'number') {
    return topic.sortOrder
  }
  return Number.MAX_SAFE_INTEGER
}

function secondarySlugs(faq: Faq): string[] {
  const secondary = faq.secondaryTopics
  if (!Array.isArray(secondary)) return []
  return secondary.map((t) => topicSlug(t as number | FaqTopic)).filter((s): s is string => Boolean(s))
}

function audienceMatches(
  faqAudience: Faq['audience'],
  placementAudience: RoutePlacement['audience'],
): boolean {
  if (!faqAudience) return false
  if (placementAudience === 'both') return true
  return faqAudience === 'both' || faqAudience === placementAudience
}

function topicMatches(faq: Faq, placement: RoutePlacement): boolean {
  if (placement.showAll) return true
  if (placement.topics.length === 0) return false
  const primary = topicSlug(faq.topic as number | FaqTopic | null)
  const all = new Set([...(primary ? [primary] : []), ...secondarySlugs(faq)])
  return placement.topics.some((t) => all.has(t))
}

function pinnedRoutesOf(faq: Faq): string[] {
  return Array.isArray(faq.pinnedRoutes) ? faq.pinnedRoutes.filter(Boolean) : []
}

function entityPinned(faq: Faq, entity: FaqEntityRef | undefined): boolean {
  if (!entity) return false
  const pins = faq.pinnedEntities
  if (!Array.isArray(pins)) return false
  return pins.some((pin) => {
    if (pin == null || typeof pin !== 'object') return false
    const rel = pin as { relationTo?: string; value?: number | string | { id?: number | string } }
    if (rel.relationTo !== entity.relationTo) return false
    const id =
      typeof rel.value === 'object' && rel.value != null
        ? rel.value.id
        : rel.value
    return id != null && String(id) === String(entity.value)
  })
}

function comparePinned(a: Faq, b: Faq): number {
  const orderDiff = (a.order ?? 0) - (b.order ?? 0)
  if (orderDiff !== 0) return orderDiff
  return (a.slug ?? '').localeCompare(b.slug ?? '')
}

function priorityNum(p: Faq['priority']): number {
  if (p === '1' || p === '2' || p === '3') return Number(p)
  return 99
}

function compareFill(a: Faq, b: Faq): number {
  const p = priorityNum(a.priority) - priorityNum(b.priority)
  if (p !== 0) return p
  const t =
    topicSortOrder(a.topic as number | FaqTopic | null) -
    topicSortOrder(b.topic as number | FaqTopic | null)
  if (t !== 0) return t
  const orderDiff = (a.order ?? 0) - (b.order ?? 0)
  if (orderDiff !== 0) return orderDiff
  return (a.slug ?? '').localeCompare(b.slug ?? '')
}

/**
 * Pure selection (no token resolution, no cap trim yet).
 * Cap is applied after unresolved-token drops in getFAQsForRoute.
 */
export function selectFaqsForRoute(
  faqs: Faq[],
  placement: RoutePlacement,
  opts: { entity?: FaqEntityRef } = {},
): SelectFaqsForRouteResult {
  const pinned = faqs
    .filter(
      (f) =>
        pinnedRoutesOf(f).includes(placement.route) || entityPinned(f, opts.entity),
    )
    .sort(comparePinned)

  const pinnedIds = new Set(pinned.map((f) => f.id))

  const fillBeforeCap = faqs
    .filter((f) => !pinnedIds.has(f.id))
    .filter((f) => audienceMatches(f.audience, placement.audience))
    .filter((f) => topicMatches(f, placement))
    .sort(compareFill)

  return {
    candidates: [...pinned, ...fillBeforeCap],
    fillBeforeCap,
    pinned,
    placement,
  }
}

/**
 * Apply cap after token filtering. Pinned never trimmed.
 * Returns trimmedCount = fill that did not make the cut (after unresolved drops).
 */
export function applyRouteCap<T extends { id: number | string }>(
  pinned: T[],
  fillResolved: T[],
  placement: RoutePlacement,
): { items: T[]; trimmedCount: number } {
  if (placement.showAll) {
    return { items: [...pinned, ...fillResolved], trimmedCount: 0 }
  }
  const cap = placement.cap
  if (cap == null) {
    return { items: [...pinned, ...fillResolved], trimmedCount: 0 }
  }
  const fillSlots = Math.max(0, cap - pinned.length)
  const kept = fillResolved.slice(0, fillSlots)
  const trimmedCount = Math.max(0, fillResolved.length - kept.length)
  return { items: [...pinned, ...kept], trimmedCount }
}
