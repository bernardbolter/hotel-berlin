'use client'

import type { MouseEvent } from 'react'

import { SweepCta } from '@/components/primitives/SweepCta'
import { requestOpenBookingPanel } from '@/lib/booking'

export type BookDirectStripProps = {
  message: string
  ctaLabel: string
  ctaUrl: string
  /** When true, left-click opens the booking panel; the href remains the no-JS fallback. */
  openPanel?: boolean
}

function onPanelClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }
  event.preventDefault()
  requestOpenBookingPanel()
}

/** Standalone book-direct CTA bar — sits above the footer, independently toggleable in CMS. */
export function BookDirectStrip({
  message,
  ctaLabel,
  ctaUrl,
  openPanel = false,
}: BookDirectStripProps) {
  const external = /^https?:\/\//i.test(ctaUrl)

  return (
    <div className="bg-white">
      <div className="site-shell flex flex-col items-start justify-between gap-5 px-section-sm py-5 md:flex-row md:items-center md:gap-8 md:px-section-x md:py-6">
        <p className="font-ui text-ui-lg font-bold text-hbb-black md:text-ui-xl">{message}</p>
        <SweepCta
          href={ctaUrl}
          unlocalized
          external={external}
          color="ctx"
          className="shrink-0"
          onClick={openPanel ? onPanelClick : undefined}
        >
          {ctaLabel}
        </SweepCta>
      </div>
    </div>
  )
}
