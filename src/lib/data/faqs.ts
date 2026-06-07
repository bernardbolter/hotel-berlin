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

export interface FAQItemConfig {
  id: string
  icon: LucideIcon
}

export const faqConfig: Record<FAQPageContext, FAQItemConfig[]> = {
  homepage: [
    { id: 'checkin-time', icon: DoorOpen },
    { id: 'parking', icon: Car },
    { id: 'pets', icon: PawPrint },
    { id: 'airport', icon: Plane },
  ],
  rooms: [
    { id: 'bed-types', icon: BedDouble },
    { id: 'room-size', icon: Ruler },
    { id: 'cancellation', icon: CalendarX },
    { id: 'extra-beds', icon: Users },
  ],
  meetings: [
    { id: 'capacity', icon: Users },
    { id: 'av-tech', icon: Monitor },
    { id: 'catering', icon: Coffee },
    { id: 'parking-meet', icon: Car },
  ],
  restaurant: [
    { id: 'lutze-open', icon: Clock },
    { id: 'reservations', icon: Calendar },
    { id: 'dietary', icon: Leaf },
    { id: 'kttk-book', icon: Table2 },
  ],
}
