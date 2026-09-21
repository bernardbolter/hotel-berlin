import { resolveLucideIcon } from '@/lib/amenities/lucide'

type Props = {
  iconName?: string | null
  size?: number
  className?: string
}

export function AmenityIcon({ iconName, size = 15, className }: Props) {
  const Icon = resolveLucideIcon(iconName)

  return <Icon size={size} className={className} aria-hidden="true" />
}
