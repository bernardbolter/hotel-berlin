import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import { getFaqs, getRelevantFaqs, type FaqCategory, type FaqContext } from '@/lib/faqs'

export type FAQSectionProps = {
  context?: FaqContext
  category?: FaqCategory
  pageId?: string
  limit?: number
  showAllLink?: boolean
  heading?: string
}

/**
 * Mini FAQ block — CMS-driven, JSON-LD matches the 4 items on screen.
 * Homepage uses context=prospect, category=general.
 */
export async function FAQSection({
  context = 'prospect',
  category = 'general',
  pageId,
  limit = 4,
  showAllLink = true,
  heading,
}: FAQSectionProps) {
  const locale = await getLocale()
  const t = await getTranslations('faq')
  const allFaqs = await getFaqs({ context, locale }).catch((error) => {
    console.error('[FAQSection] Failed to load FAQs:', error)
    return []
  })

  const relevant = getRelevantFaqs(allFaqs, { context, pageId, category, limit })
  if (relevant.length === 0) return null

  const items = relevant.map((f) => ({
    id: f.slug,
    question: f.question,
    answer: f.answer,
  }))

  const graph = buildFAQPageGraph(relevant)
  const ctaHref = context === 'guest' ? '/here/faq' : '/faq'

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
      />
    </>
  )
}
