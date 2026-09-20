import type { LocalizedSeed } from '../types'

export type AmenitySeed = {
  slug: string
  lucideIcon: string
  href?: string
  pending?: boolean
  includeInSchema?: boolean
  showInHub?: boolean
  kind?: 'facility' | 'service'
  schemaType?: 'none' | 'ExerciseGym' | 'SportsActivityLocation' | 'ParkingFacility'
  relatedFaqSlugs?: string[]
  openingHours?: { dayOfWeek: string; opens: string; closes: string }[]
  title: LocalizedSeed
  location: LocalizedSeed
  hoursOverride?: LocalizedSeed
  price?: LocalizedSeed
  what?: LocalizedSeed
  summary: LocalizedSeed
  details?: LocalizedSeed
  access?: LocalizedSeed
  subline: LocalizedSeed
}

function clip90(value: string): string {
  if (value.length <= 90) return value
  return `${value.slice(0, 89).trimEnd()}…`
}

/** Current Im Haus i18n, as editor-owned records. Order = grid order. */
export const amenitiesSeed: AmenitySeed[] = [
  {
    slug: 'kttk',
    lucideIcon: 'Table2',
    schemaType: 'SportsActivityLocation',
    openingHours: [{ dayOfWeek: 'Mo-Su', opens: '13:00', closes: '23:00' }],
    title: { de: 'KTTK', en: 'KTTK' },
    location: { de: 'B2 Keller', en: 'B2 Basement' },
    price: { de: '5 € / 30 Min.', en: '€5 / 30 min' },
    subline: {
      de: '4 JOOLA-Platten · Schläger an der Lütze-Bar',
      en: '4 JOOLA tables · bats at Lütze bar',
    },
    summary: {
      de: '4 JOOLA-Platten · Schläger an der Lütze-Bar',
      en: '4 JOOLA tables · bats at Lütze bar',
    },
  },
  {
    slug: 'wallride',
    lucideIcon: 'Waves',
    href: '/here/wallride',
    title: { de: 'Wallride', en: 'Wallride' },
    location: { de: 'B2 · vor KTTK', en: 'B2 · outside KTTK' },
    what: { de: 'Permanent', en: 'Permanent' },
    subline: {
      de: 'Halfpipe · Skate-Geschichte des Kalten Kriegs',
      en: 'Half-pipe · Cold War Berlin skate history',
    },
    summary: {
      de: 'Halfpipe · Skate-Geschichte des Kalten Kriegs',
      en: 'Half-pipe · Cold War Berlin skate history',
    },
  },
  {
    slug: 'fingerboard',
    lucideIcon: 'LayoutGrid',
    pending: true,
    includeInSchema: false,
    title: { de: 'Fingerboard-Rampen', en: 'Fingerboard ramps' },
    location: { de: 'Platzierung folgt', en: 'Placement TBC' },
    subline: {
      de: 'Wartet auf das Hotelteam: Ort, Fotos, Zugang, Zeiten.',
      en: 'Blocked on hotel-team content: location, photos, access, hours.',
    },
    summary: {
      de: clip90('Wartet auf das Hotelteam: Ort, Fotos, Zugang, Zeiten.'),
      en: clip90('Blocked on hotel-team content: location, photos, access, hours.'),
    },
  },
  {
    slug: 'gym',
    lucideIcon: 'Dumbbell',
    schemaType: 'ExerciseGym',
    relatedFaqSlugs: ['guest-gym'],
    openingHours: [{ dayOfWeek: 'Mo-Su', opens: '00:00', closes: '24:00' }],
    title: { de: 'Gym', en: 'Gym' },
    location: { de: 'Im Hotel', en: 'In the hotel' },
    subline: { de: 'Rund um die Uhr', en: 'Open around the clock' },
    summary: { de: 'Rund um die Uhr', en: 'Open around the clock' },
  },
  {
    slug: 'sauna',
    lucideIcon: 'Flame',
    relatedFaqSlugs: ['guest-sauna'],
    title: { de: 'Sauna & Sanarium', en: 'Sauna & Sanarium' },
    location: { de: 'Im Hotel', en: 'In the hotel' },
    hoursOverride: {
      de: 'Zeiten noch zu bestätigen',
      en: 'Hours to confirm',
    },
    subline: {
      de: 'Finnische Sauna + Sanarium · 45 Min. Vorlauf. Zwei veröffentlichte Zeiten — das Hotel muss bestätigen, welche gilt.',
      en: 'Finnish sauna + Sanarium · 45 min notice. Two published schedules — waiting on the hotel to confirm which is current.',
    },
    summary: {
      de: clip90('Finnische Sauna + Sanarium · 45 Min. Vorlauf.'),
      en: clip90('Finnish sauna + Sanarium · 45 min notice.'),
    },
    details: {
      de: 'Finnische Sauna + Sanarium · 45 Min. Vorlauf. Zwei veröffentlichte Zeiten — das Hotel muss bestätigen, welche gilt.',
      en: 'Finnish sauna + Sanarium · 45 min notice. Two published schedules — waiting on the hotel to confirm which is current.',
    },
  },
  {
    slug: 'bett-and-bike',
    lucideIcon: 'Bike',
    relatedFaqSlugs: ['guest-bike-garage'],
    title: { de: 'Bett & Bike', en: 'Bett & Bike' },
    location: { de: 'Im Hotel', en: 'In the hotel' },
    subline: {
      de: 'Fahrradverleih — an der Rezeption erfragen',
      en: 'Bike rental — confirm with reception',
    },
    summary: {
      de: 'Fahrradverleih — an der Rezeption erfragen',
      en: 'Bike rental — confirm with reception',
    },
  },
  {
    slug: 'business-center',
    lucideIcon: 'Briefcase',
    relatedFaqSlugs: ['guest-business-center'],
    title: { de: 'Business Center', en: 'Business Center' },
    location: { de: 'Im Hotel', en: 'In the hotel' },
    subline: { de: 'Geldautomat im Haus', en: 'ATM on site' },
    summary: { de: 'Geldautomat im Haus', en: 'ATM on site' },
  },
  {
    slug: 'e-laden',
    lucideIcon: 'Plug',
    relatedFaqSlugs: ['guest-ev-charging'],
    title: { de: 'E-Laden', en: 'EV charging' },
    location: { de: 'Vor Ort', en: 'On site' },
    what: { de: '8 × Typ 2', en: '8 × Type 2' },
    subline: {
      de: 'Ladestationen für Elektroautos',
      en: 'Electric vehicle charging',
    },
    summary: {
      de: 'Ladestationen für Elektroautos',
      en: 'Electric vehicle charging',
    },
  },
]
