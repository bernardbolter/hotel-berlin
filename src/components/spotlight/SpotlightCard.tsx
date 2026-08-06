import Image from 'next/image'
import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'
import { resolveCategoryToken } from '@/lib/spotlight/categoryTokens'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

export type { SpotlightCardProps }

type AppHref = ComponentProps<typeof Link>['href']

type Props = SpotlightCardProps & {
  className?: string
}

function isSvgSrc(src: string): boolean {
  return /\.svg($|\?)/i.test(src)
}

/**
 * SpotlightCard — fluid width (min 250px), 5∶6 media, right-edge category tag,
 * title → colored rule → monogram + venue, teal meta, Laica body, left-bar CTA.
 */
export function SpotlightCard({
  image,
  badge,
  identityMark,
  title,
  venueLabel,
  primaryMeta,
  description,
  secondaryMeta,
  cta,
  className = '',
}: Props) {
  const badgeStyle = resolveCategoryToken(badge.categoryToken)
  const ctaStyle = resolveCategoryToken(cta.categoryToken)
  const showSecondary =
    secondaryMeta != null &&
    (Boolean(secondaryMeta.left.trim()) || Boolean(secondaryMeta.right.trim()))

  const ctaLabel = (
    <span className="spotlight-card__cta-label font-ui text-label font-bold uppercase tracking-ui-label">
      {cta.label}
    </span>
  )

  const ctaClass =
    'spotlight-card__cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal focus-visible:ring-offset-2'

  return (
    <article
      className={`spotlight-card flex w-full min-w-[250px] flex-col bg-hbb-page ${className}`}
      data-spotlight-card
    >
      <div className="spotlight-card__media relative aspect-5/6 w-full overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        <span
          className="spotlight-card__badge absolute top-3 right-0 z-1 bg-white/90 px-2.5 py-1.5 font-ui text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: badgeStyle.fill }}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div>
          <h3 className="font-ui text-[13px] font-bold uppercase leading-[1.25] tracking-[0.04em] text-[#1F1F1F]">
            {title}
          </h3>
          <hr
            className="mt-2.5 mb-2.5 border-0 border-t-2"
            style={{ borderColor: badgeStyle.fill }}
            aria-hidden="true"
          />
          {(identityMark || venueLabel) ? (
            <div className="flex items-center gap-2.5">
              {identityMark ? (
                <span className="relative h-8 w-8 shrink-0 overflow-hidden">
                  {isSvgSrc(identityMark.src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={identityMark.src}
                      alt={identityMark.alt}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={identityMark.src}
                      alt={identityMark.alt}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  )}
                </span>
              ) : null}
              {venueLabel ? (
                <p className="min-w-0 font-ui text-[11px] font-semibold uppercase leading-snug tracking-[0.06em] text-[#5A5550]">
                  {venueLabel}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-hbb-teal">
          {primaryMeta}
        </p>

        <p className="font-serif text-[15px] leading-[1.55] text-[#3a3a3a]">{description}</p>

        {showSecondary ? (
          <>
            <hr className="border-0 border-t border-gray-200" />
            <p className="flex justify-between gap-3 font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500">
              <span>{secondaryMeta!.left}</span>
              {secondaryMeta!.right.trim() ? <span>{secondaryMeta!.right}</span> : null}
            </p>
          </>
        ) : null}

        <div className="mt-auto pt-2">
          {cta.external ? (
            <a
              href={cta.href}
              className={ctaClass}
              style={{ color: ctaStyle.fill }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={cta.href as AppHref}
              className={ctaClass}
              style={{ color: ctaStyle.fill }}
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
