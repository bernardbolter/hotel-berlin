import type { Faq } from '@/payload-types'

import type { FaqCategory, FaqContext } from './getFaqs'

function pageIdEquals(
  page: number | string | { id?: number | string } | null | undefined,
  pageId: string,
): boolean {
  if (page == null) return false
  if (typeof page === 'string' || typeof page === 'number') {
    return String(page) === pageId
  }
  if (typeof page === 'object' && page.id != null) {
    return String(page.id) === pageId
  }
  return false
}

/**
 * Select FAQs for a mini block: pinned pages → category match → general fallback.
 * Pure selection over an already-fetched list — no data fetching here.
 */
export function getRelevantFaqs(
  allFaqs: Faq[],
  opts: {
    context: FaqContext
    pageId?: string
    category?: FaqCategory
    limit?: number
  },
): Faq[] {
  const { context, pageId, category, limit = 4 } = opts
  const inContext = allFaqs.filter((f) => f.context === context)

  const pinned = pageId
    ? inContext.filter((f) =>
        f.relevantPages?.some((p) => pageIdEquals(p as number | { id?: number | string }, pageId)),
      )
    : []

  const categoryMatched = category
    ? inContext.filter((f) => f.category === category && !pinned.includes(f))
    : []

  const combined = [...pinned, ...categoryMatched].sort((a, b) => a.order - b.order)

  if (combined.length >= limit) return combined.slice(0, limit)

  const fallback = inContext
    .filter((f) => f.category === 'general' && !combined.includes(f))
    .sort((a, b) => a.order - b.order)

  return [...combined, ...fallback].slice(0, limit)
}
