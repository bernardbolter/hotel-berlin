/**
 * Live Galaxy URLs and early unlocalized new-site paths → localized legal pages.
 */
export function buildLegalRedirects(): {
  source: string
  destination: string
  permanent: boolean
}[] {
  return [
    { source: '/impressum', destination: '/de/impressum', permanent: true },
    { source: '/de/imprint', destination: '/de/impressum', permanent: true },
    { source: '/datenschutz', destination: '/de/datenschutz', permanent: true },
    { source: '/de/privacy', destination: '/de/datenschutz', permanent: true },
    { source: '/en/privacy-policy', destination: '/en/privacy', permanent: true },
    { source: '/privacy-policy', destination: '/de/datenschutz', permanent: true },
    { source: '/agb-nutzungsbedingungen', destination: '/de/agb', permanent: true },
    { source: '/de/terms', destination: '/de/agb', permanent: true },
    { source: '/en/terms-conditions', destination: '/en/terms', permanent: true },
    { source: '/terms-conditions', destination: '/de/agb', permanent: true },
    {
      source: '/copyright-haftungsausschluss',
      destination: '/de/haftungsausschluss',
      permanent: true,
    },
    { source: '/de/disclaimer', destination: '/de/haftungsausschluss', permanent: true },
  ]
}
