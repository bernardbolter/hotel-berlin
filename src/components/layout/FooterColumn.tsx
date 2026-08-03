'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'

import { AmenityIcon } from '@/components/home/AmenityIcon'
import { Link } from '@/i18n/routing'
import type { FooterLinkData } from '@/lib/payload/footerTypes'

type AppHref = ComponentProps<typeof Link>['href']

function FooterLink({ label, href, showArrow, dividerBefore, external }: FooterLinkData) {
  const className = showArrow
    ? 'font-ui text-ui-md text-hbb-footer-amber hover:text-hbb-footer-primary inline-flex min-h-10 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber'
    : 'font-ui text-ui-md text-hbb-footer-primary/90 hover:text-hbb-footer-primary inline-flex min-h-10 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber'

  const content = (
    <>
      {label}
      {showArrow ? <span aria-hidden="true">→</span> : null}
    </>
  )

  const itemClass = dividerBefore ? 'mt-3 pt-1' : ''

  if (
    external ||
    href.startsWith('http') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('/book')
  ) {
    return (
      <li className={itemClass}>
        <a
          href={href}
          className={className}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      </li>
    )
  }

  return (
    <li className={itemClass}>
      <Link href={href as AppHref} className={className}>
        {content}
      </Link>
    </li>
  )
}

export type FooterColumnProps = {
  title: string
  icon?: string | null
  links: FooterLinkData[]
  ariaLabel: string
}

function ColumnHeading({ title, icon }: { title: string; icon?: string | null }) {
  return (
    <p className="mb-3.5 hidden border-b border-hbb-footer-amber/35 pb-2 font-ui text-ui-sm font-semibold uppercase tracking-ui-label text-hbb-footer-amber lg:flex lg:items-center lg:gap-2">
      <AmenityIcon iconName={icon} size={16} className="shrink-0 text-hbb-footer-amber" />
      <span>{title}</span>
    </p>
  )
}

export function FooterColumn({ title, icon, links, ariaLabel }: FooterColumnProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <nav aria-label={ariaLabel}>
      <button
        ref={buttonRef}
        type="button"
        className="flex w-full items-center justify-between border-b border-hbb-footer-amber/35 py-2.5 font-ui text-ui-sm font-semibold uppercase tracking-ui-label text-hbb-footer-amber lg:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2">
          <AmenityIcon iconName={icon} size={16} className="shrink-0 text-hbb-footer-amber" />
          {title}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <ColumnHeading title={title} icon={icon} />

      <ul id={panelId} role="list" hidden={!open} className="flex flex-col gap-1.5 pb-3 pt-3 lg:hidden">
        {links.map((link) => (
          <FooterLink key={link.id} {...link} />
        ))}
      </ul>

      <ul role="list" className="hidden flex-col gap-1.5 lg:flex">
        {links.map((link) => (
          <FooterLink key={`desktop-${link.id}`} {...link} />
        ))}
      </ul>
    </nav>
  )
}
