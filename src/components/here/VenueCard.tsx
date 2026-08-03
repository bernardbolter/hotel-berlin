import Image from 'next/image'

import { Link } from '@/i18n/routing'

export type VenueCardProps = {
  title: string
  badge: string
  meta: string
  href: string
  /** Visual tint — tonight KTTK amber / Lütze gold */
  tone?: 'amber' | 'gold' | 'neutral'
  /** Status dot before badge (Lütze kitchen open) */
  live?: boolean
  className?: string
}

const toneClass: Record<NonNullable<VenueCardProps['tone']>, string> = {
  amber: 'border-[#F2D9B8] bg-[#FDF6EE]',
  gold: 'border-[#EDE0C4] bg-[#FDF8EE]',
  neutral: 'border-gray-200 bg-gray-50',
}

/**
 * Half-width tap-target card — badge + title + one meta line.
 * Not a reading card. Used in Tonight (KTTK/Lütze) and basement sections.
 */
export function VenueCard({
  title,
  badge,
  meta,
  href,
  tone = 'amber',
  live = false,
  className = '',
}: VenueCardProps) {
  return (
    <Link
      href={href as '/'}
      className={`venue-card flex min-h-22 flex-col justify-center border p-3 transition-opacity hover:opacity-90 ${toneClass[tone]} ${className}`}
    >
      <p className="flex items-center gap-1.5 font-ui text-label uppercase tracking-ui-label text-hbb-nav-amber">
        {live ? (
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-hbb-green" />
        ) : null}
        <span>{badge}</span>
      </p>
      <h3 className="mt-1.5 font-ui text-ui-md font-medium text-hbb-black">{title}</h3>
      <p className="mt-0.5 font-ui text-ui-sm text-gray-600">{meta}</p>
    </Link>
  )
}

export type TonightHeroCardProps = {
  title: string
  meta: string
  statusLabel: string
  image?: { src: string; alt: string } | null
  href: string
  className?: string
}

/**
 * Full-width Tonight hero — current FKKB exhibition/event with image.
 */
export function TonightHeroCard({
  title,
  meta,
  statusLabel,
  image,
  href,
  className = '',
}: TonightHeroCardProps) {
  return (
    <Link
      href={href as '/'}
      className={`tonight-hero-card block border border-hbb-teal bg-[#F0F8F7] transition-opacity hover:opacity-95 ${className}`}
    >
      {image?.src ? (
        <div className="relative h-20 w-full overflow-hidden md:h-28">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center bg-hbb-teal/10 font-ui text-ui-sm text-hbb-teal md:h-28">
          Exhibition image
        </div>
      )}
      <div className="p-3">
        <p className="flex items-center gap-1.5 font-ui text-label uppercase tracking-ui-label text-hbb-green">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-hbb-green" />
          {statusLabel}
        </p>
        <h3 className="mt-1.5 font-ui text-ui-md font-medium text-hbb-black">{title}</h3>
        <p className="mt-0.5 font-ui text-ui-sm text-gray-600">{meta}</p>
      </div>
    </Link>
  )
}
