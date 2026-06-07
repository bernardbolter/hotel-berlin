'use client'

import { Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, usePathname } from '@/i18n/routing'

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
  const locale = useLocale()
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

  const navLinkClass = (href: string) =>
    `font-ui text-ui-sm hover:text-hbb-teal ${
      isCurrent(href) ? 'text-hbb-teal' : 'text-hbb-black'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-hbb-page">
      <div className="hidden lg:block">
        <nav
          aria-label={tc('primaryNavAria')}
          className="flex items-center justify-between gap-6 px-section-x py-3"
        >
          <Link
            href="/"
            aria-label={tc('homeAria')}
            className="font-ui text-ui-md font-medium text-hbb-black"
          >
            {tc('hotelName')}
          </Link>

          <ul role="list" className="flex items-center gap-5">
            {primaryLinkKeys.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLinkClass(link.href)}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-ui text-ui-sm">
              <Link
                href="/"
                locale="de"
                hrefLang="de"
                lang="de"
                aria-label={tc('langDe')}
                aria-current={locale === 'de' ? 'true' : undefined}
                className={locale === 'de' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
              >
                DE
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                href="/"
                locale="en"
                hrefLang="en"
                lang="en"
                aria-label={tc('langEn')}
                aria-current={locale === 'en' ? 'true' : undefined}
                className={locale === 'en' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
              >
                EN
              </Link>
            </div>
            <a href="/book" className="btn-primary">
              {t('bookNow')}
            </a>
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

      <div className="flex items-center justify-between px-section-sm py-3 lg:hidden">
        <Link
          href="/"
          aria-label={tc('homeAria')}
          className="font-ui text-ui-sm font-medium text-hbb-black"
        >
          {tc('hotelName')}
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
                  className={navLinkClass(link.href)}
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

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 font-ui text-ui-sm">
            <Link
              href="/"
              locale="de"
              hrefLang="de"
              lang="de"
              aria-label={tc('langDe')}
              aria-current={locale === 'de' ? 'true' : undefined}
              className={locale === 'de' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
            >
              DE
            </Link>
            <span aria-hidden="true">|</span>
            <Link
              href="/"
              locale="en"
              hrefLang="en"
              lang="en"
              aria-label={tc('langEn')}
              aria-current={locale === 'en' ? 'true' : undefined}
              className={locale === 'en' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
            >
              EN
            </Link>
          </div>
          <a href="/book" className="btn-primary">
            {t('bookNow')}
          </a>
        </div>
      </div>
    </header>
  )
}
