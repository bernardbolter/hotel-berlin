'use client'

import { SweepCta } from '@/components/primitives/SweepCta'
import { requestOpenBookingPanel } from '@/lib/booking'

export type BookDirectStripProps = {
  message: string
  ctaLabel: string
  ctaUrl: string
}

function opensBookingPanel(url: string): boolean {
  return url === '/book' || url.startsWith('/book?') || url.startsWith('/book#')
}

/** Standalone book-direct CTA bar — sits above the footer, independently toggleable in CMS. */
export function BookDirectStrip({ message, ctaLabel, ctaUrl }: BookDirectStripProps) {
  return (
    <div className="bg-white">
      <div className="site-shell flex flex-col items-start justify-between gap-5 px-section-sm py-5 md:flex-row md:items-center md:gap-8 md:px-section-x md:py-6">
        <p className="font-ui text-ui-lg font-bold text-hbb-black md:text-ui-xl">{message}</p>
        {opensBookingPanel(ctaUrl) ? (
          <SweepCta color="ctx" className="shrink-0" onClick={requestOpenBookingPanel}>
            {ctaLabel}
          </SweepCta>
        ) : (
          <SweepCta href={ctaUrl} unlocalized color="ctx" className="shrink-0">
            {ctaLabel}
          </SweepCta>
        )}
      </div>
    </div>
  )
}
