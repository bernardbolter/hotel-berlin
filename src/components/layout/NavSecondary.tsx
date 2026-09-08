'use client'

import { useTranslations } from 'next-intl'
import type { ComponentProps, CSSProperties } from 'react'

import { Link, usePathname } from '@/i18n/routing'

import { NavBridgeButton } from '@/components/layout/NavBridgeButton'

import type { BridgeLabelParts } from '@/lib/nav/bridge'
import type { SecondaryNavLink } from '@/lib/nav/types'

type AppHref = ComponentProps<typeof Link>['href']

type Props = {
  context: 'outside' | 'inside'
  links: SecondaryNavLink[]
  label: BridgeLabelParts
  layout?: 'bar' | 'stacked'
  className?: string
  onNavigate?: () => void
}

/**
 * Row 2 — bridge plus the other context’s links.
 * Home: ENTER + /here destinations. /here: BLEIB + hotel destinations.
 */
export function NavSecondary({
  context,
  links,
  label,
  layout = 'bar',
  className = '',
  onNavigate,
}: Props) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const isInside = context === 'inside'

  const isCurrent = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  const isBar = layout === 'bar'
  const textSize = isBar ? 'text-[12px] min-[1100px]:text-[14px]' : 'text-[15px]'
  const accent = isInside ? 'text-hbb-teal' : 'text-hbb-amber-text'
  const underline = isInside ? 'after:bg-hbb-teal' : 'after:bg-hbb-amber-text'

  const secondaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    return [
      'relative font-ui font-normal tracking-[0.02em] no-underline',
      'transition-colors duration-200 ease-out',
      textSize,
      accent,
      "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:content-['']",
      underline,
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
      current ? 'after:w-full' : 'hover:after:w-full',
    ].join(' ')
  }

  const pipeClass = isInside
    ? `select-none px-2 font-ui font-medium text-hbb-teal/40 ${textSize}`
    : `select-none px-2 font-ui font-medium text-hbb-amber-text/40 ${textSize}`

  const row2Vars = {
    '--ctx-accent': isInside ? '#2C6B7A' : '#B87A2E',
    '--ctx-accent-text': isInside ? '#2C6B7A' : '#9A6420',
  } as CSSProperties

  const renderLink = (link: SecondaryNavLink) => {
    if (link.comingSoon) {
      return (
        <a
          href="#"
          className={secondaryNavLinkClass(link.href)}
          aria-disabled="true"
          onClick={(event) => {
            event.preventDefault()
            onNavigate?.()
          }}
        >
          {link.label}
          <span className="sr-only"> — {t('comingSoon')}</span>
        </a>
      )
    }

    if (link.external) {
      return (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryNavLinkClass(link.href)}
        >
          {link.label}
        </a>
      )
    }

    return (
      <Link
        href={link.href as AppHref}
        className={secondaryNavLinkClass(link.href)}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    )
  }

  if (layout === 'stacked') {
    return (
      <nav
        aria-label={tc('guestNavAria')}
        className={`nav-secondary flex flex-col items-start gap-3 ${className}`}
        style={row2Vars}
      >
        <NavBridgeButton context={context} label={label} size="stacked" onNavigate={onNavigate} />
        <ul role="list" className="flex flex-col gap-3.5">
          {links.map((link) => (
            <li key={link.id}>{renderLink(link)}</li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav
      aria-label={tc('guestNavAria')}
      className={`nav-secondary w-full ${className || 'bg-hbb-nav-bg'}`}
      style={row2Vars}
    >
      <div className="site-shell flex items-center px-4 py-2 md:px-8 xl:px-10">
        <div className="flex min-w-0 flex-nowrap items-center gap-x-1">
          <NavBridgeButton context={context} label={label} size="bar" onNavigate={onNavigate} />
          {links.length > 0 ? (
            <ul role="list" className="flex flex-nowrap items-center">
              {links.map((link) => (
                <li key={link.id} className="flex items-center">
                  <span aria-hidden="true" className={pipeClass}>
                    |
                  </span>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
