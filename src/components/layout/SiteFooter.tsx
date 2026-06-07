import {
  ArrowRight,
  DoorOpen,
  Globe,
  Mail,
  Share2,
  Phone,
  Train,
} from 'lucide-react'

import { FooterNavColumn } from '@/components/layout/FooterNavColumn'

import { Link } from '@/i18n/routing'

const awards = [
  'BREEAM Certified',
  'The Green Key',
  'Cvent Top 25 Europe Independent Hotels',
  'Sustainable Meetings Berlin Leader',
  'Sustainable Berlin Leader',
]

const legalLinks = [
  { label: 'Imprint', href: '/imprint' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
]

export function SiteFooter() {
  const stayLinks = [
    { label: 'Rooms & Suites', href: '/rooms' },
    { label: 'Offers', href: '/offers' },
    { label: 'Book direct', href: '/book' },
    { label: 'Radisson Rewards', href: 'https://radissonhotels.com/rewards', muted: true },
  ]

  const eatMeetLinks = [
    { label: 'Lütze', href: 'https://luetze-berlin.de' },
    { label: 'Meetings & Events', href: '/meetings' },
    { label: 'Weddings', href: '/meetings' },
    { label: 'Table tennis — KTTK', href: '/here/explore' },
  ]

  const helpLinks = [
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact', href: 'mailto:info@hotel-berlin.de' },
    { label: 'Getting here', href: '/neighbourhood' },
    { label: 'Careers', href: 'https://careers.radissonhotels.com', muted: true },
  ]

  const insideLinks = [
    { label: "What's on today", href: '/here/events' },
    { label: 'Dining & drinks', href: '/here/dining' },
    { label: 'Neighbourhood picks', href: '/here/explore' },
    { label: 'Guest FAQs', href: '/here/faq' },
  ] as const

  const socials = [
    { label: 'Instagram', href: 'https://instagram.com/hotelberlinberlin', icon: Share2 },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/hotel-berlin-berlin', icon: Globe },
  ]

  return (
    <footer aria-label="Site footer">
      <div className="flex flex-col items-start justify-between gap-4 bg-hbb-amber px-section-sm py-3 md:flex-row md:items-center md:px-section-x">
        <p className="font-ui text-ui-sm font-medium text-hbb-dark">
          Best rate guaranteed when you book direct
        </p>
        <a href="/book" className="btn-dark flex items-center gap-1.5 text-ui-sm">
          Check availability
          <ArrowRight aria-hidden="true" size={13} />
        </a>
      </div>

      <div className="bg-hbb-footer px-section-sm py-10 md:px-section-x">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_0.5px_0.9fr] lg:gap-0">
          <div className="grid grid-cols-1 gap-6 pr-0 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-6 lg:pr-10">
            <div>
              <p className="mb-1 font-ui text-ui-sm font-medium text-hbb-footer-primary">
                Hotel Berlin, Berlin
              </p>
              <address className="mb-4 font-ui text-ui-xs not-italic leading-relaxed text-hbb-footer-muted">
                Lützowplatz 17
                <br />
                10785 Berlin, Germany
                <br />
                Since 1958
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
                  Bus 100, 106, 187 · U Nollendorfplatz 7 min · S+U Zoo 10 min
                </li>
              </ul>
              <ul role="list" className="flex gap-1.5" aria-label="Social media links">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} (opens in new tab)`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-hbb-footer-muted hover:border-hbb-footer-amber/40 hover:text-hbb-footer-amber"
                    >
                      <social.icon aria-hidden="true" size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <FooterNavColumn
              title="Stay"
              iconName="bed-double"
              ariaLabel="Stay navigation"
              links={stayLinks}
            />
            <FooterNavColumn
              title="Eat & Meet"
              iconName="utensils"
              ariaLabel="Eat and meet navigation"
              links={eatMeetLinks}
            />
            <FooterNavColumn
              title="Help"
              iconName="help-circle"
              ariaLabel="Help navigation"
              links={helpLinks}
            />
          </div>

          <div className="hidden bg-white/10 lg:block" aria-hidden="true" />

          <div className="border-t border-white/10 pt-8 lg:border-t-0 lg:pl-10 lg:pt-0">
            <Link
              href="/here"
              className="mb-3 inline-flex items-center gap-1.5 rounded-pill border border-hbb-footer-teal/30 bg-hbb-footer-teal/8 px-2 py-1 font-ui text-label uppercase tracking-ui-label text-hbb-footer-teal"
              aria-label="Already here? Enter guest hub"
            >
              <DoorOpen aria-hidden="true" size={11} />
              Already here?
            </Link>
            <p className="mb-3 font-ui text-ui-xs leading-relaxed text-hbb-footer-muted">
              Your guest hub — events, dining, neighbourhood picks, and everything you need during
              your stay.
            </p>
            <ul role="list" aria-label="Guest hub links" className="flex flex-col">
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
        <p className="sr-only">Awards and recognition</p>
        <ul role="list" className="flex flex-wrap items-center gap-4">
          <li className="font-ui text-label uppercase tracking-ui-label text-white/30">
            Recognition
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
          <span className="font-ui text-[9px] uppercase tracking-ui-label text-white/30">
            Part of
          </span>
          <a
            href="https://radissonhotels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            Radisson Individuals
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="https://radissonhotels.com/rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            Radisson Rewards
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="https://pandox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-hbb-footer-muted hover:text-hbb-footer-link"
          >
            Pandox
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
        <nav aria-label="Legal links">
          <ul role="list" className="flex flex-wrap items-center gap-2">
            {legalLinks.map((link, i) => (
              <li key={link.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-[10px] text-white/20">·</span>}
                <a
                  href={link.href}
                  className="font-ui text-[10.5px] text-white/30 hover:text-hbb-footer-muted"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-ui text-[10.5px] text-white/20">© 2026 Pandox Berlin GmbH</span>
          <a
            href="https://smoothism.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10.5px] text-white/20 hover:text-white/40"
          >
            design by: smoothism.com
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
