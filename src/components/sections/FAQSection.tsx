'use client'

import { ArrowRight, HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import { faqConfig, type FAQPageContext } from '@/lib/data/faqs'

import { Link } from '@/i18n/routing'

export interface FAQSectionProps {
  pageContext: FAQPageContext
  showAllLink?: boolean
}

export function FAQSection({ pageContext, showAllLink = true }: FAQSectionProps) {
  const t = useTranslations('faq')
  const items = faqConfig[pageContext]
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-hbb-warm px-section-sm py-section-y md:px-section-x"
    >
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-hbb-purple"
          >
            <HelpCircle size={16} className="text-hbb-purple" />
          </span>
          <h2 id="faq-heading" className="font-serif text-serif-lg font-medium text-hbb-black">
            {t('title')}
          </h2>
        </div>
        {showAllLink && (
          <Link
            href="/faqs"
            className="flex items-center gap-1 border-b border-hbb-purple pb-px font-ui text-ui-sm font-medium text-hbb-purple"
          >
            {t('allFaqs')}
            <ArrowRight aria-hidden="true" size={13} />
          </Link>
        )}
      </div>

      <ul role="list" className="flex flex-col">
        {items.map((faq) => (
          <li key={faq.id}>
            <FAQAccordion
              id={faq.id}
              icon={faq.icon}
              question={t(`${pageContext}.${faq.id}.question`)}
              answer={t(`${pageContext}.${faq.id}.answer`)}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
