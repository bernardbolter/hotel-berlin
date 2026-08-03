/**
 * Homepage / happenings teaser events — static scaffold until Payload Events are wired.
 * Images reused from the former culture cards for visual placeholders.
 */

export type EventTeaserId = 'fkkb' | 'kttk' | 'sissi' | 'haus-luetzowplatz'

export type EventTeaser = {
  id: EventTeaserId
  /** next-intl pathname key or external URL */
  href: string
  external?: boolean
  imageSrc: string
}

export const eventsTeaser: EventTeaser[] = [
  {
    id: 'fkkb',
    href: '/here/gallery',
    imageSrc: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
  },
  {
    id: 'kttk',
    href: '/here/explore',
    imageSrc: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  },
  {
    id: 'sissi',
    href: '/happenings',
    imageSrc: 'https://images.unsplash.com/photo-1547448415-e9f5b28e57d0?w=800&q=80',
  },
  {
    id: 'haus-luetzowplatz',
    href: 'https://haus-am-luetzowplatz.de',
    external: true,
    imageSrc: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  },
]
