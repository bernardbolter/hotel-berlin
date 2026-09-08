import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'

export type AmenitySpec = {
  label: string
  value: string
}

export type AmenityCardImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

export type AmenityCardProps = {
  eyebrow: string
  title: string
  specs: AmenitySpec[]
  subline?: string | null
  image?: AmenityCardImage | null
  icon: LucideIcon
  href?: string | null
  pending?: boolean
}

/**
 * Hub amenity card — 2/3 photo, 1/3 text, no CTA.
 * Whole card is the link when `href` is set; otherwise inert.
 */
export function AmenityCard({
  eyebrow,
  title,
  specs,
  subline,
  image,
  icon: Icon,
  href,
  pending = false,
}: AmenityCardProps) {
  const body = (
    <>
      <div
        className={`amenity-card__media ${image ? '' : 'amenity-card__media--empty'}`}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <Icon aria-hidden="true" strokeWidth={1.75} />
        )}
      </div>
      <div className="amenity-card__body">
        <p className="font-ui text-[9px] font-bold uppercase tracking-[0.14em] text-hbb-amber-deep">
          {eyebrow}
        </p>
        <h3 className="font-serif text-[17px] font-normal leading-[1.15] text-[#141414]">
          {title}
        </h3>
        {specs.length > 0 ? (
          <dl className="amenity-card__specs">
            {specs.map((spec) => (
              <div key={spec.label} className="contents">
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {subline ? (
          <p className="font-ui text-[11px] leading-[15px] text-[#5a5a5a]">{subline}</p>
        ) : null}
      </div>
    </>
  )

  const className = `amenity-card ${pending ? 'amenity-card--pending' : ''}`

  if (href) {
    return (
      <Link href={toAppHref(href)} className={className}>
        {body}
      </Link>
    )
  }

  return <article className={className}>{body}</article>
}
