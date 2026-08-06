'use client'

import { Footprints, TrainFront } from 'lucide-react'
import Image from 'next/image'

import { Link } from '@/i18n/routing'

export type PlaceInfoCardEndorsement = {
  person: {
    name: string
    slug: string
    initials: string
  }
}

export type PlaceInfoCardTransit = {
  minutes: number
  station: string
  line: string
}

export type PlaceInfoCardImageCredit = {
  creditText: string
  creditUrl?: string | null
}

export type PlaceInfoCardProps = {
  image?: { src: string; alt: string } | null
  imageCredit?: PlaceInfoCardImageCredit | null
  category: { label: string; token: string }
  name: string
  description?: string | null
  walkingMinutes?: number | null
  walkingLabel?: string
  transit?: PlaceInfoCardTransit | null
  transitLabel?: string
  endorsements: PlaceInfoCardEndorsement[]
  /** Uppercase label above recommender chips — same treatment as category. */
  recommendedByLabel?: string
  /** Optional close control (full-page map). */
  onClose?: () => void
  closeLabel?: string
  className?: string
}

/**
 * Floating place detail — 268px on md+, full-width below the map on mobile.
 */
export function PlaceInfoCard({
  image,
  imageCredit,
  category,
  name,
  description,
  walkingMinutes,
  walkingLabel,
  transit,
  transitLabel,
  endorsements,
  recommendedByLabel,
  onClose,
  closeLabel = 'Close',
  className = '',
}: PlaceInfoCardProps) {
  const hasWalk = walkingMinutes != null && Boolean(walkingLabel)
  const hasTransit =
    transit != null &&
    transit.minutes != null &&
    Boolean(transit.station) &&
    Boolean(transit.line)
  const creditText = imageCredit?.creditText?.trim()

  return (
    <article
      className={`overflow-hidden rounded-sm border border-black/8 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.14)] ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {image?.src ? (
        <div className="relative h-36 w-full bg-gray-100">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="268px"
            className="object-cover"
          />
          {creditText ? (
            <p className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-0.5 font-ui text-[9px] leading-tight text-white/90">
              {imageCredit?.creditUrl ? (
                <a
                  href={imageCredit.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {creditText}
                </a>
              ) : (
                creditText
              )}
            </p>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-sm bg-white/90 font-ui text-ui-sm text-hbb-black shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest"
            >
              ×
            </button>
          ) : null}
        </div>
      ) : onClose ? (
        <div className="flex justify-end px-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-7 w-7 items-center justify-center rounded-sm font-ui text-ui-sm text-hbb-black/70 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="px-3 py-2.5">
        <p
          className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: category.token }}
        >
          {category.label}
        </p>
        <h3 className="mt-0.5 font-ui text-ui-sm font-medium leading-snug text-hbb-black">
          {name}
        </h3>

        {description ? (
          <p className="mt-1.5 font-ui text-[12px] leading-snug text-gray-600">{description}</p>
        ) : null}

        {hasWalk || hasTransit ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-black/6 pb-2.5 font-ui text-[11px] text-gray-500">
            {hasWalk ? (
              <span className="inline-flex items-center gap-1">
                <Footprints aria-hidden="true" size={12} strokeWidth={1.75} />
                <span>{walkingLabel}</span>
              </span>
            ) : null}
            {hasTransit && transit ? (
              <span className="inline-flex items-center gap-1" title={transitLabel}>
                <TrainFront aria-hidden="true" size={12} strokeWidth={1.75} />
                <span>
                  {transit.minutes} min · {transit.line} {transit.station}
                </span>
              </span>
            ) : null}
          </div>
        ) : null}

        {endorsements.length > 0 ? (
          <div className="mt-2.5">
            {recommendedByLabel ? (
              <p className="mb-1.5 font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                {recommendedByLabel}
              </p>
            ) : null}
            <ul className="flex flex-wrap gap-1.5">
              {endorsements.map((entry) => (
                <li key={entry.person.slug}>
                  <Link
                    href={{
                      pathname: '/you-me-berlin/[slug]',
                      params: { slug: entry.person.slug },
                    }}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-black/10 bg-hbb-page/80 py-0.5 pl-0.5 pr-2 font-ui text-[11px] text-gray-700 transition-colors hover:border-hbb-forest hover:text-hbb-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-forest"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-hbb-black font-ui text-[9px] font-medium text-white"
                      aria-hidden="true"
                    >
                      {entry.person.initials}
                    </span>
                    <span>{entry.person.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  )
}
