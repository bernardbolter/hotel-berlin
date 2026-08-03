import { Bus, Mail, Phone } from 'lucide-react'

import type { FooterPostalAddress } from '@/lib/payload/footerTypes'

export type FooterContactProps = {
  hotelName: string
  sinceYear: string
  sinceLabel: string
  postalAddress: FooterPostalAddress
  addressLines: string[]
  phone: string
  email: string
  transitJoined: string
  phoneAriaLabel: string
  emailAriaLabel: string
  transitAriaLabel: string
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/**
 * Hotel identity + contact block.
 * Semantic HTML for a11y; visible fields align with sitewide Hotel JSON-LD (AEO).
 * Contact details live inside <address>; founding year stays outside.
 */
export function FooterContact({
  hotelName,
  sinceYear,
  sinceLabel,
  postalAddress,
  addressLines,
  phone,
  email,
  transitJoined,
  phoneAriaLabel,
  emailAriaLabel,
  transitAriaLabel,
}: FooterContactProps) {
  const hasStructured =
    Boolean(postalAddress.streetAddress) &&
    Boolean(postalAddress.postalCode) &&
    Boolean(postalAddress.addressLocality)

  return (
    <section aria-labelledby="footer-hotel-name" className="min-w-0">
      <p
        id="footer-hotel-name"
        className="mb-3 font-ui text-ui-xl font-semibold leading-snug tracking-ui-tight text-hbb-footer-primary md:text-[22px]"
      >
        {hotelName}
      </p>

      <address className="not-italic">
        {hasStructured ? (
          <p className="mb-1 font-ui text-ui-md leading-relaxed text-hbb-footer-primary/85">
            <span className="block">
              {postalAddress.streetAddress}, {postalAddress.postalCode}
            </span>
            <span className="block">
              {postalAddress.addressLocality} {postalAddress.addressCountry}
            </span>
          </p>
        ) : (
          <p className="mb-1 font-ui text-ui-md leading-relaxed text-hbb-footer-primary/85">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        )}

        <p className="mb-5 font-ui text-ui-md text-hbb-footer-primary/85">
          {sinceLabel} {sinceYear}
        </p>

        <ul role="list" className="flex flex-col gap-2.5">
          <li>
            <a
              href={telHref(phone)}
              aria-label={phoneAriaLabel}
              className="inline-flex min-h-11 items-center gap-2.5 font-ui text-ui-md text-hbb-footer-primary/90 hover:text-hbb-footer-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber"
            >
              <Phone
                aria-hidden="true"
                size={16}
                className="shrink-0 text-hbb-footer-amber"
                strokeWidth={1.75}
              />
              <span>{phone}</span>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${email}`}
              aria-label={emailAriaLabel}
              className="inline-flex min-h-11 items-center gap-2.5 font-ui text-ui-md text-hbb-footer-primary/90 hover:text-hbb-footer-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber"
            >
              <Mail
                aria-hidden="true"
                size={16}
                className="shrink-0 text-hbb-footer-amber"
                strokeWidth={1.75}
              />
              <span>{email}</span>
            </a>
          </li>
        </ul>
      </address>

      {transitJoined ? (
        <p
          className="mt-3.5 flex items-start gap-2.5 font-ui text-ui-sm leading-relaxed text-hbb-footer-primary/65"
          aria-label={transitAriaLabel}
        >
          <Bus
            aria-hidden="true"
            size={16}
            className="mt-0.5 shrink-0 text-hbb-footer-amber"
            strokeWidth={1.75}
          />
          <span>{transitJoined}</span>
        </p>
      ) : null}
    </section>
  )
}
