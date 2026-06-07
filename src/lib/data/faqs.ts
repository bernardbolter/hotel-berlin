import {
  BedDouble,
  Calendar,
  CalendarX,
  Car,
  Clock,
  Coffee,
  DoorOpen,
  Leaf,
  Monitor,
  PawPrint,
  Plane,
  Ruler,
  Table2,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type FAQPageContext = 'homepage' | 'rooms' | 'meetings' | 'restaurant'

export interface FAQItem {
  id: string
  icon: LucideIcon
  question: string
  answer: string
}

export const faqsByContext: Record<FAQPageContext, FAQItem[]> = {
  homepage: [
    {
      id: 'checkin-time',
      icon: DoorOpen,
      question: 'What are the check-in and check-out times?',
      answer:
        'Check-in is from 15:00. Check-out is by 12:00 noon. Early check-in from 06:00 is available for €30 if your room is ready — or book the night before for guaranteed early access. Self-service kiosks are available in the lobby.',
    },
    {
      id: 'parking',
      icon: Car,
      question: 'Is there parking at the hotel?',
      answer:
        'Yes — underground parking with over 200 spaces. €4 per hour, maximum €25 per day. EV charging is available.',
    },
    {
      id: 'pets',
      icon: PawPrint,
      question: 'Are pets welcome?',
      answer:
        "Yes. Pets are welcome — a fee of €30 per night applies. They're also welcome at breakfast.",
    },
    {
      id: 'airport',
      icon: Plane,
      question: 'How do I get here from BER airport?',
      answer:
        'Take the RE7 or RB14 to Zoologischer Garten, then Bus 100 to Lützowplatz — right outside the hotel. Around 45–55 minutes total.',
    },
  ],
  rooms: [
    {
      id: 'bed-types',
      icon: BedDouble,
      question: 'What bed configurations are available?',
      answer:
        'All room categories are available with either a king bed or twin configuration. Request your preference at booking — subject to availability.',
    },
    {
      id: 'room-size',
      icon: Ruler,
      question: 'How large are the rooms?',
      answer:
        'Superior rooms are 22–26 m². Comfort rooms are 26–32 m². Suites range from 40–65 m². Studio 45 is available on request.',
    },
    {
      id: 'cancellation',
      icon: CalendarX,
      question: 'What is the cancellation policy?',
      answer:
        'Flexible rate bookings can be cancelled free of charge until 18:00 on the day of arrival. Non-refundable rates are charged in full at time of booking.',
    },
    {
      id: 'extra-beds',
      icon: Users,
      question: 'Can extra beds or cots be added?',
      answer:
        'Cots are available for children under 2 at no charge. Rollaway beds can be added to most room types for €30 per night, subject to availability.',
    },
  ],
  meetings: [
    {
      id: 'capacity',
      icon: Users,
      question: 'What is the largest event space?',
      answer:
        'The Berliner Saal accommodates up to 600 guests in theatre configuration. Total event space across all rooms is over 4,000 m².',
    },
    {
      id: 'av-tech',
      icon: Monitor,
      question: 'What AV and technology is included?',
      answer:
        'All meeting rooms include high-speed Wi-Fi, screen or projection, and sound system. Full AV packages including live streaming and simultaneous translation are available.',
    },
    {
      id: 'catering',
      icon: Coffee,
      question: 'Is catering included in meeting packages?',
      answer:
        'Day delegate packages include coffee breaks and lunch. Bespoke catering from Lütze is available for all events.',
    },
    {
      id: 'parking-meet',
      icon: Car,
      question: 'Is parking available for day delegates?',
      answer:
        'Underground parking is available at €4 per hour. Pre-bookable delegate parking rates are available — ask the events team when enquiring.',
    },
  ],
  restaurant: [
    {
      id: 'lutze-open',
      icon: Clock,
      question: "What are Lütze's opening hours?",
      answer:
        'The bar is open daily from 10:00. The kitchen serves 11:30–15:00 and 17:00–22:30. Vinyl Nights are every Monday from 18:00.',
    },
    {
      id: 'reservations',
      icon: Calendar,
      question: 'Do I need to book a table?',
      answer:
        'Reservations are recommended for dinner but not required. Walk-ins are always welcome at the bar. For large groups of 8 or more, please book in advance.',
    },
    {
      id: 'dietary',
      icon: Leaf,
      question: 'Are dietary requirements catered for?',
      answer:
        'Yes — vegan, vegetarian, and gluten-free options are available. Please mention any allergies or dietary requirements when booking.',
    },
    {
      id: 'kttk-book',
      icon: Table2,
      question: 'Do I need to book a table tennis table?',
      answer:
        'No booking needed — tables are available on a first-come basis during open hours. Thursday tournament nights are open to all. €5 entry.',
    },
  ],
}
