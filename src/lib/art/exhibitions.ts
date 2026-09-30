import type { Exhibition, Venue } from '@/payload-types'
import { getExhibitionStatus, type ExhibitionStatus } from '@/lib/art/status'
import { getPayloadClient } from '@/lib/payload/client'
import { getBerlinNow } from '@/lib/venue-time/berlin'

export type ExhibitionWithStatus = Exhibition & {
  derivedStatus: ExhibitionStatus
  runType: 'dated' | 'permanent'
}

function isPopulated<T extends object>(value: number | T | null | undefined): value is T {
  return typeof value === 'object' && value != null
}

function asRunType(value: unknown): 'dated' | 'permanent' {
  return value === 'permanent' ? 'permanent' : 'dated'
}

function withDerivedStatus(doc: Exhibition, now: Date): ExhibitionWithStatus {
  const runType = asRunType((doc as Exhibition & { runType?: string }).runType)
  return {
    ...doc,
    runType,
    derivedStatus: getExhibitionStatus(
      {
        runType,
        startDate: doc.startDate,
        endDate: doc.endDate,
      },
      now,
    ),
  }
}

function isArtGalleryVenue(venue: Exhibition['venue']): boolean {
  if (!isPopulated<Venue>(venue)) return false
  return venue.venueType === 'ArtGallery'
}

function endSortKey(ex: ExhibitionWithStatus): number {
  if (ex.runType === 'permanent') return Number.POSITIVE_INFINITY
  if (!ex.endDate) return Number.POSITIVE_INFINITY
  const t = new Date(ex.endDate).getTime()
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
}

function sortCurrentShows(a: ExhibitionWithStatus, b: ExhibitionWithStatus): number {
  const aPerm = a.runType === 'permanent' ? 1 : 0
  const bPerm = b.runType === 'permanent' ? 1 : 0
  if (aPerm !== bPerm) return aPerm - bPerm
  return endSortKey(a) - endSortKey(b)
}

export async function loadGalleryExhibitions(locale?: 'de' | 'en'): Promise<Exhibition[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'exhibitions',
    limit: 200,
    depth: 2,
    ...(locale ? { locale, fallbackLocale: locale === 'de' ? 'en' : 'de' } : {}),
  })
  return (docs as Exhibition[]).filter((doc) => isArtGalleryVenue(doc.venue))
}

/** All current shows across every ArtGallery venue. Dated soonest-first; permanent last. */
export async function getCurrentExhibitions(
  now: Date = getBerlinNow(),
  locale?: 'de' | 'en',
): Promise<ExhibitionWithStatus[]> {
  const docs = await loadGalleryExhibitions(locale)
  return docs
    .map((doc) => withDerivedStatus(doc, now))
    .filter((doc) => doc.derivedStatus === 'current')
    .sort(sortCurrentShows)
}

/** Upcoming dated shows that start within `withinDays` Berlin days. */
export async function getUpcomingExhibitions(
  withinDays = 30,
  now: Date = getBerlinNow(),
  locale?: 'de' | 'en',
): Promise<ExhibitionWithStatus[]> {
  const docs = await loadGalleryExhibitions(locale)
  const horizon = now.getTime() + withinDays * 24 * 60 * 60 * 1000
  return docs
    .map((doc) => withDerivedStatus(doc, now))
    .filter((doc) => {
      if (doc.runType === 'permanent') return false
      if (doc.derivedStatus !== 'upcoming') return false
      if (!doc.startDate) return false
      const start = new Date(doc.startDate).getTime()
      return !Number.isNaN(start) && start <= horizon
    })
    .sort((a, b) => {
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0
      return aStart - bStart
    })
}

/** Current show for one gallery venue, or null. Does not hardcode any venue slug. */
export async function getCurrentExhibitionForVenue(
  venueId: string | number,
  now: Date = getBerlinNow(),
  locale?: 'de' | 'en',
): Promise<ExhibitionWithStatus | null> {
  const current = await getCurrentExhibitions(now, locale)
  return (
    current.find((ex) => {
      const venue = ex.venue
      const id = isPopulated<Venue>(venue) ? venue.id : venue
      return id != null && String(id) === String(venueId)
    }) ?? null
  )
}
