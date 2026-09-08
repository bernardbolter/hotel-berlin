'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import {
  deriveGuestDiningStatus,
  deriveOpenClosed,
  type GuestDiningStatus,
  type OpeningHoursEntry,
  type OpenSegment,
} from '@/lib/venue-time'
import { localizeHoursSegmentLabel } from '@/lib/venues/formatHours'

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
  /** `guest` = one kitchen-first line for the hub band. */
  variant?: 'segments' | 'guest'
  /** `chip` = forest fill + amber live dot, for the hub dining strip. */
  appearance?: 'line' | 'chip'
  className?: string
}

function guestLine(
  status: GuestDiningStatus,
  t: ReturnType<typeof useTranslations<'lutze.openStatus'>>,
): { text: string; open: boolean } {
  switch (status.kind) {
    case 'kitchenClosingSoon':
      return {
        text: t('kitchenClosingIn', { minutes: status.minutes }),
        open: true,
      }
    case 'kitchenOpen':
      return {
        text: status.until
          ? t('kitchenOpenUntil', { time: status.until })
          : t('kitchenOpen'),
        open: true,
      }
    case 'barOnly': {
      if (!status.kitchenOpensAt) {
        return { text: t('barOpen'), open: true }
      }
      const kitchen = status.kitchenOpensTomorrow
        ? t('fromTomorrow', { time: status.kitchenOpensAt })
        : t('from', { time: status.kitchenOpensAt })
      return { text: t('barOpenKitchen', { kitchen }), open: true }
    }
    case 'closed': {
      if (!status.kitchenOpensAt) {
        return { text: t('closed'), open: false }
      }
      const kitchen = status.kitchenOpensTomorrow
        ? t('fromTomorrow', { time: status.kitchenOpensAt })
        : t('from', { time: status.kitchenOpensAt })
      return { text: t('closedKitchen', { kitchen }), open: false }
    }
  }
}

function segmentNote(
  segment: OpenSegment,
  t: ReturnType<typeof useTranslations<'lutze.openStatus'>>,
): string {
  if (segment.note) return segment.note
  if (segment.status === 'Open' && segment.closesAt) {
    return t('until', { time: segment.closesAt })
  }
  if (segment.status === 'Closed' && segment.nextOpensAt) {
    return segment.nextOpensTomorrow
      ? t('fromTomorrow', { time: segment.nextOpensAt })
      : t('from', { time: segment.nextOpensAt })
  }
  return ''
}

export function OpenStatusBadge({
  openingHours,
  variant = 'segments',
  appearance = 'line',
  className,
}: OpenStatusBadgeProps) {
  const t = useTranslations('lutze.openStatus')
  const tSeg = useTranslations('restaurantPage')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const interval = window.setInterval(tick, 60_000)
    return () => window.clearInterval(interval)
  }, [openingHours])

  if (openingHours.length === 0) return null

  if (variant === 'guest') {
    const status = deriveGuestDiningStatus(openingHours, now)
    if (!status) return null
    const { text, open } = guestLine(status, t)

    if (appearance === 'chip') {
      return (
        <p
          aria-live="polite"
          aria-atomic="true"
          role="status"
          className={`inline-flex items-center justify-center gap-2 border px-3 py-2 font-ui text-[0.78rem] leading-snug ${
            open
              ? 'border-hbb-deep-forest bg-hbb-deep-forest text-white'
              : 'border-hbb-deep-forest/30 bg-white text-[#5a5a5a]'
          } ${className ?? ''}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${open ? 'bg-hbb-amber' : 'bg-gray-400'}`}
          />
          <span className={open ? 'text-white' : 'text-[#141414]'}>{text}</span>
        </p>
      )
    }

    return (
      <p
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className={`inline-flex items-center gap-2 font-ui text-ui-sm font-medium ${
          open ? 'text-hbb-green' : 'text-gray-600'
        } ${className ?? ''}`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-hbb-green' : 'bg-gray-400'}`}
        />
        <span>{text}</span>
      </p>
    )
  }

  const segments = deriveOpenClosed(openingHours, now)
  if (segments.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className={`flex flex-wrap gap-2 ${className ?? ''}`}
    >
      {segments.map((segment) => {
        const note = segmentNote(segment, t)
        const label = localizeHoursSegmentLabel(segment.label, {
          kitchen: tSeg('segmentKitchen'),
          bar: tSeg('segmentBar'),
        })
        return (
          <span
            key={segment.label}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-ui text-ui-sm font-medium ${statusClass[segment.status]}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${dotClass[segment.status]}`}
            />
            <span>
              {label}: {segment.status === 'Open' ? t('open') : t('closed')}
              {note ? ` · ${note}` : ''}
            </span>
          </span>
        )
      })}
    </div>
  )
}
