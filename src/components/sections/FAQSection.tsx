import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import type { LightSectionBackground } from '@/components/layout/SectionShell'
import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import { isFaqRoutingV2 } from '@/lib/faq/flag'
import { getFAQsForRoute } from '@/lib/faq/getFaqsForRoute'
import type { FaqRouteKey } from '@/lib/faq/routes'
import { getFaqs, getRelevantFaqs, type FaqCategory, type FaqContext } from '@/lib/faqs'

export type FAQSectionProps = {
  context?: FaqContext
  category?: FaqCategory
  /** Prefer these slugs, in order, when present in the CMS. */
  slugs?: readonly string[]
  pageId?: string
  limit?: number
  showAllLink?: boolean
  heading?: string
  /** Explicit section tint when this block owns a full-bleed band. */
  background?: LightSectionBackground
  /**
   * Route key for FAQ_ROUTING_V2. When the flag is on, used instead of
   * category/slugs heuristics. Legacy props remain for flag-off.
   */
  routeKey?: FaqRouteKey
}

/**
 * Mini FAQ block — CMS-driven, JSON-LD matches the items on screen.
 * Homepage: context=prospect, category=general (flag off) / routeKey=home (flag on).
 * Guest hub: context=guest, slugs for the in-stay questions.
 */
export async function FAQSection({
  context = 'prospect',
  category = 'general',
  slugs,
  pageId,
  limit = 4,
  showAllLink = true,
  heading,
  background,
  routeKey,
}: FAQSectionProps) {
  const locale = await getLocale()
  const t = await getTranslations('faq')
  const ctaHref = context === 'guest' ? '/here/faq' : '/faq'

  if (isFaqRoutingV2() && routeKey) {
    const { items: routed, trimmedCount } = await getFAQsForRoute(routeKey, locale).catch(
      (error) => {
        console.error('[FAQSection] getFAQsForRoute failed:', error)
        return { items: [], trimmedCount: 0 }
      },
    )
    if (routed.length === 0) return null

    const items = routed.map((f) => ({
      id: f.slug,
      question: f.question,
      answer: f.answer,
      aliasIds: f.aliasSlugs?.map((a) => a.slug).filter(Boolean) as string[] | undefined,
    }))
    const graph = buildFAQPageGraph(routed)

    return (
      <>
        <JsonLdScript graph={graph} />
        <FAQAccordion
          items={items}
          variant="mini"
          context={context}
          heading={heading ?? t('title')}
          ctaHref={showAllLink && trimmedCount > 0 ? ctaHref : undefined}
          ctaLabel={t('allFaqs')}
          background={background}
        />
      </>
    )
  }

  const allFaqs = await getFaqs({ context, locale }).catch((error) => {
    console.error('[FAQSection] Failed to load FAQs:', error)
    return []
  })

  const relevant = getRelevantFaqs(allFaqs, {
    context,
    pageId,
    category: slugs?.length ? undefined : category,
    slugs,
    limit,
  })
  if (relevant.length === 0) return null

  const items = relevant.map((f) => ({
    id: f.slug,
    question: f.question,
    answer: f.answer,
  }))

  const graph = buildFAQPageGraph(relevant)

  return (
    <>
      <JsonLdScript graph={graph} />
      <FAQAccordion
        items={items}
        variant="mini"
        context={context}
        heading={heading ?? t('title')}
        ctaHref={showAllLink ? ctaHref : undefined}
        ctaLabel={t('allFaqs')}
        background={background}
      />
    </>
  )
}
