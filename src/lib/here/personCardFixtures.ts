import type { PersonCardProps } from '@/components/here/PersonCard'

/** Fixture hosts for PersonCard until the people audit publishes live rows. */
export const PERSON_CARD_FIXTURES: PersonCardProps[] = [
  {
    role: 'Artist / Sculptor',
    room: 'Room 1185',
    name: 'Kristiane Kegelmann',
    subline: 'Berlin-based artist and sculptor.',
    recs: [
      { name: 'Nobelhart & Schmutzig', distance: '12 min' },
      { name: 'Käthe Kollwitz Museum', distance: '18 min' },
    ],
    cta: 'Their story',
    href: null,
    portrait: null,
  },
  {
    role: 'Artist',
    room: null,
    name: 'Gita Kudpoor',
    subline: null,
    recs: [{ name: 'Tiergarten', distance: '8 min' }],
    cta: 'Their story',
    href: null,
    portrait: null,
  },
]
