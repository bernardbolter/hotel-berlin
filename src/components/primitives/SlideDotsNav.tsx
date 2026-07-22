'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface SlideDotsNavProps {
  count: number
  current: number
  labels: string[]
  onSelect: (index: number) => void
  onPrev?: () => void
  onNext?: () => void
  className?: string
  ariaLabel?: string
  prevLabel?: string
  nextLabel?: string
  variant?: 'default' | 'coral'
  showChevrons?: boolean
}

export function SlideDotsNav({
  count,
  current,
  labels,
  onSelect,
  onPrev,
  onNext,
  className = '',
  ariaLabel = 'Navigation',
  prevLabel = 'Previous',
  nextLabel = 'Next',
  variant = 'default',
  showChevrons = false,
}: SlideDotsNavProps) {
  if (variant === 'coral') {
    return (
      <nav aria-label={ariaLabel} className={`flex items-center gap-2 ${className}`}>
        {showChevrons && onPrev && (
          <button
            type="button"
            aria-label={prevLabel}
            onClick={onPrev}
            className="text-gray-400 transition-colors hover:text-hbb-coral focus-visible:outline-2 focus-visible:outline-hbb-coral"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        )}
        <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={labels[i] ?? i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={labels[i]}
              onClick={() => onSelect(i)}
              className={[
                'rounded-full transition-all duration-300',
                'focus-visible:outline-2 focus-visible:outline-hbb-coral',
                i === current
                  ? 'h-1.75 w-1.75 bg-hbb-coral'
                  : 'h-1.25 w-1.25 bg-gray-300 hover:bg-gray-400',
              ].join(' ')}
            />
          ))}
        </div>
        {showChevrons && onNext && (
          <button
            type="button"
            aria-label={nextLabel}
            onClick={onNext}
            className="text-gray-400 transition-colors hover:text-hbb-coral focus-visible:outline-2 focus-visible:outline-hbb-coral"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </nav>
    )
  }

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
          className={`h-0.5 rounded-none transition-all duration-300 ${
            i === current ? 'w-8 bg-hbb-amber' : 'w-4.5 bg-hbb-teal/20'
          }`}
        />
      ))}
    </div>
  )
}
