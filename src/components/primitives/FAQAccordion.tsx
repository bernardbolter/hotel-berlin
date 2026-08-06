'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SweepCta } from '@/components/primitives/SweepCta'

export type FAQAccordionItem = {
  id: string
  question: string
  answer: string
}

export type FAQAccordionProps = {
  items: FAQAccordionItem[]
  variant: 'mini' | 'full'
  context: 'prospect' | 'guest'
  heading?: string
  /** mini only — "See all FAQs" target */
  ctaHref?: '/faq' | '/here/faq'
  ctaLabel?: string
  className?: string
  /** When set (e.g. from URL hash), open that slug on mount */
  initialOpenId?: string | null
  /** Skip section chrome — used when grouping under category headings */
  embedded?: boolean
}

const ACCENT = {
  prospect: {
    text: 'text-[#3a3a3a]',
    chevron: 'text-[#3a3a3a]',
    focus: 'focus-visible:outline-[#3a3a3a]',
    hover: 'hover:text-[#3a3a3a]',
  },
  guest: {
    text: 'text-hbb-teal',
    chevron: 'text-hbb-teal',
    focus: 'focus-visible:outline-hbb-teal',
    hover: 'hover:text-hbb-teal',
  },
} as const

/**
 * Shared FAQ accordion — mini block or full page list.
 * Prospect uses a lighter black accent; guest keeps teal.
 */
export function FAQAccordion({
  items,
  variant,
  context,
  heading,
  ctaHref,
  ctaLabel = 'See all FAQs',
  className = '',
  initialOpenId = null,
  embedded = false,
}: FAQAccordionProps) {
  const accent = ACCENT[context]
  const [openId, setOpenId] = useState<string | null>(initialOpenId)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace(/^#/, '')
    if (hash && items.some((item) => item.id === hash)) {
      setOpenId(hash)
      document.getElementById(`faq-question-${hash}`)?.scrollIntoView({ block: 'start' })
    }
  }, [items])

  const list = (
    <div className="flex flex-col">
      {items.map((item) => {
        const isOpen = openId === item.id
        const questionId = `faq-question-${item.id}`
        const answerId = `faq-answer-${item.id}`

        return (
          <div key={item.id} id={item.id} className="border-t border-gray-200 last:border-b">
            <h3>
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left font-ui text-ui-md font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus}`}
              >
                <span className={isOpen ? accent.text : `text-[#1F1F1F] ${accent.hover}`}>
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={18}
                  className={`shrink-0 transition-transform ${accent.chevron} ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            <div id={answerId} role="region" aria-labelledby={questionId} hidden={!isOpen}>
              <p className="pb-5 pr-8 font-ui text-ui-sm leading-relaxed text-gray-600">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (embedded) {
    return <div className={className}>{list}</div>
  }

  const padding =
    variant === 'full'
      ? 'px-section-sm py-14 md:px-section-x md:py-24'
      : 'px-section-sm py-14 md:px-section-x md:py-14'

  return (
    <section
      aria-labelledby={heading ? 'faq-heading' : undefined}
      className={`bg-hbb-page ${padding} ${className}`}
    >
      <div className="mx-auto w-full max-w-(--site-max)">
        {(heading || (variant === 'mini' && ctaHref)) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            {heading ? (
              <h2
                id="faq-heading"
                className="font-serif text-[clamp(1.75rem,2.5vw,2.25rem)] font-normal leading-[1.15] text-[#1F1F1F]"
              >
                {heading}
              </h2>
            ) : (
              <span />
            )}
            {variant === 'mini' && ctaHref ? (
              <SweepCta
                href={ctaHref}
                color={context === 'guest' ? 'meet-work' : 'ink'}
                edge="right"
                className="shrink-0"
                style={context === 'guest' ? { color: '#2C6B7A' } : undefined}
              >
                {ctaLabel}
              </SweepCta>
            ) : null}
          </div>
        )}
        {list}
      </div>
    </section>
  )
}
