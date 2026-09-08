'use client'

import { useEffect, useState } from 'react'

type Props = {
  ariaLabel: string
  weekday?: string
}

export function HeroClock({ ariaLabel, weekday }: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      )
    }
    tick()
    const interval = setInterval(tick, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  return (
    <>
      <time
        className="here-hero__clock-time"
        dateTime={time}
        aria-label={ariaLabel}
        aria-live="off"
      >
        {time}
      </time>
      {weekday ? <p className="here-hero__clock-day">{weekday}</p> : null}
    </>
  )
}
