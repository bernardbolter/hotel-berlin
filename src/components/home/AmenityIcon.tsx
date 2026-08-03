import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

type Props = {
  iconName?: string | null
  size?: number
  className?: string
}

function isLucideComponent(value: unknown): value is ComponentType<LucideProps> {
  if (!value) return false
  if (typeof value === 'function') return true
  // lucide-react icons are React.forwardRef objects (typeof === 'object')
  return typeof value === 'object' && '$$typeof' in value
}

export function AmenityIcon({ iconName, size = 15, className }: Props) {
  if (!iconName) return null

  const Icon = LucideIcons[iconName as keyof typeof LucideIcons]

  if (!isLucideComponent(Icon)) return null

  return <Icon size={size} className={className} aria-hidden="true" />
}
