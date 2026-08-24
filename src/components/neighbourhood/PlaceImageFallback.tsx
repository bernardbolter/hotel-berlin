import { Landmark } from 'lucide-react'

import { CATEGORY_LUCIDE_ICON } from '@/lib/neighbourhood/categoryIcons'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

type Props = {
  category: PlaceCategory
  className?: string
}

/**
 * Empty media well — same gray box rooms/venues use when photography is missing.
 * Category glyph is a label, not a stock photo.
 */
export function PlaceImageFallback({ category, className = '' }: Props) {
  const Icon = CATEGORY_LUCIDE_ICON[category] ?? Landmark

  return (
    <div
      className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}
      aria-hidden="true"
    >
      <Icon size={32} strokeWidth={1.5} />
    </div>
  )
}
