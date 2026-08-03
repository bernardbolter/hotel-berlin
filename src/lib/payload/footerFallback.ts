import type {
  FooterAwardData,
  FooterBarLink,
  FooterColumnData,
  FooterLinkData,
  FooterViewModel,
} from './footerTypes'

type Locale = 'de' | 'en'

const ext = (href: string, label: string, opts?: Partial<FooterLinkData>): FooterLinkData => ({
  id: label,
  label,
  href,
  external: href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'),
  ...opts,
})

function columnsFor(locale: Locale): FooterColumnData[] {
  if (locale === 'de') {
    return [
      {
        id: 'stay',
        title: 'Übernachten',
        icon: 'BedDouble',
        links: [
          ext('/rooms', 'Zimmer & Suiten'),
          ext('/rooms', 'Superior'),
          ext('/rooms', 'Comfort'),
          ext('/rooms', 'Suiten'),
          ext('/rooms', 'Studio 45'),
          ext('/faqs', 'Check-in / Check-out', { dividerBefore: true }),
          ext('/faqs', 'Stornierungen'),
          ext('/faqs', 'Haustiere'),
        ],
      },
      {
        id: 'eat-meet',
        title: 'Essen & Treffen',
        icon: 'UtensilsCrossed',
        links: [
          ext('https://luetze-berlin.de', 'Lütze', { showArrow: true }),
          ext('/here/dining', 'Restaurant & Bar'),
          ext('/meetings', 'Meetings'),
          ext('/meetings', 'Tagungsräume'),
          ext('/here/art', 'On the Walls', { dividerBefore: true }),
          ext('https://fkkb.de', 'FKKB', { showArrow: true }),
          ext('/here/explore', 'KTTK', { showArrow: true }),
          ext('/neighbourhood', 'Nachbarschaft'),
        ],
      },
      {
        id: 'help',
        title: 'Hilfe',
        icon: 'CircleHelp',
        links: [
          ext('/faqs', 'FAQs'),
          ext('mailto:info@hotel-berlin.de', 'Kontakt'),
          ext('/faqs', 'Fundsachen'),
          ext('/accessibility', 'Barrierefreiheit'),
          ext('/about', 'Über uns'),
          ext('/sustainability', 'Nachhaltigkeit'),
          ext('https://careers.radissonhotels.com', 'Karriere'),
          ext('/parking', 'Parken'),
        ],
      },
    ]
  }

  return [
    {
      id: 'stay',
      title: 'Stay',
      icon: 'BedDouble',
      links: [
        ext('/rooms', 'Rooms & Suites'),
        ext('/rooms', 'Superior'),
        ext('/rooms', 'Comfort'),
        ext('/rooms', 'Suites'),
        ext('/rooms', 'Studio 45'),
        ext('/faqs', 'Check-in / Check-out', { dividerBefore: true }),
        ext('/faqs', 'Cancellations'),
        ext('/faqs', 'Pets'),
      ],
    },
    {
      id: 'eat-meet',
      title: 'Eat & Meet',
      icon: 'UtensilsCrossed',
      links: [
        ext('https://luetze-berlin.de', 'Lütze', { showArrow: true }),
        ext('/here/dining', 'Restaurant & Bar'),
        ext('/meetings', 'Meetings'),
        ext('/meetings', 'Meeting Rooms'),
        ext('/here/art', 'On the Walls', { dividerBefore: true }),
        ext('https://fkkb.de', 'FKKB', { showArrow: true }),
        ext('/here/explore', 'KTTK', { showArrow: true }),
        ext('/neighbourhood', 'Neighbourhood'),
      ],
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'CircleHelp',
      links: [
        ext('/faqs', 'FAQs'),
        ext('mailto:info@hotel-berlin.de', 'Contact'),
        ext('/faqs', 'Lost & Found'),
        ext('/accessibility', 'Accessibility'),
        ext('/about', 'About'),
        ext('/sustainability', 'Sustainability'),
        ext('https://careers.radissonhotels.com', 'Careers'),
        ext('/parking', 'Parking'),
      ],
    },
  ]
}

function alreadyHereFor(locale: Locale) {
  if (locale === 'de') {
    return {
    title: 'Schon hier?',
    icon: 'MapPin',
    description:
      'Dein Gäste-Hub — Events, Restaurants, Nachbarschaftstipps und alles für deinen Aufenthalt.',
    links: [
      ext('/here', 'Happenings Hub'),
      ext('/here/events', 'Was läuft'),
      ext('/here/art', 'Kunstprogramm'),
      ext('/here/dining', 'Alle Restaurants'),
      ext('/here/dining', 'Frühstück'),
      ext('/here/explore', 'Wundermart'),
      ext('/neighbourhood', 'Nachbarschaft entdecken'),
      ext('/here/faq', 'Gäste-FAQs'),
    ],
  }
  }

  return {
    title: 'Already here?',
    icon: 'MapPin',
    description:
      'Your guest hub — events, dining, neighbourhood picks, and everything you need during your stay.',
    links: [
      ext('/here', 'Happenings hub'),
      ext('/here/events', "What's on"),
      ext('/here/art', 'Art programme'),
      ext('/here/dining', 'All dining'),
      ext('/here/dining', 'Breakfast'),
      ext('/here/explore', 'Wundermart'),
      ext('/neighbourhood', 'Explore neighbourhood'),
      ext('/here/faq', 'Guest FAQs'),
    ],
  }
}

