import {
  Accessibility,
  Flame,
  Flower2,
  LayoutPanelLeft,
} from 'lucide-react'

type Props = {
  hasBalcony?: boolean | null
  hasSauna?: boolean | null
  hasSeparateLiving?: boolean | null
  isAccessible?: boolean | null
  labels: {
    balcony: string
    sauna: string
    separateLiving: string
    accessible: string
  }
  className?: string
}

export function RoomFeatureIcons({
  hasBalcony,
  hasSauna,
  hasSeparateLiving,
  isAccessible,
  labels,
  className = '',
}: Props) {
  const features = [
    hasBalcony ? { icon: Flower2, label: labels.balcony } : null,
    hasSauna ? { icon: Flame, label: labels.sauna } : null,
    hasSeparateLiving ? { icon: LayoutPanelLeft, label: labels.separateLiving } : null,
    isAccessible ? { icon: Accessibility, label: labels.accessible } : null,
  ].filter((f): f is { icon: typeof Flower2; label: string } => f !== null)

  if (features.length === 0) return null

  return (
    <ul role="list" className={`flex flex-wrap gap-4 ${className}`}>
      {features.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 font-ui text-ui-sm text-gray-600"
        >
          <Icon size={16} aria-hidden="true" className="text-hbb-rooms-highlight" />
          {label}
        </li>
      ))}
    </ul>
  )
}
