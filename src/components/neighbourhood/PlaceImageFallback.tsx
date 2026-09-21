import type { PlaceCategory } from '@/lib/neighbourhood/constants'
import { pinColorForCategory } from '@/lib/neighbourhood/categories'

type Props = {
  category: PlaceCategory
  name?: string
  className?: string
}

/**
 * Empty media well — name set in Archivo on a quiet ground, category-token left border.
 * Nobody mistakes a grey block for a mistake; they do mistake a random landscape.
 */
export function PlaceImageFallback({ category, name, className = '' }: Props) {
  const color = pinColorForCategory(category)

  return (
    <div
      className={`flex h-full w-full items-end border-l-4 bg-[var(--bg-subtle)] px-4 py-4 ${className}`}
      style={{ borderLeftColor: color }}
      aria-hidden={name ? undefined : true}
    >
      {name ? (
        <p className="font-ui text-ui-md font-medium leading-snug text-[var(--dim)]">{name}</p>
      ) : null}
    </div>
  )
}
