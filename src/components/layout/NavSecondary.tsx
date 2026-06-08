'use client'

import { ArrowRight } from 'lucide-react'
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

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const isBar = layout === 'bar'
  const outsideTextSize = isBar ? 'text-[15px]' : 'text-ui-sm'
  const insideTextSize = isBar ? 'text-[15px]' : 'text-ui-sm'

  const secondaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    const textSize = context === 'inside' ? insideTextSize : outsideTextSize
    const base = [
      'relative font-ui font-normal tracking-[0.03em] transition-colors duration-200 ease-out',
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
      ? `select-none px-2.5 font-ui font-medium text-hbb-nav-secondary/50 ${insideTextSize}`
      : `select-none px-2.5 font-ui font-medium text-hbb-nav-amber/35 ${outsideTextSize}`

  const bridgeHref = context === 'inside' ? '/' : '/here'
  const bridgeAria =
    context === 'inside' ? t('bridgeToMainAria') : t('bridgeToGuestAria')

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
          <ArrowRight aria-hidden="true" size={12} strokeWidth={2} />
        </CtaButton>
      </div>
    ) : (
      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        <span
          className={`shrink-0 font-ui text-hbb-nav-amber ${isBar ? 'text-[17px]' : 'text-[14px]'}`}
        >
          {t('inBuilding')}
        </span>
        <CtaButton
          href={bridgeHref}
          color="amber"
          variant="outline"
          size={isBar ? 'md' : 'sm'}
          aria-label={bridgeAria}
          className={`shrink-0 whitespace-nowrap !border-hbb-nav-amber !text-hbb-nav-amber before:!bg-hbb-nav-amber ${isBar ? 'text-[14px]' : ''}`}
          onClick={onNavigate}
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {t('enter')}
            <ArrowRight aria-hidden="true" size={isBar ? 14 : 12} strokeWidth={2} />
          </span>
        </CtaButton>
      </div>
    )

  const renderLink = (link: SecondaryNavLink) =>
    link.external ? (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryNavLinkClass(link.href)}
      >
        {link.label}
      </a>
    ) : (
      <Link
        href={link.href}
        className={secondaryNavLinkClass(link.href)}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    )

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
      className={`nav-secondary flex items-center bg-hbb-nav-bg px-section-x py-1.5 ${className}`}
    >
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
    </nav>
  )
}
