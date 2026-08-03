'use client'

import { useTranslations } from 'next-intl'
import type { ComponentProps } from 'react'

import { Link, usePathname } from '@/i18n/routing'

import { NavBridgeButton } from '@/components/layout/NavBridgeButton'

import type { SecondaryNavLink } from '@/lib/nav/types'

type AppHref = ComponentProps<typeof Link>['href']

type Props = {
  context: 'outside' | 'inside'
  links: SecondaryNavLink[]
  /** Which secondary links to show in this instance */
  visibility?: 'all' | 'tablet' | 'promoted'
  layout?: 'bar' | 'stacked'
  showBridge?: boolean
  className?: string
  onNavigate?: () => void
}

function isOverflowLink(link: SecondaryNavLink): boolean {
  return /gallery|wallride|galerie/i.test(link.label) || /gallery|wallride/i.test(link.href)
}

export function NavSecondary({
  context,
  links,
  visibility = 'all',
  layout = 'bar',
  showBridge = true,
  className = '',
  onNavigate,
}: Props) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()

  const visibleLinks = (() => {
    if (visibility === 'promoted') return links.slice(0, 1)
    if (visibility === 'tablet') return links.filter((link) => !isOverflowLink(link))
    return links
  })()

  const isCurrent = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  const isBar = layout === 'bar'
  /** Third-row (tablet) is slightly smaller; desktop bar stays 14px; drawer stacked is larger */
  const textSize = isBar ? 'text-[12px] lg:text-[14px]' : 'text-[15px]'
  const accentActive = context === 'inside' ? 'text-hbb-teal' : 'text-hbb-nav-amber'
  const accentHover =
    context === 'inside'
      ? 'text-hbb-nav-secondary hover:text-hbb-teal'
      : 'text-hbb-nav-amber hover:text-hbb-nav-amber'

  const secondaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    return [
      'relative font-ui font-normal tracking-[0.02em] transition-colors duration-200 ease-out',
      textSize,
      'after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current',
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
      current ? `${accentActive} after:w-full` : `${accentHover} hover:after:w-full`,
    ].join(' ')
  }

  const pipeClass =
    context === 'inside'
      ? `select-none px-2 font-ui font-medium text-hbb-nav-secondary/50 ${textSize}`
      : `select-none px-2 font-ui font-medium text-hbb-nav-amber/40 ${textSize}`

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
      >
        {showBridge ? <NavBridgeButton context={context} size="stacked" onNavigate={onNavigate} /> : null}
        <ul role="list" className="flex flex-col gap-3.5">
          {visibleLinks.map((link) => (
            <li key={link.id}>{renderLink(link)}</li>
          ))}
        </ul>
      </nav>
    )
  }

  if (visibility === 'promoted') {
    const link = visibleLinks[0]
    if (!link) return null
    return (
      <nav aria-label={tc('guestNavAria')} className={className}>
        {renderLink(link)}
      </nav>
    )
  }

  return (
    <nav
      aria-label={tc('guestNavAria')}
      className={`nav-secondary w-full ${className || 'bg-hbb-nav-bg'}`}
    >
      <div className="site-shell flex items-center px-4 py-2 md:px-8 xl:px-10">
        <div className="flex min-w-0 flex-nowrap items-center gap-x-1">
          {showBridge ? <NavBridgeButton context={context} size="bar" onNavigate={onNavigate} /> : null}
          {visibleLinks.length > 0 ? (
            <ul role="list" className="flex flex-nowrap items-center">
              {visibleLinks.map((link) => (
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

export { isOverflowLink }
