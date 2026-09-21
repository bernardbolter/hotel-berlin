export type SpecialHoursEntry = {
  validFrom?: string | null
  validThrough?: string | null
  kind?: 'closed' | 'hours' | 'on-request' | null
  opens?: string | null
  closes?: string | null
  note?: string | null
}

export type AmenityHoursLabels = {
  closed: string
  onRequest: string
}

export type FormatAmenityHoursInput = {
  openingHours?: {
    dayOfWeek?: string | null
    opens?: string | null
    closes?: string | null
    isOpenEnded?: boolean | null
    note?: string | null
  }[] | null
  specialHours?: SpecialHoursEntry[] | null
  hoursOverride?: string | null
  locale: 'de' | 'en'
  labels: AmenityHoursLabels
  now?: Date
}
