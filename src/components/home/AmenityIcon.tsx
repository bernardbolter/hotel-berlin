import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type Props = {
  iconName?: string | null
  size?: number
  className?: string
}

export function AmenityIcon({ iconName, size = 15, className }: Props) {
  if (!iconName) return null

  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as
    | React.FC<LucideProps>
    | undefined

  if (!Icon || typeof Icon !== 'function') return null

  return <Icon size={size} className={className} aria-hidden="true" />
}
