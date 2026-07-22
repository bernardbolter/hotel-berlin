export type SecondaryNavLink = {
  id: string
  label: string
  href: string
  external?: boolean
  /** Placeholder / coming-soon (e.g. Wallride) — visible but not a live destination */
  comingSoon?: boolean
}
