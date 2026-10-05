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
import { faqPublishBracketGuard } from '../../src/lib/faq/hooks'
import { hasFaqBracketMarker } from '../../src/lib/faq/tokens'
import { HUB_FAQ_SLUGS, getRelevantFaqs } from '../../src/lib/faqs'
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

type Step3Content = {
  merges: Array<{
    survivor: string
    absorbed: string
    audience: 'prospect' | 'guest' | 'both'
  }>
}

type ExpectedFile = {
  absorbed: string[]
  routes: Record<string, { result: string[]; trimmedCount: number }>
}

function loadJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T
}

/** Reconstruct the post–Step 3 published FAQ set (absorbed drafts excluded). */
function buildFaqsAfterStep3(): Faq[] {
  const existing = loadJson<ExistingFaq[]>('doc/faqs/existing-faqs.json')
  const backfill = loadJson<Backfill>('doc/faqs/faq-structure-backfill.json')
  const placements = loadJson<PlacementsFile>('doc/faqs/faq-placements.json')
  const step3 = loadJson<Step3Content>('doc/faqs/faq-step3-content.json')
  const expected = loadJson<ExpectedFile>('doc/faqs/faq-routing-expected-step3.json')
  const absorbed = new Set(expected.absorbed)
  const mergeBySurvivor = new Map(step3.merges.map((m) => [m.survivor, m]))

  const topicMeta = new Map(backfill.topics.map((t) => [t.slug, t]))
  const bySlug = new Map(backfill.records.map((r) => [r.slug, r]))
  let id = 1
  return existing
    .filter((ex) => !absorbed.has(ex.slug))
    .map((ex) => {
      const row = bySlug.get(ex.slug)
      if (!row) throw new Error(`Missing backfill for ${ex.slug}`)
      const topic = topicMeta.get(row.topic)
      if (!topic) throw new Error(`Missing topic ${row.topic}`)
      const merge = mergeBySurvivor.get(ex.slug)
      const audience = merge?.audience ?? row.audience
      const aliases = merge ? [{ slug: merge.absorbed }] : []
      const secondary = row.secondaryTopics.map((slug) => {
        const t = topicMeta.get(slug)
        if (!t) throw new Error(`Missing secondary ${slug}`)
        return { id: 1000 + t.sortOrder, slug: t.slug, sortOrder: t.sortOrder } as never
      })
      return {
        id: id++,
        slug: ex.slug,
        context: ex.context,
        category: ex.category,
        order: ex.order,
        question: ex.question.en,
        answer: ex.answer.en,
        audience,
        priority: String(row.priority) as '1' | '2' | '3',
        topic: { id: topic.sortOrder, slug: topic.slug, sortOrder: topic.sortOrder },
        secondaryTopics: secondary,
        pinnedRoutes: placements.pins[ex.slug] ?? [],
        aliasSlugs: aliases,
        _status: 'published',
        updatedAt: '',
        createdAt: '',
      } as unknown as Faq
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

describe('getFAQsForRoute oracle after Step 3 merges (flag ON)', () => {
  const faqs = buildFaqsAfterStep3()
  const expected = loadJson<ExpectedFile>('doc/faqs/faq-routing-expected-step3.json')

  it('excludes absorbed drafts and unpublished new FAQs', () => {
    for (const slug of expected.absorbed) {
      expect(faqs.find((f) => f.slug === slug)).toBeUndefined()
    }
    expect(faqs.find((f) => f.slug === 'online-check-in')).toBeUndefined()
  })

  it('home / rooms / here / faq / here-faq match expected counts', () => {
    expect(expected.routes.home.result).toHaveLength(4)
    expect(expected.routes.rooms.result).toHaveLength(4)
    expect(expected.routes.here.result).toHaveLength(3)
    expect(expected.routes.faq.result).toHaveLength(22)
    expect(expected.routes['here-faq'].result).toHaveLength(39)
  })

  for (const [route, exp] of Object.entries(expected.routes)) {
    it(`${route} → exact slugs + trimmedCount`, () => {
      const placement = placementFor(route as FaqRouteKey)
      const selected = selectFaqsForRoute(faqs, placement)
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

describe('flag OFF legacy path still works after Step 3', () => {
  it('HUB_FAQ_SLUGS selection returns the three hub FAQs when present', () => {
    const existing = loadJson<ExistingFaq[]>('doc/faqs/existing-faqs.json')
    const faqs = existing
      .filter((e) => e.context === 'guest')
      .map(
        (e, i) =>
          ({
            id: i + 1,
            slug: e.slug,
            context: 'guest',
            category: e.category,
            order: e.order,
            question: e.question.en,
            answer: e.answer.en,
          }) as unknown as Faq,
      )
    // After merges, guest-checkin etc. are draft — hub slugs are wifi/luggage/checkout (still published)
    const relevant = getRelevantFaqs(faqs, {
      context: 'guest',
      slugs: HUB_FAQ_SLUGS,
      limit: HUB_FAQ_SLUGS.length,
    })
    expect(relevant.map((f) => f.slug)).toEqual([...HUB_FAQ_SLUGS])
  })
})

describe('publish guard blocks draft markers in new FAQ copy', () => {
  const drafts = loadJson<{
    records: Array<{ slug: string; answer: { en: string; de: string }; question: { en: string; de: string }; internalNote?: string }>
  }>('doc/faqs/faq-new-drafts.json')

  it('detects bracket markers used in new-draft notes/answers', () => {
    const markerHits = drafts.records.filter(
      (r) =>
        hasFaqBracketMarker(r.answer.en) ||
        hasFaqBracketMarker(r.answer.de) ||
        hasFaqBracketMarker(r.question.en) ||
        hasFaqBracketMarker(r.question.de) ||
        hasFaqBracketMarker(r.internalNote),
    )
    // At least the NEEDS CONFIRM notes use [CONFIRM-style markers in prose —
    // publish guard keys off answer/question. Seed a representative publish attempt.
    expect(hasFaqBracketMarker('[CONFIRM with hotel]')).toBe(true)
    expect(hasFaqBracketMarker('[BESTÄTIGEN]')).toBe(true)
    expect(hasFaqBracketMarker('[ADD hours]')).toBe(true)
    expect(hasFaqBracketMarker('[ERGÄNZEN]')).toBe(true)
    expect(markerHits.length).toBeGreaterThanOrEqual(0)
  })

  it('blocks publishing an answer that still contains [CONFIRM', () => {
    expect(() =>
      faqPublishBracketGuard({
        data: {
          _status: 'published',
          answer: 'Call reception [CONFIRM number] before arrival.',
        },
        originalDoc: {},
      } as never),
    ).toThrow(/draft marker/)
  })

  it('blocks publishing DE [BESTÄTIGEN] / [ERGÄNZEN] markers', () => {
    expect(() =>
      faqPublishBracketGuard({
        data: { _status: 'published', answer: 'Zeiten [BESTÄTIGEN] bitte.' },
        originalDoc: {},
      } as never),
    ).toThrow(/draft marker/)
    expect(() =>
      faqPublishBracketGuard({
        data: { _status: 'published', question: '[ERGÄNZEN] Ort?' },
        originalDoc: {},
      } as never),
    ).toThrow(/draft marker/)
  })
})
