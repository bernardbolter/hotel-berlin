import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Link } from '@/i18n/routing'

export type SweepCtaColor = 'terracotta' | 'nav-amber'

type SharedProps = {
  children: ReactNode
  className?: string
  /** terracotta = rooms Sleep & Relax; nav-amber = #B87A2E (footer / nav accent) */
  color?: SweepCtaColor
  /** Use a plain <a> without locale prefix (e.g. /book) */
  unlocalized?: boolean
}

type SweepCtaAsLink = SharedProps & {
  href: string
  external?: boolean
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children' | 'className'>

type SweepCtaAsButton = SharedProps & {
  href?: undefined
  external?: never
  unlocalized?: never
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>

export type SweepCtaProps = SweepCtaAsLink | SweepCtaAsButton

const colorClass: Record<SweepCtaColor, string> = {
  terracotta: 'sweep-cta--terracotta',
  'nav-amber': 'sweep-cta--nav-amber',
}

/**
 * Standard text CTA: bold clamp size, 2px edge bar that sweeps across on hover and
 * inverts label to white. Shared by rooms teaser, book-direct strip, etc.
 */
export function SweepCta({
  children,
  className = '',
  color = 'terracotta',
  href,
  external = false,
  unlocalized = false,
  ...rest
}: SweepCtaProps) {
  const classes = ['sweep-cta', colorClass[color], className].filter(Boolean).join(' ')
  const label = <span className="sweep-cta__label">{children}</span>

  if (href) {
    if (external || unlocalized) {
      return (
        <a
          href={href}
          className={classes}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...(rest as ComponentPropsWithoutRef<'a'>)}
        >
          {label}
        </a>
      )
    }

    return (
      <Link
        className={classes}
        href={href as '/'}
        {...(rest as ComponentPropsWithoutRef<'a'>)}
      >
        {label}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {label}
    </button>
  )
}
