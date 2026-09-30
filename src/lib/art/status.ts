import { getBerlinParts, startOfBerlinDay } from '@/lib/venue-time/berlin'

export type ExhibitionRunType = 'dated' | 'permanent'
export type ExhibitionStatus = 'upcoming' | 'current' | 'past'

export type ExhibitionStatusInput = {
  runType?: ExhibitionRunType | null
  /** Legacy stored value — treated as runType when runType is absent. */
  status?: string | null
  startDate?: string | null
  endDate?: string | null
}

function berlinDayKey(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return getBerlinParts(date).dateKey
}

function resolveRunType(exhibition: ExhibitionStatusInput): ExhibitionRunType {
  if (exhibition.runType === 'permanent' || exhibition.runType === 'dated') {
    return exhibition.runType
  }
  if (exhibition.status === 'permanent') return 'permanent'
  return 'dated'
}

/**
 * Derived exhibition status in Berlin calendar days.
 * Closing day inclusive; permanent runs are always current.
 */
export function getExhibitionStatus(
  exhibition: ExhibitionStatusInput,
  now: Date,
): ExhibitionStatus {
  const runType = resolveRunType(exhibition)
  if (runType === 'permanent') return 'current'

  const today = getBerlinParts(now).dateKey
  const start = berlinDayKey(exhibition.startDate)
  const end = berlinDayKey(exhibition.endDate)

  if (start && today < start) return 'upcoming'
  if (end && today > end) return 'past'
  if (start && today >= start && (!end || today <= end)) return 'current'
  if (!start && end && today <= end) return 'current'
  if (!start && !end) return 'current'
  return 'past'
}

/** Instant at the start of a Berlin calendar day (for tests). */
export function berlinDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return startOfBerlinDay(new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0)))
}
