import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { SweepCta } from '@/components/primitives/SweepCta'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import { isFaqRoutingV2 } from '@/lib/faq/flag'
import { getFAQsForRoute } from '@/lib/faq/getFaqsForRoute'
import { getFaqs, getRelevantFaqs, HUB_FAQ_SLUGS } from '@/lib/faqs'

type Props = {
  background: LightSectionBackground
}

/**
 * Last block on /here: FAQ accordion + A–Z CTA.
 * Guest Care lives in the hero with the other stay facts.
 */
export async function HereHelpSection({ background }: Props) {
  const locale = await getLocale()
  const t = await getTranslations('here')
  const tHelp = await getTranslations('here.help')

  let items: { id: string; question: string; answer: string; aliasIds?: string[] }[] = []
  let graphFaqs: { question: string; answer: string }[] = []

  if (isFaqRoutingV2()) {
    const { items: routed } = await getFAQsForRoute('here', locale).catch((error) => {
      console.error('[HereHelpSection] getFAQsForRoute failed:', error)
      return { items: [], trimmedCount: 0 }
    })
    items = routed.map((faq) => ({
      id: faq.slug,
      question: faq.question,
      answer: faq.answer,
      aliasIds: faq.aliasSlugs?.map((a) => a.slug).filter(Boolean) as string[] | undefined,
    }))
    graphFaqs = routed
  } else {
    const allFaqs = await getFaqs({ context: 'guest', locale }).catch((error) => {
      console.error('[HereHelpSection] Failed to load FAQs:', error)
      return []
    })
    const relevant = getRelevantFaqs(allFaqs, {
      context: 'guest',
      slugs: HUB_FAQ_SLUGS,
      limit: HUB_FAQ_SLUGS.length,
    })
    items = relevant.map((faq) => ({
      id: faq.slug,
      question: faq.question,
      answer: faq.answer,
    }))
    graphFaqs = relevant
  }

  if (items.length === 0) return null

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="here-faq-heading"
    >
      <div className="site-shell px-section-sm py-section-y md:px-section-x">
        <JsonLdScript graph={buildFAQPageGraph(graphFaqs)} />
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
      </div>
    </SectionShell>
  )
}
