import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Link } from '@/i18n/routing'

type SharedProps = {
  children: ReactNode
  className?: string
  /** White default text for dark / forest backgrounds */
  onDark?: boolean
  /** Use a plain <a> without locale prefix (e.g. external or /book) */
  unlocalized?: boolean
}

type LineCtaAsLink = SharedProps & {
  href: string
  external?: boolean
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children' | 'className'>

type LineCtaAsButton = SharedProps & {
  href?: undefined
  external?: never
  unlocalized?: never
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>

export type LineCtaProps = LineCtaAsLink | LineCtaAsButton

export function LineCta({
  children,
  className = '',
  onDark = false,
  href,
  external = false,
  unlocalized = false,
  ...rest
}: LineCtaProps) {
  const classes = [
    'line-cta',
    onDark ? 'line-cta--on-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const label = <span className="line-cta__label">{children}</span>

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
      <Link href={href} className={classes} {...(rest as ComponentPropsWithoutRef<'a'>)}>
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
