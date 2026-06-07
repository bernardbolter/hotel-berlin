'use client'

export interface SlideDotsNavProps {
  count: number
  current: number
  labels: string[]
  onSelect: (index: number) => void
  className?: string
  ariaLabel?: string
}

export function SlideDotsNav({
  count,
  current,
  labels,
  onSelect,
  className = '',
  ariaLabel = 'Room categories',
}: SlideDotsNavProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={labels[i] ?? i}
          type="button"
          role="tab"
          aria-selected={i === current}
          aria-label={labels[i]}
          onClick={() => onSelect(i)}
          className={`h-[2px] rounded-none transition-all duration-300 ${
            i === current ? 'w-8 bg-hbb-amber' : 'w-[18px] bg-hbb-teal/20'
          }`}
        />
      ))}
    </div>
  )
}
