import type { ReactNode } from 'react'

import { LineCta } from '@/components/primitives/LineCta'
import type { GuestStayInfo, StayExtra } from '@/lib/payload/hotel'

export type StayInfoCardProps = {
  stay: GuestStayInfo
  labels: {
    title?: string
    extras: Record<StayExtra['key'], string>
    faqsCta: string
  }
  /** When set (e.g. ?event=), shown as a row above the extras */
  eventRow?: { label: string; value: string; programme?: string } | null
  faqHref?: string
  className?: string
}

function Row({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-0.5 border-b border-gray-100 py-2.5 last:border-b-0 sm:grid-cols-[8.5rem_1fr]">
      <dt className="font-ui text-ui-sm text-gray-500">{label}</dt>
      <dd className="font-ui text-ui-sm text-hbb-black">{children}</dd>
    </div>
  )
}

/**
 * Remainder of stay facts that do not fit the hero:
 * Wundermart, Bett & Bike, Sauna & Fitness, Hunde.
 * Returns null when nothing resolves — the hero already carries the five daily fields.
 */
export function StayInfoCard({
  stay,
  labels,
  eventRow,
  faqHref = '/here/faq',
  className = '',
}: StayInfoCardProps) {
  if (stay.extras.length === 0 && !eventRow) return null

  return (
    <article
      className={`stay-info-card h-full border border-[#E0E0E0] bg-white p-4 ${className}`}
    >
      {labels.title ? (
        <h2 className="mb-2 font-ui text-ui-md font-medium text-hbb-black">
          {labels.title}
        </h2>
      ) : null}
      <dl>
        {eventRow ? (
          <Row label={eventRow.label}>
            <span>{eventRow.value}</span>
            {eventRow.programme ? (
              <span className="mt-0.5 block text-gray-500">{eventRow.programme}</span>
            ) : null}
          </Row>
        ) : null}
        {stay.extras.map((extra) => (
          <Row key={extra.key} label={labels.extras[extra.key]}>
            {extra.value}
            {extra.note ? (
              <span className="mt-0.5 block text-gray-500">{extra.note}</span>
            ) : null}
          </Row>
        ))}
      </dl>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <LineCta href={faqHref} className="text-ui-sm">
          {labels.faqsCta}
        </LineCta>
      </div>
    </article>
  )
}
