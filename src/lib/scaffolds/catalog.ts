import type { AppPathnames } from '@/i18n/pathnames'

/** Pathnames without `[slug]` params — valid as bare `Link` / `getPathname` hrefs. */
type StaticAppPathnames = {
  [K in AppPathnames]: K extends `${string}[${string}` ? never : K
}[AppPathnames]

export const SCAFFOLD_IDS = [
  'about',
  'people',
  'on-the-walls',
  'accessibility',
  'sustainability',
  'contact',
  'amenities',
  'awards',
  'offers',
  'meetings-hybrid',
  'policies-cancellation',
  'policies-check-in',
  'policies-pets',
  'policies-fees',
  'policies-payment',
] as const

export type ScaffoldId = (typeof SCAFFOLD_IDS)[number]

export type ScaffoldExistingLabel =
  | 'rooms'
  | 'meetings'
  | 'meetingsRequest'
  | 'restaurant'
  | 'faq'
  | 'hereFaq'
  | 'hereArt'
  | 'hereWallride'
  | 'hereDining'
  | 'ymb'
  | 'terms'

export type ScaffoldRelated =
  | { type: 'scaffold'; id: ScaffoldId }
  | { type: 'route'; href: StaticAppPathnames; label: ScaffoldExistingLabel }

export const SCAFFOLD_PATHNAME: Record<ScaffoldId, StaticAppPathnames> = {
  about: '/about',
  people: '/people',
  'on-the-walls': '/on-the-walls',
  accessibility: '/accessibility',
  sustainability: '/sustainability',
  contact: '/contact',
  amenities: '/amenities',
  awards: '/awards',
  offers: '/offers',
  'meetings-hybrid': '/meetings/hybrid',
  'policies-cancellation': '/policies/cancellation',
  'policies-check-in': '/policies/check-in',
  'policies-pets': '/policies/pets',
  'policies-fees': '/policies/fees',
  'policies-payment': '/policies/payment',
}

export const SCAFFOLD_RELATED: Record<ScaffoldId, ScaffoldRelated[]> = {
  about: [
    { type: 'scaffold', id: 'contact' },
    { type: 'scaffold', id: 'sustainability' },
    { type: 'scaffold', id: 'awards' },
    { type: 'route', href: '/rooms', label: 'rooms' },
    { type: 'route', href: '/meetings', label: 'meetings' },
  ],
  people: [
    { type: 'scaffold', id: 'on-the-walls' },
    { type: 'route', href: '/you-me-berlin', label: 'ymb' },
  ],
  'on-the-walls': [
    { type: 'scaffold', id: 'people' },
    { type: 'route', href: '/here/art', label: 'hereArt' },
    { type: 'route', href: '/here/wallride', label: 'hereWallride' },
  ],
  accessibility: [
    { type: 'scaffold', id: 'contact' },
    { type: 'scaffold', id: 'amenities' },
    { type: 'scaffold', id: 'policies-check-in' },
    { type: 'route', href: '/faq', label: 'faq' },
  ],
  sustainability: [
    { type: 'scaffold', id: 'about' },
    { type: 'scaffold', id: 'awards' },
    { type: 'scaffold', id: 'meetings-hybrid' },
    { type: 'route', href: '/meetings', label: 'meetings' },
  ],
  contact: [
    { type: 'scaffold', id: 'about' },
    { type: 'scaffold', id: 'accessibility' },
    { type: 'route', href: '/faq', label: 'faq' },
    { type: 'route', href: '/meetings/request', label: 'meetingsRequest' },
  ],
  amenities: [
    { type: 'scaffold', id: 'accessibility' },
    { type: 'scaffold', id: 'policies-fees' },
    { type: 'scaffold', id: 'contact' },
    { type: 'route', href: '/rooms', label: 'rooms' },
    { type: 'route', href: '/here/faq', label: 'hereFaq' },
  ],
  awards: [
    { type: 'scaffold', id: 'about' },
    { type: 'scaffold', id: 'sustainability' },
    { type: 'route', href: '/meetings', label: 'meetings' },
  ],
  offers: [
    { type: 'scaffold', id: 'amenities' },
    { type: 'route', href: '/rooms', label: 'rooms' },
    { type: 'route', href: '/meetings', label: 'meetings' },
    { type: 'route', href: '/restaurant', label: 'restaurant' },
  ],
  'meetings-hybrid': [
    { type: 'scaffold', id: 'sustainability' },
    { type: 'scaffold', id: 'contact' },
    { type: 'route', href: '/meetings', label: 'meetings' },
    { type: 'route', href: '/meetings/request', label: 'meetingsRequest' },
  ],
  'policies-cancellation': [
    { type: 'scaffold', id: 'policies-check-in' },
    { type: 'scaffold', id: 'policies-payment' },
    { type: 'route', href: '/faq', label: 'faq' },
    { type: 'route', href: '/terms', label: 'terms' },
  ],
  'policies-check-in': [
    { type: 'scaffold', id: 'policies-cancellation' },
    { type: 'scaffold', id: 'policies-pets' },
    { type: 'route', href: '/faq', label: 'faq' },
    { type: 'route', href: '/here/faq', label: 'hereFaq' },
  ],
  'policies-pets': [
    { type: 'scaffold', id: 'policies-check-in' },
    { type: 'scaffold', id: 'amenities' },
    { type: 'route', href: '/faq', label: 'faq' },
  ],
  'policies-fees': [
    { type: 'scaffold', id: 'amenities' },
    { type: 'scaffold', id: 'policies-payment' },
    { type: 'route', href: '/faq', label: 'faq' },
  ],
  'policies-payment': [
    { type: 'scaffold', id: 'policies-fees' },
    { type: 'scaffold', id: 'policies-cancellation' },
    { type: 'route', href: '/faq', label: 'faq' },
    { type: 'route', href: '/terms', label: 'terms' },
  ],
}
