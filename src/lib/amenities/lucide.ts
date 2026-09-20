import * as LucideIcons from 'lucide-react'
import { Circle, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

function isLucideComponent(value: unknown): value is ComponentType<LucideProps> {
  if (!value) return false
  if (typeof value === 'function') return true
  return typeof value === 'object' && '$$typeof' in value
}

/** CMS Lucide name → component. Unknown or empty names fall back to Circle. */
export function resolveLucideIcon(name?: string | null): LucideIcon {
  if (!name) return Circle
  const Icon = LucideIcons[name as keyof typeof LucideIcons]
  if (isLucideComponent(Icon)) return Icon as LucideIcon
  return Circle
}
