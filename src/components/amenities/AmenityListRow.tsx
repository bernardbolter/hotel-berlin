import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { AmenityListMoreLink } from '@/components/amenities/AmenityListMoreLink'
import type { AmenityCardImage } from '@/components/here/AmenityCard'
import type { RelatedFaqLink } from '@/lib/amenities/resolve'

export type AmenityListRowCopy = {
  specWhen: string
  specPrice: string
  morePrefix: string
  faqHeading: string
  pendingText: string
  locationLabel: string
  accessLabel: string
}

type Spec = { label: string; value: string }

type Props = {
  id: string
  title: string
  location: string
  icon: LucideIcon
  image?: AmenityCardImage | null
  pending?: boolean
  specs: Spec[]
  summary?: string | null
  notice?: string | null
  details?: unknown
  access?: string | null
  hoursNote?: string | null
  pageHref?: string | null
  relatedFaqs: RelatedFaqLink[]
  copy: AmenityListRowCopy
}

export function AmenityListRow({
  id,
  title,
  location,
  icon: Icon,
  image,
  pending = false,
  specs,
  summary,
  notice,
  details,
  access,
  hoursNote,
  pageHref,
  relatedFaqs,
  copy,
}: Props) {
  const fact1 = specs[0]
  const fact2 = specs[1]
  const pageLink = pageHref ? (
    <AmenityListMoreLink href={toAppHref(pageHref)}>
      {copy.morePrefix} {title} →
    </AmenityListMoreLink>
  ) : null

  const summaryGrid = (
    <>
      <span className="amenity-list-row__ic" aria-hidden="true">
        <Icon strokeWidth={1.75} />
      </span>
      <span className="amenity-list-row__name">
        <span className="amenity-list-row__t">{title}</span>
        <span className="amenity-list-row__loc">{location}</span>
      </span>
      <span className="amenity-list-row__f">
        {fact1 ? (
          <>
            <small>{fact1.label}</small>
            {fact1.value}
          </>
        ) : null}
      </span>
      <span className="amenity-list-row__f amenity-list-row__f--second">
        {fact2 ? (
          <>
            <small>{fact2.label}</small>
            {fact2.value}
          </>
        ) : summary && !fact1 ? (
          summary
        ) : null}
      </span>
      <span className="amenity-list-row__page">{pageLink}</span>
      {pending ? null : (
        <svg className="amenity-list-row__chev" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  )

  const openBody = (
    <div className="amenity-list-row__open">
      {image ? (
        <div className="amenity-list-row__photo">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="amenity-list-row__text">
        {details ? (
          <RichTextParagraphs
            value={details}
            paragraphClassName="font-serif text-serif-sm leading-relaxed text-[#2A3540]"
          />
        ) : summary ? (
          <p className="font-serif text-serif-sm leading-relaxed text-[#2A3540]">{summary}</p>
        ) : null}
        {notice ? <p className="amenity-list-row__notice">{notice}</p> : null}
      </div>
      <dl className="amenity-list-row__facts">
        <div>
          <dt>{copy.locationLabel}</dt>
          <dd>{location}</dd>
        </div>
        {access ? (
          <div>
            <dt>{copy.accessLabel}</dt>
            <dd>{access}</dd>
          </div>
        ) : null}
        {hoursNote ? (
          <div>
            <dt>{copy.specWhen}</dt>
            <dd>{hoursNote}</dd>
          </div>
        ) : null}
        {fact2 ? (
          <div className="amenity-list-row__facts-mobile">
            <dt>{fact2.label}</dt>
            <dd>{fact2.value}</dd>
          </div>
        ) : null}
        {pageLink ? <div className="amenity-list-row__facts-mobile">{pageLink}</div> : null}
        {relatedFaqs.length > 0 ? (
          <div>
            <dt>{copy.faqHeading}</dt>
            <dd>
              <ul>
                {relatedFaqs.map((faq) => (
                  <li key={faq.slug}>
                    <Link href={toAppHref(faq.href)} className="underline-offset-2 hover:underline">
                      {faq.question}
                    </Link>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )

  if (pending) {
    return (
      <article id={id} className="amenity-list-row amenity-list-row--pending">
        <div className="amenity-list-row__summary" aria-disabled="true">
          {summaryGrid}
        </div>
        <p className="amenity-list-row__pending-msg">{copy.pendingText}</p>
      </article>
    )
  }

  return (
    <details id={id} className="amenity-list-row">
      <summary className="amenity-list-row__summary">{summaryGrid}</summary>
      {openBody}
    </details>
  )
}
