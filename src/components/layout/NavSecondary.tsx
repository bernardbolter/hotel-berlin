'use client'

import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/routing'

import { CtaButton } from '@/components/primitives/CtaButton'

import type { SecondaryNavLink } from '@/lib/nav/types'

type Props = {
  context: 'outside' | 'inside'
  links: SecondaryNavLink[]
  layout?: 'bar' | 'stacked'
  className?: string
  onNavigate?: () => void
}

export function NavSecondary({
  context,
  links,
  layout = 'bar',
  className = '',
  onNavigate,
}: Props) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()

  const isCurrent = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  const isBar = layout === 'bar'
  const textSize = isBar ? 'text-[14px]' : 'text-ui-sm'

  const secondaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    const base = [
      'relative font-ui font-normal tracking-[0.02em] transition-colors duration-200 ease-out',
      textSize,
      'after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current',
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
    ].join(' ')

    if (context === 'inside') {
      return [
        base,
        current
          ? 'text-hbb-teal after:w-full'
          : 'text-hbb-nav-secondary hover:text-hbb-teal hover:after:w-full',
      ].join(' ')
    }

    return [
      base,
      current ? 'text-hbb-nav-amber after:w-full' : 'text-hbb-nav-amber hover:after:w-full',
    ].join(' ')
  }

  const pipeClass =
    context === 'inside'
      ? `select-none px-2 font-ui font-medium text-hbb-nav-secondary/50 ${textSize}`
      : `select-none px-2 font-ui font-medium text-hbb-nav-amber/40 ${textSize}`

  const bridgeHref = context === 'inside' ? '/' : '/here'
  const bridgeAria = context === 'inside' ? t('bridgeToMainAria') : t('bridgeToGuestAria')

  const bridgeBlock =
    context === 'inside' ? (
      <div className="flex items-center gap-2">
        <span className="font-ui text-ui-base text-hbb-nav-muted">{t('planningStay')}</span>
        <CtaButton
          href={bridgeHref}
          color="teal"
          variant="outline"
          size="sm"
          aria-label={bridgeAria}
          className="gap-1"
          onClick={onNavigate}
        >
          {t('mainSite')}
        </CtaButton>
      </div>
    ) : (
      <div className="flex shrink-0 flex-nowrap items-center gap-2.5">
        <span className={`shrink-0 font-ui text-hbb-nav-amber ${isBar ? 'text-[15px]' : 'text-[14px]'}`}>
          {t('inBuilding')}
        </span>
        {/* ENTER — intentional boxed border treatment (PDF) */}
        <Link
          href={bridgeHref}
          aria-label={bridgeAria}
          onClick={onNavigate}
          className={`enter-btn ${isBar ? 'text-[12px]' : 'text-ui-xs'}`}
        >
          <span className="enter-btn__text">{t('enter')}</span>
        </Link>
      </div>
    )

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
        href={link.href}
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
        className={`nav-secondary flex flex-col items-start gap-3 bg-hbb-nav-bg ${className}`}
      >
        {bridgeBlock}
        <ul role="list" className="flex flex-col gap-2">
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
      className={`nav-secondary w-full bg-hbb-nav-bg ${className}`}
    >
      <div className="site-shell flex items-center px-8 py-2 xl:px-10">
        <div className="flex min-w-0 flex-nowrap items-center gap-x-1">
          {bridgeBlock}
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
