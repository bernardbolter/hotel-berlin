import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Link } from '@/i18n/routing'

export type SweepCtaColor = 'terracotta' | 'nav-amber' | 'meet-work' | 'ink' | 'espresso'
export type SweepCtaSize = 'md' | 'sm'
export type SweepCtaEdge = 'left' | 'right'

type SharedProps = {
  children: ReactNode
  className?: string
  /** terracotta = rooms; nav-amber = footer/nav; meet-work = Meet & Work #1E4B5D; ink = off-black headers; espresso = Eat & Drink */
  color?: SweepCtaColor
  /** md = default section CTAs; sm = compact bars / secondary placements */
  size?: SweepCtaSize
  /** Which side the 2px bar sits on (and sweeps from). Default left. */
  edge?: SweepCtaEdge
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
  'meet-work': 'sweep-cta--meet-work',
  ink: 'sweep-cta--ink',
  espresso: 'sweep-cta--espresso',
}

const sizeClass: Record<SweepCtaSize, string> = {
  md: '',
  sm: 'sweep-cta--sm',
}

const edgeClass: Record<SweepCtaEdge, string> = {
  left: '',
  right: 'sweep-cta--edge-right',
}

/**
 * Standard text CTA: bold clamp size, 2px edge bar that sweeps across on hover and
 * inverts label to white. Shared by rooms teaser, book-direct strip, etc.
 */
export function SweepCta({
  children,
  className = '',
  color = 'terracotta',
  size = 'md',
  edge = 'left',
  href,
  external = false,
  unlocalized = false,
  ...rest
}: SweepCtaProps) {
  const classes = [
    'sweep-cta',
    colorClass[color],
    sizeClass[size],
    edgeClass[edge],
    className,
  ]
    .filter(Boolean)
    .join(' ')
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
