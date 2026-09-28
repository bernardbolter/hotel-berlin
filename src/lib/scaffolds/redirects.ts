/**
 * Live Galaxy URLs and footer aliases → new scaffold / policy routes.
 */
export function buildScaffoldRedirects(): {
  source: string
  destination: string
  permanent: boolean
}[] {
  return [
    { source: '/parking', destination: '/de/richtlinien/parken', permanent: true },
    { source: '/en/parking', destination: '/en/policies/fees', permanent: true },
    { source: '/de/parking', destination: '/de/richtlinien/parken', permanent: true },
    { source: '/parken', destination: '/de/richtlinien/parken', permanent: true },
    { source: '/de/offers', destination: '/de/angebote', permanent: true },

    { source: '/en/sleep-relax/amenities-services', destination: '/en/amenities', permanent: true },
    { source: '/en/sleep-relax/bedandbike', destination: '/en/amenities', permanent: true },
    { source: '/en/sleep-relax/sauna-fitness', destination: '/en/amenities', permanent: true },
    {
      source: '/ubernachten-relaxen/serviceleistungen',
      destination: '/de/ausstattung',
      permanent: true,
    },
    { source: '/ubernachten-relaxen/bettundbike', destination: '/de/ausstattung', permanent: true },
    { source: '/ubernachten-relaxen/sauna-fitness', destination: '/de/ausstattung', permanent: true },

    {
      source: '/en/sleep-relax/guest-service-directory',
      destination: '/en/here/faq',
      permanent: true,
    },
    {
      source: '/ubernachten-relaxen/gast-info-verzeichnis',
      destination: '/de/hier/faq',
      permanent: true,
    },

    { source: '/en/contact-location', destination: '/en/contact', permanent: true },
    { source: '/kontakt-anfahrt', destination: '/de/kontakt', permanent: true },

    { source: '/en/sustainability/sustainable-stay', destination: '/en/sustainability', permanent: true },
    { source: '/nachhaltigkeit', destination: '/de/nachhaltigkeit', permanent: true },
    {
      source: '/nachhaltigkeit/nachhaltiger-aufenthalt',
      destination: '/de/nachhaltigkeit',
      permanent: true,
    },

    { source: '/en/awards-recognition', destination: '/en/awards', permanent: true },
    { source: '/auszeichnungen-anerkennungen', destination: '/de/auszeichnungen', permanent: true },

    { source: '/en/meet-work/hybrid-events', destination: '/en/meetings/hybrid', permanent: true },
    {
      source: '/tagungen-arbeiten/hybride-veranstaltungen',
      destination: '/de/tagungen/hybrid',
      permanent: true,
    },

    { source: '/en/eat-drink', destination: '/en/restaurant', permanent: true },
    { source: '/en/eat-drink/breakfast', destination: '/en/restaurant', permanent: true },
    { source: '/en/eat-drink/garden', destination: '/en/restaurant', permanent: true },
    { source: '/en/eat-drink/luetze-bar-berlin', destination: '/en/restaurant', permanent: true },
    { source: '/en/eat-drink/wundermart-shop-kiosk', destination: '/en/here/dining', permanent: true },
    { source: '/essen-trinken', destination: '/de/restaurant', permanent: true },
    { source: '/essen-trinken/fruehstueck', destination: '/de/restaurant', permanent: true },
    { source: '/essen-trinken/sommergarten', destination: '/de/restaurant', permanent: true },
    { source: '/essen-trinken/luetze-bar-berlin', destination: '/de/restaurant', permanent: true },
    { source: '/essen-trinken/wundermart-shop-kiosk', destination: '/de/hier/dining', permanent: true },

    { source: '/en/gallery', destination: '/en/here/gallery', permanent: true },
    { source: '/bildergalerie', destination: '/de/hier/gallery', permanent: true },

    { source: '/en/insiders-and-icons', destination: '/en/you-me-and-berlin', permanent: true },
    { source: '/insider-und-ikonen', destination: '/de/you-me-and-berlin', permanent: true },
    { source: '/en/explore-connect', destination: '/en/happenings', permanent: true },
    { source: '/explore-connect', destination: '/de/happenings', permanent: true },

    { source: '/de/about', destination: '/de/ueber-uns', permanent: true },
    { source: '/de/people', destination: '/de/menschen', permanent: true },
    { source: '/de/accessibility', destination: '/de/barrierefreiheit', permanent: true },
    { source: '/de/sustainability', destination: '/de/nachhaltigkeit', permanent: true },
    { source: '/de/contact', destination: '/de/kontakt', permanent: true },
    { source: '/de/amenities', destination: '/de/ausstattung', permanent: true },
    { source: '/de/awards', destination: '/de/auszeichnungen', permanent: true },
    { source: '/de/meetings/hybrid', destination: '/de/tagungen/hybrid', permanent: true },
    {
      source: '/de/policies/cancellation',
      destination: '/de/richtlinien/stornierung',
      permanent: true,
    },
    { source: '/de/policies/check-in', destination: '/de/richtlinien/check-in', permanent: true },
    { source: '/de/policies/pets', destination: '/de/richtlinien/haustiere', permanent: true },
    { source: '/de/policies/fees', destination: '/de/richtlinien/parken', permanent: true },
    { source: '/de/policies/payment', destination: '/de/richtlinien/zahlung', permanent: true },
  ]
}
