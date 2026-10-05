import 'dotenv/config'
import { describe, expect, it } from 'vitest'

import { DEFAULT_FAQ_PLACEMENT_BY_ROUTE } from '../../src/lib/faq/defaultPlacements'
import { FAQ_ROUTE_KEYS, type FaqRouteKey } from '../../src/lib/faq/routes'
import { selectFaqsForRoute, type RoutePlacement } from '../../src/lib/faq/selectFaqsForRoute'
import { extractFaqTokens, resolveFaqTokens, type TokenContext } from '../../src/lib/faq/tokens'
import { getFaqs } from '../../src/lib/faqs/getFaqs'
import { getPayloadClient } from '../../src/lib/payload/client'
import type { Faq, FaqTopic } from '../../src/payload-types'

async function loadTokenContext(): Promise<TokenContext> {
  const payload = await getPayloadClient()
  const hotel = await payload.findGlobal({ slug: 'hotel', depth: 0, overrideAccess: true })
  const amenities = await payload.find({
    collection: 'amenities',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const rooms = await payload.find({
    collection: 'rooms',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const meetings = await payload
    .findGlobal({ slug: 'meetings', depth: 0, overrideAccess: true })
    .catch(() => null)

  return {
    hotel,
    amenitiesBySlug: new Map(amenities.docs.map((a) => [a.slug, a])),
    roomsBySlug: new Map(rooms.docs.map((r) => [r.slug, r])),
    meetingsContactEmail: (meetings as { contactEmail?: string | null } | null)?.contactEmail ?? null,
  }
}

async function loadPlacement(routeKey: FaqRouteKey): Promise<RoutePlacement> {
  const payload = await getPayloadClient()
  try {
    const global = await payload.findGlobal({
      slug: 'faq-placements',
      depth: 1,
      overrideAccess: true,
    })
    const row = global?.placements?.find((r) => r?.route === routeKey)
    if (row) {
      const topics = (Array.isArray(row.topics) ? row.topics : [])
        .map((t) => (typeof t === 'object' && t && 'slug' in t ? (t as FaqTopic).slug : null))
        .filter((s): s is string => Boolean(s))
      return {
        route: routeKey,
        audience: row.audience,
        topics,
        cap: typeof row.cap === 'number' ? row.cap : row.cap == null ? null : Number(row.cap),
        showAll: Boolean(row.showAll),
      }
    }
  } catch {
    /* fall through */
  }
  const d = DEFAULT_FAQ_PLACEMENT_BY_ROUTE[routeKey]
  return { ...d, topics: [...d.topics] }
}

function unresolvedTokens(faq: Faq, locale: 'en' | 'de', ctx: TokenContext): string[] {
  const q = resolveFaqTokens(faq.question ?? '', locale, ctx)
  const a = resolveFaqTokens(faq.answer ?? '', locale, ctx)
  return [...new Set([...q.unresolved, ...a.unresolved])]
}

describe('published FAQ tokens resolve (live CMS)', () => {
  it('every {{token}} in published Q/A resolves non-empty in EN and DE', async () => {
    const ctx = await loadTokenContext()
    const failures: string[] = []

    for (const locale of ['en', 'de'] as const) {
      const faqs = await getFaqs({ locale, allPublished: true })
      for (const faq of faqs) {
        for (const field of ['question', 'answer'] as const) {
          const text = faq[field] ?? ''
          if (extractFaqTokens(text).length === 0) continue
          const { unresolved } = resolveFaqTokens(text, locale, ctx)
          for (const token of unresolved) {
            failures.push(`${faq.slug} [${locale}] ${field}: unresolved {{${token}}}`)
          }
        }
      }
    }

    expect(failures, failures.join('\n') || 'ok').toEqual([])
  }, 60_000)

  it('reports per-route FAQs that flag-ON routing would drop for unresolved tokens', async () => {
    const ctx = await loadTokenContext()
    const faqs = await getFaqs({ locale: 'en', allPublished: true })
    const report: Record<string, Array<{ slug: string; tokens: string[] }>> = {}

    for (const route of FAQ_ROUTE_KEYS) {
      const placement = await loadPlacement(route)
      const selected = selectFaqsForRoute(faqs, placement)
      const candidates = [...selected.pinned, ...selected.fillBeforeCap]
      const dropped = candidates
        .map((faq) => ({ slug: faq.slug, tokens: unresolvedTokens(faq, 'en', ctx) }))
        .filter((d) => d.tokens.length > 0)
      report[route] = dropped
    }

    // Print for the Step 3 follow-up report
    // eslint-disable-next-line no-console
    console.log(
      'routing drops (unresolved tokens):',
      JSON.stringify(report, null, 2),
    )

    const anyDrops = Object.values(report).some((list) => list.length > 0)
    expect(anyDrops, JSON.stringify(report)).toBe(false)
  }, 120_000)
})
