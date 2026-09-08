import { endOfBerlinDay } from '@/lib/venue-time/berlin'
import type { EventOccurrence } from '@/lib/payload/getEventOccurrences'

export type HubStripItem =
  | { kind: 'event'; occurrence: EventOccurrence }
  | { kind: 'exhibition' }

/**
 * Fill order: live now → dated today → dated this week → always-on → exhibition.
 * Unique by event id so Open Play is not both JETZT and IMMER.
 * Always-on / exhibition backfill from the right; dated cards keep left slots.
 */
export function pickHubStrip(
  occurrences: EventOccurrence[],
  hasExhibition: boolean,
  now: Date,
  limit = 4,
): HubStripItem[] {
  const todayEnd = endOfBerlinDay(now).getTime()
  const nowMs = now.getTime()
  const used = new Set<string | number>()

  const ranked = occurrences
    .map((occurrence) => ({
      occurrence,
      rank: hubRank(occurrence, nowMs, todayEnd),
    }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank
      return a.occurrence.start.getTime() - b.occurrence.start.getTime()
    })

  const items: HubStripItem[] = []
  for (const { occurrence } of ranked) {
    if (items.length >= limit) break
    const id = occurrence.event.id
    if (used.has(id)) continue
    used.add(id)
    items.push({ kind: 'event', occurrence })
  }

  if (items.length < limit && hasExhibition) {
    items.push({ kind: 'exhibition' })
  }

  return items.slice(0, limit)
}

function hubRank(occ: EventOccurrence, nowMs: number, todayEnd: number): number {
  const start = occ.start.getTime()
  const end = occ.end?.getTime() ?? null
  const inProgress = start <= nowMs && (end == null || end >= nowMs)
  if (inProgress) return 0
  if (occ.alwaysOn) return 3
  if (start <= todayEnd) return 1
  return 2
}

export function uniqueAlwaysOn(occurrences: EventOccurrence[]): EventOccurrence[] {
  const seen = new Set<string | number>()
  const out: EventOccurrence[] = []
  for (const occ of occurrences) {
    if (!occ.alwaysOn) continue
    if (seen.has(occ.event.id)) continue
    seen.add(occ.event.id)
    out.push(occ)
  }
  return out
}

/** True when at least two non-always-on events sit in the window. */
export function datedCount(items: HubStripItem[]): number {
  return items.filter((item) => item.kind === 'event' && !item.occurrence.alwaysOn).length
}
