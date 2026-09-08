import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'

export type PersonCardRec = {
  name: string
  distance: string
}

export type PersonCardProps = {
  role: string
  room?: string | null
  name: string
  subline?: string | null
  recs: PersonCardRec[]
  cta: string
  href?: string | null
  portrait?: { src: string; alt: string } | null
}

/**
 * Hub person card — square portrait, room pill when known, recommendation list.
 * Artists (or anyone) without a room render no pill.
 */
export function PersonCard({
  role,
  room,
  name,
  subline,
  recs,
  cta,
  href,
  portrait,
}: PersonCardProps) {
  const body = (
    <>
      <div className="person-card__media">
        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="person-card__body">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-ui text-[9px] font-bold uppercase tracking-[0.14em] text-hbb-nbhd">
            {role}
          </p>
          {room ? (
            <span className="border border-hbb-nbhd px-[5px] py-px font-mono text-[9px] font-medium text-hbb-nbhd">
              {room}
            </span>
          ) : null}
        </div>
        <h3 className="font-serif text-[20px] font-normal leading-[1.15] text-[#141414]">
          {name}
        </h3>
        {subline ? (
          <p className="font-ui text-[11px] leading-[15px] text-[#5a5a5a]">{subline}</p>
        ) : null}
        {recs.length > 0 ? (
          <ul className="person-card__recs">
            {recs.map((rec) => (
              <li key={rec.name} className="person-card__rec font-ui text-[11.5px] leading-[15px]">
                <span className="font-medium text-[#141414]">{rec.name}</span>
                <span className="shrink-0 tabular-nums text-[#5a5a5a]">{rec.distance}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {href ? (
          <p className="mt-auto w-fit pt-2 font-ui text-[10px] font-bold uppercase tracking-[0.13em] text-hbb-nbhd [border-bottom:1.5px_solid_currentColor]">
            {cta}
          </p>
        ) : null}
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={toAppHref(href)} className="person-card h-full">
        {body}
      </Link>
    )
  }

  return <article className="person-card h-full">{body}</article>
}
