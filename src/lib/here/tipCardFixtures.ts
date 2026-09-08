import type { TipCardProps } from '@/components/here/TipCard'

const base = {
  categoryLabel: 'Museum',
  categoryColor: '#A08C38',
  walkingLabel: '27 min',
  image: null,
  placeholderLabel: 'Placeholder',
  noEndorserLabel: 'A hotel tip',
  href: '/neighbourhood/test',
} as const

/** All three avatar states from the card system. */
export const TIP_CARD_FIXTURES: TipCardProps[] = [
  {
    ...base,
    slug: 'kaethe-kollwitz-museum',
    name: 'Käthe-Kollwitz-Museum',
    category: 'Museum',
    description: 'Museum mit starkem künstlerischem Profil.',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Berlin-fasanenstra%C3%9Fe-24-k%C3%A4the-kollwitz-museum-berlin.JPG/960px-Berlin-fasanenstra%C3%9Fe-24-k%C3%A4the-kollwitz-museum-berlin.JPG',
      alt: 'Käthe-Kollwitz-Museum',
    },
    endorser: {
      name: 'Dr. Iris Berndt',
      role: 'Direktorin des Käthe-Kollwitz-Museums, Kunsthistorikerin',
      room: 'Room 1171',
      href: '/you-me-berlin/iris-berndt',
      portrait: { src: '/images/here/kttk.jpg', alt: 'Iris Berndt' },
    },
  },
  {
    ...base,
    slug: 'koenig-galerie',
    name: 'König Galerie',
    category: 'Art',
    categoryLabel: 'Art',
    categoryColor: '#2C6B7A',
    description: 'Galerie für zeitgenössische Kunst.',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg/960px-St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg',
      alt: 'König Galerie',
    },
    endorser: {
      name: 'Kristiane Kegelmann',
      role: 'Künstlerin, Bildhauerei',
      room: null,
      href: '/you-me-berlin/kristiane-kegelmann',
      portrait: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg/960px-St-Agnes-Alexandrinenstr-Berlin-Kreuzberg-03-2017.jpg',
        alt: 'König Galerie',
      },
    },
  },
  {
    ...base,
    slug: 'hotel-pick',
    name: 'A place without an endorser',
    category: 'Sightseeing',
    categoryLabel: 'Sightseeing',
    categoryColor: '#E08A28',
    description: null,
    endorser: null,
  },
]
