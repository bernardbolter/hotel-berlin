import type { ContentCardProps } from '@/components/primitives/ContentCard'

export const cultureCards: ContentCardProps[] = [
  {
    badge: 'Gallery',
    badgeColor: 'teal',
    title: 'Freundeskreis der Künstler Berlin',
    subtitle: 'Contemporary art',
    body:
      'FKKB has been part of the hotel since the 1980s — a working gallery where artists make real work, not just display it. Open to guests and the public.',
    meta: 'Ground floor · Free entry',
    ctaLabel: 'Explore FKKB',
    ctaHref: '/gallery',
    image:
      'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
    imageAlt: 'Contemporary art gallery interior',
  },
  {
    badge: 'Sport',
    badgeColor: 'green',
    title: 'KTTK — Königlicher Tischtennis Klub',
    subtitle: 'Table tennis',
    body:
      'Four JOOLA tables in the basement. Open to guests and Berliners. Thursday nights — tournament. No booking, no dress code.',
    meta: 'Basement · €5/30 min',
    ctaLabel: 'Play at KTTK',
    ctaHref: '/here/explore',
    image:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    imageAlt: 'Table tennis tables',
  },
  {
    badge: 'Museum',
    badgeColor: 'amber',
    title: 'Sissi — Skateboard Museum',
    subtitle: 'Urban culture',
    body:
      'One of Europe\'s largest skateboard collections — decks, graphics, and Berlin skate history. A love letter to the city\'s counterculture.',
    meta: 'Every floor · Free for guests',
    ctaLabel: 'Visit the museum',
    ctaHref: '/skateboard-museum',
    image:
      'https://images.unsplash.com/photo-1547448415-e9f5b28e57d0?w=800&q=80',
    imageAlt: 'Skateboard collection display',
  },
  {
    badge: 'Neighbourhood',
    badgeColor: 'purple',
    title: 'Haus am Lützowplatz',
    subtitle: 'Art centre',
    body:
      'Berlin\'s oldest art association — exhibitions, talks, and a café on the square. Two minutes from the hotel.',
    meta: '2 min walk',
    ctaLabel: 'See what\'s on',
    ctaHref: 'https://haus-am-luetzowplatz.de',
    ctaExternal: true,
    image:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
    imageAlt: 'Art exhibition at Haus am Lützowplatz',
  },
]