const fallbackAwards: FooterAwardData[] = [
  {
    id: 'breeam',
    altText: 'BREEAM',
    imageUrl: '/images/awards/breeam.png',
    linkUrl: 'https://breeam.com',
  },
  {
    id: 'green-key',
    altText: 'The Green Key',
    imageUrl: '/images/awards/green-key.png',
    linkUrl: 'https://www.greenkey.global',
  },
  {
    id: 'top-25',
    altText: 'Cvent Top 25 Europe Meeting Hotels 2018',
    imageUrl: '/images/awards/cvent-top-25-2018.png',
    linkUrl: 'https://www.cvent.com',
  },
  {
    id: 'sustainable-berlin',
    altText: 'Sustainable Berlin — Leader',
    imageUrl: '/images/awards/sustainable-berlin.png',
    linkUrl: 'https://about.visitberlin.de/en/sustainable-berlin',
  },
  {
    id: 'sustainable-meetings',
    altText: 'Sustainable Meetings Berlin — Leader',
    imageUrl: '/images/awards/sustainable-meetings-berlin.png',
    linkUrl: 'https://convention.visitberlin.de/en/meeting-destination/sustainable-meetings-berlin',
  },
]

function partnerLinksFor(_locale: Locale): FooterBarLink[] {
  return [
    { id: 'ri', label: 'Radisson Individuals', href: 'https://radissonhotels.com', external: true },
    { id: 'radisson', label: 'Radisson', href: 'https://radissonhotels.com', external: true },
    { id: 'rewards', label: 'Rewards', href: 'https://radissonhotels.com/rewards', external: true },
    { id: 'pandox', label: 'Pandox', href: 'https://pandox.com', external: true },
  ]
}

function legalLinksFor(locale: Locale): FooterBarLink[] {
  if (locale === 'de') {
    return [
      { id: 'imprint', label: 'Impressum', href: '/imprint' },
      { id: 'privacy', label: 'Datenschutz', href: '/privacy' },
      { id: 'terms', label: 'AGB', href: '/terms' },
      { id: 'cookies', label: 'Cookies', href: '/cookies' },
      { id: 'accessibility', label: 'Barrierefreiheit', href: '/accessibility' },
    ]
  }

  return [
    { id: 'imprint', label: 'Imprint', href: '/imprint' },
    { id: 'privacy', label: 'Privacy', href: '/privacy' },
    { id: 'terms', label: 'Terms', href: '/terms' },
    { id: 'cookies', label: 'Cookies', href: '/cookies' },
    { id: 'accessibility', label: 'Accessibility', href: '/accessibility' },
  ]
}

/** Hardcoded footer content used when the Payload global is empty or unavailable. */
export function getFooterFallback(locale: Locale): FooterViewModel {
  const isDe = locale === 'de'

  return {
    bookDirectStrip: {
      visible: true,
      message: isDe
        ? 'Bester Preis bei Direktbuchung garantiert'
        : 'Best rate guaranteed when you book direct',
      ctaLabel: isDe ? 'Verfügbarkeit prüfen' : 'Check availability',
      ctaUrl: '/book',
    },
    contact: {
      hotelName: 'Hotel Berlin, Berlin',
      sinceYear: '1958',
      postalAddress: {
        streetAddress: 'Lützowplatz 17',
        postalCode: '10785',
        addressLocality: 'Berlin',
        addressCountry: isDe ? 'Deutschland' : 'Germany',
      },
      addressLines: ['Lützowplatz 17, 10785', 'Berlin Germany'],
      phone: '+49 30 26050',
      email: 'info@hotel-berlin.de',
      transitJoined: isDe
        ? 'Bus 100, 106, 187 · U Nollendorfplatz 7 Min. · S+U Zoo 10 Min.'
        : 'Bus 100, 106, 187 · U Nollendorfplatz 7 min · S+U Zoo 10 min',
    },
    columns: columnsFor(locale),
    alreadyHere: alreadyHereFor(locale),
    awardsHeading: isDe ? 'Auszeichnungen & Anerkennung' : 'Awards & Recognition',
    awards: fallbackAwards,
    partnerLinks: partnerLinksFor(locale),
    legalLinks: legalLinksFor(locale),
    copyrightEntity: 'Pandox Berlin GmbH',
  }
}
