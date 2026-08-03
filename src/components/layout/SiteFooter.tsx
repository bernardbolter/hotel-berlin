import { getLocale, getTranslations } from 'next-intl/server'
import type { ComponentProps } from 'react'

import { AlreadyHereColumn } from '@/components/layout/AlreadyHereColumn'
import { AwardsCarousel } from '@/components/layout/AwardsCarousel'
import { BookDirectStrip } from '@/components/layout/BookDirectStrip'
import { FooterColumn } from '@/components/layout/FooterColumn'
import { FooterContact } from '@/components/layout/FooterContact'
import { Link } from '@/i18n/routing'
import { getFooterData } from '@/lib/payload/footer'
import type { FooterBarLink } from '@/lib/payload/footerTypes'

type AppHref = ComponentProps<typeof Link>['href']

function FooterBarAnchor({
  link,
  className,
  opensInNewTabLabel,
}: {
  link: FooterBarLink
  className: string
  opensInNewTabLabel?: string
}) {
  if (link.external || link.href.startsWith('http')) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
        {opensInNewTabLabel ? <span className="sr-only"> {opensInNewTabLabel}</span> : null}
      </a>
    )
  }

  return (
    <Link href={link.href as AppHref} className={className}>
      {link.label}
    </Link>
  )
}

export async function SiteFooter() {
  const locale = (await getLocale()) as 'de' | 'en'
  const tc = await getTranslations('common')
  const t = await getTranslations('footer')
  const data = await getFooterData(locale)
  const year = new Date().getFullYear()

  return (
    <>
      {data.bookDirectStrip.visible ? (
        <BookDirectStrip
          message={data.bookDirectStrip.message}
          ctaLabel={data.bookDirectStrip.ctaLabel}
          ctaUrl={data.bookDirectStrip.ctaUrl}
        />
      ) : null}

      <footer role="contentinfo" aria-label={tc('siteFooterAria')} className="[overflow-anchor:none]">
        <div className="bg-hbb-footer-bg-dark">
          <div className="site-shell px-section-sm py-10 md:px-section-x md:py-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_0.5px_0.9fr] lg:gap-0">
              <div className="grid grid-cols-1 gap-8 pr-0 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-6 lg:pr-10">
                <FooterContact
                  hotelName={data.contact.hotelName}
                  sinceYear={data.contact.sinceYear}
                  sinceLabel={t('sinceLabel')}
                  postalAddress={data.contact.postalAddress}
                  addressLines={data.contact.addressLines}
                  phone={data.contact.phone}
                  email={data.contact.email}
                  transitJoined={data.contact.transitJoined}
                  phoneAriaLabel={t('phoneAria', { phone: data.contact.phone })}
                  emailAriaLabel={t('emailAria', { email: data.contact.email })}
                  transitAriaLabel={t('transitAria')}
                />

                {data.columns.map((column) => (
                  <FooterColumn
                    key={column.id}
                    title={column.title}
                    icon={column.icon}
                    links={column.links}
                    ariaLabel={`${column.title} ${t('navAriaSuffix')}`}
                  />
                ))}
              </div>

              <div className="hidden w-px bg-hbb-footer-teal lg:block" aria-hidden="true" />

              <div className="border-t border-white/10 pt-8 lg:border-t-0 lg:pl-10 lg:pt-0">
                <AlreadyHereColumn
                  title={data.alreadyHere.title}
                  icon={data.alreadyHere.icon}
                  description={data.alreadyHere.description}
                  links={data.alreadyHere.links}
                  ariaLabel={t('alreadyHereAria')}
                  linksAriaLabel={tc('guestHubLinksAria')}
                />
              </div>
            </div>
          </div>
        </div>

        <AwardsCarousel
          heading={data.awardsHeading}
          awards={data.awards}
          previousLabel={t('previousAward')}
          nextLabel={t('nextAward')}
        />

        {data.partnerLinks.length > 0 ? (
          <div className="bg-hbb-footer-bg-medium">
            <div className="site-shell flex flex-wrap items-center gap-x-3 gap-y-2 px-section-sm py-3 md:px-section-x">
              <span className="font-ui text-ui-sm uppercase tracking-ui-label text-hbb-footer-primary/70">
                {t('partOf')}
              </span>
              {data.partnerLinks.map((partner, index) => (
                <span key={partner.id} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-hbb-footer-primary/40">
                      ·
                    </span>
                  ) : null}
                  <FooterBarAnchor
                    link={partner}
                    opensInNewTabLabel={tc('opensInNewTab')}
                    className="font-ui text-ui-md text-hbb-footer-primary/85 hover:text-hbb-footer-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-footer-amber"
                  />
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bg-hbb-footer-bg-light">
          <div className="site-shell flex flex-col gap-3 px-section-sm py-4 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-section-x md:pb-5">
            {data.legalLinks.length > 0 ? (
              <nav aria-label={t('legalLinksAria')}>
                <ul role="list" className="flex flex-wrap items-center gap-x-0 gap-y-1">
                  {data.legalLinks.map((link, index) => (
                    <li key={link.id} className="flex items-center">
                      {index > 0 ? (
                        <span aria-hidden="true" className="px-2.5 text-hbb-footer-on-light/45">
                          ·
                        </span>
                      ) : null}
                      <FooterBarAnchor
                        link={link}
                        className="font-ui text-ui-md text-hbb-footer-on-light/85 hover:text-hbb-footer-on-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-black"
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <span />
            )}

            <p className="font-ui text-ui-md text-hbb-footer-on-light sm:text-right">
              © {year} {data.copyrightEntity}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
