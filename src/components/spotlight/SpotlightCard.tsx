import Image from 'next/image'

import { LineCta } from '@/components/primitives/LineCta'
import { resolveCategoryToken } from '@/lib/spotlight/categoryTokens'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

export type { SpotlightCardProps }

type Props = SpotlightCardProps & {
  className?: string
}

export function SpotlightCard({
  image,
  badge,
  identityMark,
  title,
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

  return (
    <article
      className={`spotlight-card flex flex-col bg-hbb-page ${className}`}
      data-spotlight-card
    >
      <div className="spotlight-card__media relative aspect-4/3 overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        {/* Circle fill is decorative; label text stays readable to AT */}
        <span className="spotlight-card__badge absolute left-3 top-3 flex h-11 min-w-11 items-center justify-center px-2 font-ui text-label uppercase tracking-ui-label">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: `${badgeStyle.fill}e6` }}
          />
          <span className="relative z-1" style={{ color: badgeStyle.text }}>
            {badge.label}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-4">
        <div className="flex items-center gap-3">
          {identityMark ? (
            <span className="relative h-8 w-8 shrink-0 overflow-hidden">
              <Image
                src={identityMark.src}
                alt={identityMark.alt}
                fill
                sizes="32px"
                className="object-contain"
              />
            </span>
          ) : null}
          <h3 className="min-w-0 font-ui text-ui-lg font-medium text-hbb-black">{title}</h3>
        </div>

        <p className="label-tag text-hbb-teal">{primaryMeta}</p>

        <p className="font-serif text-serif-sm text-gray-600">{description}</p>

        {showSecondary ? (
          <>
            <hr className="border-0 border-t border-gray-200" />
            <p className="flex justify-between gap-3 font-ui text-ui-sm text-gray-500">
              <span>{secondaryMeta!.left}</span>
              {secondaryMeta!.right.trim() ? <span>{secondaryMeta!.right}</span> : null}
            </p>
          </>
        ) : null}

        <div className="mt-auto pt-1">
          <LineCta
            href={cta.href}
            external={cta.external}
            unlocalized
            style={{ ['--cta-highlight' as string]: ctaStyle.fill }}
          >
            {cta.label}
          </LineCta>
        </div>
      </div>
    </article>
  )
}
