'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

import { Link, usePathname } from '@/i18n/routing'
import { useNavScroll } from '@/hooks/useNavScroll'

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { NavSecondary } from '@/components/layout/NavSecondary'

import type { BridgeLabelParts } from '@/lib/nav/bridge'
import type { SecondaryNavLink } from '@/lib/nav/types'

type AppHref = ComponentProps<typeof Link>['href']

export interface SiteNavProps {
  context?: 'outside' | 'inside'
  /** `/here` destinations — used as row 1 when `context="inside"`. */
  hereLinks: SecondaryNavLink[]
  bridge: {
    toHere: BridgeLabelParts
    toStay: BridgeLabelParts
  }
}

const outsideLinkKeys = [
  { href: '/rooms', key: 'rooms' },
  { href: '/meetings', key: 'meetings' },
  { href: '/restaurant', key: 'eatDrink' },
  { href: '/happenings', key: 'happenings' },
  { href: '/neighbourhood', key: 'neighbourhood' },
] as const

/**
 * Shared responsive nav for Home + /here.
 *
 * Row 1 = current context. Row 2 = bridge + the other context’s links.
 *
 * Breakpoints (Tailwind):
 * - <768: Row 1 wordmark + hamburger; util strip lang + CTA;
 *   row-1 links + bridge in dropdown
 * - 768–1099: three rows, no hamburger —
 *     Row 1 wordmark + lang + CTA | Row 2 primary | Row 3 bridge
 * - ≥1100: desktop two-row — primary beside wordmark; bridge below
 */
export function SiteNav({ context = 'outside', hereLinks, bridge }: SiteNavProps) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const { headerRef: navScrollRef, navState } = useNavScroll()
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const isInside = context === 'inside'
  const ctaLabel = isInside ? t('planNextStay') : t('bookNow')
  const bridgeLabel = isInside ? bridge.toStay : bridge.toHere

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

  const primaryHover = isInside ? 'hover:text-hbb-amber-text' : 'hover:text-hbb-teal'
  const primaryPipe = 'text-hbb-black/40'

  const primaryNavLinkClass = (href: string) => {
    const current = isCurrent(href)
    return [
      'relative font-ui text-[15px] font-medium text-hbb-black no-underline',
      'transition-colors duration-200 ease-out',
      primaryHover,
      "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:content-['']",
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
      current ? 'after:w-full' : 'hover:after:w-full',
    ].join(' ')
  }

  const drawerLinkClass = (href: string) =>
    `font-ui text-[15px] leading-snug text-hbb-black ${primaryHover} ${
      isCurrent(href) ? '' : 'opacity-90 hover:opacity-100'
    }`

  const langSwitcherColors = {
    label: 'text-[#9A9590]',
    link: 'text-[#6B6762]',
    active: 'text-hbb-black',
    hover: primaryHover,
    separator: 'text-[#6B6762]/40',
  } as const

  const outsideNavLinks: SecondaryNavLink[] = outsideLinkKeys.map((link) => ({
    id: link.href,
    href: link.href,
    label: t(link.key),
  }))
  const row2Links = isInside ? outsideNavLinks : hereLinks

  const renderOutsideLinks = (opts: { drawer?: boolean }) =>
    outsideLinkKeys.map((link, index) => {
      const className = opts.drawer ? drawerLinkClass(link.href) : primaryNavLinkClass(link.href)
      const item = (
        <Link
          href={link.href}
          className={className}
          aria-current={isCurrent(link.href) ? 'page' : undefined}
          onClick={opts.drawer ? closeDrawer : undefined}
        >
          {t(link.key)}
        </Link>
      )
      if (opts.drawer) {
        return <li key={link.href}>{item}</li>
      }
      return (
        <li key={link.href} className="flex items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={`select-none px-2 font-ui text-[15px] font-medium ${primaryPipe}`}
            >
              |
            </span>
          ) : null}
          {item}
        </li>
      )
    })

  const renderHereLinks = (opts: { drawer?: boolean }) =>
    hereLinks.map((link, index) => {
      const className = opts.drawer ? drawerLinkClass(link.href) : primaryNavLinkClass(link.href)
      const item = (
        <Link
          href={link.href as AppHref}
          className={className}
          aria-current={isCurrent(link.href) ? 'page' : undefined}
          onClick={opts.drawer ? closeDrawer : undefined}
        >
          {link.label}
        </Link>
      )
      if (opts.drawer) {
        return <li key={link.id}>{item}</li>
      }
      return (
        <li key={link.id} className="flex items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={`select-none px-2 font-ui text-[15px] font-medium ${primaryPipe}`}
            >
              |
            </span>
          ) : null}
          {item}
        </li>
      )
    })

  const renderPrimaryLinks = (opts: { drawer?: boolean } = {}) => (
    <ul role="list" className={opts.drawer ? 'flex flex-col gap-3.5' : 'flex items-center'}>
      {isInside ? renderHereLinks(opts) : renderOutsideLinks(opts)}
    </ul>
  )

  const wordmarkClass =
    'inline-flex min-w-0 shrink font-ui text-[1.15rem] font-semibold leading-tight tracking-tight text-hbb-black min-[320px]:text-[1.4rem] xs:text-[1.65rem] xs:leading-none'

  return (
    <header
      ref={navScrollRef}
      data-nav-state={navState}
      data-nav-context={context}
      className="site-nav-header sticky top-0 z-50 bg-white"
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

          <nav aria-label={tc('primaryNavAria')} className="hidden min-[1100px]:block">
            {renderPrimaryLinks()}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 min-[1100px]:gap-5">
          <div className="hidden md:contents">
            <LanguageSwitcher size="md" colors={langSwitcherColors} />
            {/* F5 — Komm wieder still points at /book pending destination decision */}
            <a href="/book" className="inline-flex book-now-btn">
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

      <div className="w-full bg-hbb-nav-bg md:hidden">
        <div className="site-shell flex items-center justify-between gap-3 px-4 py-2">
          <LanguageSwitcher align="start" size="md" colors={langSwitcherColors} />
          <a href="/book" className="inline-flex book-now-btn">
            <span className="book-now-btn__text">{ctaLabel}</span>
            <span className="book-now-btn__line" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hidden md:max-[1099px]:block">
        <nav aria-label={tc('primaryNavAria')} className="nav-secondary w-full bg-hbb-nav-bg">
          <div className="site-shell flex items-center overflow-x-auto px-4 py-2 md:px-8 xl:px-10">
            {renderPrimaryLinks()}
          </div>
        </nav>
      </div>

      <div className="nav-secondary-clip">
        <NavSecondary
          context={isInside ? 'inside' : 'outside'}
          links={row2Links}
          label={bridgeLabel}
          className="hidden bg-hbb-nav-bg md:block"
        />
      </div>

      <div className="md:hidden">
        <div className="nav-drawer-clip" data-open={mobileOpen ? 'true' : 'false'}>
          <div className="nav-drawer-panel">
            <div
              ref={drawerRef}
              id="site-nav-drawer"
              role="region"
              aria-label={tc('navMenuAria')}
              inert={!mobileOpen}
              className="nav-drawer-panel-inner"
            >
              <nav aria-label={tc('primaryNavAria')} className="mb-6">
                {renderPrimaryLinks({ drawer: true })}
              </nav>
              <NavSecondary
                context={isInside ? 'inside' : 'outside'}
                links={row2Links}
                label={bridgeLabel}
                layout="stacked"
                className="border-t border-black/8 pt-5"
                onNavigate={closeDrawer}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
