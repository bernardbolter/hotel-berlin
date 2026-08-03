export type OpeningHoursEntry = {
  dayOfWeek?: string | null
  opens?: string | null
  closes?: string | null
  /** Segment grouping key, e.g. "Bar" / "Kitchen". Falls back to legacy `label`. */
  segment?: string | null
  /** @deprecated Prefer `segment` — kept for reading older documents. */
  label?: string | null
  note?: string | null
}

export type OpenSegment = {
  label: string
  status: 'Open' | 'Closed'
  note?: string
}

export type RelativeTimeState =
  | { kind: 'now' }
  | { kind: 'soon'; minutesOrHours: string }
  | { kind: 'scheduled'; time: string }

export type VenueTimeExhibition = {
  id: string | number
  title: string
  status?: 'upcoming' | 'current' | 'permanent' | 'past' | null
  startDate?: string | null
  endDate?: string | null
  venue?: string | number | { id: string | number } | null
}

export type VenueTimeEvent = {
  id: string | number
  name: string
  startDate: string
  endDate?: string | null
  isRecurring?: boolean | null
  recurrenceRule?: string | null
  venue?:
    | string
    | number
    | {
        id: string | number
        name?: string | null
        spotlightLocation?: string | null
      }
    | null
}

export type EventWithRelativeTime = VenueTimeEvent & {
  relativeTime: RelativeTimeState
  /** Resolved occurrence start used for relativeTime / ranking */
  occurrenceStart: Date
  occurrenceEnd?: Date | null
}
