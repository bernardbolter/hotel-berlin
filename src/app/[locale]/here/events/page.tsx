import { getTranslations } from 'next-intl/server'

import { HereSubpage } from '@/components/here/HereSubpage'
import { uniqueAlwaysOn } from '@/lib/here/pickHubStrip'
import { herePageMetadata } from '@/lib/here/canonical'
import { getBerlinNow } from '@/lib/venue-time/berlin'
import { formatBerlinTime } from '@/lib/venue-time'
import { getEventOccurrences, type EventOccurrence } from '@/lib/payload/getEventOccurrences'
import { formatEventPrice, venueFloor } from '@/lib/spotlight/eventMeta'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/events',
    locale,
    t('pages.events.title'),
    t('pages.events.intro'),
  )
}

function formatOccurrenceWhen(occ: EventOccurrence, locale: string): string {
  if (occ.alwaysOn) return locale === 'de' ? 'Immer' : 'Always'
  const date = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Berlin',
  }).format(occ.start)
  return `${date} · ${formatBerlinTime(occ.start)}`
}

export default async function HereEventsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('here')
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()
  const to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const occs = await getEventOccurrences({
    from: now,
    to,
    locale: loc,
    includeAlwaysOn: true,
  }).catch(() => [])

  const standing = uniqueAlwaysOn(occs)
  const dated = occs.filter((o) => !o.alwaysOn)
  const rows = [...standing, ...dated]
  const seenSlug = new Set<string>()

  return (
    <HereSubpage
      title={t('pages.events.title')}
      intro={t('pages.events.intro')}
      backLabel={t('backToHub')}
    >
      {rows.length > 0 ? (
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
          {rows.map((occ) => {
            const slug = occ.event.slug
            const anchorId = seenSlug.has(slug)
              ? `${slug}-${occ.start.toISOString().slice(0, 10)}`
              : slug
            seenSlug.add(slug)
            const venue =
              typeof occ.event.venue === 'object' && occ.event.venue ? occ.event.venue : null
            const meta = [
              formatOccurrenceWhen(occ, loc),
              venueFloor(venue, loc),
              formatEventPrice(occ.event, loc),
              occ.event.bookingNote,
            ]
              .map((p) => p?.trim())
              .filter(Boolean)
              .join(' · ')

            return (
              <li key={anchorId} id={anchorId} className="scroll-mt-28 py-3">
                <p className="font-ui text-ui-md text-hbb-black">{occ.event.name}</p>
                <p className="font-ui text-ui-sm text-gray-500">{meta}</p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="font-serif text-serif-sm text-gray-600">{t('pages.events.empty')}</p>
      )}
    </HereSubpage>
  )
}
