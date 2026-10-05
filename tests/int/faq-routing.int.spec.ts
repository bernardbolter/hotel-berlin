import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import {
  applyRouteCap,
  selectFaqsForRoute,
  type RoutePlacement,
} from '../../src/lib/faq/selectFaqsForRoute'
import type { FaqRouteKey } from '../../src/lib/faq/routes'
import { DEFAULT_FAQ_PLACEMENT_BY_ROUTE } from '../../src/lib/faq/defaultPlacements'
import type { Faq } from '../../src/payload-types'

const root = path.resolve(__dirname, '../..')

type ExistingFaq = {
  slug: string
  context: 'prospect' | 'guest'
  category: string
  order: number
  question: { en: string; de: string }
  answer: { en: string; de: string }
}

type Backfill = {
  topics: Array<{ slug: string; sortOrder: number }>
  records: Array<{
    slug: string
    audience: 'prospect' | 'guest' | 'both'
    topic: string
    secondaryTopics: string[]
    priority: number
  }>
}

type PlacementsFile = {
  placements: Array<{
    route: FaqRouteKey
    audience: 'prospect' | 'guest' | 'both'
    topics: string[]
    cap: number | null
    showAll: boolean
  }>
  pins: Record<string, string[]>
}

type ExpectedFile = {
  routes: Record<
    string,
    {
      result: string[]
      trimmedCount: number
    }
  >
}

function loadJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T
}

function buildFaqs(): Faq[] {
  const existing = loadJson<ExistingFaq[]>('doc/faqs/existing-faqs.json')
  const backfill = loadJson<Backfill>('doc/faqs/faq-structure-backfill.json')
  const placements = loadJson<PlacementsFile>('doc/faqs/faq-placements.json')
  const topicMeta = new Map(backfill.topics.map((t) => [t.slug, t]))
  const bySlug = new Map(backfill.records.map((r) => [r.slug, r]))
  let id = 1
  return existing.map((ex) => {
    const row = bySlug.get(ex.slug)
    if (!row) throw new Error(`Missing backfill for ${ex.slug}`)
    const topic = topicMeta.get(row.topic)
    if (!topic) throw new Error(`Missing topic ${row.topic}`)
    const secondary = row.secondaryTopics.map((slug) => {
      const t = topicMeta.get(slug)
      if (!t) throw new Error(`Missing secondary topic ${slug}`)
      return { id: 1000 + t.sortOrder, slug: t.slug, sortOrder: t.sortOrder } as never
    })
    const faq = {
      id: id++,
      slug: ex.slug,
      context: ex.context,
      category: ex.category,
      order: ex.order,
      question: ex.question.en,
      answer: ex.answer.en,
      audience: row.audience,
      priority: String(row.priority) as '1' | '2' | '3',
      topic: { id: topic.sortOrder, slug: topic.slug, sortOrder: topic.sortOrder },
      secondaryTopics: secondary,
      pinnedRoutes: placements.pins[ex.slug] ?? [],
      aliasSlugs: [],
      updatedAt: '',
      createdAt: '',
    } as unknown as Faq
    return faq
  })
}

function placementFor(route: FaqRouteKey): RoutePlacement {
  const file = loadJson<PlacementsFile>('doc/faqs/faq-placements.json')
  const row = file.placements.find((p) => p.route === route)
  if (!row) {
    const d = DEFAULT_FAQ_PLACEMENT_BY_ROUTE[route]
    return { ...d, topics: [...d.topics] }
  }
  return {
    route: row.route,
    audience: row.audience,
    topics: [...row.topics],
    cap: row.cap,
    showAll: row.showAll,
  }
}

describe('getFAQsForRoute oracle (selection + cap, no tokens)', () => {
  const faqs = buildFaqs()
  const expected = loadJson<ExpectedFile>('doc/faqs/faq-routing-expected.json')

  for (const [route, exp] of Object.entries(expected.routes)) {
    it(`${route} → exact slugs + trimmedCount`, () => {
      const placement = placementFor(route as FaqRouteKey)
      const selected = selectFaqsForRoute(faqs, placement)
      // No tokens in existing answers → nothing dropped
      const { items, trimmedCount } = applyRouteCap(
        selected.pinned,
        selected.fillBeforeCap,
        placement,
      )
      expect(items.map((f) => f.slug)).toEqual(exp.result)
      expect(trimmedCount).toBe(exp.trimmedCount)
    })
  }
})
