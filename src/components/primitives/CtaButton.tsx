import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Link } from '@/i18n/routing'

export type CtaButtonVariant = 'solid' | 'outline'
export type CtaButtonColor = 'teal' | 'amber' | 'teal-deep'
/** xl = primary nav / hero CTA (largest). Then lg, md, sm. */
export type CtaButtonSize = 'xl' | 'lg' | 'md' | 'sm'

type SharedProps = {
  children: ReactNode
  variant?: CtaButtonVariant
  color?: CtaButtonColor
  size?: CtaButtonSize
  className?: string
  /** Uppercase label + wide tracking (section CTAs). Default: sentence case per brand book button. */
  caps?: boolean
  /** Use a plain <a> without locale prefix (e.g. /book) */
  unlocalized?: boolean
}

type CtaButtonAsLink = SharedProps & {
  href: string
  external?: boolean
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children' | 'className'>

type CtaButtonAsButton = SharedProps & {
  href?: undefined
  external?: never
  unlocalized?: never
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>

export type CtaButtonProps = CtaButtonAsLink | CtaButtonAsButton

const sizeClasses: Record<CtaButtonSize, string> = {
  xl: 'box-border h-11 px-3.5 text-[22px] font-medium leading-none',
  lg: 'box-border h-10 px-3 text-ui-md font-medium leading-none',
  md: 'px-2.5 py-1 text-ui-base font-medium leading-none',
  sm: 'px-2 py-0.5 text-ui-xs font-medium leading-none',
}

const colorVariantClasses: Record<
  CtaButtonColor,
  Record<CtaButtonVariant, { shell: string; fill: string; label: string }>
> = {
  teal: {
    solid: {
      shell: 'border-hbb-teal bg-hbb-teal text-white',
      fill: 'before:bg-hbb-teal-deep',
      label: '',
    },
    outline: {
      shell: '!bg-transparent border-hbb-teal text-hbb-teal',
      fill: 'before:bg-hbb-teal',
      label: 'transition-colors duration-300 group-hover:text-white',
    },
  },
  amber: {
    solid: {
      shell: 'border-hbb-amber bg-hbb-amber text-hbb-dark',
      fill: 'before:bg-hbb-gold',
      label: '',
    },
    outline: {
      shell: '!bg-transparent border-hbb-amber text-hbb-amber',
      fill: 'before:bg-hbb-amber',
      label: 'transition-colors duration-300 group-hover:text-hbb-dark',
    },
  },
  'teal-deep': {
    solid: {
      shell: 'border-hbb-teal-deep bg-hbb-teal-deep text-white',
      fill: 'before:bg-hbb-teal',
      label: '',
    },
    outline: {
      shell: '!bg-transparent border-hbb-teal-deep text-hbb-teal-deep',
      fill: 'before:bg-hbb-teal-deep',
      label: 'transition-colors duration-300 group-hover:text-white',
    },
  },
}

const shellClasses = [
  'group relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden',
  'border border-1 font-ui no-underline',
  'before:pointer-events-none before:absolute before:inset-0 before:z-0 before:origin-left',
  'before:scale-x-0 before:content-[""]',
  'before:transition-transform before:duration-300 before:ease-out',
  'hover:before:scale-x-100',
  'motion-reduce:before:transition-none',
].join(' ')

export function CtaButton({
  children,
  variant = 'solid',
  color = 'teal',
  size = 'md',
  className = '',
  caps = false,
  href,
  external = false,
  unlocalized = false,
  ...rest
}: CtaButtonProps) {
  const palette = colorVariantClasses[color][variant]
  const caseClasses = caps ? 'uppercase tracking-ui-wide' : 'normal-case tracking-normal'
  const classes = [
    shellClasses,
    sizeClasses[size],
    caseClasses,
    palette.shell,
    palette.fill,
    className,
  ].join(' ')

  const label = <span className={`relative z-10 ${palette.label}`}>{children}</span>

  if (href) {
    if (external || unlocalized) {
      return (
        <a
          href={href}
          data-variant={variant}
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
        href={href}
        data-variant={variant}
        className={classes}
        {...(rest as ComponentPropsWithoutRef<'a'>)}
      >
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      data-variant={variant}
      className={classes}
      {...(rest as ComponentPropsWithoutRef<'button'>)}
    >
      {label}
    </button>
  )
}
