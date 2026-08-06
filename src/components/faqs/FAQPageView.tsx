'use client'

import { useMemo, useState } from 'react'

import { FAQAccordion } from '@/components/primitives/FAQAccordion'
import type { FaqCategory, FaqContext } from '@/lib/faqs'

export type FAQPageItem = {
  id: string
  question: string
  answer: string
  category: FaqCategory
  order: number
}

type CategoryOption = {
  value: FaqCategory | 'all'
  label: string
}

type Props = {
  items: FAQPageItem[]
  context: FaqContext
  heading: string
  categoryOptions: CategoryOption[]
  allLabel: string
  categoriesHeading: string
}

/**
 * Full FAQ page — client chip filter over a small dataset.
 * Schema is emitted server-side over the full unfiltered set.
 */
export function FAQPageView({
  items,
  context,
  heading,
  categoryOptions,
  categoriesHeading,
}: Props) {
  const [active, setActive] = useState<FaqCategory | 'all'>('all')

  const grouped = useMemo(() => {
    const filtered = active === 'all' ? items : items.filter((i) => i.category === active)
    const byCat = new Map<FaqCategory, FAQPageItem[]>()
    for (const item of filtered) {
      const list = byCat.get(item.category) ?? []
      list.push(item)
      byCat.set(item.category, list)
    }
    for (const list of byCat.values()) {
      list.sort((a, b) => a.order - b.order)
    }
    return byCat
  }, [items, active])

  const accentFocus =
    context === 'prospect'
      ? 'focus-visible:outline-[#3a3a3a]'
      : 'focus-visible:outline-hbb-teal'
  const accentActive =
    context === 'prospect'
      ? 'border-[#3a3a3a] bg-black/5 text-[#3a3a3a]'
      : 'border-hbb-teal bg-hbb-teal/10 text-hbb-teal'

  return (
    <div className="bg-hbb-page">
      <div className="mx-auto w-full max-w-(--site-max) px-section-sm pb-6 pt-14 md:px-section-x md:pt-24">
        <h1 className="font-serif text-[clamp(2rem,3vw,2.75rem)] font-normal leading-[1.12] text-[#1F1F1F]">
          {heading}
        </h1>

        <div className="mt-8" role="group" aria-label={categoriesHeading}>
          <ul className="flex flex-wrap gap-2" role="list">
            {categoryOptions.map((opt) => {
              const isActive = active === opt.value
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => setActive(opt.value)}
                    aria-pressed={isActive}
                    className={`min-h-10 border px-3 py-1.5 font-ui text-ui-xs uppercase tracking-ui-label outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${accentFocus} ${
                      isActive
                        ? accentActive
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-(--site-max) px-section-sm pb-14 md:px-section-x md:pb-24">
        {[...grouped.entries()].map(([category, catItems]) => {
          const label =
            categoryOptions.find((o) => o.value === category)?.label ?? category
          return (
            <div key={category} className="mb-10 last:mb-0">
              <h2 className="mb-2 font-ui text-ui-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {label}
              </h2>
              <FAQAccordion
                items={catItems.map(({ id, question, answer }) => ({ id, question, answer }))}
                variant="full"
                context={context}
                embedded
              />
            </div>
          )
        })}

        {grouped.size === 0 ? (
          <p className="font-ui text-ui-sm text-gray-500">—</p>
        ) : null}
      </div>
    </div>
  )
}
