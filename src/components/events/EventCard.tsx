import Image from 'next/image'
import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'

type AppHref = ComponentProps<typeof Link>['href']

export type EventCardProps = {
  title: string
  meta?: string
  imageSrc?: string
  imageAlt: string
  href: string
  external?: boolean
  className?: string
}

/**
 * Minimal event card — scaffold for homepage row and happenings masonry.
 */
export function EventCard({
  title,
  meta,
  imageSrc,
  imageAlt,
  href,
  external = false,
  className = '',
}: EventCardProps) {
  const media = imageSrc ? (
    <Image
      src={imageSrc}
      alt={imageAlt}
      fill
      sizes="(max-width: 768px) 80vw, 280px"
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
    />
  ) : (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"
    />
  )

  const body = (
    <>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-hbb-page">{media}</div>
      <div className="px-1 pt-3">
        {meta ? (
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            {meta}
          </p>
        ) : null}
        <p className="mt-1 font-ui text-ui-sm font-semibold text-hbb-black group-hover:text-hbb-teal">
          {title}
        </p>
      </div>
    </>
  )

  const sharedClass = [
    'group block w-[min(72vw,280px)] shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal focus-visible:ring-offset-2',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (external) {
    return (
      <a href={href} className={sharedClass} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    )
  }

  return (
    <Link href={href as AppHref} className={sharedClass}>
      {body}
    </Link>
  )
}
