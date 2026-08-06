import type { SpotlightCardProps } from '@/lib/spotlight/types'

/**
 * Homepage Happenings spotlight teasers — static fallback when Payload is empty.
 * Placeholder copy for layout review; swap for CMS content anytime.
 */
export const spotlightTeasers: SpotlightCardProps[] = [
  {
    image: {
      src: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=900&q=80',
      alt: 'Contemporary gallery interior with white walls and artwork',
    },
    badge: { label: 'Art', categoryToken: 'art' },
    title: 'FKKB',
    primaryMeta: 'On now · Free entry',
    description:
      'Independent art in the hotel — residencies, murals on every floor, and shows that rotate through the seasons. Drop in for the current duo exhibition, or follow the trail of works upstairs.',
    cta: {
      label: 'Explore FKKB',
      href: '/here/gallery',
      categoryToken: 'art',
    },
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80',
      alt: 'Table tennis tables in a basement sports space',
    },
    badge: { label: 'Sport', categoryToken: 'sport' },
    title: 'Thursday Tournament',
    primaryMeta: 'Thu · 19:00',
    description:
      'Four JOOLA tables in the basement, open to guests and Berliners. Sign up at the door, no dress code, bats provided. €5 gets you into the knockout rounds and a night of loud rallies.',
    secondaryMeta: { left: 'KTTK', right: 'B2 Basement' },
    cta: {
      label: 'See event',
      href: '/here/events',
      categoryToken: 'sport',
    },
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
      alt: 'Restaurant and bar interior with warm lighting',
    },
    badge: { label: 'Food', categoryToken: 'food' },
    title: 'Vinyl Nights',
    primaryMeta: 'Mon · 18:00',
    description:
      'Monday evenings at Lütze: local selectors on the decks, drinks flowing, no cover. Bring a friend, claim a corner of the bar, and stay until the last record runs out.',
    secondaryMeta: { left: 'Lütze', right: 'Ground floor' },
    cta: {
      label: 'See event',
      href: '/here/events',
      categoryToken: 'food',
    },
  },
  {
    image: {
      src: 'https://images.unsplash.com/photo-1547448415-e9f5b28e57d0?w=900&q=80',
      alt: 'People sketching at a communal table',
    },
    badge: { label: 'Community', categoryToken: 'community' },
    title: 'Zeichenstammtisch',
    primaryMeta: 'Last Thu · 19:00',
    description:
      'An open drawing table for illustrators, sketchers, and the merely curious. Bring your own materials, share the table, and leave with new lines — and maybe a new collaborator.',
    secondaryMeta: { left: 'Lütze', right: 'Monthly' },
    cta: {
      label: 'See event',
      href: '/here/events',
      categoryToken: 'community',
    },
  },
]
