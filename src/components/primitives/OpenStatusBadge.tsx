'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import {
  deriveOpenClosed,
  type OpeningHoursEntry,
  type OpenSegment,
} from '@/lib/venue-time'

const statusClass: Record<OpenSegment['status'], string> = {
  Open: 'bg-hbb-green/15 text-hbb-green',
  Closed: 'bg-gray-100 text-gray-600',
}

const dotClass: Record<OpenSegment['status'], string> = {
  Open: 'bg-hbb-green',
  Closed: 'bg-gray-400',
}

type OpenStatusBadgeProps = {
  openingHours: OpeningHoursEntry[]
  className?: string
}

export function OpenStatusBadge({ openingHours, className }: OpenStatusBadgeProps) {
  const t = useTranslations('lutze.openStatus')
  const [segments, setSegments] = useState<OpenSegment[]>(() =>
    deriveOpenClosed(openingHours),
  )

  useEffect(() => {
    const tick = () => setSegments(deriveOpenClosed(openingHours))
    tick()
    const interval = window.setInterval(tick, 60_000)
    return () => window.clearInterval(interval)
  }, [openingHours])

  if (segments.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className={`flex flex-wrap gap-2 ${className ?? ''}`}
    >
      {segments.map((segment) => (
        <span
          key={segment.label}
          className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-ui text-ui-sm font-medium ${statusClass[segment.status]}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${dotClass[segment.status]}`}
          />
          <span>
            {segment.label}: {segment.status === 'Open' ? t('open') : t('closed')}
            {segment.note ? ` · ${segment.note}` : ''}
          </span>
        </span>
      ))}
    </div>
  )
}
