import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { SweepCta } from '@/components/primitives/SweepCta'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import { getFaqs, getRelevantFaqs, HUB_FAQ_SLUGS } from '@/lib/faqs'

/**
 * Last block on /here: FAQ accordion + A–Z CTA.
 * Guest Care lives in the hero with the other stay facts.
 */
export async function HereHelpSection() {
  const locale = await getLocale()
  const t = await getTranslations('here')
  const tHelp = await getTranslations('here.help')

  const allFaqs = await getFaqs({ context: 'guest', locale }).catch((error) => {
    console.error('[HereHelpSection] Failed to load FAQs:', error)
    return []
  })
  const relevant = getRelevantFaqs(allFaqs, {
    context: 'guest',
    slugs: HUB_FAQ_SLUGS,
    limit: HUB_FAQ_SLUGS.length,
  })
  const items = relevant.map((faq) => ({
    id: faq.slug,
    question: faq.question,
    answer: faq.answer,
  }))
  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="here-faq-heading"
      className="site-shell px-section-sm py-section-y md:px-section-x"
    >
      <JsonLdScript graph={buildFAQPageGraph(relevant)} />
      <h2
        id="here-faq-heading"
        className="mb-2 font-serif text-[clamp(1.5rem,2vw,2rem)] font-normal leading-[1.15] text-[#1F1F1F]"
      >
        {t('faqsHeading')}
      </h2>
      <FAQAccordion items={items} variant="mini" context="guest" embedded />
      <div className="mt-8 flex justify-end">
        <SweepCta href="/here/faq" color="ctx" edge="right">
          {tHelp('azCta')}
        </SweepCta>
      </div>
    </section>
  )
}
