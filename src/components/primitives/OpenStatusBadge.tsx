'use client'

import { useEffect, useState } from 'react'

import { getStatus, type StatusResult, type StatusType } from '@/lib/lutze/openStatus'

const badgeClass: Record<StatusType, string> = {
  closed: 'bg-gray-100 text-gray-600',
  open: 'bg-hbb-green/15 text-hbb-green',
  'bar-only': 'bg-hbb-teal/15 text-hbb-teal',
  closing: 'bg-hbb-amber/15 text-hbb-amber',
}

const dotClass: Record<StatusType, string> = {
  closed: 'bg-gray-400',
  open: 'bg-hbb-green',
  'bar-only': 'bg-hbb-teal',
  closing: 'bg-hbb-amber',
}

export function OpenStatusBadge() {
  const [status, setStatus] = useState<StatusResult>(getStatus())

  useEffect(() => {
    setStatus(getStatus())
    const interval = window.setInterval(() => setStatus(getStatus()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-ui text-ui-sm font-medium ${badgeClass[status.type]}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClass[status.type]}`} />
      {status.text}
    </div>
  )
}
