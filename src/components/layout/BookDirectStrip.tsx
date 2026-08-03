import { SweepCta } from '@/components/primitives/SweepCta'

export type BookDirectStripProps = {
  message: string
  ctaLabel: string
  ctaUrl: string
}

/** Standalone book-direct CTA bar — sits above the footer, independently toggleable in CMS. */
export function BookDirectStrip({ message, ctaLabel, ctaUrl }: BookDirectStripProps) {
  return (
    <div className="bg-white">
      <div className="site-shell flex flex-col items-start justify-between gap-5 px-section-sm py-5 md:flex-row md:items-center md:gap-8 md:px-section-x md:py-6">
        <p className="font-ui text-ui-lg font-bold text-hbb-black md:text-ui-xl">{message}</p>
        <SweepCta href={ctaUrl} unlocalized color="nav-amber" className="shrink-0">
          {ctaLabel}
        </SweepCta>
      </div>
    </div>
  )
}
