import type { ReactNode } from 'react'

import { LineCta } from '@/components/primitives/LineCta'

type Props = {
  title: string
  kicker?: string
  intro?: string
  backLabel: string
  children?: ReactNode
  /** Full-bleed content below the padded body (e.g. map). */
  footer?: ReactNode
}

/** Shared chrome for /here/* deep pages — title, intro, back to hub, content. */
export function HereSubpage({
  title,
  kicker,
  intro,
  backLabel,
  children,
  footer,
}: Props) {
  return (
    <main id="main-content" className="bg-hbb-page">
      <div className="site-shell px-4 py-8 md:px-6 md:py-12">
        <header className="mb-8 max-w-2xl">
          {kicker ? (
            <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.06em] text-[#aaa]">
              {kicker}
            </p>
          ) : null}
          <h1 className="font-ui text-ui-xl font-medium text-hbb-black md:font-serif md:text-serif-xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 max-w-xl font-serif text-serif-sm text-gray-600">{intro}</p>
          ) : null}
          <div className="mt-4">
            <LineCta href="/here" className="text-ui-sm">
              {backLabel}
            </LineCta>
          </div>
        </header>
        {children}
      </div>
      {footer}
    </main>
  )
}
