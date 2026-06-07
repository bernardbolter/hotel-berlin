'use client'

import { ChevronDown, type LucideIcon } from 'lucide-react'

export interface FAQAccordionProps {
  id: string
  question: string
  answer: string
  icon?: LucideIcon
  isOpen: boolean
  onToggle: () => void
}

export function FAQAccordion({
  id,
  question,
  answer,
  icon: Icon,
  isOpen,
  onToggle,
}: FAQAccordionProps) {
  return (
    <div className="border-t border-gray-200 last:border-b">
      <h3>
        <button
          type="button"
          id={`faq-btn-${id}`}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-4 text-left font-ui text-ui-md font-medium"
        >
          <span className="flex items-center gap-3">
            {Icon && (
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  isOpen ? 'bg-hbb-amber/20' : 'bg-gray-100'
                }`}
              >
                <Icon size={14} className={isOpen ? 'text-hbb-amber' : 'text-gray-500'} />
              </span>
            )}
            <span className={isOpen ? 'text-hbb-amber' : 'text-hbb-black'}>{question}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div
        id={`faq-answer-${id}`}
        role="region"
        aria-labelledby={`faq-btn-${id}`}
        hidden={!isOpen}
      >
        <p className="pb-4 pl-10 font-ui text-ui-sm leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  )
}
