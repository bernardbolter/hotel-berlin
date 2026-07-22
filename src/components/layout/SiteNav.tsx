'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

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

export function SiteNav({ context = 'outside', secondaryLinks }: SiteNavProps) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const { headerRef: navScrollRef, navState } = useNavScroll()
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

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
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusable.length === 0) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [mobileOpen])

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

  const mobileNavLinkClass = (href: string) =>
    `font-ui text-ui-sm hover:text-hbb-black ${
      isCurrent(href) ? 'text-hbb-black' : 'text-[#6B6762]'
    }`

  const wordmark = (
    <Link
      href="/"
      aria-label={tc('homeAria')}
      className="inline-flex shrink-0 self-center font-ui text-[1.65rem] font-semibold leading-none tracking-tight text-hbb-black"
    >
      <span className="whitespace-nowrap">{tc('hotelName')}</span>
    </Link>
  )

  return (
    <header
      ref={navScrollRef}
      data-nav-state={navState}
      className="site-nav-header sticky top-0 z-50 bg-white"
    >
      <div className="hidden lg:block">
        <div className="site-shell flex items-center justify-between gap-6 bg-white px-8 py-3.5 xl:px-10">
          <div className="flex min-w-0 items-center gap-4">
            {wordmark}

            <span
              aria-hidden="true"
              className="mx-0.5 h-7 w-0.5 shrink-0 self-center bg-hbb-black"
            />

            <nav aria-label={tc('primaryNavAria')}>
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
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <LanguageSwitcher
              size="md"
              colors={{
                label: 'text-[#9A9590]',
                link: 'text-[#6B6762]',
                active: 'text-hbb-black',
                hover: 'hover:text-hbb-black',
                separator: 'text-[#6B6762]/40',
              }}
            />
            <a href="/book" className="book-now-btn">
              <span className="book-now-btn__text">{t('bookNow')}</span>
              <span className="book-now-btn__line" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="nav-secondary-clip">
          <NavSecondary context={context} links={secondaryLinks} />
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-section-sm py-3 lg:hidden">
        <Link
          href="/"
          aria-label={tc('homeAria')}
          className="inline-flex min-w-0 shrink font-ui text-[1.15rem] font-semibold leading-tight tracking-tight text-hbb-black"
        >
          <span className="truncate">{tc('hotelName')}</span>
        </Link>
        <button
          ref={hamburgerRef}
          type="button"
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-hbb-black"
        >
          {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      <div
        ref={drawerRef}
        id="mobile-nav"
        hidden={!mobileOpen}
        role="dialog"
        aria-label={tc('navMenuAria')}
        aria-modal="true"
        className="border-t border-black/8 bg-white px-section-sm py-4 lg:hidden"
      >
        <nav aria-label={tc('primaryNavAria')} className="mb-6">
          <ul role="list" className="flex flex-col gap-3">
            {primaryLinkKeys.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={mobileNavLinkClass(link.href)}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <NavSecondary
          context={context}
          links={secondaryLinks}
          layout="stacked"
          className="mb-6 border-t border-black/8 px-0 py-4"
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="flex items-end justify-between border-t border-gray-100 pt-4">
          <LanguageSwitcher align="start" size="lg" />
          <a href="/book" className="book-now-btn">
            <span className="book-now-btn__text">{t('bookNow')}</span>
            <span className="book-now-btn__line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}
