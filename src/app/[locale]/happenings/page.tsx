import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { SpotlightCard } from '@/components/spotlight/SpotlightCard'
import { uniqueAlwaysOn } from '@/lib/here/pickHubStrip'
import { getBerlinNow } from '@/lib/venue-time/berlin'
import { getEventOccurrences } from '@/lib/payload/getEventOccurrences'
import { resolveEventSpotlight } from '@/lib/spotlight/resolvers'
import type { SpotlightCardProps } from '@/lib/spotlight/types'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'happenings' })

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('intro'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/happenings' : 'en/happenings'}`,
      languages: {
        de: 'https://hotel-berlin.de/de/happenings',
        en: 'https://hotel-berlin.de/en/happenings',
        'x-default': 'https://hotel-berlin.de/de/happenings',
      },
    },
  }
}

export default async function HappeningsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('happenings')
  const loc = locale === 'de' ? 'de' : 'en'
  const now = getBerlinNow()
  const to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const occs = await getEventOccurrences({
    from: now,
    to,
    locale: loc,
    includeAlwaysOn: true,
  }).catch(() => [])

  const dated = occs.filter((o) => !o.alwaysOn)
  const standing = uniqueAlwaysOn(occs)
  const seenSlug = new Set<string>()
  const cards: Array<SpotlightCardProps & { anchorId: string }> = []

  for (const occ of [...dated, ...standing]) {
    const card = await resolveEventSpotlight(occ.event, {
      locale: loc,
      now,
      framing: 'prospect',
      occurrence: { start: occ.start, end: occ.end },
      alwaysOn: occ.alwaysOn,
    })
    if (!card) continue
    const slug = occ.event.slug
    const anchorId = seenSlug.has(slug) ? `${slug}-${occ.start.toISOString().slice(0, 10)}` : slug
    seenSlug.add(slug)
    cards.push({ ...card, anchorId })
  }

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="site-shell px-section-sm py-section-y md:px-section-x">
          <header className="mb-10 max-w-2xl">
            <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
              {t('title')}
            </h1>
            <p className="mt-3 max-w-xl font-serif text-serif-sm text-gray-600">{t('intro')}</p>
          </header>

          {cards.length === 0 ? (
            <p className="font-serif text-serif-sm text-gray-600">{t('empty')}</p>
          ) : (
            <ul
              role="list"
              aria-label={t('listAria')}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
            >
              {cards.map((card) => (
                <li
                  key={card.anchorId}
                  id={card.anchorId}
                  className="min-w-0 scroll-mt-28"
                >
                  <SpotlightCard {...card} className="w-full min-w-0!" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
