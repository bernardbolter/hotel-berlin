/**
 * Homepage happenings teaser — maps onto VenueCompactCard.
 * Static scaffold until Payload Events are wired for this row.
 */

export type EventTeaserId = 'fkkb' | 'kttk' | 'sissi' | 'haus-luetzowplatz'

export type EventTeaser = {
  id: EventTeaserId
  href: string
  external?: boolean
  badgeVariant: 'schedule' | 'liveStatus' | 'static'
  categoryToken: 'amber' | 'gold' | 'neutral' | 'art' | 'sport' | 'neighbourhood'
}

export const eventsTeaser: EventTeaser[] = [
  {
    id: 'fkkb',
    href: '/here/gallery',
    badgeVariant: 'static',
    categoryToken: 'art',
  },
  {
    id: 'kttk',
    href: '/here/explore',
    badgeVariant: 'schedule',
    categoryToken: 'amber',
  },
  {
    id: 'sissi',
    href: '/happenings',
    badgeVariant: 'static',
    categoryToken: 'sport',
  },
  {
    id: 'haus-luetzowplatz',
    href: 'https://haus-am-luetzowplatz.de',
    external: true,
    badgeVariant: 'static',
    categoryToken: 'neighbourhood',
  },
]
