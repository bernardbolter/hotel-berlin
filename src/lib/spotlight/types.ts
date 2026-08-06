export type SpotlightCardProps = {
  image: { src: string; alt: string }
  badge: { label: string; categoryToken: string }
  identityMark?: { src: string; alt: string }
  /** Event / exhibition title (primary) */
  title: string
  /** Hosting venue name shown under the title when present */
  venueLabel?: string
  primaryMeta: string
  description: string
  secondaryMeta?: { left: string; right: string }
  cta: { label: string; href: string; categoryToken: string; external?: boolean }
}
