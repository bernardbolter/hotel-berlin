import { formatBerlinTime, getBerlinNow } from './berlin'
import type { RelativeTimeState } from './types'

const SOON_THRESHOLD_MINUTES = 120

/**
 * Structured relative-time state for hero / card copy.
 * Display strings come from i18n keys (`relativeTime.now` / `.soon` / `.scheduled`).
 */
export function formatRelativeTime(
  startDateTime: Date,
  now: Date = getBerlinNow(),
  endDateTime?: Date | null,
): RelativeTimeState {
  const diffMinutes = (startDateTime.getTime() - now.getTime()) / 60_000

  const hasStarted = diffMinutes <= 0
  const hasEnded = endDateTime != null && endDateTime.getTime() < now.getTime()

  if (hasStarted && !hasEnded) {
    return { kind: 'now' }
  }

  if (diffMinutes > 0 && diffMinutes <= SOON_THRESHOLD_MINUTES) {
    return { kind: 'soon', minutesOrHours: formatSoonDuration(diffMinutes) }
  }

  return { kind: 'scheduled', time: formatBerlinTime(startDateTime) }
}

function formatSoonDuration(diffMinutes: number): string {
  if (diffMinutes < 60) {
    const mins = Math.max(1, Math.round(diffMinutes))
    return `${mins} min`
  }
  const hours = Math.round(diffMinutes / 60)
  return hours === 1 ? '1 hour' : `${hours} hours`
}
