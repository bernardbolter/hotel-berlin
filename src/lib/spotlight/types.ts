export type SpotlightCardProps = {
  image: { src: string; alt: string }
  badge: { label: string; categoryToken: string }
  identityMark?: { src: string; alt: string }
  title: string
  primaryMeta: string
  description: string
  secondaryMeta?: { left: string; right: string }
  cta: { label: string; href: string; categoryToken: string; external?: boolean }
}
