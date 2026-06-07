import {
  BedDouble,
  Monitor,
  Ruler,
  Sofa,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  ruler: Ruler,
  bed: BedDouble,
  users: Users,
  balcony: Sun,
  sofa: Sofa,
  monitor: Monitor,
  sun: Sun,
}

export function getRoomIcon(name: string): LucideIcon {
  return iconMap[name] ?? Users
}
