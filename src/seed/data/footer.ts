function link(
  label: string,
  url: string,
  opts?: { showArrow?: boolean; dividerBefore?: boolean },
) {
  return {
    label,
    linkType: 'external' as const,
    externalUrl: url,
    showArrow: opts?.showArrow ?? false,
    dividerBefore: opts?.dividerBefore ?? false,
  }
}

/** Award logo definitions — image IDs are filled in by the seed script after upload. */
export const footerAwardDefs = [
  {
    filename: 'breeam.png',
    altEn: 'BREEAM',
    altDe: 'BREEAM',
    linkUrl: 'https://breeam.com',
    visible: true,
  },
  {
    filename: 'green-key.png',
    altEn: 'The Green Key',
    altDe: 'The Green Key',
    linkUrl: 'https://www.greenkey.global',
    visible: true,
  },
  {
    filename: 'cvent-top-25-2018.png',
    altEn: 'Cvent Top 25 Europe Meeting Hotels 2018',
    altDe: 'Cvent Top 25 Europe Meeting Hotels 2018',
    linkUrl: 'https://www.cvent.com',
    visible: true,
  },
  {
    filename: 'sustainable-berlin.png',
    altEn: 'Sustainable Berlin — Leader',
    altDe: 'Sustainable Berlin — Leader',
    linkUrl: 'https://about.visitberlin.de/en/sustainable-berlin',
    visible: true,
  },
  {
    filename: 'sustainable-meetings-berlin.png',
    altEn: 'Sustainable Meetings Berlin — Leader',
    altDe: 'Sustainable Meetings Berlin — Leader',
    linkUrl: 'https://convention.visitberlin.de/en/meeting-destination/sustainable-meetings-berlin',
    visible: true,
  },
] as const

/** English locale payload for the Footer global (mockup structure; KTTK not TKKT). */
export const footerSeedEn = {
  bookDirectStrip: {
    visible: true,
    message: 'Best rate guaranteed when you book direct',
    ctaLabel: 'Check availability',
    ctaUrl: '/book',
  },
  contact: {
    sinceYear: '1958',
    addressLines: [
      { line: 'Lützowplatz 17, 10785' },
      { line: 'Berlin Germany' },
    ],
    phone: '+49 30 26050',
    email: 'info@hotel-berlin.de',
    transitLines: [
      { line: 'Bus 100, 106, 187' },
      { line: 'U Nollendorfplatz 7 min' },
      { line: 'S+U Zoo 10 min' },
    ],
  },
  columns: [
    {
      icon: 'BedDouble',
      title: 'Stay',
      links: [
        link('Rooms & Suites', '/rooms'),
        link('Superior', '/rooms'),
        link('Comfort', '/rooms'),
        link('Suites', '/rooms'),
        link('Studio 45', '/rooms'),
        link('Check-in / Check-out', '/faqs', { dividerBefore: true }),
        link('Cancellations', '/faqs'),
        link('Pets', '/faqs'),
      ],
    },
    {
      icon: 'UtensilsCrossed',
      title: 'Eat & Meet',
      links: [
        link('Lütze', 'https://luetze-berlin.de', { showArrow: true }),
        link('Restaurant & Bar', '/here/dining'),
        link('Meetings', '/meetings'),
        link('Meeting Rooms', '/meetings'),
        link('On the Walls', '/here/art', { dividerBefore: true }),
        link('FKKB', 'https://fkkb.de', { showArrow: true }),
        link('KTTK', '/here/explore', { showArrow: true }),
        link('Neighbourhood', '/neighbourhood'),
      ],
    },
    {
      icon: 'CircleHelp',
      title: 'Help',
      links: [
        link('FAQs', '/faqs'),
        link('Contact', 'mailto:info@hotel-berlin.de'),
        link('Lost & Found', '/faqs'),
        link('Accessibility', '/accessibility'),
        link('About', '/about'),
        link('Sustainability', '/sustainability'),
        link('Careers', 'https://careers.radissonhotels.com'),
        link('Parking', '/parking'),
      ],
    },
  ],
  alreadyHereColumn: {
    title: 'Already here?',
    icon: 'MapPin',
    description:
      'Your guest hub — events, dining, neighbourhood picks, and everything you need during your stay.',
    links: [
      link('Happenings hub', '/here'),
      link("What's on", '/here/events'),
      link('Art programme', '/here/art'),
      link('All dining', '/here/dining'),
      link('Breakfast', '/here/dining'),
      link('Wundermart', '/here/explore'),
      link('Explore neighbourhood', '/neighbourhood'),
      link('Guest FAQs', '/here/faq'),
    ],
  },
  awards: [] as Array<{
    visible: boolean
    image: number
    altText: string
    linkUrl: string
  }>,
  awardsHeading: 'Awards & Recognition',
  partnerLinks: [
    {
      visible: true,
      label: 'Radisson Individuals',
      url: 'https://radissonhotels.com',
    },
    { visible: true, label: 'Radisson', url: 'https://radissonhotels.com' },
    { visible: true, label: 'Rewards', url: 'https://radissonhotels.com/rewards' },
    { visible: true, label: 'Pandox', url: 'https://pandox.com' },
  ],
  legalLinks: [
    { visible: true, label: 'Imprint', url: '/imprint' },
    { visible: true, label: 'Privacy', url: '/privacy' },
    { visible: true, label: 'Terms', url: '/terms' },
    { visible: true, label: 'Cookies', url: '/cookies' },
    { visible: true, label: 'Accessibility', url: '/accessibility' },
  ],
  copyrightEntity: 'Pandox Berlin GmbH',
}

