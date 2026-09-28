import { getBerlinParts } from '@/lib/venue-time/berlin'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** True for a calendar date in `YYYY-MM-DD`. */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const utc = Date.UTC(year, month - 1, day)
  const check = new Date(utc)
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  )
}

/** Berlin's calendar date for `now`, as `YYYY-MM-DD`. */
export function berlinTodayIso(now: Date = new Date()): string {
  return getBerlinParts(now).dateKey
}

export function addDaysIso(iso: string, days: number): string {
  if (!isIsoDate(iso)) {
    throw new Error(`Invalid ISO date: ${iso}`)
  }
  const [year, month, day] = iso.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  const y = next.getUTCFullYear()
  const m = String(next.getUTCMonth() + 1).padStart(2, '0')
  const d = String(next.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Radisson's booking engine wants `MM/DD/YYYY` even on `de-de` URLs.
 * Keep the conversion here so call sites never format dates themselves.
 */
export function isoToVendorDate(iso: string): string {
  if (!isIsoDate(iso)) {
    throw new Error(`Invalid ISO date: ${iso}`)
  }
  const [year, month, day] = iso.split('-')
  return `${month}/${day}/${year}`
}

export function compareIsoDates(a: string, b: string): number {
  if (!isIsoDate(a) || !isIsoDate(b)) {
    throw new Error(`Invalid ISO date: ${a} / ${b}`)
  }
  return a.localeCompare(b)
}
