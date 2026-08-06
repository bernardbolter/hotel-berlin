'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { Link, usePathname } from '@/i18n/routing'
import { useNavScroll } from '@/hooks/useNavScroll'

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { NavSecondary } from '@/components/layout/NavSecondary'

import type { SecondaryNavLink } from '@/lib/nav/types'

export interface SiteNavProps {
  context?: 'outside' | 'inside'
  secondaryLinks: SecondaryNavLink[]
}

const primaryLinkKeys = [
  { href: '/rooms', key: 'rooms' },
  { href: '/meetings', key: 'meetings' },
  { href: '/restaurant', key: 'eatDrink' },
  { href: '/happenings', key: 'happenings' },
  { href: '/neighbourhood', key: 'neighbourhood' },
] as const

/**
 * Shared responsive nav for Home + /here.
 *
 * Breakpoints (Tailwind):
 * - <768: Row 1 wordmark + hamburger; Row 2 lang (left) + CTA (right);
 *   primary + secondary both in dropdown
 * - 768–1099: three rows, no hamburger —
 *     Row 1 wordmark + lang + CTA | Row 2 primary | Row 3 secondary
 * - ≥1100: desktop two-row — primary beside wordmark; secondary below
 */
export function SiteNav({ context = 'outside', secondaryLinks }: SiteNavProps) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const { headerRef: navScrollRef, navState } = useNavScroll()
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const isInside = context === 'inside'
  const ownIsSecondary = isInside
  const ctaLabel = isInside ? t('planNextStay') : t('bookNow')

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  // Close dropdown once hamburger is gone (≥768).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const closeDrawer = () => setMobileOpen(false)

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const primaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    return [
      'relative font-ui text-[15px] font-medium transition-colors duration-200 ease-out',
      'after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current',
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
      current
        ? 'text-hbb-black after:w-full'
        : 'text-[#6B6762] hover:text-hbb-black hover:after:w-full',
    ].join(' ')
  }

  const drawerLinkClass = (href: string) =>
    `font-ui text-[15px] leading-snug hover:text-hbb-black ${
      isCurrent(href) ? 'text-hbb-black' : 'text-[#6B6762]'
    }`

  const ctaClass = `inline-flex book-now-btn ${isInside ? 'book-now-btn--teal' : ''}`

  const langSwitcherColors = {
    label: 'text-[#9A9590]',
    link: 'text-[#6B6762]',
    active: isInside ? 'text-hbb-teal' : 'text-hbb-black',
    hover: 'hover:text-hbb-black',
    separator: 'text-[#6B6762]/40',
  } as const

  const renderPrimaryLinks = () => (
    <ul role="list" className="flex items-center">
      {primaryLinkKeys.map((link, index) => (
        <li key={link.href} className="flex items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="select-none px-2 font-ui text-[15px] font-medium text-[#6B6762]/40"
            >
              |
            </span>
          ) : null}
          <Link
            href={link.href}
            className={primaryNavLinkClass(link.href)}
            aria-current={isCurrent(link.href) ? 'page' : undefined}
          >
            {t(link.key)}
          </Link>
        </li>
      ))}
    </ul>
  )

  const drawerPrimary = (
    <ul role="list" className="flex flex-col gap-3.5">
      {primaryLinkKeys.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={drawerLinkClass(link.href)}
            aria-current={isCurrent(link.href) ? 'page' : undefined}
            onClick={closeDrawer}
          >
            {t(link.key)}
          </Link>
        </li>
      ))}
    </ul>
  )

  const drawerSecondary = (
    <NavSecondary
      context={context}
      links={secondaryLinks}
      layout="stacked"
      className="bg-transparent px-0 py-0"
      onNavigate={closeDrawer}
    />
  )

  const hotelGroup = (
    <nav aria-label={tc('primaryNavAria')} className="mb-6">
      <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.07em] text-[#AAAAAA]">
        {t('drawerHotel')}
      </p>
      {drawerPrimary}
    </nav>
  )

  const stayGroup = (
    <div className="mb-6 border-t border-black/8 pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.07em] text-[#AAAAAA]">
        {t('drawerStay')}
      </p>
      {drawerSecondary}
    </div>
  )

  /** <320: compact · 320–479: mid · ≥480: desktop */
  const wordmarkClass =
    'inline-flex min-w-0 shrink font-ui text-[1.15rem] font-semibold leading-tight tracking-tight text-hbb-black min-[320px]:text-[1.4rem] xs:text-[1.65rem] xs:leading-none'

  return (
    <header
      ref={navScrollRef}
      data-nav-state={navState}
      data-nav-context={context}
      className="site-nav-header sticky top-0 z-50 bg-white"
      style={
        {
          '--nav-accent': isInside ? '#2C6B7A' : '#B87A2E',
        } as CSSProperties
      }
    >
      {/* ── Row 1 ── */}
      <div className="site-shell flex items-center justify-between gap-3 bg-white px-4 py-3 md:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3 min-[1100px]:gap-4">
          <Link href="/" aria-label={tc('homeAria')} className={wordmarkClass}>
            <span className="truncate">{tc('hotelName')}</span>
          </Link>

          <span
            aria-hidden="true"
            className="mx-0.5 hidden h-7 w-0.5 shrink-0 self-center bg-hbb-black min-[1100px]:block"
          />

          {/* Primary beside wordmark — desktop only (≥1100) */}
          <nav aria-label={tc('primaryNavAria')} className="hidden min-[1100px]:block">
            {renderPrimaryLinks()}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 min-[1100px]:gap-5">
          {/* Lang + CTA in Row 1 from 768 up only (below that they live on the util strip) */}
          <div className="hidden md:contents">
            <LanguageSwitcher size="md" colors={langSwitcherColors} />
            <a href="/book" className={ctaClass}>
              <span className="book-now-btn__text">{ctaLabel}</span>
              <span className="book-now-btn__line" aria-hidden="true" />
            </a>
          </div>

          <button
            ref={hamburgerRef}
            type="button"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="site-nav-drawer"
            data-open={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen((open) => !open)}
            className="nav-hamburger inline-flex md:hidden"
          >
            <span className="nav-hamburger__box" aria-hidden="true">
              <span className="nav-hamburger__line" />
              <span className="nav-hamburger__line" />
              <span className="nav-hamburger__line" />
            </span>
          </button>
        </div>
      </div>

      {/*
        Below 768: util strip — language left, Book Now right.
        Primary + secondary live in the hamburger dropdown.
      */}
      <div className="w-full bg-hbb-nav-bg md:hidden">
        <div className="site-shell flex items-center justify-between gap-3 px-4 py-2">
          <LanguageSwitcher align="start" size="md" colors={langSwitcherColors} />
          <a href="/book" className={ctaClass}>
            <span className="book-now-btn__text">{ctaLabel}</span>
            <span className="book-now-btn__line" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/*
        Row 2 — primary links as their own strip (768–1099 only).
        Wrapper owns visibility so `.nav-secondary` display can't fight utilities.
      */}
      <div className="hidden md:max-[1099px]:block">
        <nav aria-label={tc('primaryNavAria')} className="nav-secondary w-full bg-hbb-nav-bg">
          <div className="site-shell flex items-center overflow-x-auto px-4 py-2 md:px-8 xl:px-10">
            {renderPrimaryLinks()}
          </div>
        </nav>
      </div>

      {/* Scroll-hide clip: guest secondary from 768 up */}
      <div className="nav-secondary-clip">
        <NavSecondary
          context={context}
          links={secondaryLinks}
          visibility="all"
          className="hidden bg-hbb-nav-bg-deep md:block min-[1100px]:bg-hbb-nav-bg"
        />
      </div>

      {/* ── Dropdown — only below 768: primary + secondary, own group first ── */}
      <div className="md:hidden">
        <div
          className="nav-drawer-clip"
          data-open={mobileOpen ? 'true' : 'false'}
        >
          <div className="nav-drawer-panel">
            <div
              ref={drawerRef}
              id="site-nav-drawer"
              role="region"
              aria-label={tc('navMenuAria')}
              inert={!mobileOpen}
              className="nav-drawer-panel-inner"
            >
              {ownIsSecondary ? (
                <>
                  {stayGroup}
                  <div className="border-t border-black/8 pt-5">{hotelGroup}</div>
                </>
              ) : (
                <>
                  {hotelGroup}
                  {stayGroup}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
