import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { LineCta } from '@/components/primitives/LineCta'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import { getFaqs } from '@/lib/faqs'

type Props = {
  heading: string
  ctaLabel: string
  className?: string
}

/** Compact guest FAQ accordion for the /here hub card grid. */
export async function HereFaqSection({ heading, ctaLabel, className = '' }: Props) {
  const locale = await getLocale()
  const t = await getTranslations('here')
  const allFaqs = await getFaqs({ context: 'guest', locale }).catch((error) => {
    console.error('[HereFaqSection] Failed to load FAQs:', error)
    return []
  })

  const relevant = allFaqs
    .filter((f) => f.context === 'guest')
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)

  const items =
    relevant.length > 0
      ? relevant.map((f) => ({
          id: f.slug,
          question: f.question,
          answer: f.answer,
        }))
      : [
          {
            id: 'checkout',
            question: t('faqFallback.checkout.q'),
            answer: t('faqFallback.checkout.a'),
          },
          {
            id: 'ubahn',
            question: t('faqFallback.ubahn.q'),
            answer: t('faqFallback.ubahn.a'),
          },
          {
            id: 'luggage',
            question: t('faqFallback.luggage.q'),
            answer: t('faqFallback.luggage.a'),
          },
        ]

  const graph = relevant.length > 0 ? buildFAQPageGraph(relevant) : null

  return (
    <article
      className={`border border-[#E0E0E0] bg-white p-4 ${className}`}
      aria-labelledby="here-faq-heading"
    >
      {graph ? <JsonLdScript graph={graph} /> : null}
      <h2 id="here-faq-heading" className="mb-2 font-ui text-ui-md font-medium text-hbb-black">
        {heading}
      </h2>
      <FAQAccordion items={items} variant="mini" context="guest" embedded />
      <div className="mt-3 border-t border-gray-200 pt-3">
        <LineCta href="/here/faq" className="text-ui-sm">
          {ctaLabel}
        </LineCta>
      </div>
    </article>
  )
}
