import type { ReactNode } from 'react'

import { LineCta } from '@/components/primitives/LineCta'
import type { GuestStayInfo } from '@/lib/payload/hotel'

export type StayInfoCardProps = {
  stay: GuestStayInfo
  labels: {
    checkout: string
    breakfast: string
    wifi: string
    parking: string
    luggage: string
    faqsCta: string
  }
  /** When set (e.g. ?event=), replaces the check-out row */
  eventRow?: { label: string; value: string; programme?: string } | null
  faqHref?: string
  className?: string
}

function WifiPill({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-pill bg-[#F0F0F0] px-2 py-0.5 font-mono text-[11px] text-hbb-black">
      {value}
    </span>
  )
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
 * Full-width operational stay card — check-out, breakfast, WiFi pills, parking, luggage.
 * Not a reading card. Data from hotel Payload global via GuestStayInfo.
 */
export function StayInfoCard({
  stay,
  labels,
  eventRow,
  faqHref = '/here/faq',
  className = '',
}: StayInfoCardProps) {
  return (
    <article
      className={`stay-info-card border border-[#E0E0E0] bg-white p-4 ${className}`}
    >
      <dl>
        {eventRow ? (
          <Row label={eventRow.label}>
            <span>{eventRow.value}</span>
            {eventRow.programme ? (
              <span className="mt-0.5 block text-gray-500">{eventRow.programme}</span>
            ) : null}
          </Row>
        ) : (
          <Row label={labels.checkout}>
            {stay.checkoutTime}
            {stay.checkoutNote ? ` ${stay.checkoutNote}` : ''}
          </Row>
        )}

        <Row label={labels.breakfast}>
          {stay.breakfastHours}
          {stay.breakfastLocation ? (
            <span className="text-gray-500"> · {stay.breakfastLocation}</span>
          ) : null}
        </Row>

        <Row label={labels.wifi}>
          <span className="inline-flex flex-wrap gap-1.5">
            <WifiPill value={stay.wifiNetwork} />
            <WifiPill value={stay.wifiPassword} />
          </span>
        </Row>

        <Row label={labels.parking}>{stay.parkingSummary}</Row>
        <Row label={labels.luggage}>{stay.luggageNote}</Row>
      </dl>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <LineCta href={faqHref} unlocalized className="text-ui-sm">
          {labels.faqsCta}
        </LineCta>
      </div>
    </article>
  )
}
