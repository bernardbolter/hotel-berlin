import type { ReactNode } from 'react'

import { LineCta } from '@/components/primitives/LineCta'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import type { LocalHref } from '@/components/entity/EntityIdentity'

export type EntityBandProps = {
  heading?: string
  href?: LocalHref
  ctaLabel?: string
  label?: string
  children: ReactNode
  id?: string
  className?: string
}

export function EntityBand({
  heading,
  href,
  ctaLabel,
  label,
  children,
  id,
  className = '',
}: EntityBandProps) {
  const headingId = id
  const hrefString = typeof href === 'string' ? href : undefined

  return (
    <section
      aria-labelledby={heading ? headingId : undefined}
      className={`px-section-sm md:px-section-x ${className}`}
    >
      {label ? (
        <p className="font-ui text-label uppercase tracking-ui-label text-[var(--dim)]">{label}</p>
      ) : null}

      {heading ? (
        hrefString ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading as="h2" title={heading} id={headingId} />
            <LineCta href={hrefString} className="text-ui-sm">
              {ctaLabel ?? heading}
            </LineCta>
          </div>
        ) : (
          <SectionHeading as="h2" title={heading} id={headingId} className="mb-6" />
        )
      ) : null}

      {children}
    </section>
  )
}
