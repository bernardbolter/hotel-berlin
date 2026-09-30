export type SpotlightFraming = 'prospect' | 'guest'

export type SpotlightCardProps = {
  /** Null → category-coloured flat ground with the badge label (F5). */
  image: { src: string; alt: string } | null
  badge: { label: string; categoryToken: string }
  identityMark?: { src: string; alt: string }
  /** Event / exhibition title (primary) */
  title: string
  /** Hosting venue name shown under the title when present */
  venueLabel?: string
  /** Static per-venue location, appended to the identity row (`venue · location`) */
  locationLabel?: string
  primaryMeta: string
  description: string
  secondaryMeta?: { left: string; right: string }
  cta: { label: string; href: string; categoryToken: string; external?: boolean }
  /**
   * Which strings fill the slots. The card does not read this — resolvers do.
   */
  framing?: SpotlightFraming
}
