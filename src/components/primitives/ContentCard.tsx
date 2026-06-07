import { ArrowRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'

import { Link } from '@/i18n/routing'

const badgeColorClasses = {
  teal: 'bg-hbb-teal/10 text-hbb-teal',
  amber: 'bg-hbb-amber/15 text-hbb-amber',
  green: 'bg-hbb-green/10 text-hbb-green',
  purple: 'bg-hbb-purple/10 text-hbb-purple',
} as const

export interface ContentCardProps {
  badge: string
  badgeColor?: keyof typeof badgeColorClasses
  title: string
  subtitle?: string
  date?: string
  price?: string
  body: string
  meta?: string
  ctaLabel: string
  ctaHref: string
  ctaExternal?: boolean
  image?: string
  imageAlt?: string
}

export function ContentCard({
  badge,
  badgeColor = 'teal',
  title,
  subtitle,
  date,
  price,
  body,
  meta,
  ctaLabel,
  ctaHref,
  ctaExternal = false,
  image,
  imageAlt,
}: ContentCardProps) {
  return (
    <article className="flex flex-col border border-gray-200">
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt={imageAlt ?? ''} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span
            className={`inline-block rounded-pill px-2 py-0.5 font-ui text-label uppercase tracking-ui-label ${badgeColorClasses[badgeColor]}`}
          >
            {badge}
          </span>
          {subtitle && <p className="label-tag mt-1">{subtitle}</p>}
        </div>
        <h3 className="font-ui text-ui-md font-medium text-hbb-black">{title}</h3>
        {(date || price) && (
          <p className="font-ui text-ui-sm text-gray-500">
            {date}
            {date && price && ' · '}
            {price}
          </p>
        )}
        <p className="flex-1 font-ui text-ui-sm text-gray-600">{body}</p>
        {meta && <p className="label-tag text-gray-400">{meta}</p>}
        {ctaExternal ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ctaLabel} (opens in new tab)`}
            className="mt-auto flex items-center gap-1 font-ui text-ui-sm font-medium text-hbb-teal"
          >
            {ctaLabel}
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        ) : (
          <Link
            href={ctaHref}
            className="mt-auto flex items-center gap-1 font-ui text-ui-sm font-medium text-hbb-teal"
          >
            {ctaLabel}
            <ArrowRight aria-hidden="true" size={13} />
          </Link>
        )}
      </div>
    </article>
  )
}
