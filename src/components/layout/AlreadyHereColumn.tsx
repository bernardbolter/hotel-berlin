'use client'

import { ArrowRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { AmenityIcon } from '@/components/home/AmenityIcon'
import { Link } from '@/i18n/routing'
import type { FooterLinkData } from '@/lib/payload/footerTypes'

type AppHref = ComponentProps<typeof Link>['href']

export type AlreadyHereColumnProps = {
  title: string
  icon?: string | null
  description: string
  links: FooterLinkData[]
  ariaLabel: string
  linksAriaLabel: string
}

export function AlreadyHereColumn({
  title,
  icon,
  description,
  links,
  ariaLabel,
  linksAriaLabel,
}: AlreadyHereColumnProps) {
  return (
    <div>
      <p
        className="mb-3.5 inline-flex items-center gap-2 border-b border-hbb-footer-teal/40 pb-2 font-ui text-ui-sm font-semibold uppercase tracking-ui-label text-hbb-footer-teal"
        aria-label={ariaLabel}
      >
        <AmenityIcon iconName={icon ?? 'MapPin'} size={16} className="shrink-0 text-hbb-footer-teal" />
        {title}
      </p>
      {description ? (
        <p className="mb-3.5 font-ui text-ui-md leading-relaxed text-hbb-footer-primary/70">{description}</p>
      ) : null}
      <ul role="list" aria-label={linksAriaLabel} className="flex flex-col">
        {links.map((link) => {
          const className =
            'flex min-h-11 items-center justify-between py-2.5 font-ui text-ui-md text-hbb-footer-primary/90 hover:text-hbb-footer-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber'
          const content = (
            <>
              <span className="inline-flex items-center gap-1">
                {link.label}
                {link.showArrow ? <span aria-hidden="true">→</span> : null}
              </span>
              <ArrowRight aria-hidden="true" size={12} className="text-white/20" />
            </>
          )

          return (
            <li
              key={link.id}
              className={`border-t border-white/8 last:border-b ${link.dividerBefore ? 'mt-2' : ''}`}
            >
              {link.external ||
              link.href.startsWith('http') ||
              link.href.startsWith('mailto:') ||
              link.href.startsWith('tel:') ? (
                <a href={link.href} className={className}>
                  {content}
                </a>
              ) : (
                <Link href={link.href as AppHref} className={className}>
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
