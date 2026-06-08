'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, usePathname } from '@/i18n/routing'

import {
  HotelBerlinBerlinLogo,
  LOGO_MOBILE_CLASS,
} from '@/components/brand/HotelBerlinBerlinLogo'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { CtaButton } from '@/components/primitives/CtaButton'

export interface SiteNavProps {
  context?: 'outside' | 'inside'
}

const primaryLinkKeys = [
  { href: '/rooms', key: 'rooms' },
  { href: '/meetings', key: 'meetings' },
  { href: '/restaurant', key: 'eatDrink' },
  { href: '/happenings', key: 'happenings' },
  { href: '/neighbourhood', key: 'neighbourhood' },
] as const

const guestLinkKeys = [
  { href: '/here/events', key: 'whatsOn' },
  { href: '/here/explore', key: 'gettingAround' },
  { href: '/here/explore', key: 'localTips' },
  { href: '/gallery', key: 'gallery' },
  { href: '/skateboard-museum', key: 'skateboardMuseum' },
] as const

export function SiteNav({ context: _context = 'outside' }: SiteNavProps) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
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
      'relative font-ui text-ui-xl font-medium transition-colors duration-200 ease-out',
      'after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current',
      'after:w-0 after:transition-[width] after:duration-200 after:ease-out',
      'motion-reduce:transition-none motion-reduce:after:transition-none',
      current
        ? 'text-hbb-teal after:w-full'
        : 'text-hbb-nav-link hover:text-hbb-black hover:after:w-full',
    ].join(' ')
  }

  const mobileNavLinkClass = (href: string) =>
    `font-ui text-ui-sm hover:text-hbb-teal ${
      isCurrent(href) ? 'text-hbb-teal' : 'text-hbb-black'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-hbb-page">
      <div className="hidden lg:block">
        <nav
          aria-label={tc('primaryNavAria')}
          className="flex items-start justify-between gap-6 px-section-x pt-3 pb-1"
        >
          <div className="flex min-w-0 items-center gap-5">
            <Link
              href="/"
              aria-label={tc('homeAria')}
              className="inline-flex shrink-0 self-start"
            >
              <HotelBerlinBerlinLogo variant="default" />
            </Link>

            <ul role="list" className="flex items-center">
              {primaryLinkKeys.map((link, index) => (
                <li key={link.href} className="flex items-center">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="select-none px-2.5 font-ui text-ui-xl font-medium text-hbb-nav-link/35"
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
          </div>

          <div className="flex shrink-0 items-start gap-4">
            <LanguageSwitcher size="md" />
            <CtaButton
              href="/book"
              unlocalized
              color="teal"
              variant="outline"
              size="xl"
              className="shrink-0 self-start"
            >
              {t('bookNow')}
            </CtaButton>
          </div>
        </nav>

        <nav
          aria-label={tc('guestNavAria')}
          className="flex items-center justify-between border-t border-gray-100 px-section-x py-2"
        >
          <Link href="/here" className="font-ui text-ui-sm text-hbb-teal">
            {t('inBuilding')} <span aria-hidden="true">{t('enter')}</span>
            <span className="sr-only">{t('enterGuestHub')}</span>
          </Link>
          <ul role="list" className="flex items-center gap-4">
            {guestLinkKeys.map((link) => (
              <li key={`${link.href}-${link.key}`}>
                <Link href={link.href} className="font-ui text-ui-xs text-gray-500 hover:text-hbb-teal">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-start justify-between px-section-sm pt-3 pb-1 lg:hidden">
        <Link href="/" aria-label={tc('homeAria')} className="inline-flex shrink-0 self-start">
          <HotelBerlinBerlinLogo variant="default" className={LOGO_MOBILE_CLASS} />
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
        className="border-t border-gray-200 bg-hbb-page px-section-sm py-4 lg:hidden"
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

        <nav aria-label={tc('guestNavAria')} className="mb-6 border-t border-gray-100 pt-4">
          <Link
            href="/here"
            className="mb-3 block font-ui text-ui-sm text-hbb-teal"
            onClick={() => setMobileOpen(false)}
          >
            {t('inBuilding')} <span aria-hidden="true">{t('enter')}</span>
            <span className="sr-only">{t('enterGuestHub')}</span>
          </Link>
          <ul role="list" className="flex flex-col gap-2">
            {guestLinkKeys.map((link) => (
              <li key={`${link.href}-${link.key}`}>
                <Link
                  href={link.href}
                  className="font-ui text-ui-sm text-gray-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-end justify-between border-t border-gray-100 pt-4">
          <LanguageSwitcher align="start" size="lg" />
          <CtaButton
            href="/book"
            unlocalized
            color="teal"
            variant="outline"
            size="lg"
            className="shrink-0 self-start"
          >
            {t('bookNow')}
          </CtaButton>
        </div>
      </div>
    </header>
  )
}
