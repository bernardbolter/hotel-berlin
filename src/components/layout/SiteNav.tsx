'use client'

import { Menu, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, usePathname } from '@/i18n/routing'

export interface SiteNavProps {
  context?: 'outside' | 'inside'
}

const primaryLinks = [
  { href: '/rooms', label: 'Rooms' },
  { href: '/meetings', label: 'Meetings' },
  { href: '/restaurant', label: 'Eat & Drink' },
  { href: '/happenings', label: 'Happenings' },
  { href: '/neighbourhood', label: 'Neighbourhood' },
] as const

const guestLinks = [
  { href: '/here/events', label: "What's on" },
  { href: '/here/explore', label: 'Getting around' },
  { href: '/here/explore', label: 'Local tips' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/skateboard-museum', label: 'Skateboard Museum' },
] as const

export function SiteNav({ context: _context = 'outside' }: SiteNavProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

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

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const navLinkClass = (href: string) =>
    `font-ui text-ui-sm hover:text-hbb-teal ${
      isCurrent(href) ? 'text-hbb-teal' : 'text-hbb-black'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-hbb-page">
      <div className="hidden lg:block">
        <nav
          aria-label="Primary navigation"
          className="flex items-center justify-between gap-6 px-section-x py-3"
        >
          <Link
            href="/"
            aria-label="Hotel Berlin, Berlin — home"
            className="font-ui text-ui-md font-medium text-hbb-black"
          >
            Hotel Berlin, Berlin
          </Link>

          <ul role="list" className="flex items-center gap-5">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLinkClass(link.href)}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                >
                  {link.label}
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
                aria-label="Deutsch"
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
                aria-label="English"
                aria-current={locale === 'en' ? 'true' : undefined}
                className={locale === 'en' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
              >
                EN
              </Link>
            </div>
            <a href="/book" className="btn-primary">
              Book Now
            </a>
          </div>
        </nav>

        <nav
          aria-label="Guest navigation"
          className="flex items-center justify-between border-t border-gray-100 px-section-x py-2"
        >
          <Link href="/here" className="font-ui text-ui-sm text-hbb-teal">
            In the Building? <span aria-hidden="true">ENTER</span>
            <span className="sr-only">— Enter guest hub</span>
          </Link>
          <ul role="list" className="flex items-center gap-4">
            {guestLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href} className="font-ui text-ui-xs text-gray-500 hover:text-hbb-teal">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center justify-between px-section-sm py-3 lg:hidden">
        <Link
          href="/"
          aria-label="Hotel Berlin, Berlin — home"
          className="font-ui text-ui-sm font-medium text-hbb-black"
        >
          Hotel Berlin, Berlin
        </Link>
        <button
          ref={hamburgerRef}
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-hbb-black"
        >
          {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!mobileOpen}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className="border-t border-gray-200 bg-hbb-page px-section-sm py-4 lg:hidden"
      >
        <nav aria-label="Primary navigation" className="mb-6">
          <ul role="list" className="flex flex-col gap-3">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLinkClass(link.href)}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Guest navigation" className="mb-6 border-t border-gray-100 pt-4">
          <Link
            href="/here"
            className="mb-3 block font-ui text-ui-sm text-hbb-teal"
            onClick={() => setMobileOpen(false)}
          >
            In the Building? <span aria-hidden="true">ENTER</span>
            <span className="sr-only">— Enter guest hub</span>
          </Link>
          <ul role="list" className="flex flex-col gap-2">
            {guestLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  className="font-ui text-ui-sm text-gray-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
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
              aria-label="Deutsch"
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
              aria-label="English"
              aria-current={locale === 'en' ? 'true' : undefined}
              className={locale === 'en' ? 'font-medium text-hbb-teal' : 'text-gray-500'}
            >
              EN
            </Link>
          </div>
          <a href="/book" className="btn-primary">
            Book Now
          </a>
        </div>
      </div>
    </header>
  )
}