/** German localized fields for the Footer global. */
export const footerSeedDe = {
  bookDirectStrip: {
    visible: true,
    message: 'Bester Preis bei Direktbuchung garantiert',
    ctaLabel: 'Verfügbarkeit prüfen',
    ctaUrl: '/book',
  },
  contact: {
    sinceYear: '1958',
    addressLines: [
      { line: 'Lützowplatz 17, 10785' },
      { line: 'Berlin Germany' },
    ],
    phone: '+49 30 26050',
    email: 'info@hotel-berlin.de',
    transitLines: [
      { line: 'Bus 100, 106, 187' },
      { line: 'U Nollendorfplatz 7 Min.' },
      { line: 'S+U Zoo 10 Min.' },
    ],
  },
  columns: [
    {
      icon: 'BedDouble',
      title: 'Übernachten',
      links: [
        link('Zimmer & Suiten', '/rooms'),
        link('Superior', '/rooms'),
        link('Comfort', '/rooms'),
        link('Suiten', '/rooms'),
        link('Studio 45', '/rooms'),
        link('Check-in / Check-out', '/faqs', { dividerBefore: true }),
        link('Stornierungen', '/faqs'),
        link('Haustiere', '/faqs'),
      ],
    },
    {
      icon: 'UtensilsCrossed',
      title: 'Essen & Treffen',
      links: [
        link('Lütze', 'https://luetze-berlin.de', { showArrow: true }),
        link('Restaurant & Bar', '/here/dining'),
        link('Meetings', '/meetings'),
        link('Tagungsräume', '/meetings'),
        link('On the Walls', '/here/art', { dividerBefore: true }),
        link('FKKB', 'https://fkkb.de', { showArrow: true }),
        link('KTTK', '/here/explore', { showArrow: true }),
        link('Nachbarschaft', '/neighbourhood'),
      ],
    },
    {
      icon: 'CircleHelp',
      title: 'Hilfe',
      links: [
        link('FAQs', '/faqs'),
        link('Kontakt', 'mailto:info@hotel-berlin.de'),
        link('Fundsachen', '/faqs'),
        link('Barrierefreiheit', '/accessibility'),
        link('Über uns', '/about'),
        link('Nachhaltigkeit', '/sustainability'),
        link('Karriere', 'https://careers.radissonhotels.com'),
        link('Parken', '/parking'),
      ],
    },
  ],
  alreadyHereColumn: {
    title: 'Schon hier?',
    icon: 'MapPin',
    description:
      'Dein Gäste-Hub — Events, Restaurants, Nachbarschaftstipps und alles für deinen Aufenthalt.',
    links: [
      link('Happenings Hub', '/here'),
      link('Was läuft', '/here/events'),
      link('Kunstprogramm', '/here/art'),
      link('Alle Restaurants', '/here/dining'),
      link('Frühstück', '/here/dining'),
      link('Wundermart', '/here/explore'),
      link('Nachbarschaft entdecken', '/neighbourhood'),
      link('Gäste-FAQs', '/here/faq'),
    ],
  },
  awards: [] as Array<{
    visible: boolean
    image: number
    altText: string
    linkUrl: string
  }>,
  awardsHeading: 'Auszeichnungen & Anerkennung',
  partnerLinks: [
    {
      visible: true,
      label: 'Radisson Individuals',
      url: 'https://radissonhotels.com',
    },
    { visible: true, label: 'Radisson', url: 'https://radissonhotels.com' },
    { visible: true, label: 'Rewards', url: 'https://radissonhotels.com/rewards' },
    { visible: true, label: 'Pandox', url: 'https://pandox.com' },
  ],
  legalLinks: [
    { visible: true, label: 'Impressum', url: '/imprint' },
    { visible: true, label: 'Datenschutz', url: '/privacy' },
    { visible: true, label: 'AGB', url: '/terms' },
    { visible: true, label: 'Cookies', url: '/cookies' },
    { visible: true, label: 'Barrierefreiheit', url: '/accessibility' },
  ],
  copyrightEntity: 'Pandox Berlin GmbH',
}
