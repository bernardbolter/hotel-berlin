export type FooterLinkData = {
  id: string
  label: string
  href: string
  showArrow?: boolean
  dividerBefore?: boolean
  external?: boolean
}

export type FooterColumnData = {
  id: string
  title: string
  icon?: string | null
  links: FooterLinkData[]
}

export type FooterAwardData = {
  id: string
  altText: string
  imageUrl: string | null
  linkUrl?: string | null
}

/** Partner strip or bottom legal bar link. */
export type FooterBarLink = {
  id: string
  label: string
  href: string
  external?: boolean
}

/** @deprecated Use FooterBarLink */
export type FooterPartnerLink = FooterBarLink

/** Structured postal address — mirrors schema.org PostalAddress / Hotel global. */
export type FooterPostalAddress = {
  streetAddress: string
  postalCode: string
  addressLocality: string
  addressCountry: string
}

export type FooterViewModel = {
  bookDirectStrip: {
    visible: boolean
    message: string
    ctaLabel: string
    ctaUrl: string
  }
  contact: {
    hotelName: string
    sinceYear: string
    /** Preferred structured address for a11y + AEO alignment with JSON-LD */
    postalAddress: FooterPostalAddress
    /** Legacy freeform lines — used only if postalAddress is incomplete */
    addressLines: string[]
    phone: string
    email: string
    transitJoined: string
  }
  columns: FooterColumnData[]
  alreadyHere: {
    title: string
    icon?: string | null
    description: string
    links: FooterLinkData[]
  }
  awardsHeading: string
  awards: FooterAwardData[]
  partnerLinks: FooterBarLink[]
  legalLinks: FooterBarLink[]
  copyrightEntity: string
}
