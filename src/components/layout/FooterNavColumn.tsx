'use client'

import { BedDouble, ChevronDown, HelpCircle, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { Link } from '@/i18n/routing'

export type FooterNavIconName = 'bed-double' | 'utensils' | 'help-circle'

const footerNavIcons: Record<FooterNavIconName, LucideIcon> = {
  'bed-double': BedDouble,
  utensils: Utensils,
  'help-circle': HelpCircle,
}

export interface FooterNavLink {
  label: string
  href: string
  muted?: boolean
}

export interface FooterNavColumnProps {
  title: string
  iconName: FooterNavIconName
  links: FooterNavLink[]
  ariaLabel: string
}

function FooterLink({ href, label, muted }: FooterNavLink) {
  const className = `font-ui text-ui-xs hover:text-hbb-footer-primary ${
    muted ? 'text-hbb-footer-muted' : 'text-hbb-footer-link'
  }`

  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

export function FooterNavColumn({ title, iconName, links, ariaLabel }: FooterNavColumnProps) {
  const Icon = footerNavIcons[iconName]
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
        className="flex w-full items-center justify-between py-2 font-ui text-label uppercase tracking-ui-label text-hbb-footer-amber lg:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-1.5">
          <Icon aria-hidden="true" size={11} />
          {title}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <p className="mb-3 hidden items-center gap-1.5 font-ui text-label uppercase tracking-ui-label text-hbb-footer-amber lg:flex">
        <Icon aria-hidden="true" size={11} />
        {title}
      </p>

      <ul
        id={panelId}
        role="list"
        hidden={!open}
        className="flex flex-col gap-1 pb-3 lg:hidden"
      >
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>

      <ul role="list" className="hidden flex-col gap-1 lg:flex">
        {links.map((link) => (
          <li key={`desktop-${link.label}`}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
