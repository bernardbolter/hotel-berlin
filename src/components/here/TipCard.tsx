import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

export type TipCardEndorser = {
  name: string
  role: string
  room?: string | null
  href?: string | null
  portrait?: { src: string; alt: string } | null
}

export type TipCardProps = {
  slug: string
  name: string
  category: PlaceCategory
  categoryLabel: string
  categoryColor: string
  description?: string | null
  walkingLabel?: string | null
  image?: { src: string; alt: string } | null
  placeholderLabel: string
  noEndorserLabel: string
  href: string
  endorser?: TipCardEndorser | null
}

/**
 * Hub tip card — 4:3 media, top-left 28px, 3px category rule, ink label + dot.
 * Avatar: portrait · dashed ring with category dot · omitted when no endorser.
 */
export function TipCard({
  name,
  categoryLabel,
  categoryColor,
  description,
  walkingLabel,
  image,
  noEndorserLabel,
  href,
  endorser,
}: TipCardProps) {
  const style = { ['--tip-cat' as string]: categoryColor }

  const endorserBlock = endorser ? (
    <div className="tip-card__endorser">
      {endorser.portrait ? (
        <span className="tip-card__avatar" data-avatar="portrait">
          <Image
            src={endorser.portrait.src}
            alt={endorser.portrait.alt}
            fill
            sizes="40px"
            className="object-cover"
          />
        </span>
      ) : (
        <span className="tip-card__avatar tip-card__avatar--empty" data-avatar="empty" aria-hidden="true">
          <span className="tip-card__avatar-dot" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-ui text-[12px] font-medium leading-[15px] text-[#141414]">
          {endorser.name}
        </p>
        <p className="flex flex-wrap items-center gap-1.5 font-ui text-[10px] leading-[13px] text-[#5a5a5a]">
          <span className="truncate">{endorser.role}</span>
          {endorser.room ? (
            <span className="shrink-0 border border-hbb-nbhd px-[5px] py-px font-mono text-[9px] font-medium text-hbb-nbhd">
              {endorser.room}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  ) : (
    <div className="tip-card__endorser" data-endorser-state="none">
      <span className="tip-card__avatar tip-card__avatar--empty" data-avatar="none" aria-hidden="true" />
      <p className="font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-[#5a5a5a]">
        {noEndorserLabel}
      </p>
    </div>
  )

  return (
    <article className="tip-card" style={style} data-endorser={endorser ? 'yes' : 'none'}>
      <Link href={toAppHref(href)} className="tip-card__link">
        <div className={`tip-card__media ${image ? '' : 'tip-card__media--block'}`}>
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <p className="tip-card__nameblock">{name}</p>
          )}
        </div>
        <div className="tip-card__body">
          <p className="tip-card__cat">
            <span className="tip-card__dot" aria-hidden="true" />
            {categoryLabel}
          </p>
          <h3 className="font-serif text-[20px] font-normal leading-[1.15] text-[#141414]">{name}</h3>
          {walkingLabel ? (
            <p className="font-ui text-[11px] tabular-nums text-[#5a5a5a]">{walkingLabel}</p>
          ) : null}
          {description ? (
            <p className="line-clamp-3 font-ui text-[11.5px] leading-[15px] text-[#5a5a5a]">
              {description}
            </p>
          ) : null}
          {endorserBlock}
        </div>
      </Link>
    </article>
  )
}
