import { isIsoDate } from './dates'
import type { BookingLocale } from './radisson'

export const MEETINGPACKAGE_VENUE_URL =
  'https://hotelberlinberlin.meetingpackage.com/venue/hotel-berlin-berlin-2'

export const MEETING_LENGTH_HOURS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export const MEETING_LENGTH_SPECIAL = ['Overnight', 'Two-Days'] as const

export type MeetingLengthHours = (typeof MEETING_LENGTH_HOURS)[number]
export type MeetingLengthSpecial = (typeof MEETING_LENGTH_SPECIAL)[number]
export type MeetingLength = `${MeetingLengthHours}` | MeetingLengthSpecial

export type MeetingPackageParams = {
  /** Required. The live widget accepted a blank date; we do not. */
  date: string
  /** Venue-local start time `HH:mm`. */
  time: string
  meetingLength: MeetingLength
  delegates: number
  locale: BookingLocale
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

function isMeetingLength(value: string): value is MeetingLength {
  if ((MEETING_LENGTH_SPECIAL as readonly string[]).includes(value)) return true
  const hours = Number(value)
  return (MEETING_LENGTH_HOURS as readonly number[]).includes(hours)
}

/**
 * Instant-book handoff into MeetingPackage.
 * Sends date and time as well as delegates / length — the live Galaxy widget
 * dropped both (audit §3.2). `start_date` / `start_time` / `duration` match
 * MeetingPackage's availability API; `date` / `time` / `meeting-length` match
 * the names the current venue page already reads.
 */
export function buildMeetingPackageUrl(params: MeetingPackageParams): string {
  if (!isIsoDate(params.date)) {
    throw new Error(`Invalid ISO date: ${params.date}`)
  }
  if (!TIME.test(params.time)) {
    throw new Error(`Invalid time: ${params.time}`)
  }
  if (!Number.isInteger(params.delegates) || params.delegates < 1) {
    throw new Error('delegates must be a positive integer')
  }
  if (!isMeetingLength(params.meetingLength)) {
    throw new Error(`Invalid meeting length: ${params.meetingLength}`)
  }

  const url = new URL(MEETINGPACKAGE_VENUE_URL)
  url.searchParams.set('delegates', String(params.delegates))
  url.searchParams.set('meeting-length', params.meetingLength)
  url.searchParams.set('date', params.date)
  url.searchParams.set('time', params.time)
  url.searchParams.set('start_date', params.date)
  url.searchParams.set('start_time', params.time)
  if (/^\d+$/.test(params.meetingLength)) {
    url.searchParams.set('duration', params.meetingLength)
  }
  url.searchParams.set('tab', 'room')
  url.searchParams.set('lang', params.locale)
  return url.toString()
}

export function meetingTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 6; hour <= 21; hour += 1) {
    times.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 21) times.push(`${String(hour).padStart(2, '0')}:30`)
  }
  return times
}
