import {
  ArrowRight,
  DoorOpen,
  Globe,
  Mail,
  Share2,
  Phone,
  Train,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { FooterNavColumn } from '@/components/layout/FooterNavColumn'

import { Link } from '@/i18n/routing'

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const tc = await getTranslations('common')

  const stayLinks = [
    { label: t('stayRooms'), href: '/rooms' },
    { label: t('stayOffers'), href: '/offers' },
    { label: t('stayBookDirect'), href: '/book' },
    { label: t('stayRewards'), href: 'https://radissonhotels.com/rewards', muted: true },
  ]

  const eatMeetLinks = [
    { label: t('eatLutze'), href: 'https://luetze-berlin.de' },
    { label: t('eatMeetings'), href: '/meetings' },
    { label: t('eatWeddings'), href: '/meetings' },
    { label: t('eatKttk'), href: '/here/explore' },
  ]

  const helpLinks = [
    { label: t('helpFaqs'), href: '/faqs' },
    { label: t('helpContact'), href: 'mailto:info@hotel-berlin.de' },
    { label: t('helpGettingHere'), href: '/neighbourhood' },
    { label: t('helpCareers'), href: 'https://careers.radissonhotels.com', muted: true },
  ]

  const insideLinks = [
    { label: t('insideWhatsOn'), href: '/here/events' },
    { label: t('insideDining'), href: '/here/dining' },
    { label: t('insideNeighbourhood'), href: '/here/explore' },
    { label: t('insideFaqs'), href: '/here/faq' },
  ] as const

  const awards = [
    t('awardBreeam'),
    t('awardGreenKey'),
    t('awardCvent'),
    t('awardMeetings'),
    t('awardBerlin'),
  ]

  const legalLinks = [
    { label: t('legalImprint'), href: '/imprint' },
    { label: t('legalPrivacy'), href: '/privacy' },
    { label: t('legalTerms'), href: '/terms' },
    { label: t('legalAccessibility'), href: '/accessibility' },
  ]

  const socials = [
    { label: t('socialInstagram'), href: 'https://instagram.com/hotelberlinberlin', icon: Share2 },
    { label: t('socialLinkedIn'), href: 'https://linkedin.com/company/hotel-berlin-berlin', icon: Globe },
  ]

  return (
    <footer aria-label={tc('siteFooterAria')}>
      <div className="flex flex-col items-start justify-between gap-4 bg-hbb-amber px-section-sm py-3 md:flex-row md:items-center md:px-section-x">
        <p className="font-ui text-ui-sm font-medium text-hbb-dark">{t('bookingStrip')}</p>
        <a href="/book" className="btn-dark flex items-center gap-1.5 text-ui-sm">
          {t('checkAvailability')}
          <ArrowRight aria-hidden="true" size={13} />
        </a>
      </div>

      <div className="bg-hbb-footer px-section-sm py-10 md:px-section-x">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_0.5px_0.9fr] lg:gap-0">
          <div className="grid grid-cols-1 gap-6 pr-0 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-6 lg:pr-10">
            <div>
              <p className="mb-1 font-ui text-ui-sm font-medium text-hbb-footer-primary">
                {tc('hotelName')}
              </p>
              <address className="mb-4 font-ui text-ui-xs not-italic leading-relaxed text-hbb-footer-muted">
                Lützowplatz 17
                <br />
                10785 Berlin, {tc('germany')}
                <br />
                {tc('since1958')}
              </address>
              <ul role="list" className="mb-4 flex flex-col gap-1.5">
                <li>
                  <a
                    href="tel:+493026050"
                    className="flex items-center gap-1.5 font-ui text-ui-xs text-hbb-footer-muted hover:text-hbb-footer-primary"
                  >
                    <Phone aria-hidden="true" size={11} className="flex-shrink-0 text-hbb-footer-amber" />
                    +49 (0)30 2605 0
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@hotel-berlin.de"
                    className="flex items-center gap-1.5 font-ui text-ui-xs text-hbb-footer-muted hover:text-hbb-footer-primary"
                  >
                    <Mail aria-hidden="true" size={11} className="flex-shrink-0 text-hbb-footer-amber" />
                    info@hotel-berlin.de
                  </a>
                </li>
                <li className="flex items-center gap-1.5 font-ui text-ui-xs text-hbb-footer-muted">
                  <Train aria-hidden="true" size={11} className="flex-shrink-0 text-hbb-footer-amber" />
                  {t('transit')}
                </li>
              </ul>
              <ul role="list" className="flex gap-1.5" aria-label={tc('socialLinksAria')}>
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} ${tc('opensInNewTab')}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-hbb-footer-muted hover:border-hbb-footer-amber/40 hover:text-hbb-footer-amber"
                    >
                      <social.icon aria-hidden="true" size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <FooterNavColumn
              title={t('stayTitle')}
              iconName="bed-double"
              ariaLabel={t('stayNavAria')}
              links={stayLinks}
            />
            <FooterNavColumn
              title={t('eatMeetTitle')}
              iconName="utensils"
              ariaLabel={t('eatMeetNavAria')}
              links={eatMeetLinks}
            />
            <FooterNavColumn
              title={t('helpTitle')}
              iconName="help-circle"
              ariaLabel={t('helpNavAria')}
              links={helpLinks}
            />
          </div>

          <div className="hidden bg-white/10 lg:block" aria-hidden="true" />

          <div className="border-t border-white/10 pt-8 lg:border-t-0 lg:pl-10 lg:pt-0">
            <Link
              href="/here"
              className="mb-3 inline-flex items-center gap-1.5 rounded-pill border border-hbb-footer-teal/30 bg-hbb-footer-teal/8 px-2 py-1 font-ui text-label uppercase tracking-ui-label text-hbb-footer-teal"
              aria-label={t('alreadyHereAria')}
            >
              <DoorOpen aria-hidden="true" size={11} />
              {t('alreadyHere')}
            </Link>
            <p className="mb-3 font-ui text-ui-xs leading-relaxed text-hbb-footer-muted">
              {t('alreadyHereDesc')}
            </p>
            <ul role="list" aria-label={tc('guestHubLinksAria')} className="flex flex-col">
              {insideLinks.map((link) => (
                <li key={link.label} className="border-t border-white/8 last:border-b">
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-1.5 font-ui text-ui-xs text-hbb-footer-muted hover:text-hbb-footer-teal"
                  >
                    {link.label}
                    <ArrowRight aria-hidden="true" size={10} className="text-white/20" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 bg-hbb-footer px-section-sm py-4 md:px-section-x">
        <p className="sr-only">{tc('awardsAria')}</p>
        <ul role="list" className="flex flex-wrap items-center gap-4">
          <li className="font-ui text-label uppercase tracking-ui-label text-hbb-footer-muted">
            {t('recognition')}
          </li>
          {awards.map((award) => (
            <li
              key={award}
              className="flex items-center gap-1.5 font-ui text-[10.5px] text-hbb-footer-muted"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-hbb-footer-amber/30"
              />
              {award}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/6 bg-hbb-footer px-section-sm py-3 md:px-section-x">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-ui text-[9px] uppercase tracking-ui-label text-hbb-footer-muted">
            {t('partOf')}
          </span>
          <a
            href="https://radissonhotels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            {t('radissonIndividuals')}
            <span className="sr-only"> {tc('opensInNewTab')}</span>
          </a>
          <a
            href="https://radissonhotels.com/rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            {t('radissonRewards')}
            <span className="sr-only"> {tc('opensInNewTab')}</span>
          </a>
          <a
            href="https://pandox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            {t('pandox')}
            <span className="sr-only"> {tc('opensInNewTab')}</span>
          </a>
        </div>
        <nav aria-label={tc('legalNavAria')}>
          <ul role="list" className="flex flex-wrap items-center gap-2">
            {legalLinks.map((link, i) => (
              <li key={link.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-[10px] text-white/20">·</span>}
                <a
                  href={link.href}
                  className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-ui text-[10.5px] text-hbb-footer-muted">{t('copyright')}</span>
          <a
            href="https://smoothism.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            {t('designBy')}
            <span className="sr-only"> {tc('opensInNewTab')}</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
